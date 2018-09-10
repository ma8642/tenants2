from django import forms

from . import models


class IssueAreaForm(forms.Form):
    area = forms.ChoiceField(
        choices=models.ISSUE_AREA_CHOICES.choices,
        help_text="The area for the issues being set.")

    issues = forms.MultipleChoiceField(
        required=False,
        choices=models.ISSUE_CHOICES.choices,
        help_text=(
            "The issues to set. Any issues not listed, but in the same area, will be "
            "removed."
        ))

    other = forms.CharField(
        required=False,
        max_length=10000,
        help_text="Any other custom issues the user wants to report.")

    def clean(self):
        cleaned_data = super().clean()
        area = cleaned_data.get('area')
        issues = cleaned_data.get('issues')

        if area and (issues is not None):
            for issue in issues:
                models.ensure_issue_matches_area(issue, area)