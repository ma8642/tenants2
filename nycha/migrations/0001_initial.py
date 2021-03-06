# Generated by Django 2.1.2 on 2018-11-01 20:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='NychaOffice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='The name of the management entity.', max_length=255)),
                ('address', models.TextField(help_text='The full mailing address of the management office.')),
            ],
        ),
        migrations.CreateModel(
            name='NychaProperty',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pad_bbl', models.CharField(help_text='The zero-padded borough, block and lot (BBL) number for the NYCHA property.', max_length=10)),
                ('address', models.CharField(help_text='The street address of the NYCHA property.', max_length=100)),
                ('office', models.ForeignKey(help_text='The NYCHA office that manages the property.', on_delete=django.db.models.deletion.CASCADE, related_name='properties', to='nycha.NychaOffice')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='nychaproperty',
            unique_together={('pad_bbl', 'address')},
        ),
    ]
