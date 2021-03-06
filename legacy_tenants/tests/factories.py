import factory.django

from users.tests.factories import UserFactory
from ..models import LegacyUserInfo
from .. import mongo
from . import example_legacy_data


class LegacyUserInfoFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LegacyUserInfo

    user = factory.SubFactory(UserFactory)

    role = LegacyUserInfo.TENANT

    prefers_legacy_app = True


def MongoTenantFactory(**kwargs):
    return mongo.MongoTenant(**{**example_legacy_data.TENANT, **kwargs})


def MongoAdvocateFactory(**kwargs):
    return mongo.MongoAdvocate(**{**example_legacy_data.ADVOCATE, **kwargs})


def MongoUserFactory(is_advocate=False, **extra_kwargs):
    kwargs = {
        'id': 'abcd',
        'identity': example_legacy_data.IDENTITY,
    }
    if is_advocate:
        kwargs['advocate_info'] = example_legacy_data.ADVOCATE
    else:
        kwargs['tenant_info'] = example_legacy_data.TENANT

    kwargs.update(extra_kwargs)
    return mongo.MongoUser(**kwargs)
