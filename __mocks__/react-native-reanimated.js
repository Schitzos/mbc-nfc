const React = require('react');
const { View } = require('react-native');

const Animated = {
  View: View,
  Text: require('react-native').Text,
  Image: require('react-native').Image,
  ScrollView: require('react-native').ScrollView,
  FlatList: require('react-native').FlatList,
};

module.exports = {
  __esModule: true,
  default: Animated,
  useSharedValue: (init) => ({ value: init }),
  useAnimatedStyle: (fn) => fn(),
  withTiming: (toValue) => toValue,
  withDelay: (_delay, anim) => anim,
  withRepeat: (anim) => anim,
  Easing: {
    linear: (v) => v,
    ease: (v) => v,
    cubic: (v) => v,
    out: (fn) => fn,
    in: (fn) => fn,
    inOut: (fn) => fn,
  },
};
