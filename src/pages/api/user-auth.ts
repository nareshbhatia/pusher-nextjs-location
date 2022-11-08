import type { NextApiRequest, NextApiResponse } from 'next';
import { PusherUser } from '../../models';
import { setCookie } from '../../utils';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PusherUser>
) {
  const name = req?.body?.name;
  const userId = name.toLowerCase().replace(/[^a-z]/g, '');
  const user = {
    id: userId,
    user_info: { name },
  };
  console.log('user-auth', user);

  setCookie(res, 'name', name, { path: '/' });
  res.status(200).json(user);
}
