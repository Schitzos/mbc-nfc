import React from 'react';
import { render, act } from '@testing-library/react-native';
import { SplashScreen } from '../index';

const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ replace: mockReplace }),
}));

jest.useFakeTimers();

describe('SplashScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('renders splash image', () => {
    const { getByTestId } = render(<SplashScreen />);
    expect(getByTestId).toBeDefined();
  });

  it('hides bootsplash and navigates to roleSwitcher after 2 seconds', () => {
    render(<SplashScreen />);
    expect(mockReplace).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockReplace).toHaveBeenCalledWith('roleSwitcher');
  });

  it('cleans up timer on unmount', () => {
    const { unmount } = render(<SplashScreen />);
    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
