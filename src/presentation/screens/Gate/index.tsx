import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../../app/navigation';
import { SignalButton } from '../../components/SignalButton';
import { NfcLogPanel } from '../../components/NfcLogPanel';
import { NfcActionSheet } from '../../components/NfcActionSheet';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { useAppStore } from '../../stores/app-store';
import { useGateServices } from '../../context/service-context';
import { GateHeader } from './fragments/GateHeader';
import { GateResultState } from './fragments/GateResultState';
import { useGateActions } from './useGateActions';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'gate'>>;

export function GateScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useGateServices();
  const actions = useGateActions(services);
  const contentContainerStyle = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
        },
      }),
    [insets.top, insets.bottom],
  );

  useEffect(() => {
    setSelectedRole('gate');
  }, [setSelectedRole]);

  return (
    <View className="flex-1 bg-background">
      <BackgroundDecor variant="gate" />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={contentContainerStyle.container}
      >
        <View className="gap-4">
          <GateHeader onBack={() => navigation.goBack()} />

          <View className="rounded-2xl border border-[#BFE8D3] bg-[#F2FCF7] p-4">
            <Text className="text-xs font-semibold uppercase text-[#007A4D]">
              Gate Flow
            </Text>
            <Text className="mt-1 text-sm text-muted">
              Tap card to start parking session with current device time.
            </Text>
          </View>

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
            label={actions.busy ? 'Processing...' : 'Tap Card to Check In'}
            disabled={actions.busy}
            onPress={() => {
              void actions.handleCheckIn();
            }}
          />

          <GateResultState latestResult={actions.latestResult} />

          <NfcLogPanel />
        </View>

        <NfcActionSheet
          state={actions.nfcSheet}
          onDismiss={() => actions.handleDismissSheet()}
        />
      </ScrollView>
    </View>
  );
}
