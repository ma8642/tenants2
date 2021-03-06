import React from 'react';

import { ProgressRoutesTester } from './progress-routes-tester';
import RentalHistoryRoutes, { getRentalHistoryRoutesProps, GenerateUserRhFormInput } from '../rental-history';
import Routes from '../routes';
import { AppTesterPal } from './app-tester-pal';
import { browserStorage } from '../browser-storage';
import { FakeAppContext } from './util';
import { BlankRhFormInput } from '../queries/RhFormMutation';
import { AppContextType } from '../app-context';
import { RhFormInput, OnboardingInfoSignupIntent, OnboardingInfoBorough } from '../queries/globalTypes';

const tester = new ProgressRoutesTester(getRentalHistoryRoutesProps(), 'Rental History');

tester.defineSmokeTests();

describe('Rental history frontend', () => {
    afterEach(AppTesterPal.cleanup);

    it('returns splash page by default', () => {
      expect(tester.getLatestStep()).toBe(Routes.locale.rh.splash);
    });
  
    it('returns splash even if user is logged in', () => {
      expect(tester.getLatestStep({
        phoneNumber: '5551234567'
      })).toBe(Routes.locale.rh.splash);
    });

    it('shows user details on form if user is logged in', () => {
      const loggedInAppContext: AppContextType = 
        { ...FakeAppContext, 
          session:{
            ...FakeAppContext.session, 
            userId: 1,
            firstName: "boop",
            lastName: "jones",
            phoneNumber: "2120000000",
            onboardingInfo: {
              address: "150 DOOMBRINGER STREET",
              signupIntent: OnboardingInfoSignupIntent.LOC,
              borough: OnboardingInfoBorough.MANHATTAN,
              padBbl: '1234567890',
              aptNumber: "1",
              floorNumber: null
            }
          }
        }

      const expectedFormInput: RhFormInput = { 
        firstName: "boop",
        lastName: "jones",
        address: "150 DOOMBRINGER STREET",
        apartmentNumber: "1",
        borough: "MANHATTAN",
        phoneNumber: "2120000000"
      }

      expect(GenerateUserRhFormInput(loggedInAppContext)).toEqual(expectedFormInput);

    });

    it('shows blank form if no user is logged in and no form data saved to session', () => {
      expect(GenerateUserRhFormInput(FakeAppContext)).toEqual(BlankRhFormInput);
    });

    it('deletes user details on clicking cancel button', () => {
      const pal = new AppTesterPal(<RentalHistoryRoutes />, {
        url: Routes.locale.rh.form,
        session: {
          rentalHistoryInfo: {
            firstName: 'boop',
            lastName: 'jones',
            address: "150 DOOMBRINGER STREET",
            apartmentNumber: '2',
            phoneNumber: '2120000000',
            borough: 'MANHATTAN',
            zipcode: '10001',
            addressVerified: true,
          },
        }
      });
      const inputAddress = pal.rr.getAllByLabelText(/address/i)[0] as HTMLInputElement;
      expect(inputAddress.value).toEqual('150 DOOMBRINGER STREET, Manhattan');
      const inputPhone = pal.rr.getByLabelText('Phone number') as HTMLInputElement;
      expect(inputPhone.value).toEqual('(212) 000-0000');

      pal.clickButtonOrLink('Cancel request');
      pal.expectFormInput({});

    });

    it('shows an anonymous users address from DDO in form', () => {
      browserStorage.update({latestAddress: "150 DOOMBRINGER STREET"});
      browserStorage.update({latestBorough: "MANHATTAN"});

      const pal = new AppTesterPal(<RentalHistoryRoutes />, {
        url: Routes.locale.rh.form,
        session: {
          userId: null,
          rentalHistoryInfo: null
        }
      });

      const inputAddress = pal.rr.getAllByLabelText(/address/i)[0] as HTMLInputElement;
      expect(inputAddress.value).toEqual('150 DOOMBRINGER STREET, Manhattan');

      browserStorage.clear();

    });

  });
