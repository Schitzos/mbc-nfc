jest.mock('../src/app/App', () => ({
  __esModule: true,
  default: 'MOCK_SRC_APP',
}));

import RootApp from '../App';

describe('Root app export', () => {
  it('exports src app entrypoint', () => {
    expect(RootApp).toBe('MOCK_SRC_APP');
  });
});
