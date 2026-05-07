import React from 'react';
import { SignalButton } from '@presentation/components/SignalButton';
import { TopUpCard } from './TopUpCard';

interface TopUpActionsProps {
  busyAction: string | null;
  topUpAmount: string;
  setTopUpAmount: (v: string) => void;
  handleTopUp: () => Promise<void>;
  setRegisterMode: (v: boolean) => void;
}

export function TopUpActions({
  busyAction,
  topUpAmount,
  setTopUpAmount,
  handleTopUp,
  setRegisterMode,
}: Readonly<TopUpActionsProps>): React.JSX.Element {
  return (
    <>
      <TopUpCard topUpAmount={topUpAmount} setTopUpAmount={setTopUpAmount} />
      <SignalButton
        label={
          busyAction === 'topup' ? 'Processing...' : 'Tap NFC Card to Top Up'
        }
        disabled={busyAction !== null}
        onPress={() => {
          void handleTopUp();
        }}
      />
      <SignalButton
        label="Switch to Register"
        variant="secondary"
        onPress={() => setRegisterMode(true)}
      />
    </>
  );
}
