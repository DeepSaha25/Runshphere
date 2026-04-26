/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    getItem: jest.fn(async key => (store.has(key) ? store.get(key) : null)),
    setItem: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    removeItem: jest.fn(async key => {
      store.delete(key);
    }),
    clear: jest.fn(async () => {
      store.clear();
    }),
  };
});

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(async () => false),
  setGenericPassword: jest.fn(async () => true),
  resetGenericPassword: jest.fn(async () => true),
}));

jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    ANDROID: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      ACCESS_BACKGROUND_LOCATION: 'android.permission.ACCESS_BACKGROUND_LOCATION',
    },
    IOS: {
      LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS',
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    BLOCKED: 'blocked',
    DENIED: 'denied',
  },
  check: jest.fn(async () => 'granted'),
  request: jest.fn(async () => 'granted'),
  openSettings: jest.fn(async () => undefined),
}));

jest.mock('react-native-background-geolocation', () => ({
  __esModule: true,
  default: {
    DesiredAccuracy: {High: -1},
    ActivityType: {Fitness: 3},
    ready: jest.fn(async () => ({enabled: false})),
    start: jest.fn(async () => ({enabled: true})),
    stop: jest.fn(async () => ({enabled: false})),
    getCurrentPosition: jest.fn(),
    onLocation: jest.fn(() => ({remove: jest.fn()})),
  },
}));

jest.mock('@maplibre/maplibre-react-native', () => {
  const React = require('react');
  const {View} = require('react-native');
  const Component = ({children}) =>
    React.createElement(View, null, children);

  return {
    Map: Component,
    Camera: React.forwardRef((props, ref) => React.createElement(View, null)),
    GeoJSONSource: Component,
    Layer: Component,
    Marker: Component,
  };
});

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const {View} = require('react-native');
  return ({children, ...props}) =>
    React.createElement(View, props, children);
});

jest.mock('react-native-toast-message', () => {
  const React = require('react');
  const {View} = require('react-native');
  const Toast = () => React.createElement(View);
  Toast.show = jest.fn();
  return Toast;
});
