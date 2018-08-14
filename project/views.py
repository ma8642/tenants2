import json
import subprocess
from typing import NamedTuple
from django.utils.safestring import SafeString
from django.shortcuts import render
from django.middleware import csrf
from django.urls import reverse
from django.conf import settings

from project.justfix_environment import BASE_DIR


class LambdaResponse(NamedTuple):
    html: SafeString
    status: int


def run_react_lambda(initial_props) -> LambdaResponse:
    result = subprocess.run(
        ['node', 'lambda.js'],
        input=json.dumps(initial_props).encode('utf-8'),
        stdout=subprocess.PIPE,
        check=True,
        cwd=BASE_DIR
    )

    # The structure of this response is defined in
    # the LambdaResponse interface in frontend/lambda/lambda.ts.
    response = json.loads(result.stdout.decode('utf-8'))

    return LambdaResponse(
        html=SafeString(response['html']),
        status=response['status']
    )


def react_rendered_view(request, url):
    if request.user.is_authenticated:
        username = request.user.username
    else:
        username = None

    # Currently, the schema for this structure needs to be mirrored
    # in the AppProps interface in frontend/lib/app.tsx. So if you
    # add or remove anything here, make sure to do the same over there!
    initial_props = {
        'initialURL': f'/{url}',
        'initialSession': {
            'csrfToken': csrf.get_token(request),
            'username': username,
        },
        'server': {
            'staticURL': settings.STATIC_URL,
            'adminIndexURL': reverse('admin:index'),
            'batchGraphQLURL': reverse('batch-graphql'),
            'debug': settings.DEBUG
        },
    }

    lambda_response = run_react_lambda(initial_props)

    return render(request, 'index.html', {
        'initial_render': lambda_response.html,
        'initial_props': initial_props,
    }, status=lambda_response.status)
