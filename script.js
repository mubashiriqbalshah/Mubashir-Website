// ========== Theme Toggle ==========
(function initTheme() {
    const saved = localStorage.getItem('mi_theme');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const theme = saved || (prefersLight ? 'light' : 'dark');
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
})();

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('mi_theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('mi_theme', 'light');
        }
    });
});

// ========== Render Site Content from DataStore ==========
function renderSite() {
    const data = DataStore.get();

    // Bind simple text fields
    document.querySelectorAll('[data-bind]').forEach(el => {
        const path = el.getAttribute('data-bind');
        const value = path.split('.').reduce((o, k) => o?.[k], data);
        if (value !== undefined) el.textContent = value;
    });
    document.querySelectorAll('[data-bind-html]').forEach(el => {
        const path = el.getAttribute('data-bind-html');
        const value = path.split('.').reduce((o, k) => o?.[k], data);
        if (value !== undefined) el.innerHTML = value;
    });

    renderHeroStats(data.hero.stats);
    renderTraits(data.about.traits);
    renderSkills(data.skills);
    renderTools(data.tools);
    renderLanguages(data.languages);
    renderMarkets(data.markets);
    renderTimeline(data.experience);
    renderProjects(data.projects);
    renderEducation(data.education);
    renderTestimonials(data.testimonials);
    updateSocialLinks(data.social);
    updateProfileImage(data.about.profileImage);
}

