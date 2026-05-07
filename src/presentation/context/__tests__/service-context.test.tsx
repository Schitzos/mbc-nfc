import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import {
  ServiceProvider,
  useStationServices,
  useGateServices,
  useTerminalServices,
  useScoutServices,
} from '../service-context';

const mockServices = {
  station: { checkNfcAvailabilityUseCase: { execute: jest.fn() } },
  gate: { checkNfcAvailabilityUseCase: { execute: jest.fn() } },
  terminal: { checkNfcAvailabilityUseCase: { execute: jest.fn() } },
  scout: { checkNfcAvailabilityUseCase: { execute: jest.fn() } },
} as never;

function StationConsumer() {
  const s = useStationServices();
  return <Text>{s ? 'station-ok' : 'no'}</Text>;
}
function GateConsumer() {
  const s = useGateServices();
  return <Text>{s ? 'gate-ok' : 'no'}</Text>;
}
function TerminalConsumer() {
  const s = useTerminalServices();
  return <Text>{s ? 'terminal-ok' : 'no'}</Text>;
}
function ScoutConsumer() {
  const s = useScoutServices();
  return <Text>{s ? 'scout-ok' : 'no'}</Text>;
}

describe('service-context', () => {
  it('provides station services', () => {
    render(
      <ServiceProvider services={mockServices}>
        <StationConsumer />
      </ServiceProvider>,
    );
    expect(screen.getByText('station-ok')).toBeTruthy();
  });

  it('provides gate services', () => {
    render(
      <ServiceProvider services={mockServices}>
        <GateConsumer />
      </ServiceProvider>,
    );
    expect(screen.getByText('gate-ok')).toBeTruthy();
  });

  it('provides terminal services', () => {
    render(
      <ServiceProvider services={mockServices}>
        <TerminalConsumer />
      </ServiceProvider>,
    );
    expect(screen.getByText('terminal-ok')).toBeTruthy();
  });

  it('provides scout services', () => {
    render(
      <ServiceProvider services={mockServices}>
        <ScoutConsumer />
      </ServiceProvider>,
    );
    expect(screen.getByText('scout-ok')).toBeTruthy();
  });

  it('throws when used outside provider', () => {
    const spy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    expect(() => render(<StationConsumer />)).toThrow(
      'useServices must be used within ServiceProvider',
    );
    spy.mockRestore();
  });
});
