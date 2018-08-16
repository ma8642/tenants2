import base64
import hashlib
from typing import Optional
from django.utils.crypto import pbkdf2
from django.conf import settings
from django.contrib.auth.models import User

from .mongo import get_db


def convert_salt_to_bytes(salt: str) -> bytes:
    '''
    Although the JustFix tenant app's current codebase base64
    encodes the salt, it appears that some early records
    in the database have raw binary values encoded as
    strings.

    The NodeJS fix for this is Buffer.from(salt, 'binary'),
    but I didn't know of a Python equivalent so I tried
    to implement one here.
    '''

    try:
        return salt.encode('ascii')
    except UnicodeEncodeError:
        # I don't actually know what's going on at a fundamental
        # level here; I just noticed that node's own
        # Buffer.from(salt, 'binary') (which is the fix in Node)
        # was essentially clearing the upper 16 bits of each
        # character's unicode codepoint representation,
        # so I did the same thing here.
        #
        # But because I essentially just saw a pattern and
        # accounted for it, it's quite possible I'm missing out
        # on some edge cases, or that this might all break
        # down if run on a different kind of system.
        return bytes([ord(ch) & 0x00ff for ch in salt])


def validate_password(password: str, expected_hash: str, salt: str) -> bool:
    '''
    Validates whether the given password is valid, given its
    expected hash and salt.
    '''

    salt_bytes = convert_salt_to_bytes(salt)

    hashval = base64.b64encode(
        pbkdf2(password, salt_bytes, 10000, dklen=64, digest=hashlib.sha1)
    )

    return hashval == expected_hash.encode('ascii')


def try_password(phone: str, password: str) -> bool:
    '''
    Return whether the password for the given user account
    (identified by phone number) is correct.
    '''

    ident = get_db()['identities'].find_one({'phone': phone})
    if ident is None:
        return False
    return validate_password(password, ident['password'], ident['salt'])


class LegacyTenantsAppBackend:
    '''
    A Django authentication backend that authenticates against the
    legacy tenants app.
    '''

    def authenticate(self, request, username: Optional[str]=None,
                     password: Optional[str]=None):
        if settings.LEGACY_MONGODB_URL and username and password:
            if try_password(username, password):
                try:
                    user = User.objects.get(username=username)
                except User.DoesNotExist:
                    user = User(username=username)
                    user.save()
                return user

        return None
