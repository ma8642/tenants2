import React from 'react';

import Page from '../page';
import { Link } from 'react-router-dom';
import { AppContext } from '../app-context';
import Routes from '../routes';

export interface IndexPageProps {
  isLoggedIn: boolean;
}

export default class IndexPage extends React.Component<IndexPageProps> {
  renderLoggedOut() {
    return (
      <Page title="Technology for Housing Justice">
        <h1 className="title">Level the playing field between you and your landlord.</h1>
        <h2 className="subtitle">
          Learn the steps to take action to fight for your right to a safe and healthy home!
        </h2>
        <Link className="button is-medium is-fullwidth is-primary" to={Routes.onboarding.latestStep}>Get started</Link>
        <br/>
        <p>Already have an account? <Link to={Routes.login}>Sign in!</Link></p>
      </Page>
    );
  }

  renderLoggedIn() {
    return (
      <Page title="TODO SHOW SOMETHING HERE">
        <h1 className="title">Hello authenticated user!</h1>
        <p>We don't have anything for you here just yet.</p>
        <p>Perhaps you'd like to go through our <Link to={Routes.onboarding.latestStep}>onboarding</Link>?</p>
      </Page>
    );
  }

  render() {
    if (this.props.isLoggedIn) {
      return this.renderLoggedIn();
    } else {
      return this.renderLoggedOut();
    }
  }
}