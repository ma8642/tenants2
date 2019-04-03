from typing import Optional
from django.contrib import admin
from django.contrib.auth.decorators import permission_required
from django import forms
from django.http import HttpResponseRedirect
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.html import format_html
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.core import signing

from project.util.admin_util import admin_field, admin_action
from users.models import CHANGE_LETTER_REQUEST_PERMISSION
from . import models, views, lob_api


@admin_action("Print letter of complaint envelopes")
def print_loc_envelopes(modeladmin, request, queryset):
    user_ids = [str(user.pk) for user in queryset]
    qs = '?user_ids=' + ','.join(user_ids)
    return HttpResponseRedirect(reverse('loc_envelopes') + qs)


class AccessDateInline(admin.TabularInline):
    model = models.AccessDate
    verbose_name = "Letter of complaint access date"
    verbose_name_plural = "Letter of complaint access dates"
    extra = 1


class LandlordDetailsForm(forms.ModelForm):
    class Meta:
        model = models.LandlordDetails
        widgets = {
            'address': forms.Textarea()
        }
        fields = '__all__'


class LandlordDetailsInline(admin.StackedInline):
    form = LandlordDetailsForm
    model = models.LandlordDetails
    verbose_name = "Landlord details"
    verbose_name_plural = verbose_name


class LetterRequestInline(admin.StackedInline):
    model = models.LetterRequest
    verbose_name = "Letter of complaint request"
    verbose_name_plural = verbose_name
    exclude = ['html_content', 'lob_letter_object']

    readonly_fields = ['loc_actions', 'lob_integration']

    @admin_field(
        short_description="Letter of complaint actions",
        allow_tags=True
    )
    def loc_actions(self, obj: models.LetterRequest):
        url = obj.admin_pdf_url
        if not url:
            return 'This user has not yet completed the letter of complaint process.'
        return format_html(
            '<a class="button" target="_blank" href="{}">View letter of complaint PDF</a>',
            url
        )

    @admin_field(
        short_description='Lob integration',
        allow_tags=True
    )
    def lob_integration(self, obj: models.LetterRequest):
        if obj.lob_letter_object:
            return obj.lob_letter_html_description
        nomail_reason = get_lob_nomail_reason(obj)
        if not nomail_reason:
            return format_html(
                '<a class="button" href="{}">Mail letter of complaint via Lob&hellip;</a>',
                reverse('admin:mail-via-lob', kwargs={'letterid': obj.id})
            )
        return format_html("Unable to send mail via Lob because {}.", nomail_reason)


class LocAdminViews:
    def __init__(self, site):
        self.site = site

    def get_urls(self):
        return [
            path('lob/<int:letterid>/',
                 self.view_with_perm(self.mail_via_lob, CHANGE_LETTER_REQUEST_PERMISSION),
                 name='mail-via-lob'),
        ]

    def view_with_perm(self, view_func, perm: str):
        return self.site.admin_view(permission_required(perm)(view_func))

    def _get_mail_confirmation_context(self, user):
        landlord_details = user.landlord_details
        onboarding_info = user.onboarding_info

        landlord_verification = lob_api.verify_address(
            address=landlord_details.address
        )
        user_verification = lob_api.verify_address(
            primary_line=onboarding_info.address,
            secondary_line=onboarding_info.apartment_address_line,
            state=onboarding_info.state,
            city=onboarding_info.city,
            zip_code=onboarding_info.zipcode,
        )

        return self._create_mail_confirmation_context(
            landlord_verification=landlord_verification,
            user_verification=user_verification
        )

    def _create_mail_confirmation_context(self, landlord_verification, user_verification):
        is_deliverable = (
            landlord_verification['deliverability'] != lob_api.UNDELIVERABLE and
            user_verification['deliverability'] != lob_api.UNDELIVERABLE
        )

        is_definitely_deliverable = (
            landlord_verification['deliverability'] == lob_api.DELIVERABLE and
            user_verification['deliverability'] == lob_api.DELIVERABLE
        )

        verifications = {
            'landlord_verification': landlord_verification,
            'landlord_verified_address': lob_api.get_address_from_verification(
                landlord_verification),
            'landlord_deliverability_docs': lob_api.get_deliverability_docs(
                landlord_verification),
            'user_verification': user_verification,
            'user_verified_address': lob_api.get_address_from_verification(user_verification),
            'user_deliverability_docs': lob_api.get_deliverability_docs(user_verification),
            'is_deliverable': is_deliverable,
            'is_definitely_deliverable': is_definitely_deliverable
        }

        return {
            'signed_verifications': signing.dumps(verifications),
            **verifications
        }

    def _create_letter(self, request, letter, verifications):
        user = letter.user
        pdf_file = views.render_letter_of_complaint(request, user, 'pdf').file_to_stream
        response = lob_api.mail_certified_letter(
            description='Letter of complaint',
            to_address={
                'name': user.landlord_details.name,
                **lob_api.verification_to_inline_address(verifications['landlord_verification'])
            },
            from_address={
                'name': letter.user.full_name,
                **lob_api.verification_to_inline_address(verifications['user_verification'])
            },
            file=pdf_file,
            color=False,
            double_sided=False
        )
        return response

    def mail_via_lob(self, request, letterid):
        letter = get_object_or_404(models.LetterRequest, pk=letterid)
        user = letter.user
        lob_nomail_reason = get_lob_nomail_reason(letter)
        is_post = request.method == "POST"
        ctx = {
            **self.site.each_context(request),
            'title': "Mail letter of complaint via Lob",
            'user': user,
            'letter': letter,
            'lob_nomail_reason': lob_nomail_reason,
            'is_post': is_post,
            'pdf_url': user.letter_request.admin_pdf_url,
            'go_back_href': reverse('admin:users_justfixuser_change', args=(user.pk,)),
        }

        if not lob_nomail_reason:
            if is_post:
                verifications = signing.loads(request.POST['signed_verifications'])
                response = self._create_letter(request, letter, verifications)
                letter.lob_letter_object = response
                letter.save()
            else:
                ctx.update(self._get_mail_confirmation_context(user))

        return TemplateResponse(request, "loc/admin/lob.html", ctx)


def get_lob_nomail_reason(letter: models.LetterRequest) -> Optional[str]:
    '''
    If the given letter can't be mailed via Lob, return a human-readable
    English string explaining why. Otherwise, return None.
    '''

    result: Optional[str] = None

    if not (settings.LOB_SECRET_API_KEY and settings.LOB_PUBLISHABLE_API_KEY):
        result = 'Lob integration is disabled'
    elif not letter.id:
        result = 'the letter has not yet been created'
    elif letter.lob_letter_object:
        result = 'the letter has already been sent via Lob'
    elif letter.mail_choice != models.LOC_MAILING_CHOICES.WE_WILL_MAIL:
        result = 'the user wants to mail the letter themself'
    elif not hasattr(letter.user, 'landlord_details'):
        result = 'the user does not have landlord details'
    elif not hasattr(letter.user, 'onboarding_info'):
        result = 'the user does not have onboarding info'
    return result


user_inlines = (
    AccessDateInline,
    LandlordDetailsInline,
    LetterRequestInline
)
