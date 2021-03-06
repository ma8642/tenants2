import React from 'react';
import { AppTesterPal } from "../../tests/app-tester-pal";
import Routes from '../../routes';
import { BlankDDOSuggestionsResult } from '../../queries/DDOSuggestionsResult';
import { DataDrivenOnboardingSuggestions_output } from '../../queries/DataDrivenOnboardingSuggestions';
import { createMockFetch } from '../../tests/mock-fetch';
import { FakeGeoResults, nextTick } from '../../tests/util';
import { suppressSpuriousActErrors } from '../../tests/react-act-workaround';
import DataDrivenOnboardingPage, { isBuildingClassBorC } from '../data-driven-onboarding';
import { Route } from 'react-router';

async function simulateResponse(response: Partial<DataDrivenOnboardingSuggestions_output>|null) {
  const output: DataDrivenOnboardingSuggestions_output|null =
    response ? {...BlankDDOSuggestionsResult, ...response} : null;

  jest.useFakeTimers();
  const fetch = createMockFetch();
  const pal = new AppTesterPal(<Route path={Routes.locale.home} exact component={DataDrivenOnboardingPage} />, {
    url: Routes.locale.home
  });
  await suppressSpuriousActErrors(async () => {
    await nextTick();
    fetch.mockReturnJson(FakeGeoResults);
    pal.fillFormFields([[/address/i, '150 cou']]);
    await fetch.resolvePromisesAndTimers();
    pal.clickListItem(/150 COURT STREET/);
    pal.clickButtonOrLink(/search address/i);
    pal.expectGraphQL(/ddoSuggestions/);
    pal.getFirstRequest().resolve({output});
    await nextTick();
  });
  return pal;
}

describe('Data driven onboarding', () => {
  afterEach(AppTesterPal.cleanup);

  it('shows suggestions when they exist', async () => {
    const pal = await simulateResponse({unitCount: 5});
    pal.rr.getByText(/No registration found./i);
  });

  it('apologizes when we could not find anything', async () => {
    const pal = await simulateResponse(null);
    pal.rr.getByText(/sorry, we don't recognize the address/i);
  });
});

test('isBuildingClassBorC() works', () => {
  // https://www1.nyc.gov/assets/finance/jump/hlpbldgcode.html
  expect(isBuildingClassBorC(null)).toBe(false);
  expect(isBuildingClassBorC("C0")).toBe(true);
  expect(isBuildingClassBorC("B1")).toBe(true);
  expect(isBuildingClassBorC("D0")).toBe(false);
});
