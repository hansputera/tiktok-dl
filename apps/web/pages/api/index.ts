import type {
	NextApiRequest,
	NextApiResponse
} from 'next';

export default function IndexApi(_: NextApiRequest, res: NextApiResponse) {
	res.send('Hello world.');
}