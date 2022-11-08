'use client';

import * as React from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { PresenceChannel } from 'pusher-js';
import { useLocation } from '../../components/LocationProvider';
import { usePusher } from '../../components/PusherProvider';
import { Location, LocationUpdate, User } from '../../models';
import { postData } from '../../utils';
import Map from './Map';
import Marker from './Marker';

type UserMap = { [userId: string]: User };
type LocationMap = { [userId: string]: Location };

export default function Page() {
  const myLocation = useLocation();
  const pusher = usePusher();
  const [presenceChannel, setPresenceChannel] = React.useState<
    PresenceChannel | undefined
  >();
  const [myUserId, setMyUserId] = React.useState<string | undefined>();
  const [users, setUsers] = React.useState<UserMap>({});
  const [locations, setLocations] = React.useState<LocationMap>({});

  // Sign in to pusher
  React.useEffect(() => {
    if (pusher) {
      pusher.signin();
    }
  }, [pusher]);

  // Wait for pusher:signin_success and then subscribe to presence-channel
  React.useEffect(() => {
    if (pusher) {
      pusher.bind('pusher:signin_success', () => {
        console.log('pusher:signin_success');
        const channel = pusher.subscribe('presence-channel') as PresenceChannel;

        channel.bind('pusher:subscription_succeeded', (result: any) => {
          console.log('pusher:subscription_succeeded', result);

          // Set presenceChannel
          setPresenceChannel(channel);

          // Set my userId
          setMyUserId(result.me.id);

          // Set existing users who are online
          // Convert { john: { name: 'John' }, mike: { name: 'Mike' } }
          // to      { john: { id: 'john', name: 'John' }, mike: { id: 'mike', name: 'Mike' } }
          const newUsers = Object.keys(result.members).reduce(
            (userMap: UserMap, userId) => {
              userMap[userId] = {
                id: userId,
                name: result.members[userId].name,
              };
              return userMap;
            },
            {}
          );
          setUsers(newUsers);
        });
      });
    }

    return function cleanup() {
      console.log('presence-page: useEffect cleanup() called');
      if (pusher && presenceChannel) {
        console.log('---> cleaning up');
        presenceChannel.unbind();
        pusher.unsubscribe('presence-channel');
      }
    };
  }, [pusher, presenceChannel]);

  // Subscribe to pusher:member_added
  React.useEffect(() => {
    if (presenceChannel) {
      presenceChannel.bind('pusher:member_added', (member: any) => {
        console.log('pusher:member_added', member);
        // Use function form, otherwise you will always get the initial value of users which is {}
        setUsers((previousUsers) => {
          return {
            ...previousUsers,
            [member.id]: { id: member.id, name: member.info.name },
          };
        });
      });
    }
  }, [presenceChannel]);

  // Subscribe to pusher:member_removed
  React.useEffect(() => {
    if (presenceChannel) {
      presenceChannel.bind('pusher:member_removed', (member: any) => {
        console.log('pusher:member_removed', member);
        // Use function form, otherwise you will always get the initial value of users which is {}
        setUsers((previousUsers) => {
          const newUsers = { ...previousUsers };
          delete newUsers[member.id];
          return newUsers;
        });

        setLocations((previousLocations) => {
          const newLocations = { ...previousLocations };
          delete newLocations[member.id];
          return newLocations;
        });
      });
    }
  }, [presenceChannel]);

  // Subscribe to location_updated
  React.useEffect(() => {
    if (presenceChannel) {
      presenceChannel.bind('location_updated', (update: LocationUpdate) => {
        console.log('location_updated', update);
        // Use function form, otherwise you will always get the initial value of users which is {}
        setLocations((previousLocations) => {
          return {
            ...previousLocations,
            [update.userId]: update.location,
          };
        });
      });
    }
  }, [presenceChannel]);

  // Post changes to my location
  React.useEffect(() => {
    if (myUserId && myLocation) {
      postData('/api/update-location', {
        userId: myUserId,
        location: myLocation,
      }).then(() => {
        console.log('My location updated successfully');
      });
    }
  }, [myUserId, myLocation]);

  if (!myLocation) {
    return <div>Loading...</div>;
  }

  console.log('Rendering presence page, locations:', locations);

  return (
    <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string}>
      <Map center={myLocation} zoom={4}>
        {Object.keys(locations).map((userId) => (
          <Marker
            key={userId}
            position={locations[userId]}
            label={users[userId]?.name}
          />
        ))}
      </Map>
    </Wrapper>
  );
}
