import { CheckNfcAvailabilityUseCase } from '../check-nfc-availability-use-case';
import type { MbcCardRepository } from '../../../domain/repositories/mbc-card-repository';
import type { NfcAvailabilityStatus } from '../../dto/check-nfc-availability-result-dto';

function createRepository(status?: NfcAvailabilityStatus): MbcCardRepository & {
  getAvailabilityStatus?: () => Promise<NfcAvailabilityStatus>;
} {
  return {
    isSupported: jest.fn().mockResolvedValue(status !== 'UNSUPPORTED'),
    readCard: jest.fn(),
    writeCard: jest.fn(),
    cancel: jest.fn(),
    getAvailabilityStatus: status
      ? jest.fn().mockResolvedValue(status)
      : undefined,
  };
}

describe('CheckNfcAvailabilityUseCase', () => {
  it('returns a supported result when NFC is available', async () => {
    const useCase = new CheckNfcAvailabilityUseCase(
      createRepository('SUPPORTED'),
    );

    await expect(useCase.execute()).resolves.toMatchObject({
      supported: true,
      status: 'SUPPORTED',
      shouldUseMockMode: false,
    });
  });

  it('returns an unsupported result when NFC hardware is missing', async () => {
    const useCase = new CheckNfcAvailabilityUseCase(
      createRepository('UNSUPPORTED'),
    );

    await expect(useCase.execute()).resolves.toMatchObject({
      supported: false,
      status: 'UNSUPPORTED',
      shouldUseMockMode: true,
    });
  });

  it('returns a disabled result when the platform can distinguish disabled NFC', async () => {
    const useCase = new CheckNfcAvailabilityUseCase(
      createRepository('DISABLED'),
    );

    await expect(useCase.execute()).resolves.toMatchObject({
      supported: false,
      status: 'DISABLED',
      shouldUseMockMode: true,
    });
  });

  it('returns an unavailable result when NFC cannot be prepared right now', async () => {
    const useCase = new CheckNfcAvailabilityUseCase(
      createRepository('UNAVAILABLE'),
    );

    await expect(useCase.execute()).resolves.toMatchObject({
      supported: false,
      status: 'UNAVAILABLE',
      shouldUseMockMode: true,
    });
  });

  it('falls back to isSupported when detailed availability is not provided', async () => {
    const useCase = new CheckNfcAvailabilityUseCase({
      isSupported: jest.fn().mockResolvedValue(true),
      readCard: jest.fn(),
      writeCard: jest.fn(),
      cancel: jest.fn(),
    });

    await expect(useCase.execute()).resolves.toMatchObject({
      supported: true,
      status: 'SUPPORTED',
    });
  });
});
