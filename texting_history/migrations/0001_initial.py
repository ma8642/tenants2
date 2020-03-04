# Generated by Django 2.2.10 on 2020-02-28 14:41

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Message',
            fields=[
                ('sid', models.CharField(max_length=34, primary_key=True, serialize=False)),
                ('ordering', models.FloatField()),
                ('body', models.TextField()),
                ('status', models.CharField(max_length=20)),
                ('date_created', models.DateTimeField()),
                ('date_sent', models.DateTimeField()),
                ('date_updated', models.DateTimeField()),
                ('direction', models.CharField(max_length=15)),
                ('user_phone_number', models.CharField(max_length=15)),
                ('is_from_us', models.BooleanField()),
                ('error_code', models.IntegerField(blank=True, null=True)),
                ('error_message', models.TextField(blank=True, null=True)),
            ],
        ),
    ]