// This file was automatically generated and should not be edited.

import * as AllSessionInfo from './AllSessionInfo'
/* tslint:disable */
// This file was automatically generated and should not be edited.

import { OnboardingStep3Input } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: OnboardingStep3Mutation
// ====================================================

export interface OnboardingStep3Mutation_onboardingStep3_errors {
  /**
   * The camel-cased name of the input field, or '__all__' for non-field errors.
   */
  field: string;
  /**
   * A list of human-readable validation errors.
   */
  messages: string[];
}

export interface OnboardingStep3Mutation_onboardingStep3_session_onboardingStep1 {
  name: string;
  address: string;
  aptNumber: string;
  borough: string;
}

export interface OnboardingStep3Mutation_onboardingStep3_session_onboardingStep2 {
  /**
   * Has the user received an eviction notice?
   */
  isInEviction: boolean;
  /**
   * Does the user need repairs in their apartment?
   */
  needsRepairs: boolean;
  /**
   * Is the user missing essential services like water?
   */
  hasNoServices: boolean;
  /**
   * Does the user have pests like rodents or bed bugs?
   */
  hasPests: boolean;
  /**
   * Has the user called 311 before?
   */
  hasCalled311: boolean;
}

export interface OnboardingStep3Mutation_onboardingStep3_session_onboardingStep3 {
  leaseType: string;
  /**
   * Does the user receive public assistance, e.g. Section 8?
   */
  receivesPublicAssistance: boolean;
}

export interface OnboardingStep3Mutation_onboardingStep3_session {
  /**
   * The phone number of the currently logged-in user, or null if not logged-in.
   */
  phoneNumber: string | null;
  /**
   * The cross-site request forgery (CSRF) token.
   */
  csrfToken: string;
  /**
   * Whether or not the currently logged-in user is a staff member.
   */
  isStaff: boolean;
  onboardingStep1: OnboardingStep3Mutation_onboardingStep3_session_onboardingStep1 | null;
  onboardingStep2: OnboardingStep3Mutation_onboardingStep3_session_onboardingStep2 | null;
  onboardingStep3: OnboardingStep3Mutation_onboardingStep3_session_onboardingStep3 | null;
}

export interface OnboardingStep3Mutation_onboardingStep3 {
  /**
   * A list of validation errors in the form, if any. If the form was valid, this list will be empty.
   */
  errors: OnboardingStep3Mutation_onboardingStep3_errors[];
  session: OnboardingStep3Mutation_onboardingStep3_session | null;
}

export interface OnboardingStep3Mutation {
  onboardingStep3: OnboardingStep3Mutation_onboardingStep3;
}

export interface OnboardingStep3MutationVariables {
  input: OnboardingStep3Input;
}

export function fetchOnboardingStep3Mutation(fetchGraphQL: (query: string, args?: any) => Promise<any>, args: OnboardingStep3MutationVariables): Promise<OnboardingStep3Mutation> {
  // The following query was taken from OnboardingStep3Mutation.graphql.
  return fetchGraphQL(`mutation OnboardingStep3Mutation($input: OnboardingStep3Input!) {
    onboardingStep3(input: $input) {
        errors {
            field,
            messages
        },
        session {
            ...AllSessionInfo
        }
    }
}

${AllSessionInfo.graphQL}`, args);
}