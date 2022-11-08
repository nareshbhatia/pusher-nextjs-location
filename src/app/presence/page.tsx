'use client';

import * as React from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
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
        const presenceChannel = pusher.subscribe('presence-channel');

        presenceChannel.bind('pusher:subscription_succeeded', (result: any) => {
          console.log('pusher:subscription_succeeded', result);

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
      });
    }
  }, [pusher, users]);

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

  console.log('locations', locations);

  return (
    <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string}>
      <Map center={myLocation} zoom={14}>
        {Object.keys(locations).map((userId) => (
          <Marker
            key={userId}
            position={locations[userId]}
            label={users[userId].name}
          />
        ))}
      </Map>
    </Wrapper>
  );
}
