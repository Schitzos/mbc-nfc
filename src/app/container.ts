import { open } from '@op-engineering/op-sqlite';
import NfcManager from 'react-native-nfc-manager';

function createLedgerConnection() {
  return open({
    name: 'mbc-ledger.db',
    location: 'default',
  });
}

export const appContainer = {
  ledger: createLedgerConnection,
  nfc: NfcManager,
};
