'use client';

import * as React from 'react';
import Pusher from 'pusher-js';

// ---------- PusherContext ----------
const PusherContext = React.createContext<Pusher | undefined>(undefined);

// ---------- PusherProvider ----------
interface PusherProviderProps {
  pusherKey: string;
  cluster: string;
  children?: React.ReactNode;
}

export default function PusherProvider({
  pusherKey,
  cluster,
  children,
}: PusherProviderProps) {
  const [pusher, setPusher] = React.useState<Pusher | undefined>();

  React.useEffect(() => {
    const pusher = new Pusher(pusherKey, {
      cluster,
      userAuthentication: {
        endpoint: '/api/pusher-auth',
        transport: 'ajax',
      },
      authEndpoint: '/api/channel-auth',
    });
    console.log(pusher);
    setPusher(pusher);
  }, [pusherKey, cluster]);

  return (
    <PusherContext.Provider value={pusher}>{children}</PusherContext.Provider>
  );
}

// ---------- usePusher ----------
export function usePusher() {
  return React.useContext(PusherContext);
}
