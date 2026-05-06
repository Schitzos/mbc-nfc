import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appContainer } from '../../../app/container';
import type { RootStackParamList } from '../../../app/navigation';
import type { RoleActionResultDto } from '../../../application/dto/role-action-result-dto';
import { SignalButton } from '../../components/SignalButton';
import { NfcLogPanel } from '../../components/NfcLogPanel';
import { NfcActionSheet } from '../../components/NfcActionSheet';
import type { NfcActionState } from '../../components/NfcActionSheet';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { useAppStore } from '../../stores/app-store';
import { GateHeader } from './fragments/GateHeader';
import { GateResultState } from './fragments/GateResultState';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'gate'>>;

export function GateScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const appendNfcLog = useAppStore(state => state.appendNfcLog);
  const services = useMemo(() => appContainer.getGateServices(), []);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [nfcSheet, setNfcSheet] = useState<NfcActionState>({ phase: 'idle' });

  useEffect(() => {
    setSelectedRole('gate');
  }, [setSelectedRole]);

  useEffect(() => {
    services.checkNfcAvailabilityUseCase
      .execute()
      .then(status =>
        appendNfcLog(`[NFC] Availability result: ${status.status}`),
      )
      .catch(() => undefined);
  }, [appendNfcLog, services]);

  const handleCheckIn = async () => {
    setBusy(true);
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to check in',
    });
    try {
      appendNfcLog('[NFC] Check-in flow started');
      const result = await services.checkInActivityUseCase.execute({
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
      });
      setLatestResult(result);
      if (result.success) {
        setNfcSheet({
          phase: 'success',
          title: 'Checked In',
          message: result.message,
        });
        appendNfcLog('[NFC] Check-in succeeded');
      } else {
        setNfcSheet({
          phase: 'error',
          title: 'Check-In Failed',
          message: result.message,
        });
        appendNfcLog(`[NFC] Check-in failed: ${result.message}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Check-in error: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <BackgroundDecor variant="gate" />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="gap-4">
          <GateHeader onBack={() => navigation.goBack()} />

          <View className="rounded-2xl bg-white p-4 shadow-sm">
            <View className="rounded-xl border border-[#2A8BFF] bg-[#EAF4FF] p-3">
              <Text className="text-sm font-semibold text-muted">
                Selected activity
              </Text>
              <Text className="text-2xl font-bold text-foreground">
                Parking
              </Text>
              <Text className="text-sm text-muted">
                Rp 2.000 / started hour
              </Text>
            </View>
          </View>

          <SignalButton
            label={busy ? 'Processing...' : 'Tap Card to Check In'}
            disabled={busy}
            onPress={() => {
              handleCheckIn().catch(() => undefined);
            }}
          />

          <GateResultState latestResult={latestResult} />

          <NfcLogPanel />
        </View>

        <NfcActionSheet
          state={nfcSheet}
          onDismiss={() => setNfcSheet({ phase: 'idle' })}
        />
      </ScrollView>
    </View>
  );
}
