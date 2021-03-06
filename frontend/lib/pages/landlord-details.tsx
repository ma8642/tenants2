import React from 'react';

import Page from "../page";
import { SessionUpdatingFormSubmitter } from '../session-updating-form-submitter';
import { TextualFormField, TextareaFormField } from '../form-fields';

import { BackButton, ProgressButtons } from "../buttons";
import Routes from '../routes';
import { LandlordDetailsInput } from '../queries/globalTypes';
import { LandlordDetailsMutation, BlankLandlordDetailsInput } from '../queries/LandlordDetailsMutation';
import { AppContextType, withAppContext } from '../app-context';
import { exactSubsetOrDefault } from '../util';
import { Link } from 'react-router-dom';
import { AllSessionInfo_landlordDetails } from '../queries/AllSessionInfo';
import { FormContext } from '../form-context';


const PREV_STEP = () => Routes.locale.loc.accessDates;

const NEXT_STEP = () => Routes.locale.loc.preview;

function renderForm(ctx: FormContext<LandlordDetailsInput>): JSX.Element {
  return (
    <React.Fragment>
      <TextualFormField label="Landlord's name" type="text" {...ctx.fieldPropsFor('name')} />
      <TextareaFormField label="Landlord's address" {...ctx.fieldPropsFor('address')} />
      <ProgressButtons back={PREV_STEP()} isLoading={ctx.isLoading} nextLabel="Preview letter" />
    </React.Fragment>
  );
}

function getIntroText(isLookedUp: boolean|null): JSX.Element {
  return isLookedUp
    ? (
      <React.Fragment>
        <p className="subtitle is-6">This is your landlord’s information as registered with the <b>NYC Department of Housing and Preservation (HPD)</b>. This may be different than where you send your rent checks.</p>
        <p className="subtitle is-6">We will use this address to ensure your landlord receives it.</p>
      </React.Fragment>
    )
    : (
      <React.Fragment>
        <p className="subtitle is-6">Please enter your landlord's name and contact information below. You can find this information on your lease and/or rent receipts.</p>
      </React.Fragment>
    );
}

function splitLines(text: string): JSX.Element[] {
  return text.split('\n').map((line, i) => <div key={i}>{line}</div>);
}

function ReadOnlyLandlordDetails(props: {details: AllSessionInfo_landlordDetails}): JSX.Element {
  const { details } = props;

  return (
    <div className="content">
      <dl>
        <dt><strong>Landlord name</strong></dt>
        <dd>{details.name}</dd>
        <br/>
        <dt><strong>Landlord address</strong></dt>
        <dd>{splitLines(details.address)}</dd>
      </dl>
      <ProgressButtons>
        <BackButton to={PREV_STEP()} />
        <Link to={NEXT_STEP()} className="button is-primary is-medium">Preview letter</Link>
      </ProgressButtons>
    </div>
  );
}

export default withAppContext(function LandlordDetailsPage(props: AppContextType): JSX.Element {
  const { landlordDetails } = props.session;

  return (
    <Page title="Landlord information">
      <div>
        <h1 className="title is-4 is-spaced">Landlord information</h1>
        {getIntroText(landlordDetails && landlordDetails.isLookedUp)}
        {landlordDetails && landlordDetails.isLookedUp
          ? <ReadOnlyLandlordDetails details={landlordDetails} />
          : <SessionUpdatingFormSubmitter
              mutation={LandlordDetailsMutation}
              initialState={(session) => exactSubsetOrDefault(session.landlordDetails, BlankLandlordDetailsInput)}
              onSuccessRedirect={NEXT_STEP}
            >
              {renderForm}
            </SessionUpdatingFormSubmitter>
        }
      </div>
    </Page>
  );
});
