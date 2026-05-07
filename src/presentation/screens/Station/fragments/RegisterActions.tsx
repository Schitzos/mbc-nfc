import React from 'react';
import { Text } from 'react-native';
import { SignalButton } from '@presentation/components/SignalButton';

interface RegisterActionsProps {
  busyAction: string | null;
  handleRegister: () => Promise<void>;
  setRegisterMode: (v: boolean) => void;
}

export function RegisterActions({
  busyAction,
  handleRegister,
  setRegisterMode,
}: Readonly<RegisterActionsProps>): React.JSX.Element {
  return (
    <>
      <SignalButton
        label={
          busyAction === 'register' ? 'Registering...' : 'Tap NFC Card to Register'
        }
        disabled={busyAction !== null}
        onPress={() => void handleRegister()}
        leftIcon={<Text className="text-white">{'((•))'}</Text>}
      />
      <SignalButton
        label="Switch to Top Up"
        variant="secondary"
        onPress={() => setRegisterMode(false)}
      />
    </>
  );
}
