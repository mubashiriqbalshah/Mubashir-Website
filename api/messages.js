import { Redis } from '@upstash/redis';

const MESSAGES_KEY = 'portfolio:messages';
const SESSION_PREFIX = 'session:';
const MAX_MESSAGES = 500;

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

function sanitize(str, maxLength = 5000) {
    return String(str || '').trim().slice(0, maxLength);
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    try {
        if (req.method === 'POST') {
            const { name, email, phone, subject, message } = req.body || {};
            if (!name || !email || !message) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const entry = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                name: sanitize(name, 200),
                email: sanitize(email, 200),
                phone: sanitize(phone, 50),
                subject: sanitize(subject, 300),
                message: sanitize(message, 5000)
            };
            const existing = (await redis.get(MESSAGES_KEY)) || [];
            const updated = [entry, ...existing].slice(0, MAX_MESSAGES);
            await redis.set(MESSAGES_KEY, updated);
            return res.status(201).json({ ok: true, id: entry.id });
        }

        if (req.method === 'GET') {
            if (!(await isAuthorized(req))) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const messages = (await redis.get(MESSAGES_KEY)) || [];
            return res.status(200).json({ messages });
        }

        if (req.method === 'DELETE') {
            if (!(await isAuthorized(req))) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const url = new URL(req.url, `http://${req.headers.host}`);
            const id = url.searchParams.get('id');
            const existing = (await redis.get(MESSAGES_KEY)) || [];
            if (id === 'all') {
                await redis.set(MESSAGES_KEY, []);
                return res.status(200).json({ ok: true, deleted: existing.length });
            }
            const filtered = existing.filter(m => String(m.id) !== String(id));
            await redis.set(MESSAGES_KEY, filtered);
            return res.status(200).json({ ok: true, deleted: existing.length - filtered.length });
        }

        res.setHeader('Allow', 'GET, POST, DELETE');
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Messages API error:', err);
        return res.status(500).json({ error: 'Internal server error', detail: String(err.message || err) });
    }
}
