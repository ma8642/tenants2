import pytest
from django.conf import settings

from onboarding.forms import (
    OnboardingStep1Form,
    OnboardingStep4Form,
)
from onboarding.models import AddressWithoutBoroughDiagnostic
from users.models import JustfixUser
from project.tests.test_geocoding import EXAMPLE_SEARCH, enable_fake_geocoding


STEP_1_FORM_DATA = {
    'first_name': 'Boop',
    'last_name': 'Jones',
    'address': '150 court',
    'borough': 'BROOKLYN',
    'apt_number': '2'
}

STEP_4_FORM_DATA = {
    'phone_number': '555-123-4567',
    'can_we_sms': True,
    'signup_intent': 'LOC',
    'password': 'iamasuperstrongpassword#@$reowN@#rokeNER',
    'confirm_password': 'iamasuperstrongpassword#@$reowN@#rokeNER',
    'agree_to_terms': True,
}


@pytest.mark.django_db
def test_onboarding_step_4_form_works():
    form = OnboardingStep4Form(data=STEP_4_FORM_DATA)
    form.full_clean()
    assert form.errors == {}


@pytest.mark.django_db
def test_onboarding_step_4_form_requires_agreeing_to_terms():
    form = OnboardingStep4Form(data={
        **STEP_4_FORM_DATA,
        'agree_to_terms': False
    })
    form.full_clean()
    assert form.errors == {
        'agree_to_terms': ['This field is required.']
    }


@pytest.mark.django_db
def test_onboarding_step_4_form_fails_on_mismatched_passwords():
    form = OnboardingStep4Form(data={
        **STEP_4_FORM_DATA,
        'confirm_password': 'i do not match the password'
    })
    form.full_clean()
    assert form.errors == {
        '__all__': ['Passwords do not match!']
    }


@pytest.mark.django_db
def test_onboarding_step_4_form_does_not_require_sms_permission():
    form = OnboardingStep4Form(data={
        **STEP_4_FORM_DATA,
        'can_we_sms': False
    })
    form.full_clean()
    assert form.errors == {}


@pytest.mark.django_db
def test_onboarding_step_4_form_fails_on_existing_phone_number():
    JustfixUser.objects.create_user(username='blah', phone_number='5551234567')
    form = OnboardingStep4Form(data=STEP_4_FORM_DATA)
    form.full_clean()
    assert form.errors == {
        'phone_number': ['A user with that phone number already exists.']
    }


@pytest.mark.django_db
def test_onboarding_step_4_form_validates_passwords():
    form = OnboardingStep4Form(data={
        **STEP_4_FORM_DATA,
        'password': 'test',
        'confirm_password': 'test'
    })
    form.full_clean()
    assert form.errors == {
        'password': [
            'This password is too short. It must contain at least 8 characters.',
            'This password is too common.'
        ]
    }


@enable_fake_geocoding
def test_onboarding_step_1_form_sets_address_to_geocoder_value(requests_mock):
    requests_mock.get(settings.GEOCODING_SEARCH_URL, json=EXAMPLE_SEARCH)
    form = OnboardingStep1Form(data=STEP_1_FORM_DATA)
    form.full_clean()
    assert form.cleaned_data['address'] == '150 COURT STREET'
    assert form.cleaned_data['borough'] == 'BROOKLYN'
    assert form.cleaned_data['address_verified'] is True
    assert form.errors == {}


@enable_fake_geocoding
def test_onboarding_step_1_form_works_when_geocoder_is_unavailable(requests_mock):
    requests_mock.get(settings.GEOCODING_SEARCH_URL, status_code=500)
    form = OnboardingStep1Form(data=STEP_1_FORM_DATA)
    form.full_clean()
    assert form.cleaned_data['address'] == '150 court'
    assert form.cleaned_data['borough'] == 'BROOKLYN'
    assert form.cleaned_data['address_verified'] is False
    assert form.errors == {}


@enable_fake_geocoding
def test_onboarding_step_1_form_raises_err_on_invalid_address(requests_mock):
    requests_mock.get(settings.GEOCODING_SEARCH_URL, json={'features': []})
    form = OnboardingStep1Form(data=STEP_1_FORM_DATA)
    form.full_clean()
    assert form.errors == {
        '__all__': ['The address provided is invalid.']
    }


@enable_fake_geocoding
@pytest.mark.django_db
def test_onboarding_step_1_form_sets_borough_to_geocoder_value_when_absent(requests_mock):
    requests_mock.get(settings.GEOCODING_SEARCH_URL, json=EXAMPLE_SEARCH)
    form = OnboardingStep1Form(data={
        **STEP_1_FORM_DATA,
        'borough': ''
    })
    form.full_clean()
    assert form.cleaned_data['address'] == '150 COURT STREET'
    assert form.cleaned_data['borough'] == 'BROOKLYN'
    assert form.cleaned_data['address_verified'] is True
    assert form.errors == {}


@enable_fake_geocoding
@pytest.mark.django_db
def test_onboarding_step_1_form_requires_borough_when_geocoder_fails(requests_mock):
    requests_mock.get(settings.GEOCODING_SEARCH_URL, status_code=500)
    form = OnboardingStep1Form(data={
        **STEP_1_FORM_DATA,
        'borough': ''
    })
    form.full_clean()
    assert form.errors == {
        'borough': ['This field is required.']
    }


@pytest.mark.django_db
def test_onboarding_step_1_creates_addr_without_borough_diagnostic():
    form = OnboardingStep1Form(data={
        **STEP_1_FORM_DATA,
        'borough': ''
    })
    form.full_clean()
    diags = list(AddressWithoutBoroughDiagnostic.objects.all())
    assert len(diags) == 1
    assert diags[0].address == '150 court'
