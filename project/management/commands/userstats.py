import csv
from typing import Iterator, List, Any
from pathlib import Path
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import UNUSABLE_PASSWORD_PREFIX
from django.db import connection

from project.util.site_util import absolute_reverse
from project.util.streaming_csv import generate_csv_rows


MY_DIR = Path(__file__).parent.resolve()
USER_STATS_SQLFILE = MY_DIR / 'userstats.sql'


def execute_user_stats_query(cursor, include_pad_bbl: bool = False):
    admin_url_begin, admin_url_end = absolute_reverse(
        'admin:users_justfixuser_change', args=(999,)).split('999')
    cursor.execute(USER_STATS_SQLFILE.read_text(), {
        'include_pad_bbl': include_pad_bbl,
        'unusable_password_pattern': UNUSABLE_PASSWORD_PREFIX + '%',
        'admin_url_begin': admin_url_begin,
        'admin_url_end': admin_url_end
    })


def get_user_stats_rows(include_pad_bbl: bool = False) -> Iterator[List[Any]]:
    with connection.cursor() as cursor:
        execute_user_stats_query(cursor, include_pad_bbl=include_pad_bbl)
        yield from generate_csv_rows(cursor)


class Command(BaseCommand):
    help = 'Output a CSV of statistics about users.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--include-pad-bbl', action='store_true',
            help='Include potentially personally-identifiable "pad_bbl" column'
        )

    def handle(self, *args, **options):
        include_pad_bbl: bool = options['include_pad_bbl']
        writer = csv.writer(self.stdout)
        for row in get_user_stats_rows(include_pad_bbl=include_pad_bbl):
            writer.writerow(row)
