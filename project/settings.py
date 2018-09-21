"""
Django settings for project project.

Generated by 'django-admin startproject' using Django 2.1.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

from typing import List
import dj_database_url

from . import justfix_environment
from .justfix_environment import BASE_DIR
from .util.settings_util import parse_secure_proxy_ssl_header


env = justfix_environment.get()

SECRET_KEY = env.SECRET_KEY

DEBUG = env.DEBUG

# TODO: Figure out if this can securely stay at '*'.
ALLOWED_HOSTS: List[str] = ['*']


if env.SECURE_PROXY_SSL_HEADER:
    SECURE_PROXY_SSL_HEADER = parse_secure_proxy_ssl_header(
        env.SECURE_PROXY_SSL_HEADER
    )

SECURE_SSL_REDIRECT = env.SECURE_SSL_REDIRECT

SECURE_HSTS_SECONDS = env.SECURE_HSTS_SECONDS

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    'graphene_django',
    'project.apps.DefaultConfig',
    'frontend',
    'legacy_tenants.apps.LegacyTenantsConfig',
    'users.apps.UsersConfig',
    'onboarding.apps.OnboardingConfig',
    'issues.apps.IssuesConfig',
    'loc.apps.LocConfig'
]

MIDDLEWARE = [
    'project.middleware.CSPHashingMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'project.context_processors.ga_snippet',
                'project.context_processors.rollbar_snippet',
            ],
        },
    },
]

WSGI_APPLICATION = 'project.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases

DATABASES = {
    'default': dj_database_url.parse(env.DATABASE_URL),
}


# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTH_USER_MODEL = 'users.JustfixUser'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'legacy_tenants.auth.LegacyTenantsAppBackend',
]

LOGIN_URL = '/login'

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# This is based off the default Django logging configuration:
# https://github.com/django/django/blob/master/django/utils/log.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'rollbar': {
            # This will be replaced by a real handler if Rollbar is enabled.
            'level': 'ERROR',
            'class': 'logging.NullHandler'
        },
        'console': {
            'class': 'logging.StreamHandler',
        },
        'django.server': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'django.server',
        },
    },
    'formatters': {
        'django.server': {
            '()': 'django.utils.log.ServerFormatter',
            'format': '[{server_time}] {message}',
            'style': '{',
        }
    },
    'loggers': {
        '': {
            'handlers': ['console', 'rollbar'],
            'level': 'INFO',
        },
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.server': {
            'handlers': ['django.server'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = '/static/'

STATIC_ROOT = str(BASE_DIR / 'staticfiles')

STATICFILES_STORAGE = 'project.storage.CompressedStaticFilesStorage'

GRAPHENE = {
    'SCHEMA': 'project.schema.schema',
    # Setting this to None is very important for error logging, as
    # its default value of
    # graphene_django.debug.middleware.DjangoDebugMiddleware somehow
    # silently eats all errors:
    #
    #   https://github.com/graphql-python/graphene-django/issues/504
    'MIDDLEWARE': None
}

GEOCODING_SEARCH_URL = "https://geosearch.planninglabs.nyc/v1/search"

GEOCODING_TIMEOUT = 3

LEGACY_MONGODB_URL = env.LEGACY_MONGODB_URL

GA_TRACKING_ID = env.GA_TRACKING_ID

# If this is truthy, Rollbar will be enabled on the client-side.
ROLLBAR_ACCESS_TOKEN = env.ROLLBAR_ACCESS_TOKEN

if env.ROLLBAR_SERVER_ACCESS_TOKEN:
    # The following will enable Rollbar on the server-side.
    ROLLBAR = {
        'access_token': env.ROLLBAR_SERVER_ACCESS_TOKEN,
        'environment': 'development' if DEBUG else 'production',
        'root': str(BASE_DIR),
    }
    LOGGING['handlers']['rollbar'].update({    # type: ignore
        'class': 'rollbar.logger.RollbarHandler'
    })
    MIDDLEWARE.append(
        'rollbar.contrib.django.middleware.RollbarNotifierMiddlewareExcluding404')

CSP_CONNECT_SRC = [
    "'self'",
    "https://geosearch.planninglabs.nyc"
]

if DEBUG:
    CSP_EXCLUDE_URL_PREFIXES = (
        # The webpack-bundle-analyzer report contains inline JS
        # that we need to permit if we want to use it, so
        # allow it during development.
        f'{STATIC_URL}frontend/report.html',
        # Bleh, the GraphIQL UI has a bunch of inline script code.
        '/graphiql',
    )
