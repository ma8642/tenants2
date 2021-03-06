# Generated by Django 2.1.2 on 2018-11-29 19:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('onboarding', '0005_onboardinginfo_signup_intent'),
    ]

    operations = [
        migrations.AddField(
            model_name='onboardinginfo',
            name='pad_bbl',
            field=models.CharField(blank=True, help_text="The user's Boro, Block, and Lot number. This field is automatically updated when you change the address or borough, so you generally shouldn't have to change it manually.", max_length=10),
        ),
    ]
