// ========== Shared Data Layer ==========
// All editable content + admin settings. Stored in localStorage.

const STORAGE_KEY = 'mi_portfolio_data_v1';
const ADMIN_KEY = 'mi_portfolio_admin_v1';

const DEFAULT_DATA = {
    hero: {
        badge: 'Available for new projects',
        name: 'Mubashir Iqbal',
        subtitle: 'Web Developer & Frontend Engineer',
        description: 'I build fast, responsive, and modern websites that look great and work even better. From sleek landing pages to full-stack web apps — I turn ideas into clean, production-ready code.',
        stats: [
            { num: '50+', label: 'Websites Built' },
            { num: '7+', label: 'Years in Tech' },
            { num: '100%', label: 'Responsive' }
        ]
    },
    about: {
        profileImage: 'assets/profile.jpg',
        lead: "I'm <strong>Mubashir Iqbal</strong>, a Web Developer based in Lahore, Pakistan. With a Master's in Computer Science (MCS) and a strong design background, I bridge the gap between beautiful UI and clean, performant code.",
        paragraph: "I build responsive websites and web apps using HTML, CSS, JavaScript, and modern frameworks like React. My designer's eye means I don't just write code that works — I write code that ships pixel-perfect interfaces users love.",
        traits: ['Frontend', 'Responsive', 'Pixel Perfect', 'Performance', 'Clean Code', 'Problem Solver'],
        info: {
            location: 'Lahore, Pakistan',
            phone: '+92 300 4596768',
            email: 'mubashir2009@gmail.com',
            education: 'MCS — UCP Pakistan',
            languages: 'English · Urdu · Hindi',
            stack: 'HTML · CSS · JS · React'
        }
    },
    skills: [
        { name: 'HTML5 & Semantic Markup', pct: 95 },
        { name: 'CSS3 / Flexbox / Grid', pct: 92 },
        { name: 'JavaScript (ES6+)', pct: 85 },
        { name: 'React.js', pct: 80 },
        { name: 'Tailwind CSS / Bootstrap', pct: 90 },
        { name: 'Responsive & Mobile-First Design', pct: 95 },
        { name: 'WordPress / CMS', pct: 75 },
        { name: 'Figma to Code Conversion', pct: 95 },
        { name: 'Git & GitHub', pct: 80 },
        { name: 'SEO & Performance Optimization', pct: 75 }
    ],
    tools: [
        { name: 'HTML5', label: '</>', color1: '#e34f26', color2: '#f06529', textColor: '#fff' },
        { name: 'CSS3', label: 'CSS', color1: '#2965f1', color2: '#264de4', textColor: '#fff' },
        { name: 'JavaScript', label: 'JS', color1: '#f7df1e', color2: '#f0a500', textColor: '#000' },
        { name: 'React', label: '⚛', color1: '#61dafb', color2: '#21a1c4', textColor: '#000' },
        { name: 'Tailwind', label: 'TW', color1: '#38bdf8', color2: '#0ea5e9', textColor: '#fff' },
        { name: 'Git', label: 'Git', color1: '#f05032', color2: '#c5402c', textColor: '#fff' },
        { name: 'WordPress', label: 'WP', color1: '#21759b', color2: '#0073aa', textColor: '#fff' },
        { name: 'Figma', label: 'F', color1: '#f24e1e', color2: '#a259ff', textColor: '#fff' },
        { name: 'VS Code', label: 'VS', color1: '#0078d4', color2: '#005a9e', textColor: '#fff' }
    ],
    languages: [
        { name: 'English', level: 4 },
        { name: 'Urdu', level: 5 },
        { name: 'Hindi', level: 4 }
    ],
    markets: [
        { flag: '🇵🇰', name: 'Pakistan' },
        { flag: '🇦🇪', name: 'UAE' },
        { flag: '🇬🇧', name: 'UK' }
    ],
    experience: [
        {
            title: 'Web Developer & UI Designer',
            company: 'Argon Teq · Lahore, Pakistan',
            period: 'Mar 2022 — Present',
            current: true,
            freelance: false,
            description: 'Designing and developing responsive websites and mobile-app interfaces. Working with Figma for design and translating mockups into clean, responsive HTML/CSS/JS code. Managing multiple projects from concept to deployment within tight specifications.'
        },
        {
            title: 'Frontend Developer',
            company: 'RMR Tourism · Dubai, UAE',
            period: 'Sep 2021 — Feb 2022',
            current: false,
            freelance: true,
            description: 'Built and maintained web pages for a Dubai-based tourism brand. Developed responsive layouts, optimized assets for web, and delivered cross-browser-compatible interfaces with smooth user flows.'
        },
        {
            title: 'Web Designer',
            company: 'TheHash.io · Pakistan',
            period: 'Dec 2017 — Sep 2021',
            current: false,
            freelance: false,
            description: 'Designed and sliced web layouts for blockchain and Web3 projects. Built landing pages, product pages, and marketing sites with focus on responsive design, performance, and brand consistency across crypto products.'
        },
        {
            title: 'Web Designer',
            company: 'Ozawa Traders · Pakistan',
            period: 'Oct 2015 — Nov 2017',
            current: false,
            freelance: false,
            description: 'Reviewed and optimized the company website for performance, layout, and user experience. Implemented responsive layouts and improved typography to boost engagement and conversion.'
        },
        {
            title: 'Junior Web Designer',
            company: 'Dove IT Solutions · Dubai, UAE',
            period: 'Dec 2014 — Sep 2015',
            current: false,
            freelance: false,
            description: 'Designed digital interfaces, web banners, and landing pages for various clients in the UAE market. Built foundation in HTML/CSS, web layout, and visual design principles.'
        }
    ],
    education: [
        {
            tag: 'Degree',
            title: 'Master in Computer Science (MCS)',
            school: 'University of Central Punjab (UCP)',
            location: 'Lahore, Pakistan',
            featured: true
        },
        {
            tag: 'Certificate',
            title: 'Graphic Designing',
            school: 'Adobe Photoshop CC & Illustrator',
            location: 'Short Course · 2014 — 2015',
            featured: false
        },
        {
            tag: 'Workshop',
            title: 'Positive Thinking',
            school: 'Superior Group of Colleges',
            location: 'Pakistan',
            featured: false
        },
        {
            tag: 'Workshop',
            title: 'iOS Training Workshop',
            school: 'North Bay Solutions (IT Company)',
            location: 'Pakistan',
            featured: false
        }
    ],
    projects: [
        {
            title: 'Ozawa Traders',
            description: 'Designed and developed the corporate website for Ozawa Traders — a Pakistan-based supplier of industrial, power, and medical equipment with 20+ years of experience. Built clean product catalog pages, responsive navigation, and a CMS-backed admin to manage products serving utilities, hospitals, and enterprises nationwide.',
            image: '',
            link: 'https://www.ozawatraders.org',
            tags: ['HTML', 'CSS', 'CMS', 'Responsive', 'Corporate']
        },
        {
            title: 'MavaPK',
            description: 'Currently in working phase — building www.mavapk.com from scratch with a modern, responsive design. More details coming soon as the project develops.',
            image: '',
            link: 'https://www.mavapk.com',
            tags: ['In Progress', 'HTML', 'CSS', 'JavaScript']
        }
    ],
    resume: {
        title: 'Full-Stack Web Developer',
        summary: [
            'Full-stack web developer with 11+ years of combined experience in design and development, based in Lahore, Pakistan. I bring a hybrid background — over a decade of professional design experience (UI/UX, branding, social media creatives) combined with modern web development skills in React, Node.js, and MongoDB. This allows me to deliver websites that are both visually polished and technically robust, without separate handoffs between designers and developers.',
            'Recent independent projects include corporate websites with custom admin panels, blockchain service platforms, and business websites with phased rollout strategies. Focus areas: responsive design, fast load times, SEO-friendly architecture, and easy client maintainability.'
        ],
        onlineLinks: [
            { label: 'linkedin.com/in/mubashiriqbalshah', url: 'https://linkedin.com/in/mubashiriqbalshah' },
            { label: 'ozawatraders.org', url: 'https://ozawatraders.org' },
            { label: 'thehash.io', url: 'https://thehash.io' }
        ],
        technicalSkills: [
            { category: 'Frontend', items: 'React.js, Next.js\nHTML5, CSS3, JavaScript\nTailwind, Bootstrap' },
            { category: 'Backend', items: 'Node.js, Express.js\nREST APIs, PHP' },
            { category: 'Database', items: 'MongoDB, MySQL' },
            { category: 'Tools', items: 'Git, GitHub, Vercel\nNetlify, Hostinger' }
        ],
        designSkills: [
            'UI/UX Design',
            'Figma',
            'Adobe Photoshop',
            'Adobe Illustrator',
            'Landing Page Design',
            'Mobile App Design',
            'Logo & Branding'
        ],
        featuredProjects: [
            {
                name: 'Ozawa Traders Pvt Ltd',
                urlLabel: 'ozawatraders.org',
                url: 'https://ozawatraders.org',
                type: 'Corporate Website with Custom Admin Panel',
                year: '2026',
                description: 'Designed and developed a complete responsive corporate website for a 25-year ISO-certified supplier of industrial, power, and medical equipment. Built dedicated product pages across three divisions, a certificate gallery for ISO and IEC compliance documents, and a custom admin panel enabling non-technical staff to manage products and content independently.',
                stack: 'HTML5, CSS3, JavaScript, Node.js, Responsive Design'
            },
            {
                name: 'The Hash',
                urlLabel: 'thehash.io',
                url: 'https://thehash.io',
                type: 'Blockchain & Smart Contract Services Platform',
                year: '2025–2026',
                description: 'Independently designed, developed, and launched my own Web3 services venture from concept to production. Owned every aspect including brand identity, UI design, frontend implementation, content strategy, hosting setup, and deployment. Demonstrates end-to-end execution capability.',
                stack: 'HTML5, CSS3, JavaScript, Responsive Design, Hostinger'
            },
            {
                name: 'MAVA PK',
                urlLabel: 'mavapk.com',
                url: 'https://mavapk.com',
                type: 'Business Website',
                year: '2026 (In Progress)',
                description: 'Ongoing client engagement for a Lahore-based business. Managed end-to-end including domain registration, DNS configuration, and deployment of an interim maintenance page so the brand stays reachable during the full build. Currently developing the complete responsive site using phased delivery methodology.',
                stack: ''
            }
        ],
        experienceDetails: [
            {
                title: 'UI/UX Designer & Web Developer',
                company: 'Argon Teq, Lahore — Pakistan',
                period: 'Mar 2022 – Present',
                bullets: [
                    'Designing and developing mobile applications, websites, and landing pages using Figma for design and modern web technologies for implementation.',
                    'Creating social media creatives, posters, brochures, flyers, and thumbnails for digital and print marketing campaigns.',
                    'Managing multiple concurrent projects within design specifications and tight deadlines.',
                    'Collaborating with development teams on UI implementation and design system consistency.'
                ]
            },
            {
                title: 'Freelance Designer',
                company: 'R M R Tourism, Dubai — UAE',
                period: 'Sep 2021 – Feb 2022',
                bullets: [
                    'Created visual design concepts, mockups, and packaging designs for signage, logos, and brand collateral for a Dubai-based tourism company.',
                    'Delivered remote design services to international clients with consistent quality and timely communication across time zones.'
                ]
            },
            {
                title: 'Designer (Web & Blockchain)',
                company: 'TheHash.io — Pakistan',
                period: 'Dec 2017 – Sep 2021',
                bullets: [
                    'Designed social media creatives, marketing assets, and brand collateral for various blockchain and Web3 projects.',
                    'Produced image manipulation, web slicing, and asset preparation for development teams.',
                    'Created logo designs and print media for crypto, blockchain, and tech ventures.'
                ]
            },
            {
                title: 'Graphic Designer',
                company: 'Ozawa Traders — Pakistan',
                period: 'Oct 2015 – Nov 2017',
                bullets: [
                    'Reviewed and optimized company website and social media presence; created attractive social media posts and typography to engage target audiences in the industrial sector.',
                    'This long-term client relationship led to the recent 2026 web development engagement for ozawatraders.org — demonstrating sustained client trust over a decade.'
                ]
            },
            {
                title: 'Graphic Designer',
                company: 'Dove IT Solutions, Dubai — UAE',
                period: 'Dec 2014 – Sep 2015',
                bullets: [
                    'Designed graphical content, illustrations, infographics, logos, branding materials, brochures, and posters for a Dubai-based IT solutions company.',
                    'Gained international client exposure and cross-cultural design experience early in career.'
                ]
            }
        ]
    },
    testimonials: [
        {
            name: 'Ahmed Khan',
            role: 'CEO',
            company: 'Ozawa Traders',
            quote: 'Mubashir delivered exactly what we needed — a clean, professional website with an admin panel that even our non-technical staff can use. His attention to detail and reliability over the years has been outstanding.',
            avatar: 'A'
        },
        {
            name: 'Sarah Mitchell',
            role: 'Project Manager',
            company: 'RMR Tourism, Dubai',
            quote: 'Excellent designer and developer. Delivered our tourism brand assets ahead of schedule with strong communication across time zones. Highly recommended for international clients.',
            avatar: 'S'
        },
        {
            name: 'Bilal Hussain',
            role: 'Founder',
            company: 'TheHash.io',
            quote: 'Mubashir has a rare combination of design eye and developer skills. He owned the brand identity and frontend implementation end-to-end and delivered a polished Web3 product I am proud to ship.',
            avatar: 'B'
        }
    ],
    social: {
        behance: 'https://www.behance.net/mubashir20e6c9',
        linkedin: 'https://www.linkedin.com/in/mubashiriqbalshah/',
        instagram: 'https://www.instagram.com/mubashirs1985/',
        whatsapp: 'https://wa.me/923004596768'
    },
    submissions: []
};

