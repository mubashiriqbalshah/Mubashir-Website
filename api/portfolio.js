import { Redis } from '@upstash/redis';

const PORTFOLIO_KEY = 'portfolio:data';
const SESSION_PREFIX = 'session:';

const redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
});

async function isAuthorized(req) {
    const auth = req.headers.authorization || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!token) return false;
    try {
        const session = await redis.get(SESSION_PREFIX + token);
        return !!(session && session.username);
    } catch {
        return false;
    }
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    try {
        if (req.method === 'GET') {
            const data = await redis.get(PORTFOLIO_KEY);
            return res.status(200).json({ data: data || null });
        }

        if (req.method === 'PUT') {
            if (!(await isAuthorized(req))) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const body = req.body;
            if (!body || typeof body !== 'object') {
                return res.status(400).json({ error: 'Invalid body' });
            }
            await redis.set(PORTFOLIO_KEY, body);
            return res.status(200).json({ ok: true });
        }

        if (req.method === 'DELETE') {
            if (!(await isAuthorized(req))) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            await redis.del(PORTFOLIO_KEY);
            return res.status(200).json({ ok: true });
        }

        res.setHeader('Allow', 'GET, PUT, DELETE');
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Portfolio API error:', err);
        return res.status(500).json({ error: 'Internal server error', detail: String(err.message || err) });
    }
}
