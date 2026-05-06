/**
 * Verifies that the barrel re-export files correctly expose their screen components.
 * These are simple re-exports but must be covered for the changed-file policy.
 */

describe('screen barrel exports', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('GateScreen.tsx re-exports GateScreen from Gate/', () => {
    jest.mock('../Gate', () => ({ GateScreen: 'GateScreenMock' }));
    const { GateScreen } = require('../GateScreen');
    expect(GateScreen).toBe('GateScreenMock');
  });

  it('RoleSwitcherScreen.tsx re-exports RoleSwitcherScreen from RoleSwitcher/', () => {
    jest.mock('../RoleSwitcher', () => ({
      RoleSwitcherScreen: 'RoleSwitcherScreenMock',
    }));
    const { RoleSwitcherScreen } = require('../RoleSwitcherScreen');
    expect(RoleSwitcherScreen).toBe('RoleSwitcherScreenMock');
  });

  it('ScoutScreen.tsx re-exports ScoutScreen from Scout/', () => {
    jest.mock('../Scout', () => ({ ScoutScreen: 'ScoutScreenMock' }));
    const { ScoutScreen } = require('../ScoutScreen');
    expect(ScoutScreen).toBe('ScoutScreenMock');
  });

  it('StationScreen.tsx re-exports StationScreen from Station/', () => {
    jest.mock('../Station', () => ({ StationScreen: 'StationScreenMock' }));
    const { StationScreen } = require('../StationScreen');
    expect(StationScreen).toBe('StationScreenMock');
  });

  it('TerminalScreen.tsx re-exports TerminalScreen from Terminal/', () => {
    jest.mock('../Terminal', () => ({
      TerminalScreen: 'TerminalScreenMock',
    }));
    const { TerminalScreen } = require('../TerminalScreen');
    expect(TerminalScreen).toBe('TerminalScreenMock');
  });
});
