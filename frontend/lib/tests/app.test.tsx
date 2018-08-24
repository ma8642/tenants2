import React from 'react';
import { shallow } from 'enzyme';

import { App, AppProps } from '../app';
import { createTestGraphQlClient, FakeSessionInfo, FakeServerInfo } from './util';

describe('App', () => {
  const buildApp = () => {
    const { client } = createTestGraphQlClient();
    const props: AppProps = {
      initialURL: '/',
      initialSession: FakeSessionInfo,
      server: FakeServerInfo,
    };
  
    const wrapper = shallow(<App {...props} />);
    const app = wrapper.instance() as App;
  
    app.gqlClient = client;
    return { client, app };
  };

  it('reports fetch errors', () => {
    const { app } = buildApp();

    const windowAlert = jest.fn();
    jest.spyOn(window, 'alert').mockImplementation(windowAlert);
    const consoleError = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(consoleError);
    const err = new Error('blargghh');
    app.handleFetchError(err);
    expect(consoleError.mock.calls).toHaveLength(1);
    expect(consoleError.mock.calls[0][0]).toBe(err);
    expect(windowAlert.mock.calls).toHaveLength(1);
    expect(windowAlert.mock.calls[0][0]).toContain('network error');
  });

  describe('handleLogout', () => {
    it('sets state and makes request upon starting', () => {
      const { app, client } = buildApp();

      expect(app.state.logoutLoading).toBe(false);
      app.handleLogout();
      expect(app.state.logoutLoading).toBe(true);
      const requests = client.getRequestQueue();
      expect(requests.length).toBe(1);
      expect(requests[0].query).toMatch('LogoutMutation');  
    });

    it('sets state when successful', async () => {
      const { app, client } = buildApp();
      const logout = app.handleLogout();

      client.getRequestQueue()[0].resolve({
        logout: {
          session: FakeSessionInfo
        }
      });
      await logout;
      expect(app.state.logoutLoading).toBe(false);
    });

    it('sets state when network error occurs', async () => {
      const { app, client } = buildApp();
      const logout = app.handleLogout();

      const handleFetchError = jest.fn();
      app.handleFetchError = handleFetchError;
      client.getRequestQueue()[0].reject(new Error('kaboom'));
      await logout;
      expect(app.state.logoutLoading).toBe(false);
      expect(handleFetchError.mock.calls).toHaveLength(1);
    });
  });

  describe('handleLoginSubmit()', () => {
    let payload = { phoneNumber: '1', password: '2' };

    it('sets state when successful', async () => {
      const { app, client } = buildApp();
      const login = app.handleLoginSubmit(payload);

      expect(app.state.loginLoading).toBe(true);
      client.getRequestQueue()[0].resolve({
        login: {
          session: FakeSessionInfo
        }
      });
      await login;
      expect(app.state.loginLoading).toBe(false);
    });

    it('sets state when validation errors occur', async () => {
      const { app, client } = buildApp();
      const login = app.handleLoginSubmit(payload);

      expect(app.state.loginLoading).toBe(true);
      client.getRequestQueue()[0].resolve({
        login: {
          errors: [{
            field: '__all__',
            messages: ['nope.']
          }]
        }
      });
      await login;
      expect(app.state.loginLoading).toBe(false);
      expect(app.state.loginErrors).toEqual({
        nonFieldErrors: ['nope.'],
        fieldErrors: {}
      });
    });

    it('sets state when network error occurs', async () => {
      const { app, client } = buildApp();
      const login = app.handleLoginSubmit(payload);

      const handleFetchError = jest.fn();
      app.handleFetchError = handleFetchError;
      client.getRequestQueue()[0].reject(new Error('kaboom'));
      await login;
      expect(app.state.loginLoading).toBe(false);
      expect(handleFetchError.mock.calls).toHaveLength(1);
    });
  });
});
