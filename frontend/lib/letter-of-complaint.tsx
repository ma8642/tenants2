import React from 'react';
import Page from './page';
import { WhyMailALetterOfComplaint } from './letter-of-complaint-common';
import { Link, Route } from 'react-router-dom';
import Routes from './routes';
import { IssuesRoutes } from './pages/issue-pages';
import AccessDatesPage from './pages/access-dates';
import LandlordDetailsPage from './pages/landlord-details';
import { RouteProgressBar } from './progress-bar';
import LetterRequestPage from './pages/letter-request';
import LetterConfirmation from './pages/loc-confirmation';
import { CenteredPrimaryButtonLink } from './buttons';


export function Welcome(): JSX.Element {
  return (
    <Page title="Welcome!">
      <div className="content">
        <h1 className="title">Let's start your letter!</h1>
        <p>
          We're going to help you create a customized Letter of Complaint that highlights the issues in your apartment that need repair. This will take about 5 minutes.
        </p>
        <ol className="has-text-left">
          <li>First, conduct a self-inspection of your apartment to document all the issues that need repair.</li>
          <li>Review your Letter of Complaint and JustFix will mail it certified for you.</li>
        </ol>
        <CenteredPrimaryButtonLink to={Routes.loc.issues.home}>
          Add issues
        </CenteredPrimaryButtonLink>
        <br/>
        <WhyMailALetterOfComplaint heading="h3" />
      </div>
    </Page>
  );
}

export default function LetterOfComplaintRoutes(): JSX.Element {
  return (
    <RouteProgressBar label="Letter of Complaint">
      <Route path={Routes.loc.home} exact component={Welcome} />
      <Route path={Routes.loc.issues.prefix} component={IssuesRoutes} />
      <Route path={Routes.loc.accessDates} exact component={AccessDatesPage} />
      <Route path={Routes.loc.yourLandlord} exact component={LandlordDetailsPage} />
      <Route path={Routes.loc.preview} exact component={LetterRequestPage} />
      <Route path={Routes.loc.confirmation} exact component={LetterConfirmation} />
    </RouteProgressBar>
  );
}
