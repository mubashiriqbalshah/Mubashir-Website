import { Redis } from '@upstash/redis';

const CREDS_KEY = 'admin:credentials';
const SESSION_PREFIX = 'session:';
const SESSION_TTL = 60 * 60 * 24 * 7;
const RECOVERY_USERNAME = process.env.ADMIN_USERNAME || '';
const RECOVERY_PASSWORD = process.env.ADMIN_PASSWORD || '';

const redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
});

function generateToken() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
        return globalThis.crypto.randomUUID().replace(/-/g, '');
    }
    return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function getCredentials() {
    try {
        const stored = await redis.get(CREDS_KEY);
        if (stored && stored.username && stored.password) return stored;
    } catch {}
    if (RECOVERY_USERNAME && RECOVERY_PASSWORD) {
        return { username: RECOVERY_USERNAME, password: RECOVERY_PASSWORD };
    }
    return null;
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    try {
        if (req.method === 'DELETE') {
            const auth = req.headers.authorization || '';
            const token = auth.replace(/^Bearer\s+/i, '');
            if (token) {
                try { await redis.del(SESSION_PREFIX + token); } catch {}
            }
            return res.status(200).json({ ok: true });
        }

        if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST, DELETE');
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        const creds = await getCredentials();
        if (!creds) {
            return res.status(503).json({ error: 'Admin not configured. Contact the site owner.' });
        }
        if (username === creds.username && password === creds.password) {
            const token = generateToken();
            await redis.set(SESSION_PREFIX + token, {
                username: creds.username,
                createdAt: Date.now()
            }, { ex: SESSION_TTL });
            return res.status(200).json({ ok: true, token, username: creds.username });
        }
        await new Promise(r => setTimeout(r, 400));
        return res.status(401).json({ error: 'Wrong username or password' });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error', detail: String(err.message || err) });
    }
}
