'use client';

import * as React from 'react';
import { Location } from '../models';

// ---------- LocationContext ----------
const LocationContext = React.createContext<Location | undefined>(undefined);

// ---------- LocationProvider ----------
interface LocationProviderProps {
  children?: React.ReactNode;
}

export default function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = React.useState<Location | undefined>();

  React.useEffect(() => {
    if ('geolocation' in navigator) {
      // Register a handler track the position of this device
      navigator.geolocation.watchPosition((position) => {
        let location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('My location:', location);
        setLocation(location);
      });
    } else {
      alert(
        'Sorry, geolocation is not available on your device. You need that to use this app'
      );
    }

    // cleanup is causing clearWatch and watchPosition on every render, causing an infinite loop.
    // Hence commenting this out.
    // return function cleanup() {
    //   if (watchId) {
    //     navigator.geolocation.clearWatch(watchId);
    //   }
    // };
  }, []);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
}

// ---------- useLocation ----------
export function useLocation() {
  return React.useContext(LocationContext);
}
