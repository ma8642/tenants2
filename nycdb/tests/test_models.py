import pytest

from nycdb.models import HPDRegistration, HPDContact, Company, Individual
from . import fixtures


def test_tiny_landlord_works(nycdb):
    tiny = fixtures.load_hpd_registration("tiny-landlord.json")
    assert tiny.get_management_company() is None
    boop = tiny.get_landlord()
    assert isinstance(boop, Individual)
    assert boop.name == "BOOP JONES"
    assert boop.address.lines_for_mailing == [
        "124 99TH STREET",
        "Brooklyn, NY 11999"
    ]


def test_medium_landlord_works(nycdb):
    reg = fixtures.load_hpd_registration("medium-landlord.json")

    mgmtco = reg.get_management_company()
    assert isinstance(mgmtco, Company)
    assert mgmtco.name == "FUNKY APARTMENT MANAGEMENT"
    assert mgmtco.address.lines_for_mailing == [
        '900 EAST 25TH STREET #2',
        'NEW YORK, NY 10099'
    ]

    ll = reg.get_landlord()
    assert isinstance(ll, Company)
    assert ll.name == "ULTRA DEVELOPERS, LLC"
    assert ll.address.lines_for_mailing == [
        '9 BEAN CENTER DRIVE #40',
        'FUNKYPLACE, NJ 07099'
    ]


@pytest.mark.parametrize("model", [
    HPDRegistration,
    HPDContact,
])
def test_error_raised_when_nycdb_not_enabled(model):
    with pytest.raises(Exception, match='NYCDB integration is disabled'):
        model.objects.all()


class TestHPDContact:
    def test_full_name_works(self):
        assert HPDContact().full_name == ''
        assert HPDContact(firstname='a', lastname='b').full_name == "a b"
        assert HPDContact(firstname='a').full_name == "a"
        assert HPDContact(lastname='b').full_name == "b"

    def test_street_address_works(self):
        assert HPDContact().street_address == ''
        assert HPDContact(
            businesshousenumber='23',
            businessstreetname="blarg st"
        ).street_address == '23 blarg st'
