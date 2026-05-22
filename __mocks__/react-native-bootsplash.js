module.exports = {
  hide: jest.fn().mockResolvedValue(undefined),
  isVisible: jest.fn().mockResolvedValue(false),
  useHideAnimation: jest.fn().mockReturnValue({ container: {}, logo: {} }),
};
