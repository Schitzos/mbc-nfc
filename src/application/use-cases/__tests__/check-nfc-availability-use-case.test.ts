import { createCheckNfcAvailabilityUseCase } from '@application/use-cases/check-nfc-availability-use-case';
import type {
  NfcAvailabilityRepository,
  NfcAvailabilityStatus,
} from '@domain/repositories/nfc-availability-repository';

function createRepository(
  status: NfcAvailabilityStatus,
): NfcAvailabilityRepository {
  return {
    isSupported: jest.fn().mockResolvedValue(status === 'SUPPORTED'),
    getAvailabilityStatus: jest.fn().mockResolvedValue(status),
  };
}

describe('createCheckNfcAvailabilityUseCase', () => {
  it('returns a supported result when NFC is available', async () => {
    const useCase = createCheckNfcAvailabilityUseCase(
      createRepository('SUPPORTED'),
    );

    await expect(useCase.execute()).resolves.toMatchObject({
      supported: true,
      status: 'SUPPORTED',
    });
  });

  it('returns an unsupported result when NFC hardware is missing', async () => {
    const useCase = createCheckNfcAvailabilityUseCase(
      createRepository('UNSUPPORTED'),
    );

    await expect(useCase.execute()).resolves.toMatchObject({
      supported: false,
      status: 'UNSUPPORTED',
    });
  });

  it('returns a disabled result when the platform can distinguish disabled NFC', async () => {
    const useCase = createCheckNfcAvailabilityUseCase(
      createRepository('DISABLED'),
    );

    await expect(useCase.execute()).resolves.toMatchObject({
      supported: false,
      status: 'DISABLED',
    });
  });

  it('returns an unavailable result when NFC cannot be prepared right now', async () => {
    const useCase = createCheckNfcAvailabilityUseCase(
      createRepository('UNAVAILABLE'),
    );

    await expect(useCase.execute()).resolves.toMatchObject({
      supported: false,
      status: 'UNAVAILABLE',
    });
  });
});
