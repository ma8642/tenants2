// This file was automatically generated and should not be edited.

import * as AllSessionInfo from './AllSessionInfo'
/* tslint:disable */
// This file was automatically generated and should not be edited.

import { IssueAreaInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IssueAreaMutation
// ====================================================

export interface IssueAreaMutation_output_errors {
  /**
   * The camel-cased name of the input field, or '__all__' for non-field errors.
   */
  field: string;
  /**
   * A list of human-readable validation errors.
   */
  messages: string[];
}

export interface IssueAreaMutation_output_session_onboardingStep1 {
  name: string;
  /**
   * The user's address. Only street name and number are required.
   */
  address: string;
  aptNumber: string;
  /**
   * The New York City borough the user's address is in.
   */
  borough: string;
}

export interface IssueAreaMutation_output_session_onboardingStep2 {
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

export interface IssueAreaMutation_output_session_onboardingStep3 {
  /**
   * The type of lease the user has on their dwelling.
   */
  leaseType: string;
  /**
   * Does the user receive public assistance, e.g. Section 8?
   */
  receivesPublicAssistance: boolean;
}

export interface IssueAreaMutation_output_session_customIssues {
  area: string;
  description: string;
}

export interface IssueAreaMutation_output_session {
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
  onboardingStep1: IssueAreaMutation_output_session_onboardingStep1 | null;
  onboardingStep2: IssueAreaMutation_output_session_onboardingStep2 | null;
  onboardingStep3: IssueAreaMutation_output_session_onboardingStep3 | null;
  issues: string[];
  customIssues: IssueAreaMutation_output_session_customIssues[];
}

export interface IssueAreaMutation_output {
  /**
   * A list of validation errors in the form, if any. If the form was valid, this list will be empty.
   */
  errors: IssueAreaMutation_output_errors[];
  session: IssueAreaMutation_output_session | null;
}

export interface IssueAreaMutation {
  output: IssueAreaMutation_output;
}

export interface IssueAreaMutationVariables {
  input: IssueAreaInput;
}

export function fetchIssueAreaMutation(fetchGraphQL: (query: string, args?: any) => Promise<any>, args: IssueAreaMutationVariables): Promise<IssueAreaMutation> {
  // The following query was taken from IssueAreaMutation.graphql.
  return fetchGraphQL(`mutation IssueAreaMutation($input: IssueAreaInput!) {
  output: issueArea(input: $input) {
    errors {
      field,
      messages
    }
    session {
      ...AllSessionInfo
    }
  }
}

${AllSessionInfo.graphQL}`, args);
}