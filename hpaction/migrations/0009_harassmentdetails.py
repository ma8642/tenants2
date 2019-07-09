# Generated by Django 2.1.8 on 2019-06-21 13:09

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('hpaction', '0008_hpactiondetails_sue_for_harassment'),
    ]

    operations = [
        migrations.CreateModel(
            name='HarassmentDetails',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('more_than_two_apartments_in_building', models.NullBooleanField(help_text='Are there more than two apartments in your building?')),
                ('more_than_one_family_per_apartment', models.NullBooleanField(help_text='Is there more than one family living in each apartment?')),
                ('harassment_details', models.TextField(blank=True, help_text='Explain how the landlord has harassed you.')),
                ('prior_relief_sought_case_numbers_and_dates', models.TextField(blank=True, help_text='\n            Please provide the court case number (the "index number") and/or the date(s)\n            of the earlier case(s).  (Please also include the case number and date(s) of\n            any case(s) you have brought in the housing court for repairs.)\n            ')),
                ('user', models.OneToOneField(help_text='The user whom the harassment details are for.', on_delete=django.db.models.deletion.CASCADE, related_name='harassment_details', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Harassment details',
            },
        ),
    ]