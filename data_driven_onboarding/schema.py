from typing import Dict, Any
from pathlib import Path
import logging
from django.db import connections
from django.conf import settings
import graphene

from project import schema_registry, geocoding
from project.util.streaming_json import generate_json_rows
from onboarding.forms import get_geocoding_search_text


MY_DIR = Path(__file__).parent.resolve()

DDO_SQL_FILE = MY_DIR / 'data-driven-onboarding.sql'

logger = logging.getLogger(__name__)


class DDOSuggestionsResult(graphene.ObjectType):
    full_address = graphene.String(required=True)
    bbl = graphene.String(required=True)
    zipcode = graphene.String()
    unit_count = graphene.Int()
    hpd_complaint_count = graphene.Int()
    hpd_open_violation_count = graphene.Int()
    stabilized_unit_count_2007 = graphene.Int()
    stabilized_unit_count_2017 = graphene.Int()
    has_stabilized_units = graphene.Boolean()
    associated_building_count = graphene.Int()
    portfolio_unit_count = graphene.Int()


@schema_registry.register_queries
class DDOQuery:
    ddo_suggestions = graphene.Field(
        DDOSuggestionsResult,
        address=graphene.String(),
        borough=graphene.String(),
    )

    def resolve_ddo_suggestions(self, info, address: str, borough: str):
        if not settings.WOW_DATABASE:
            logger.warning("Data-driven onboarding requires WoW integration.")
            return None
        features = geocoding.search(get_geocoding_search_text(address, borough))
        if not features:
            return None
        props = features[0].properties
        row = run_ddo_sql_query(props.pad_bbl)
        return DDOSuggestionsResult(
            full_address=props.label,
            bbl=props.pad_bbl,
            **row
        )


def run_ddo_sql_query(bbl: str) -> Dict[str, Any]:
    sql_query = DDO_SQL_FILE.read_text()
    with connections[settings.WOW_DATABASE].cursor() as cursor:
        cursor.execute(sql_query, {'bbl': bbl})
        return list(generate_json_rows(cursor))[0]