# Generated by Django 2.1.2 on 2018-10-30 14:43

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Reminder',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('kind', models.TextField(choices=[('LOC', 'Letter of complaint reminder')], help_text='The type of reminder sent.', max_length=30)),
                ('sent_at', models.DateField(help_text='When the reminder was sent.')),
                ('sid', models.CharField(help_text='The Twilio Message SID for the reminder.', max_length=34)),
                ('user', models.ForeignKey(help_text='The user the reminder was sent to.', on_delete=django.db.models.deletion.CASCADE, related_name='reminders', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
