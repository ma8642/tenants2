import React from 'react';

import { AllSessionInfo } from './queries/AllSessionInfo';

/** Details about the server that don't change through the app's lifetime. */
export interface AppServerInfo {
  /**
   * The URL of the server's static files, e.g. "/static/".
   */
  staticURL: string;

  /**
   * The URL to generated webpack bundles for lazy-loading, e.g. "/static/frontend/".
   */
  webpackPublicPathURL: string;

  /**
   * The URL of the server's Django admin, e.g. "/admin/".
   */
  adminIndexURL: string;

  /** The batch GraphQL endpoint; required if a GraphQL client is not provided. */
  batchGraphQLURL: string;

  /**
   * Whether the site is in development mode (corresponds to settings.DEBUG in
   * the Django app).
   */
  debug: boolean;
}

/**
 * Basic information about the app that components
 * should have relatively easy access to.
 */
export interface AppContextType {
  /**
   * Information about the server that stays constant through the app's
   * lifetime.
   */
  server: AppServerInfo;

  /**
   * Information about the current user that may change if they
   * log in/out, etc.
   */
  session: AllSessionInfo;
}

/* istanbul ignore next: this will never be executed in practice. */
class UnimplementedError extends Error {
  constructor() {
    super("This is unimplemented!");
  }
}

/* istanbul ignore next: this will never be executed in practice. */
/**
 * The default AppContext will raise an exception when any of its
 * properties are accessed; because this information is very
 * important to the user experience, we really need it to be
 * provided by the app!
 * 
 * However, we're also exporting the symbol, so test suites
 * can use Object.defineProperty() to override the properties
 * and provide defaults for testing. This will ensure that
 * tests don't need to wrap everything in an AppContext.Provider.
 */
export const defaultContext: AppContextType = {
  get server(): AppServerInfo {
    throw new UnimplementedError();
  },
  get session(): AllSessionInfo {
    throw new UnimplementedError();
  }
};

/**
 * A React Context that provides basic information about
 * the app that we don't want to have to pass down through
 * our whole component heirarchy.
 * 
 * For more details, see:
 * 
 *   https://reactjs.org/docs/context.html
 */
export const AppContext = React.createContext<AppContextType>(defaultContext);