# Generated by Django 2.1.2 on 2018-10-04 20:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('onboarding', '0002_auto_20180925_1505'),
    ]

    operations = [
        migrations.AlterField(
            model_name='onboardinginfo',
            name='lease_type',
            field=models.CharField(choices=[('RENT_STABILIZED', 'Rent Stabilized/Rent Controlled'), ('MARKET_RATE', 'Market Rate'), ('NYCHA', 'NYCHA Housing Development'), ('OTHER', 'Other (Mitchell Lama, COOP/Condo, House, HUD, etc.)'), ('NOT_SURE', "I'm not sure (currently hidden in app)"), ('NO_LEASE', "I don't have a lease")], help_text='The type of lease the user has on their dwelling.', max_length=30),
        ),
    ]
