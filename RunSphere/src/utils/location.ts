import Geolocation from 'react-native-geolocation-service';
import {Platform} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  openSettings,
} from 'react-native-permissions';

const getAndroidPermission = () => PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

const getIosPermission = () => PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

const getPermission = () =>
  Platform.OS === 'android' ? getAndroidPermission() : getIosPermission();

export const requestLocationPermission = async () => {
  const permission = getPermission();
  const currentStatus = await check(permission);

  if (currentStatus === RESULTS.GRANTED) {
    return true;
  }

  if (currentStatus === RESULTS.BLOCKED) {
    await openSettings();
    return false;
  }

  const requestStatus = await request(permission);
  return requestStatus === RESULTS.GRANTED;
};

export const getCurrentLocation = () =>
  new Promise<Geolocation.GeoPosition>((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
      forceRequestLocation: true,
      showLocationDialog: true,
    });
  });

export const startLocationWatch = (
  onSuccess: (position: Geolocation.GeoPosition) => void,
  onError: (error: Geolocation.GeoError) => void,
) =>
  Geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    distanceFilter: 5,
    interval: 2000,
    fastestInterval: 1000,
    forceRequestLocation: true,
    showLocationDialog: true,
  });

export const stopLocationWatch = (watchId: number | null) => {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
  }
};
