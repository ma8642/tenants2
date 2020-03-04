# Generated by Django 2.2.10 on 2020-03-03 13:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('texting_history', '0002_auto_20200303_1123'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['user_phone_number'], name='texting_his_user_ph_12f2c5_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['date_sent'], name='texting_his_date_se_a6ca86_idx'),
        ),
    ]