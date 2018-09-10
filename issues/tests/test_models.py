import pytest
from django.core.exceptions import ValidationError

from users.tests.factories import UserFactory
from issues import models
from issues.models import CustomIssue


def test_issue_choice_areas_are_valid():
    areas = set([value for (value, _) in models.ISSUE_AREA_CHOICES.choices])
    for value, _ in models.ISSUE_CHOICES.choices:
        area = models.get_issue_area(value)
        assert area in areas


def test_choices_have_valid_length():
    for value, _ in models.ISSUE_AREA_CHOICES.choices:
        assert len(value) < models.VALUE_MAXLEN
    for value, _ in models.ISSUE_CHOICES.choices:
        assert len(value) < models.VALUE_MAXLEN


def test_issue_raises_err_on_mismatched_area():
    issue = models.Issue(area='BLAH', value='BOOP__FOO')
    with pytest.raises(ValidationError) as exc_info:
        issue.clean()
    assert exc_info.value.args[0] == 'Issue BOOP__FOO does not match area BLAH'


@pytest.mark.django_db
def test_set_area_issues_for_user_works():
    user = UserFactory.create()
    models.Issue.objects.set_area_issues_for_user(user, 'BEDROOMS', [
        'BEDROOMS__PAINT'
    ])
    models.Issue.objects.set_area_issues_for_user(user, 'HOME', [
        'HOME__MICE'
    ])
    models.Issue.objects.set_area_issues_for_user(user, 'HOME', [
        'HOME__RATS', 'HOME__RATS'
    ])
    assert models.Issue.objects.get_area_issues_for_user(user, 'HOME') == [
        'HOME__RATS'
    ]
    assert models.Issue.objects.get_area_issues_for_user(user, 'BEDROOMS') == [
        'BEDROOMS__PAINT'
    ]


@pytest.mark.django_db
def test_set_custom_issue_for_user_works():
    user = UserFactory.create()

    assert CustomIssue.objects.get_for_user(user, 'BEDROOMS') == ''
    assert CustomIssue.objects.get_for_user(user, 'HOME') == ''

    CustomIssue.objects.set_for_user(user, 'BEDROOMS', 'blah')

    assert CustomIssue.objects.get_for_user(user, 'BEDROOMS') == 'blah'
    assert CustomIssue.objects.get_for_user(user, 'HOME') == ''