import React from 'react';
import { AppTesterPal } from "../../tests/app-tester-pal";
import DataRequestsRoutes from "../data-requests";
import Routes from '../../routes';
import { DataRequestMultiLandlordQuery } from '../../queries/DataRequestMultiLandlordQuery';
import { suppressSpuriousActErrors } from '../../tests/react-act-workaround';
import { nextTick } from '../../tests/util';

describe('Data requests', () => {
  afterEach(AppTesterPal.cleanup);

  it('should work', async () => {
    const pal = new AppTesterPal(<DataRequestsRoutes/>, {
      url: Routes.locale.dataRequests.multiLandlord
    });

    await suppressSpuriousActErrors(async () => {
      await nextTick();
      pal.fillFormFields([[/landlords/i, "Boop Jones"]]);
      pal.clickButtonOrLink(/request data/i);
  
      pal.expectGraphQL(/DataRequestMultiLandlordQuery/);
      const response: DataRequestMultiLandlordQuery = {
        output: {
          snippetRows: JSON.stringify([['blargh'], ['boop']]),
          snippetMaxRows: 20,
          csvUrl: 'http://boop'
        }
      };
  
      pal.getFirstRequest().resolve(response);
      await nextTick();
    });

    pal.rr.getByText(/blargh/);
  });
});
