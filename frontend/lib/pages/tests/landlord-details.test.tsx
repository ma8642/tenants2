import React from 'react';

import Routes from '../../routes';
import LetterOfComplaintRoutes from '../../letter-of-complaint';
import { AppTesterPal } from '../../tests/app-tester-pal';
import { LandlordDetailsMutation_output } from '../../queries/LandlordDetailsMutation';
import { LandlordDetailsInput } from '../../queries/globalTypes';


const BLANK_LANDLORD_DETAILS = {
  name: '',
  address: '',
  isLookedUp: false
};

const LOOKED_UP_LANDLORD_DETAILS = {
  name: 'BOBBY DENVER',
  address: '123 DOOMBRINGER STREET 4\nNEW YORK 11299',
  isLookedUp: true
};

describe('landlord details page', () => {
  afterEach(AppTesterPal.cleanup);

  it('works when details are not looked up', () => {
    const pal = new AppTesterPal(<LetterOfComplaintRoutes />, {
      url: Routes.locale.loc.yourLandlord,
      session: { landlordDetails: BLANK_LANDLORD_DETAILS }
    });
    pal.rr.getByText(/Please enter your landlord's name/i);
    pal.rr.getByText(/Back/);
    pal.rr.getByText(/Preview letter/);
  });

  it('works when details are looked up', () => {
    const pal = new AppTesterPal(<LetterOfComplaintRoutes />, {
      url: Routes.locale.loc.yourLandlord,
      session: { landlordDetails: LOOKED_UP_LANDLORD_DETAILS }
    });
    pal.rr.getByText(/This may be different .+ rent checks/i);
    pal.rr.getByText(/Back/);
    pal.rr.getByText(/Preview letter/);
  });

  it('redirects to next step after successful submission', async () => {
    const pal = new AppTesterPal(<LetterOfComplaintRoutes />, {
      url: Routes.locale.loc.yourLandlord,
      session: { landlordDetails: BLANK_LANDLORD_DETAILS }
    });
    const name = "Boop Jones";
    const address = "123 Boop Way\nBoopville, NY 11299";

    pal.fillFormFields([
      [/name/i, name],
      [/address/i, address]
    ]);
    pal.clickButtonOrLink('Preview letter');
    pal.expectFormInput<LandlordDetailsInput>({ name, address });
    pal.respondWithFormOutput<LandlordDetailsMutation_output>({
      errors: [],
      session: { landlordDetails: { name, address, isLookedUp: false } }
    });

    await pal.rt.waitForElement(() => pal.rr.getByText(/Review the letter of complaint/i));
    const { mock } = pal.appContext.updateSession;
    expect(mock.calls).toHaveLength(1);
    expect(mock.calls[0][0]).toEqual({ landlordDetails: { name, address, isLookedUp: false } });
  });
});
