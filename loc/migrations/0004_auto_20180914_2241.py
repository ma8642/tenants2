# Generated by Django 2.1 on 2018-09-14 22:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('loc', '0003_letterrequest'),
    ]

    operations = [
        migrations.AlterField(
            model_name='landlorddetails',
            name='address',
            field=models.CharField(blank=True, help_text='The full mailing address for the landlord.', max_length=1000),
        ),
        migrations.AlterField(
            model_name='landlorddetails',
            name='name',
            field=models.CharField(blank=True, help_text="The landlord's name.", max_length=100),
        ),
    ]