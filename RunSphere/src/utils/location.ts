import {Platform} from 'react-native';
import BackgroundGeolocation, {
  Location,
  LocationError,
  Subscription,
} from 'react-native-background-geolocation';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  openSettings,
} from 'react-native-permissions';

type LocationPosition = {
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy?: number | null;
    speed?: number | null;
    heading?: number | null;
  };
  timestamp: number;
};

type LocationWatch = {
  remove: () => void;
};

let readyPromise: Promise<unknown> | null = null;

const getAndroidPermission = () => PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
const getAndroidBackgroundPermission = () =>
  PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION;
const getIosPermission = () => PERMISSIONS.IOS.LOCATION_ALWAYS;

const getPermission = () =>
  Platform.OS === 'android' ? getAndroidPermission() : getIosPermission();

const ensureBackgroundTrackerReady = () => {
  if (!readyPromise) {
    readyPromise = BackgroundGeolocation.ready({
      geolocation: {
        desiredAccuracy: BackgroundGeolocation.DesiredAccuracy.High,
        distanceFilter: 5,
        locationUpdateInterval: 2000,
        fastestLocationUpdateInterval: 1000,
        pausesLocationUpdatesAutomatically: false,
        activityType: BackgroundGeolocation.ActivityType.Fitness,
        locationAuthorizationRequest: 'Always',
        showsBackgroundLocationIndicator: true,
      },
      app: {
        stopOnTerminate: false,
        startOnBoot: false,
        preventSuspend: true,
        notification: {
          title: 'RunSphere is tracking your run',
          text: 'GPS tracking remains active until you stop the run.',
          channelName: 'Run tracking',
        },
        backgroundPermissionRationale: {
          title: 'Allow RunSphere to track runs in the background',
          message:
            'RunSphere needs background GPS so your run keeps recording when your phone is locked.',
          positiveAction: 'Open settings',
          negativeAction: 'Cancel',
        },
      },
      activity: {
        disableMotionActivityUpdates: true,
      },
    });
  }

  return readyPromise;
};

export const requestLocationPermission = async () => {
  const permission = getPermission();
  const currentStatus = await check(permission);

  if (currentStatus === RESULTS.GRANTED) {
    await requestAndroidBackgroundPermission();
    await ensureBackgroundTrackerReady();
    return true;
  }

  if (currentStatus === RESULTS.BLOCKED) {
    await openSettings();
    return false;
  }

  const requestStatus = await request(permission);
  if (requestStatus !== RESULTS.GRANTED) {
    return false;
  }

  await requestAndroidBackgroundPermission();
  await ensureBackgroundTrackerReady();
  return true;
};

export const getCurrentLocation = async (): Promise<LocationPosition> => {
  await ensureBackgroundTrackerReady();
  const location = await BackgroundGeolocation.getCurrentPosition({
    samples: 3,
    persist: true,
    timeout: 30,
    maximumAge: 5000,
  });

  return toPosition(location);
};

export const startLocationWatch = (
  onSuccess: (position: LocationPosition) => void,
  onError: (error: {message: string; code?: number}) => void,
): LocationWatch => {
  let locationSubscription: Subscription | null = null;
  let started = true;

  ensureBackgroundTrackerReady()
    .then(() => {
      if (!started) {
        return;
      }

      locationSubscription = BackgroundGeolocation.onLocation(
        location => onSuccess(toPosition(location)),
        error => onError(toLocationError(error)),
      );

      return BackgroundGeolocation.start();
    })
    .catch(error => {
      onError({
        message: error?.message || 'Unable to start background GPS tracking',
      });
    });

  return {
    remove: () => {
      started = false;
      locationSubscription?.remove();
      BackgroundGeolocation.stop();
    },
  };
};

export const stopLocationWatch = (watch: LocationWatch | null) => {
  watch?.remove();
};

const requestAndroidBackgroundPermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 29) {
    return;
  }

  const permission = getAndroidBackgroundPermission();
  const currentStatus = await check(permission);
  if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.BLOCKED) {
    return;
  }

  await request(permission);
};

const toPosition = (location: Location): LocationPosition => ({
  coords: {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    altitude:
      typeof location.coords.altitude === 'number'
        ? location.coords.altitude
        : null,
    accuracy:
      typeof location.coords.accuracy === 'number'
        ? location.coords.accuracy
        : null,
    speed:
      typeof location.coords.speed === 'number' ? location.coords.speed : null,
    heading:
      typeof location.coords.heading === 'number'
        ? location.coords.heading
        : null,
  },
  timestamp: new Date(location.timestamp).getTime(),
});

const toLocationError = (error: LocationError | number) => ({
  code: typeof error === 'number' ? error : undefined,
  message: `Location error ${typeof error === 'number' ? error : 'unknown'}`,
});
