import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

describe('AppHeaderCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with dark blue solid background', () => {
    const { UNSAFE_root } = render(<AppHeaderCard title="Test" />);
    const wrapper = UNSAFE_root.children[0] as any;
    expect(wrapper.props.className).toContain('bg-[#001A41]');
  });

  it('renders title text', () => {
    render(<AppHeaderCard title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    render(<AppHeaderCard title="Title" subTitle="Sub" />);
    expect(screen.getByText('Sub')).toBeTruthy();
  });

  it('renders back button and navigates on press', () => {
    render(<AppHeaderCard title="Title" hasBackButton />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('does not render back button when hasBackButton is false', () => {
    render(<AppHeaderCard title="Title" />);
    expect(screen.queryByLabelText('Go back')).toBeNull();
  });

  it('renders right icon when provided', () => {
    const { Text } = require('react-native');
    const icon = <Text>RightIcon</Text>;
    render(<AppHeaderCard title="Title" rightIcon={icon} />);
    expect(screen.getByText('RightIcon')).toBeTruthy();
  });
});
