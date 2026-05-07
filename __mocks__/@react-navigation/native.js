const goBack = jest.fn();
const navigate = jest.fn();

module.exports = {
  useNavigation: () => ({ goBack, navigate }),
  useRoute: () => ({ params: {} }),
  NavigationContainer: ({ children }) => children,
  __mockNavigation: { goBack, navigate },
};
