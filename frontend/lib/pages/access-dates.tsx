import React from 'react';

import Page from "../page";
import { LegacyFormSubmitter } from '../forms';
import { TextualFormField } from '../form-fields';
import { AccessDatesMutation } from '../queries/AccessDatesMutation';
import { AppContextType, withAppContext } from '../app-context';
import { AccessDatesInput } from '../queries/globalTypes';
import { NextButton } from './onboarding-step-1';
import Routes from '../routes';
import { Link } from 'react-router-dom';
import { assertNotNull } from '../util';


function getInitialState(accessDates: string[]): AccessDatesInput {
  const result: AccessDatesInput = {
    date1: '',
    date2: '',
    date3: ''
  };
  accessDates.forEach((date, i) => {
    (result as any)[`date${i + 1}`] = date;
  });
  return result;
}

function AccessDatesPageWithAppContext(props: AppContextType): JSX.Element {
  return (
    <Page title="Access dates">
      <h1 className="title">Access dates</h1>
      <div className="content">
        <p>Access dates are times you know when you will be home for the landlord to schedule repairs.</p>
        <p>Please provide up to three access dates you will be available (allowing at least a week for the letter to be received).</p>
      </div>
      <LegacyFormSubmitter
        mutation={AccessDatesMutation}
        initialState={getInitialState(props.session.accessDates)}
        onSuccess={(output) => {
          props.updateSession(assertNotNull(output.session));
        }}
        onSuccessRedirect={Routes.loc.yourLandlord}
      >
        {(ctx) => (
          <React.Fragment>
            <TextualFormField label="First access date" type="date" {...ctx.fieldPropsFor('date1')} />
            <TextualFormField label="Second access date (optional)" type="date" {...ctx.fieldPropsFor('date2')} />
            <TextualFormField label="Third access date (optional)" type="date" {...ctx.fieldPropsFor('date3')} />
            <div className="field is-grouped">
              <div className="control">
                <Link to={Routes.loc.issues.home} className="button is-text">Cancel and go back</Link>
              </div>
              <NextButton isLoading={ctx.isLoading} />
            </div>
          </React.Fragment>
        )}
      </LegacyFormSubmitter>
    </Page>
  );
}

const AccessDatesPage = withAppContext(AccessDatesPageWithAppContext);

export default AccessDatesPage;
