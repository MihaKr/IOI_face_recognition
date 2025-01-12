import type { NextApiRequest, NextApiResponse } from 'next';
import { callImg2ImgApi } from '@/utils/handlers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const payload = req.body;
        await callImg2ImgApi(payload);
        res.status(200).json({ message: 'Images processed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}