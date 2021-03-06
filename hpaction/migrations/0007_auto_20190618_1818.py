# Generated by Django 2.1.8 on 2019-06-18 18:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hpaction', '0006_hpactiondetails'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='hpactiondetails',
            name='issues_fixed',
        ),
        migrations.AddField(
            model_name='hpactiondetails',
            name='thirty_days_since_violations',
            field=models.NullBooleanField(help_text='Whether 30 days have passed since HPD issued violations.'),
        ),
    ]