function renderTestimonials(items) {
    const el = document.getElementById('testimonialsGrid');
    if (!el) return;
    if (!items || items.length === 0) {
        el.innerHTML = '<p style="text-align:center; color:var(--text-muted); grid-column: 1/-1;">No testimonials yet.</p>';
        return;
    }
    el.innerHTML = items.map(t => {
        const initial = (t.avatar || (t.name || 'C')[0]).toUpperCase();
        return `
        <div class="testimonial-card">
            <svg class="testimonial-quote-icon" width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/></svg>
            <p class="testimonial-quote">${escapeHtml(t.quote)}</p>
            <div class="testimonial-author">
                <div class="testimonial-avatar">${escapeHtml(initial)}</div>
                <div class="testimonial-meta">
                    <div class="testimonial-name">${escapeHtml(t.name)}</div>
                    <div class="testimonial-role">${escapeHtml(t.role)}${t.company ? ` · ${escapeHtml(t.company)}` : ''}</div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function renderTools(tools) {
    const el = document.getElementById('toolsContainer');
    if (!el || !tools) return;
    el.innerHTML = tools.map(t => `
        <div class="tool-card">
            <div class="tool-icon" style="background: linear-gradient(135deg, ${escapeAttr(t.color1)}, ${escapeAttr(t.color2)}); color: ${escapeAttr(t.textColor || '#fff')};">${escapeHtml(t.label)}</div>
            <span>${escapeHtml(t.name)}</span>
        </div>
    `).join('');
}

function renderLanguages(languages) {
    const el = document.getElementById('languagesContainer');
    if (!el || !languages) return;
    el.innerHTML = languages.map(lang => {
        const level = Math.max(0, Math.min(5, lang.level || 0));
        const dots = Array.from({ length: 5 }, (_, i) =>
            `<span class="dot ${i < level ? 'active' : ''}"></span>`
        ).join('');
        return `
            <div class="lang-item">
                <span>${escapeHtml(lang.name)}</span>
                <div class="lang-dots">${dots}</div>
            </div>
        `;
    }).join('');
}

function renderMarkets(markets) {
    const el = document.getElementById('marketsContainer');
    if (!el || !markets) return;
    el.innerHTML = markets.map(m =>
        `<span class="market">${escapeHtml(m.flag)} ${escapeHtml(m.name)}</span>`
    ).join('');
}

function updateProfileImage(src) {
    const img = document.getElementById('profilePhoto');
    if (!img || !src) return;
    img.style.display = '';
    const placeholder = img.nextElementSibling;
    if (placeholder) placeholder.style.display = 'none';
    if (img.src !== src && !img.src.endsWith(src)) {
        img.src = src;
    }
}

function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

function renderHeroStats(stats) {
    const el = document.getElementById('heroStats');
    if (!el) return;
    el.innerHTML = stats.map(s => `
        <div class="stat">
            <div class="stat-num">${escapeHtml(s.num)}</div>
            <div class="stat-label">${escapeHtml(s.label)}</div>
        </div>
    `).join('');
}

function renderTraits(traits) {
    const el = document.getElementById('traitsContainer');
    if (!el) return;
    el.innerHTML = traits.map(t => `<span class="trait">${escapeHtml(t)}</span>`).join('');
}

function renderSkills(skills) {
    const el = document.getElementById('skillsContainer');
    if (!el) return;
    el.innerHTML = skills.map(s => `
        <div class="skill">
            <div class="skill-row"><span>${escapeHtml(s.name)}</span><span class="skill-pct">${s.pct}%</span></div>
            <div class="skill-bar"><div class="skill-fill" data-pct="${s.pct}"></div></div>
        </div>
    `).join('');
}

function renderTimeline(items) {
    const el = document.getElementById('timelineContainer');
    if (!el) return;
    el.innerHTML = items.map(item => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <div>
                        <h3 class="job-title">${escapeHtml(item.title)} ${item.freelance ? '<span class="badge-freelance">Freelance</span>' : ''}</h3>
                        <div class="company">${escapeHtml(item.company)}</div>
                    </div>
                    <span class="period ${item.current ? 'current' : ''}">${escapeHtml(item.period)}</span>
                </div>
                <p>${escapeHtml(item.description)}</p>
            </div>
        </div>
    `).join('');
}

function renderProjects(projects) {
    const el = document.getElementById('projectsGrid');
    if (!el) return;
    if (!projects || projects.length === 0) {
        el.innerHTML = '<p style="text-align:center; color:var(--text-muted); grid-column: 1/-1;">No projects yet. Add some from the admin panel.</p>';
        return;
    }
    el.innerHTML = projects.map(p => `
        <a href="${escapeHtml(p.link || '#')}" target="_blank" rel="noopener" class="project-card">
            <div class="project-image">
                ${p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" onerror="this.parentElement.classList.add('no-img');">` : ''}
                <div class="project-image-fallback">${escapeHtml((p.title || 'P')[0].toUpperCase())}</div>
            </div>
            <div class="project-body">
                <h3 class="project-title">${escapeHtml(p.title)}</h3>
                <p class="project-desc">${escapeHtml(p.description)}</p>
                ${p.tags && p.tags.length ? `<div class="project-tags">${p.tags.map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
            </div>
        </a>
    `).join('');
}

function renderEducation(items) {
    const el = document.getElementById('eduGrid');
    if (!el) return;
    const icons = {
        Degree: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5"/></svg>',
        Certificate: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/></svg>',
        Workshop: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>'
    };
    el.innerHTML = items.map(item => `
        <div class="edu-card ${item.featured ? 'featured' : ''}">
            <div class="edu-icon">${icons[item.tag] || icons.Certificate}</div>
            <div class="edu-tag">${escapeHtml(item.tag)}</div>
            <h3>${escapeHtml(item.title)}</h3>
            <div class="edu-school">${escapeHtml(item.school)}</div>
            <div class="edu-loc">${escapeHtml(item.location)}</div>
        </div>
    `).join('');
}

function updateSocialLinks(social) {
    document.querySelectorAll('[data-social]').forEach(el => {
        const key = el.getAttribute('data-social');
        const url = social[key];
        if (!url) return;
        if (el.getAttribute('data-social-prefill') === 'hire' && key === 'whatsapp') {
            const sep = url.includes('?') ? '&' : '?';
            el.href = `${url}${sep}text=${encodeURIComponent("Hi Mubashir, I'd like to hire you for a web development project. Can we discuss?")}`;
        } else {
            el.href = url;
        }
    });
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

// ========== Initialize ==========
renderSite();
DataStore.fetchFromAPI().then(() => {
    renderSite();
    setupSkillObserver();
}).catch(() => {});

// ========== Year ==========
document.getElementById('year').textContent = new Date().getFullYear();

// ========== Hire Me Dropdown ==========
const hireBtn = document.getElementById('hireBtn');
const hireDropdown = document.getElementById('hireDropdown');

if (hireBtn && hireDropdown) {
    hireBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = hireDropdown.classList.toggle('active');
        hireBtn.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', (e) => {
        if (!hireDropdown.contains(e.target) && e.target !== hireBtn) {
            hireDropdown.classList.remove('active');
            hireBtn.setAttribute('aria-expanded', 'false');
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hireDropdown.classList.remove('active');
            hireBtn.setAttribute('aria-expanded', 'false');
        }
    });
    hireDropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hireDropdown.classList.remove('active');
            hireBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

// ========== Navbar Scroll Effect ==========
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 120;
        if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
});

