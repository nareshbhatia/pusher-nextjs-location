import type { NextApiRequest, NextApiResponse } from 'next';
import Pusher, { UserAuthResponse } from 'pusher';

// Initialize pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APPID as string,
  key: process.env.PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.PUSHER_CLUSTER as string,
  useTLS: true,
});

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserAuthResponse>
) {
  const socketId = req.body.socket_id;
  const name = req?.cookies?.name as string;
  const userId = name.toLowerCase().replace(/[^a-z]/g, '');
  const user = {
    id: userId,
    user_info: { name },
  };
  console.log('pusher-auth', user);

  const authResponse = pusher.authenticateUser(socketId, user);
  res.status(200).json(authResponse);
}