const DEFAULT_ADMIN = {
    password: 'admin123',
    isLoggedIn: false
};

function mergeDefaults(parsed) {
    const defaults = structuredClone(DEFAULT_DATA);
    if (!parsed || typeof parsed !== 'object') return defaults;

    function deepMerge(target, source) {
        if (!target || typeof target !== 'object') return structuredClone(source);
        if (Array.isArray(source)) return Array.isArray(target) ? target : structuredClone(source);
        const out = Array.isArray(target) ? target : Object.assign({}, target);
        for (const k of Object.keys(source)) {
            const sv = source[k];
            const tv = out[k];
            if (tv === undefined || tv === null) {
                out[k] = structuredClone(sv);
            } else if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
                out[k] = deepMerge(tv, sv);
            }
        }
        return out;
    }

    return deepMerge(parsed, defaults);
}

function getAuthToken() {
    try { return sessionStorage.getItem('mi_admin_token') || ''; } catch { return ''; }
}

const DataStore = {
    get() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return structuredClone(DEFAULT_DATA);
            return mergeDefaults(JSON.parse(stored));
        } catch {
            return structuredClone(DEFAULT_DATA);
        }
    },
    set(data, options = {}) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        if (options.skipAPI) return;
        if (getAuthToken()) {
            this.pushToAPI(data).then(result => {
                if (!result.ok && typeof window !== 'undefined' && window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('portfolio-sync-error', { detail: result.error }));
                }
            });
        }
    },
    reset() {
        localStorage.removeItem(STORAGE_KEY);
    },

    async fetchFromAPI() {
        try {
            const res = await fetch('/api/portfolio', { cache: 'no-store' });
            if (!res.ok) throw new Error('fetch failed');
            const { data } = await res.json();
            if (data) {
                const merged = mergeDefaults(data);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                return merged;
            }
        } catch (err) {
            console.warn('API fetch failed, using local data:', err.message);
        }
        return this.get();
    },

    async pushToAPI(data) {
        const token = getAuthToken();
        if (!token) return { ok: false, error: 'Not authenticated' };
        try {
            const res = await fetch('/api/portfolio', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                return { ok: false, error: err.error || 'API save failed' };
            }
            this.set(data);
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    },

    async fetchMessages() {
        const token = getAuthToken();
        if (!token) return [];
        try {
            const res = await fetch('/api/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return [];
            const { messages } = await res.json();
            return messages || [];
        } catch {
            return [];
        }
    },

    async submitMessage(submission) {
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission)
            });
            return res.ok;
        } catch {
            return false;
        }
    },

    async deleteMessage(id) {
        const token = getAuthToken();
        if (!token) return false;
        try {
            const res = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.ok;
        } catch {
            return false;
        }
    },

    async clearAllMessages() {
        const token = getAuthToken();
        if (!token) return false;
        try {
            const res = await fetch('/api/messages?id=all', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.ok;
        } catch {
            return false;
        }
    }
};