// ========== Mobile Menu ==========
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ========== Cursor Glow ==========
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
function animateGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
}
animateGlow();

// ========== Skill Bar Animation ==========
function setupSkillObserver() {
    document.querySelectorAll('.skill-fill').forEach(fill => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.width = entry.target.dataset.pct + '%';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        observer.observe(fill);
    });
}
setupSkillObserver();

// ========== Reveal on Scroll ==========
function setupRevealObserver() {
    const revealEls = document.querySelectorAll(
        '.section-header, .info-card, .tool-card, .timeline-item, .edu-card, .contact-card, .skill, .lang-item, .market, .project-card, .testimonial-card'
    );
    revealEls.forEach(el => el.classList.add('reveal'));
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 40);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => observer.observe(el));
}
setupRevealObserver();

// ========== Number Counter ==========
function setupCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const text = el.textContent;
                    const match = text.match(/(\d+)(.*)/);
                    if (!match) return;
                    const target = parseInt(match[1]);
                    const suffix = match[2];
                    let count = 0;
                    const step = Math.max(1, Math.ceil(target / 30));
                    const timer = setInterval(() => {
                        count += step;
                        if (count >= target) { el.textContent = target + suffix; clearInterval(timer); }
                        else { el.textContent = count + suffix; }
                    }, 40);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(el);
    });
}
setupCounters();

// ========== Contact Form ==========
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

const WEB3FORMS_PUBLIC_KEY = '4d4843cb-4e41-446f-b66e-9229e2932e75';

function normalizePhoneForWa(phone) {
    if (!phone) return '';
    let digits = String(phone).replace(/[^\d]/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = '92' + digits.slice(1);
    return digits;
}

async function sendEmailDirect(submission) {
    const waNumber = normalizePhoneForWa(submission.phone);
    const waPrefill = encodeURIComponent(
        `Hi ${submission.name}, thanks for reaching out via my portfolio. Regarding "${submission.subject || 'your inquiry'}" — `
    );
    const body =
        `New contact form submission from your portfolio website.\n\n` +
        `Name:    ${submission.name}\n` +
        `Email:   ${submission.email}\n` +
        (submission.phone ? `Phone:   ${submission.phone}\n` : '') +
        `Subject: ${submission.subject || '(none)'}\n\n` +
        `--- Message ---\n${submission.message}\n\n` +
        `--- Quick Reply ---\n` +
        `Email: mailto:${submission.email}\n` +
        (waNumber ? `WhatsApp: https://wa.me/${waNumber}?text=${waPrefill}\n` : '');

    try {
        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                access_key: WEB3FORMS_PUBLIC_KEY,
                subject: `Portfolio Inquiry: ${submission.subject || 'No subject'} — ${submission.name}`,
                name: submission.name,
                email: submission.email,
                message: body
            })
        });
        const result = await res.json().catch(() => ({}));
        return res.ok && result.success;
    } catch {
        return false;
    }
}

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const submission = {
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        phone: formData.get('phone') || '',
        subject: formData.get('subject') || '',
        message: formData.get('message') || ''
    };

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.style.opacity = '0.6';

    const [savedToInbox, emailSent] = await Promise.all([
        DataStore.submitMessage(submission),
        sendEmailDirect(submission)
    ]);

    btn.disabled = false;
    btn.style.opacity = '1';

    if (savedToInbox || emailSent) {
        formStatus.textContent = 'Thanks! Your message was received. Mubashir will get back to you soon.';
        formStatus.className = 'form-status success';
        contactForm.reset();
    } else {
        const mailtoLink = `mailto:mubashir2009@gmail.com?subject=${encodeURIComponent(submission.subject)}&body=${encodeURIComponent(`Name: ${submission.name}\nEmail: ${submission.email}\n\n${submission.message}`)}`;
        window.location.href = mailtoLink;
        formStatus.textContent = 'Opening email client as backup...';
        formStatus.className = 'form-status success';
        contactForm.reset();
    }

    setTimeout(() => {
        formStatus.className = 'form-status';
        formStatus.textContent = '';
    }, 6000);
});

// ========== Smooth Anchor Scroll ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const offset = 70;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});
