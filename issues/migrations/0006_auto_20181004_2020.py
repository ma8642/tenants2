# Generated by Django 2.1.2 on 2018-10-04 20:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('issues', '0005_auto_20180926_0207'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customissue',
            name='area',
            field=models.CharField(choices=[('HOME', 'Entire home and hallways'), ('BEDROOMS', 'Bedrooms'), ('KITCHEN', 'Kitchen'), ('LIVING_ROOM', 'Living room'), ('BATHROOMS', 'Bathrooms'), ('PUBLIC_AREAS', 'Public areas'), ('LANDLORD', 'Landlord harassment (currently hidden in app)')], help_text='The area this custom issue belongs to.', max_length=60),
        ),
        migrations.AlterField(
            model_name='issue',
            name='area',
            field=models.CharField(choices=[('HOME', 'Entire home and hallways'), ('BEDROOMS', 'Bedrooms'), ('KITCHEN', 'Kitchen'), ('LIVING_ROOM', 'Living room'), ('BATHROOMS', 'Bathrooms'), ('PUBLIC_AREAS', 'Public areas'), ('LANDLORD', 'Landlord harassment (currently hidden in app)')], help_text='The area this issue belongs to.', max_length=60),
        ),
    ]
