export interface User {
  id: string;
  name: string;
}

export interface PusherUser {
  id: string;
  user_info: {
    name: string;
  };
}

export interface Location {
  lat: number;
  lng: number;
}

export type LocationUpdate = { userId: string; location: Location };
