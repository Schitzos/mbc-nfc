/**
 * Intentional type alias — the domain shape is already presentation-ready
 * (plain primitives). No transformation needed for this offline-first app.
 */
import type { StationLedgerSummary } from '@domain/membership/entities/ledger-entry';

export type StationLedgerSummaryDto = StationLedgerSummary;
