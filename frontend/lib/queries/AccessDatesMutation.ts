// This file was automatically generated and should not be edited.

import * as ExtendedFormFieldErrors from './ExtendedFormFieldErrors'
/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { AccessDatesInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AccessDatesMutation
// ====================================================

export interface AccessDatesMutation_output_errors_extendedMessages {
  /**
   * A human-readable validation error.
   */
  message: string;
  /**
   * A machine-readable representation of the error.
   */
  code: string | null;
}

export interface AccessDatesMutation_output_errors {
  /**
   * The camel-cased name of the input field, or '__all__' for non-field errors.
   */
  field: string;
  /**
   * A list of validation errors with extended metadata.
   */
  extendedMessages: AccessDatesMutation_output_errors_extendedMessages[];
}

export interface AccessDatesMutation_output_session {
  accessDates: string[];
}

export interface AccessDatesMutation_output {
  /**
   * A list of validation errors in the form, if any. If the form was valid, this list will be empty.
   */
  errors: AccessDatesMutation_output_errors[];
  session: AccessDatesMutation_output_session | null;
}

export interface AccessDatesMutation {
  output: AccessDatesMutation_output;
}

export interface AccessDatesMutationVariables {
  input: AccessDatesInput;
}

export const AccessDatesMutation = {
  // The following query was taken from AccessDatesMutation.graphql.
  graphQL: `mutation AccessDatesMutation($input: AccessDatesInput!) {
    output: accessDates(input: $input) {
        errors { ...ExtendedFormFieldErrors },
        session {
            accessDates
        }
    }
}

${ExtendedFormFieldErrors.graphQL}`,
  fetch(fetchGraphQL: (query: string, args?: any) => Promise<any>, args: AccessDatesMutationVariables): Promise<AccessDatesMutation> {
    return fetchGraphQL(AccessDatesMutation.graphQL, args);
  }
};

export const fetchAccessDatesMutation = AccessDatesMutation.fetch;