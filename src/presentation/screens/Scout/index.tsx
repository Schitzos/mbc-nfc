import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SignalButton } from '@presentation/components/SignalButton';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { useScoutServices } from '@presentation/context/service-context';
import { useScoutActions } from './useScoutActions';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';
import { ScoutErrorCard } from './fragments/MemberCardError';
import { MemberCardInfo } from './fragments/MemberCardInfo';
import { LatestLogsCard } from './fragments/LatestLogsCard';

export function ScoutScreen(): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useScoutServices();
  const actions = useScoutActions(services);

  useEffect(() => {
    setSelectedRole('scout');
  }, [setSelectedRole]);

  return (
    <View className="flex-1 bg-[#001A41]">
      <View className="flex-1">
        <AppHeaderCard
          title="The Scout"
          subTitle="Card Inspection and Member Info"
          hasBackButton={true}
          rightIcon={
            <View className="bg-purple-700 px-4 py-1 rounded-full">
              <Text className="text-white">Scout</Text>
            </View>
          }
        />
        <View className="-mt-3 rounded-t-3xl bg-[#F0F2F5] px-5 pt-5 pb-6 flex-1">
          <View className="gap-4">
            <SignalButton
              label={actions.busy ? 'Inspecting...' : 'Tap Card to Inspect'}
              disabled={actions.busy}
              onPress={() => {
                void actions.handleInspect();
              }}
              leftIcon={<Text className="text-white">{'((•))'}</Text>}
            />

            {/* Error state */}
            {actions.latestResult?.success === false && (
              <ScoutErrorCard message={actions.latestResult.message} />
            )}

            {/* Member Card (Read-Only) */}
            {actions.latestResult?.card && (
              <MemberCardInfo card={actions.latestResult.card} />
            )}

            {/* Latest Five Logs */}
            {actions.latestResult?.card && (
              <LatestLogsCard
                logs={actions.latestResult.card.transactionLogs}
              />
            )}

            <NfcLogPanel />
          </View>
        </View>

        <NfcActionSheet
          state={actions.nfcSheet}
          onDismiss={() => actions.handleDismissSheet()}
        />
      </View>
    </View>
  );
}
