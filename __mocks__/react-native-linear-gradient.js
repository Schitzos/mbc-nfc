const React = require('react');

const LinearGradient = (props) =>
  React.createElement('LinearGradient', props, props.children);
LinearGradient.displayName = 'LinearGradient';

module.exports = LinearGradient;
module.exports.default = LinearGradient;
