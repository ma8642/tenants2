'''
    This builds upon Graphene-Django's default form integration
    to resolve some of its limitations.
'''

import graphene
import graphene_django.forms.mutation
from graphene.utils.str_converters import to_camel_case


class StrictFormFieldErrorType(graphene.ObjectType):
    '''
    This is similar to Graphene-Django's default form field
    error type, but with all fields required, to simplify
    the type system.
    '''

    field = graphene.String(
        required=True,
        description=(
            "The camel-cased name of the input field, or "
            "'__all__' for non-field errors."
        )
    )

    messages = graphene.List(
        graphene.NonNull(graphene.String),
        required=True,
        description="A list of human-readable validation errors."
    )


class DjangoFormMutation(graphene_django.forms.mutation.DjangoFormMutation):
    class Meta:
        abstract = True

    # This is just like our superclass' "errors" attribute, only
    # it's required, to simplify the type system.
    errors = graphene.List(
        graphene.NonNull(StrictFormFieldErrorType),
        default_value=[],
        required=True,
        description=(
            "A list of validation errors in the form, if any. "
            "If the form was valid, this list will be empty."
        )
    )

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        form = cls.get_form(root, info, **input)

        if form.is_valid():
            return cls.perform_mutate(form, info)
        else:
            errors = []
            for key, value in form.errors.items():
                if key != '__all__':
                    # Graphene-Django's default implementation for form field validation
                    # errors doesn't convert field names to camel case, but we want to,
                    # because the input was provided using camel case field names, so the
                    # errors should use them too.
                    key = to_camel_case(key)
                errors.append(StrictFormFieldErrorType(field=key, messages=value))
            return cls(errors=errors)