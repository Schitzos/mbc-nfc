import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { RegisterActions } from '../fragments/RegisterActions';
import { componentTokens } from '@presentation/theme/components';

describe('RegisterActions', () => {
  const defaultProps = {
    busyAction: null,
    handleRegister: jest.fn().mockResolvedValue(undefined),
    setRegisterMode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Register button with primary variant background', () => {
    render(<RegisterActions {...defaultProps} />);
    const button = screen.getByRole('button', {
      name: /Tap NFC Card to Register/i,
    });
    expect(button).toBeTruthy();
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor:
            componentTokens.button.variants.primary.backgroundColor,
        }),
      ]),
    );
  });

  it('renders Switch to Top Up button unchanged (secondary variant)', () => {
    render(<RegisterActions {...defaultProps} />);
    const button = screen.getByRole('button', {
      name: /Switch to Top Up/i,
    });
    expect(button).toBeTruthy();
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor:
            componentTokens.button.variants.secondary.backgroundColor,
        }),
      ]),
    );
  });

  it('shows Registering... label when busyAction is register', () => {
    render(<RegisterActions {...defaultProps} busyAction="register" />);
    expect(screen.getByText('Registering...')).toBeTruthy();
  });

  it('disables Register button when busyAction is not null', () => {
    render(<RegisterActions {...defaultProps} busyAction="register" />);
    const button = screen.getByRole('button', {
      name: /Registering/i,
    });
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it('calls handleRegister on press', () => {
    render(<RegisterActions {...defaultProps} />);
    fireEvent.press(
      screen.getByRole('button', { name: /Tap NFC Card to Register/i }),
    );
    expect(defaultProps.handleRegister).toHaveBeenCalledTimes(1);
  });

  it('calls setRegisterMode(false) when Switch to Top Up is pressed', () => {
    render(<RegisterActions {...defaultProps} />);
    fireEvent.press(
      screen.getByRole('button', { name: /Switch to Top Up/i }),
    );
    expect(defaultProps.setRegisterMode).toHaveBeenCalledWith(false);
  });
});

describe('componentTokens.button.variants.pink', () => {
  it('exists with correct pink color values', () => {
    const pink = componentTokens.button.variants.pink;
    expect(pink).toBeDefined();
    expect(pink.backgroundColor).toBe('#E91E8C');
    expect(pink.borderColor).toBe('#E91E8C');
    expect(pink.textColor).toBe('#FFFFFF');
    expect(pink.iconColor).toBe('#FFFFFF');
  });
});