const AdminStore = {
    async login(username, password) {
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                return { ok: false, error: err.error || 'Login failed' };
            }
            const { token, username: u } = await res.json();
            sessionStorage.setItem('mi_admin_token', token);
            sessionStorage.setItem('mi_admin_username', u || username);
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err.message || 'Network error' };
        }
    },
    async logout() {
        const token = getAuthToken();
        sessionStorage.removeItem('mi_admin_token');
        sessionStorage.removeItem('mi_admin_username');
        if (token) {
            try {
                await fetch('/api/auth', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch {}
        }
    },
    isLoggedIn() {
        try { return !!sessionStorage.getItem('mi_admin_token'); } catch { return false; }
    },
    getToken() {
        return getAuthToken();
    },
    getUsername() {
        try { return sessionStorage.getItem('mi_admin_username') || 'admin'; } catch { return 'admin'; }
    },
    async fetchCredentials() {
        const token = getAuthToken();
        if (!token) return null;
        try {
            const res = await fetch('/api/credentials', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    },
    async updateCredentials(username, password, currentPassword) {
        const token = getAuthToken();
        if (!token) return { ok: false, error: 'Not authenticated' };
        try {
            const res = await fetch('/api/credentials', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username, password, currentPassword })
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                return { ok: false, error: err.error || 'Update failed' };
            }
            const data = await res.json();
            if (data.token) {
                sessionStorage.setItem('mi_admin_token', data.token);
                sessionStorage.setItem('mi_admin_username', username);
            }
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err.message };
        }
    }
};

if (typeof window !== 'undefined') {
    window.DataStore = DataStore;
    window.AdminStore = AdminStore;
    window.DEFAULT_DATA = DEFAULT_DATA;
}
