import React from 'react';
import Navbar from '../navbar';
import { FakeDebugAppContext } from './util';
import { MemoryRouter } from 'react-router';
import { AppContext } from '../app-context';
import ReactTestingLibraryPal from './rtl-pal';
import { assertNotNull } from '../util';

describe('Navbar', () => {
  afterEach(ReactTestingLibraryPal.cleanup);

  const createNavbar = () => {
    const pal = new ReactTestingLibraryPal(
      <MemoryRouter>
        <AppContext.Provider value={FakeDebugAppContext}>
          <Navbar/>
        </AppContext.Provider>
      </MemoryRouter>
    );
    return {
      pal,
      click: pal.rt.fireEvent.click,
      get burger() {
        return pal.getElement('a', '.navbar-burger');
      },
      get devDropdown() {
        return assertNotNull(pal.rr.container.querySelector('.navbar-item.has-dropdown'));
      },
      get devDropdownLink() {
        return assertNotNull(this.devDropdown.querySelector('a.navbar-link'));
      }
    };
  };

  it('toggles burger when clicked', () => {
    const {burger, click} = createNavbar();
    expect(burger.classList.contains('is-active')).toBe(false);
    click(burger);
    expect(burger.classList.contains('is-active')).toBe(true);
    click(burger);
    expect(burger.classList.contains('is-active')).toBe(false);
  });

  it('toggles dev dropdown when clicked', () => {
    const {devDropdown, devDropdownLink, click} = createNavbar();
    expect(devDropdown.classList.contains('is-active')).toBe(false);
    click(devDropdownLink);
    expect(devDropdown.classList.contains('is-active')).toBe(true);
    click(devDropdownLink);
    expect(devDropdown.classList.contains('is-active')).toBe(false);
  });

  it('collapses when focus moves outside the navbar', () => {
    const navbar = createNavbar();
    navbar.click(navbar.burger);
    expect(navbar.burger.classList.contains('is-active')).toBe(true);

    const btn = document.createElement('button');
    document.body.appendChild(btn);
    try {
      btn.focus();
      expect(navbar.burger.classList.contains('is-active')).toBe(false);
    } finally {
      document.body.removeChild(btn);
    }
  });
});
