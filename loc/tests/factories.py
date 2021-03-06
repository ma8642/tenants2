import factory
import datetime

from onboarding.tests.factories import OnboardingInfoFactory
from users.tests.factories import UserFactory
from loc.models import LetterRequest, LOC_MAILING_CHOICES, LandlordDetails, AccessDate
from issues.models import Issue


class LetterRequestFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LetterRequest

    user = factory.SubFactory(UserFactory)

    mail_choice = LOC_MAILING_CHOICES.WE_WILL_MAIL


class LandlordDetailsFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LandlordDetails

    user = factory.SubFactory(UserFactory)

    name = 'Landlordo Calrissian'

    address = '1 Cloud City'


def create_user_with_all_info(issues=True, landlord=True, access_dates=True):
    info = OnboardingInfoFactory(
        user__full_name="Bobby Denver",
        address="1 Times Square",
        borough="MANHATTAN",
        apt_number="301",
        zipcode="11201",
        can_we_sms=True,
        has_called_311=False
    )
    user = info.user
    if issues:
        Issue.objects.set_area_issues_for_user(user, 'HOME', ['HOME__MICE'])
    if landlord:
        ld = LandlordDetails(
            user=user,
            name='Landlordo Calrissian',
            address='1 Cloud City\nBespin'
        )
        ld.save()
    if access_dates:
        AccessDate.objects.set_for_user(user, [datetime.date(2018, 2, 1)])
    return user
