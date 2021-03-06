# Generated by Django 2.1.8 on 2019-05-03 15:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('onboarding', '0007_addresswithoutboroughdiagnostic'),
    ]

    operations = [
        migrations.AddField(
            model_name='onboardinginfo',
            name='pad_bin',
            field=models.CharField(blank=True, help_text="The user's building identification number (BIN). This field is automatically updated when you change the address or borough, so you generally shouldn't have to change it manually.", max_length=7),
        ),
    ]
