import type { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';

// Initialize pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APPID as string,
  key: process.env.PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET as string,
  cluster: process.env.PUSHER_CLUSTER as string,
  useTLS: true,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('update-location', req.body);
  try {
    const result = await pusher.trigger(
      'presence-channel',
      'location_updated',
      req.body
    );
    res
      .status(200)
      .json({ message: `update-location returned status=${result.status}` });
  } catch (err) {
    res.status(500).json({ error: 'failed to update location' });
  }
}
