import type {VercelRequest, VercelResponse} from '@vercel/node';
import {fetch} from '../lib';

export default async (_: VercelRequest, res: VercelResponse) => {
  const start = Date.now();
  try {
    const response = await fetch('./');
    res.status(200).json({
      status: response.statusCode,
      took: Date.now() - start,
      data: response.statusMessage || 'Nothing.',
    });
  } catch (e) {
    res.status(500).json({status: null, data: null, took: null});
  }
};
