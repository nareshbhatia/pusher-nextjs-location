import type { NextApiRequest, NextApiResponse } from 'next';
import Pusher, { ChannelAuthResponse } from 'pusher';

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
  res: NextApiResponse<ChannelAuthResponse>
) {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  console.log('channel-auth', { socketId, channel });
  const authResponse = pusher.authorizeChannel(socketId, channel);
  res.status(200).json(authResponse);
}
