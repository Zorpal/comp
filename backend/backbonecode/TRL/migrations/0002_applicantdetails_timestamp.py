# Generated by Django 5.1.2 on 2024-12-06 17:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('TRL', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='applicantdetails',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, default="2024-12-02 12:10"),
            preserve_default=False,
        ),
    ]