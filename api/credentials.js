import { Redis } from '@upstash/redis';

const CREDS_KEY = 'admin:credentials';
const SESSION_PREFIX = 'session:';
const SESSION_TTL = 60 * 60 * 24 * 7;

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

async function validateSession(req) {
    const auth = req.headers.authorization || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!token) return null;
    try {
        const session = await redis.get(SESSION_PREFIX + token);
        if (session && session.username) return { token, username: session.username };
    } catch {}
    return null;
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    try {
        const session = await validateSession(req);
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (req.method === 'GET') {
            let username = session.username;
            try {
                const stored = await redis.get(CREDS_KEY);
                if (stored && stored.username) username = stored.username;
            } catch {}
            return res.status(200).json({ username });
        }

        if (req.method === 'PUT') {
            const { username, password, currentPassword } = req.body || {};
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password required' });
            }
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required' });
            }
            if (String(username).trim().length < 2) {
                return res.status(400).json({ error: 'Username must be at least 2 characters' });
            }
            if (String(password).length < 4) {
                return res.status(400).json({ error: 'Password must be at least 4 characters' });
            }

            let storedCreds = null;
            try { storedCreds = await redis.get(CREDS_KEY); } catch {}
            if (!storedCreds || !storedCreds.password) {
                return res.status(400).json({ error: 'No existing credentials found. Please log in again.' });
            }
            if (String(currentPassword) !== String(storedCreds.password)) {
                await new Promise(r => setTimeout(r, 400));
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            await redis.set(CREDS_KEY, {
                username: String(username).trim(),
                password: String(password)
            });

            await redis.del(SESSION_PREFIX + session.token);
            const newToken = generateToken();
            await redis.set(SESSION_PREFIX + newToken, {
                username: String(username).trim(),
                createdAt: Date.now()
            }, { ex: SESSION_TTL });
            return res.status(200).json({ ok: true, token: newToken });
        }

        res.setHeader('Allow', 'GET, PUT');
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error', detail: String(err.message || err) });
    }
}
