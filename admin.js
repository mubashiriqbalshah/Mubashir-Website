// ========== Admin Panel Logic ==========
const loginScreen = document.getElementById('loginScreen');
const adminApp = document.getElementById('adminApp');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');

// ----- Login / Logout -----
async function checkAuth() {
    if (AdminStore.isLoggedIn()) {
        loginScreen.style.display = 'none';
        adminApp.style.display = 'flex';
        await DataStore.fetchFromAPI();
        initAdmin();
    } else {
        loginScreen.style.display = 'flex';
        adminApp.style.display = 'none';
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.style.opacity = '0.6';
    loginError.textContent = '';
    try {
        const result = await AdminStore.login(username, password);
        if (result.ok) {
            await checkAuth();
        } else {
            loginError.textContent = result.error || 'Wrong username or password.';
            document.getElementById('loginPassword').value = '';
        }
    } finally {
        btn.disabled = false;
        btn.style.opacity = '1';
    }
});

logoutBtn.addEventListener('click', async () => {
    if (confirm('Logout from admin panel?')) {
        await AdminStore.logout();
        DataStore.reset();
        location.reload();
    }
});

// ----- Toast -----
function showToast(message, type = 'success', duration = 2500) {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), duration);
}

// ----- Persist (local + API) -----
async function persistData(data, successMessage) {
    DataStore.set(data);
    const result = await DataStore.pushToAPI(data);
    if (result.ok) {
        showToast(successMessage || 'Saved');
    } else if (result.error === 'Not authenticated') {
        showToast('Saved locally only (session expired). Please re-login.', 'error', 4000);
    } else {
        showToast(`Saved locally — DB sync failed: ${result.error}`, 'error', 4000);
    }
    return result.ok;
}

// ----- Tabs -----
function setupTabs() {
    const links = document.querySelectorAll('.sidebar-link');
    const tabs = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('pageTitle');

    function activate(name) {
        links.forEach(l => l.classList.toggle('active', l.dataset.tab === name));
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
        const link = document.querySelector(`.sidebar-link[data-tab="${name}"]`);
        if (link) pageTitle.textContent = link.textContent.trim().replace(/\s*\d+$/, '');
        document.querySelector('.sidebar')?.classList.remove('open');
    }

    links.forEach(link => {
        link.addEventListener('click', () => activate(link.dataset.tab));
    });

    document.querySelectorAll('[data-go-tab]').forEach(btn => {
        btn.addEventListener('click', () => activate(btn.dataset.goTab));
    });

    document.getElementById('mobileToggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('open');
    });
}

// ----- Init -----
function initAdmin() {
    setupTabs();
    refreshDashboard();
    loadHeroForm();
    loadAboutForm();
    renderSkillsEditor();
    renderToolsEditor();
    renderLanguagesEditor();
    renderMarketsEditor();
    renderExperienceEditor();
    renderProjectsEditor();
    renderEducationEditor();
    renderTestimonialsEditor();
    loadResumeForms();
    renderResumeLinksEditor();
    renderResumeTechEditor();
    renderResumeProjectsEditor();
    renderResumeExpEditor();
    renderMessages();
    loadSocialForm();
    loadCredentialsForm();
    setupGlobalActions();
    setupForms();
}

async function loadCredentialsForm() {
    const usernameField = document.getElementById('credentialsUsername');
    if (!usernameField) return;
    usernameField.value = AdminStore.getUsername();
    const data = await AdminStore.fetchCredentials();
    if (data && data.username) {
        usernameField.value = data.username;
    }
}

let cachedMessages = [];

async function refreshDashboard() {
    const data = DataStore.get();
    document.getElementById('statSkills').textContent = data.skills.length;
    document.getElementById('statExp').textContent = data.experience.length;
    document.getElementById('statProjects').textContent = data.projects.length;
    cachedMessages = await DataStore.fetchMessages();
    const count = cachedMessages.length;
    document.getElementById('statMessages').textContent = count;
    const badge = document.getElementById('messagesBadge');
    badge.textContent = count;
    badge.style.display = count === 0 ? 'none' : 'inline-block';
}

// ========== HERO ==========
function loadHeroForm() {
    const data = DataStore.get();
    const f = document.getElementById('heroForm');
    f.badge.value = data.hero.badge;
    f.name.value = data.hero.name;
    f.subtitle.value = data.hero.subtitle;
    f.description.value = data.hero.description;
    renderStatsEditor(data.hero.stats);
}

function renderStatsEditor(stats) {
    const el = document.getElementById('statsEditor');
    if (!stats || stats.length === 0) {
        el.innerHTML = '<div class="empty-state">No stats yet. Click "Add Stat".</div>';
        return;
    }
    el.innerHTML = stats.map((s, i) => `
        <div class="item-card">
            <div class="form-grid-2" style="grid-template-columns: 1fr 2fr auto; gap:12px; align-items:end;">
                <div class="form-group" style="margin-bottom:0;">
                    <label>Number</label>
                    <input type="text" data-stat-num="${i}" value="${esc(s.num)}" placeholder="50+">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Label</label>
                    <input type="text" data-stat-label="${i}" value="${esc(s.label)}" placeholder="Years Experience">
                </div>
                <button type="button" class="icon-btn danger" onclick="deleteStat(${i})" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                </button>
            </div>
        </div>
    `).join('');
}

window.deleteStat = function(i) {
    const data = DataStore.get();
    data.hero.stats.splice(i, 1);
    DataStore.set(data);
    renderStatsEditor(data.hero.stats);
    showToast('Stat deleted');
};

// ========== ABOUT ==========
function loadAboutForm() {
    const data = DataStore.get();
    const f = document.getElementById('aboutForm');
    f.profileImage.value = data.about.profileImage || '';
    document.getElementById('profilePreview').src = data.about.profileImage || 'assets/profile.jpg';
    f.lead.value = data.about.lead;
    f.paragraph.value = data.about.paragraph;
    f.traits.value = data.about.traits.join(', ');
    f.location.value = data.about.info.location;
    f.phone.value = data.about.info.phone;
    f.email.value = data.about.info.email;
    f.education.value = data.about.info.education;
    f.languages.value = data.about.info.languages;
    f.stack.value = data.about.info.stack;

    f.profileImage.addEventListener('input', () => {
        document.getElementById('profilePreview').src = f.profileImage.value || 'assets/profile.jpg';
    });
}

// ========== SKILLS ==========
function renderSkillsEditor() {
    const data = DataStore.get();
    const el = document.getElementById('skillsEditor');
    if (data.skills.length === 0) {
        el.innerHTML = '<div class="empty-state">No skills yet. Click "Add Skill" to add one.</div>';
        return;
    }
    el.innerHTML = data.skills.map((s, i) => `
        <div class="item-card">
            <div class="skill-input-row">
                <input type="text" value="${esc(s.name)}" data-skill-name="${i}" placeholder="Skill name">
                <input type="range" min="0" max="100" value="${s.pct}" data-skill-pct="${i}" oninput="this.nextElementSibling.value=this.value+'%'">
                <input type="text" value="${s.pct}%" readonly style="text-align:center; background:var(--surface);">
            </div>
            <div class="item-actions" style="margin-top:10px; justify-content: flex-end;">
                ${reorderButtons('skills', i, data.skills.length)}
                <button class="icon-btn danger" onclick="deleteSkill(${i})" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                </button>
            </div>
        </div>
    `).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveSkills()" style="margin-top:14px;">Save All Skills</button>`;
}

window.deleteSkill = function(i) {
    if (!confirm('Delete this skill?')) return;
    const data = DataStore.get();
    data.skills.splice(i, 1);
    DataStore.set(data);
    renderSkillsEditor();
    refreshDashboard();
    showToast('Skill deleted');
};

window.saveSkills = function() {
    const data = DataStore.get();
    data.skills = data.skills.map((_, i) => ({
        name: document.querySelector(`[data-skill-name="${i}"]`).value,
        pct: parseInt(document.querySelector(`[data-skill-pct="${i}"]`).value)
    })).filter(s => s.name.trim());
    DataStore.set(data);
    renderSkillsEditor();
    refreshDashboard();
    showToast('Skills saved');
};

document.getElementById('addSkillBtn').addEventListener('click', () => {
    const data = DataStore.get();
    data.skills.push({ name: 'New Skill', pct: 75 });
    DataStore.set(data);
    renderSkillsEditor();
    refreshDashboard();
    showToast('Skill added');
});

// ========== TOOLS ==========
function renderToolsEditor() {
    const data = DataStore.get();
    const el = document.getElementById('toolsEditor');
    const tools = data.tools || [];
    if (tools.length === 0) {
        el.innerHTML = '<div class="empty-state">No tools yet. Click "Add Tool" to add one.</div>';
        return;
    }
    el.innerHTML = tools.map((t, i) => `
        <div class="item-card">
            <div class="item-card-header">
                <div class="item-card-title" style="display: flex; align-items: center; gap: 12px;">
                    <div style="width:38px; height:38px; border-radius:10px; background: linear-gradient(135deg, ${esc(t.color1)}, ${esc(t.color2)}); color: ${esc(t.textColor || '#fff')}; display:flex; align-items:center; justify-content:center; font-weight:700; font-size: 0.95rem;">${esc(t.label)}</div>
                    <span>${esc(t.name)}</span>
                </div>
                <div class="item-actions">
                    ${reorderButtons('tools', i, tools.length)}
                    <button class="icon-btn danger" onclick="deleteTool(${i})" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Tool Name</label>
                    <input type="text" data-tool-name="${i}" value="${esc(t.name)}">
                </div>
                <div class="form-group">
                    <label>Label (1-4 chars or emoji)</label>
                    <input type="text" data-tool-label="${i}" value="${esc(t.label)}" maxlength="6">
                </div>
                <div class="form-group">
                    <label>Color 1 (top-left)</label>
                    <input type="color" data-tool-color1="${i}" value="${esc(t.color1)}">
                </div>
                <div class="form-group">
                    <label>Color 2 (bottom-right)</label>
                    <input type="color" data-tool-color2="${i}" value="${esc(t.color2)}">
                </div>
                <div class="form-group" style="grid-column: 1 / -1;">
                    <label class="checkbox-row">
                        <input type="checkbox" data-tool-textdark="${i}" ${t.textColor === '#000' ? 'checked' : ''}>
                        Use dark text (for light backgrounds)
                    </label>
                </div>
            </div>
        </div>
    `).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveTools()" style="margin-top:14px;">Save All Tools</button>`;
}

window.deleteTool = function(i) {
    if (!confirm('Delete this tool?')) return;
    const data = DataStore.get();
    data.tools.splice(i, 1);
    DataStore.set(data);
    renderToolsEditor();
    showToast('Tool deleted');
};

window.saveTools = function() {
    const data = DataStore.get();
    data.tools = (data.tools || []).map((_, i) => ({
        name: document.querySelector(`[data-tool-name="${i}"]`).value,
        label: document.querySelector(`[data-tool-label="${i}"]`).value,
        color1: document.querySelector(`[data-tool-color1="${i}"]`).value,
        color2: document.querySelector(`[data-tool-color2="${i}"]`).value,
        textColor: document.querySelector(`[data-tool-textdark="${i}"]`).checked ? '#000' : '#fff'
    })).filter(t => t.name.trim());
    DataStore.set(data);
    renderToolsEditor();
    showToast('Tools saved');
};

document.getElementById('addToolBtn').addEventListener('click', () => {
    const data = DataStore.get();
    data.tools = data.tools || [];
    data.tools.push({ name: 'New Tool', label: 'NT', color1: '#6366f1', color2: '#8b5cf6', textColor: '#fff' });
    DataStore.set(data);
    renderToolsEditor();
    showToast('Tool added');
});

// ========== LANGUAGES ==========
function renderLanguagesEditor() {
    const data = DataStore.get();
    const el = document.getElementById('languagesEditor');
    const langs = data.languages || [];
    if (langs.length === 0) {
        el.innerHTML = '<div class="empty-state">No languages yet.</div>';
        return;
    }
    el.innerHTML = langs.map((lang, i) => `
        <div class="item-card">
            <div class="form-grid-2" style="align-items:end;">
                <div class="form-group" style="margin-bottom:0;">
                    <label>Language</label>
                    <input type="text" data-lang-name="${i}" value="${esc(lang.name)}">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Proficiency (1-5)</label>
                    <select data-lang-level="${i}">
                        ${[1,2,3,4,5].map(n => `<option value="${n}" ${lang.level === n ? 'selected' : ''}>${'●'.repeat(n)}${'○'.repeat(5-n)} (${n}/5)</option>`).join('')}
                    </select>
                </div>
            </div>
            <div style="margin-top:10px; display:flex; gap:6px; justify-content:flex-end;">
                ${reorderButtons('languages', i, langs.length)}
                <button class="icon-btn danger" onclick="deleteLanguage(${i})" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                </button>
            </div>
        </div>
    `).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveLanguages()" style="margin-top:14px;">Save All Languages</button>`;
}

window.deleteLanguage = function(i) {
    if (!confirm('Delete this language?')) return;
    const data = DataStore.get();
    data.languages.splice(i, 1);
    DataStore.set(data);
    renderLanguagesEditor();
    showToast('Language deleted');
};

window.saveLanguages = function() {
    const data = DataStore.get();
    data.languages = (data.languages || []).map((_, i) => ({
        name: document.querySelector(`[data-lang-name="${i}"]`).value,
        level: parseInt(document.querySelector(`[data-lang-level="${i}"]`).value)
    })).filter(l => l.name.trim());
    DataStore.set(data);
    renderLanguagesEditor();
    showToast('Languages saved');
};

document.getElementById('addLangBtn').addEventListener('click', () => {
    const data = DataStore.get();
    data.languages = data.languages || [];
    data.languages.push({ name: 'New Language', level: 3 });
    DataStore.set(data);
    renderLanguagesEditor();
    showToast('Language added');
});

// ========== MARKETS ==========
function renderMarketsEditor() {
    const data = DataStore.get();
    const el = document.getElementById('marketsEditor');
    const markets = data.markets || [];
    if (markets.length === 0) {
        el.innerHTML = '<div class="empty-state">No markets yet.</div>';
        return;
    }
    el.innerHTML = markets.map((m, i) => `
        <div class="item-card">
            <div class="form-grid-2" style="align-items:end; grid-template-columns: 100px 1fr auto;">
                <div class="form-group" style="margin-bottom:0;">
                    <label>Flag (emoji)</label>
                    <input type="text" data-market-flag="${i}" value="${esc(m.flag)}" placeholder="🇵🇰" style="font-size: 1.2rem;">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Country / Market</label>
                    <input type="text" data-market-name="${i}" value="${esc(m.name)}">
                </div>
                <div style="display:flex; gap:6px; margin-bottom:0;">
                    ${reorderButtons('markets', i, markets.length)}
                    <button class="icon-btn danger" onclick="deleteMarket(${i})" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveMarkets()" style="margin-top:14px;">Save All Markets</button>`;
}

window.deleteMarket = function(i) {
    if (!confirm('Delete this market?')) return;
    const data = DataStore.get();
    data.markets.splice(i, 1);
    DataStore.set(data);
    renderMarketsEditor();
    showToast('Market deleted');
};

window.saveMarkets = function() {
    const data = DataStore.get();
    data.markets = (data.markets || []).map((_, i) => ({
        flag: document.querySelector(`[data-market-flag="${i}"]`).value,
        name: document.querySelector(`[data-market-name="${i}"]`).value
    })).filter(m => m.name.trim());
    DataStore.set(data);
    renderMarketsEditor();
    showToast('Markets saved');
};

document.getElementById('addMarketBtn').addEventListener('click', () => {
    const data = DataStore.get();
    data.markets = data.markets || [];
    data.markets.push({ flag: '🌍', name: 'New Market' });
    DataStore.set(data);
    renderMarketsEditor();
    showToast('Market added');
});

// ========== EXPERIENCE ==========
function renderExperienceEditor() {
    const data = DataStore.get();
    const el = document.getElementById('experienceEditor');
    if (data.experience.length === 0) {
        el.innerHTML = '<div class="empty-state">No experience yet. Click "Add Job" to add one.</div>';
        return;
    }
    el.innerHTML = data.experience.map((exp, i) => `
        <div class="item-card">
            <div class="item-card-header">
                <div class="item-card-title">${esc(exp.title)} — ${esc(exp.company)}</div>
                <div class="item-actions">
                    ${reorderButtons('experience', i, data.experience.length)}
                    <button class="icon-btn danger" onclick="deleteExp(${i})" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" data-exp-title="${i}" value="${esc(exp.title)}">
                </div>
                <div class="form-group">
                    <label>Company · Location</label>
                    <input type="text" data-exp-company="${i}" value="${esc(exp.company)}">
                </div>
                <div class="form-group">
                    <label>Period (e.g. Mar 2022 — Present)</label>
                    <input type="text" data-exp-period="${i}" value="${esc(exp.period)}">
                </div>
                <div class="form-group" style="display:flex; flex-direction:column; gap:8px; justify-content:center;">
                    <label class="checkbox-row">
                        <input type="checkbox" data-exp-current="${i}" ${exp.current ? 'checked' : ''}>
                        Current Job
                    </label>
                    <label class="checkbox-row">
                        <input type="checkbox" data-exp-freelance="${i}" ${exp.freelance ? 'checked' : ''}>
                        Freelance
                    </label>
                </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Description</label>
                <textarea data-exp-desc="${i}" rows="3">${esc(exp.description)}</textarea>
            </div>
        </div>
    `).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveExperience()" style="margin-top:14px;">Save All Experience</button>`;
}

window.deleteExp = function(i) {
    if (!confirm('Delete this job?')) return;
    const data = DataStore.get();
    data.experience.splice(i, 1);
    DataStore.set(data);
    renderExperienceEditor();
    refreshDashboard();
    showToast('Job deleted');
};

window.saveExperience = function() {
    const data = DataStore.get();
    data.experience = data.experience.map((_, i) => ({
        title: document.querySelector(`[data-exp-title="${i}"]`).value,
        company: document.querySelector(`[data-exp-company="${i}"]`).value,
        period: document.querySelector(`[data-exp-period="${i}"]`).value,
        current: document.querySelector(`[data-exp-current="${i}"]`).checked,
        freelance: document.querySelector(`[data-exp-freelance="${i}"]`).checked,
        description: document.querySelector(`[data-exp-desc="${i}"]`).value
    }));
    DataStore.set(data);
    renderExperienceEditor();
    refreshDashboard();
    showToast('Experience saved');
};

document.getElementById('addExpBtn').addEventListener('click', () => {
    const data = DataStore.get();
    data.experience.unshift({
        title: 'New Job Title',
        company: 'Company · Location',
        period: 'Year — Year',
        current: false,
        freelance: false,
        description: 'Job description here.'
    });
    DataStore.set(data);
    renderExperienceEditor();
    refreshDashboard();
    showToast('Job added');
});

// ========== PROJECTS ==========
function renderProjectsEditor() {
    const data = DataStore.get();
    const el = document.getElementById('projectsEditor');
    if (data.projects.length === 0) {
        el.innerHTML = '<div class="empty-state">No projects yet. Click "Add Project" to add one.</div>';
        return;
    }
    el.innerHTML = data.projects.map((p, i) => {
        const hasImg = !!(p.image && p.image.length > 0);
        const previewSrc = hasImg ? esc(p.image) : '';
        return `
        <div class="item-card">
            <div class="item-card-header">
                <div class="item-card-title">${esc(p.title)}</div>
                <div class="item-actions">
                    ${reorderButtons('projects', i, data.projects.length)}
                    <button class="icon-btn danger" onclick="deleteProject(${i})" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" data-proj-title="${i}" value="${esc(p.title)}">
                </div>
                <div class="form-group">
                    <label>Project Link (URL)</label>
                    <input type="url" data-proj-link="${i}" value="${esc(p.link)}">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea data-proj-desc="${i}" rows="2">${esc(p.description)}</textarea>
            </div>
            <div class="form-group">
                <label>Project Image</label>
                <div style="display:flex; gap:14px; align-items:flex-start; flex-wrap:wrap;">
                    <div style="flex:0 0 140px;">
                        <div id="projImgPreview${i}" style="width:140px; height:90px; border-radius:8px; background:${hasImg ? `url('${previewSrc}') center/cover` : 'rgba(255,255,255,0.05)'}; border:1px dashed rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-size:0.75rem;">
                            ${hasImg ? '' : 'No image'}
                        </div>
                    </div>
                    <div style="flex:1; min-width:200px; display:flex; flex-direction:column; gap:8px;">
                        <input type="file" accept="image/*" data-proj-file="${i}" onchange="uploadProjectImage(${i}, this)" style="font-size:0.85rem;">
                        <div style="font-size:0.75rem; color:var(--text-dim);">Or paste URL below:</div>
                        <input type="text" data-proj-image="${i}" value="${esc(p.image || '')}" placeholder="https://... or assets/..." oninput="updateProjImgPreview(${i}, this.value)">
                        ${hasImg ? `<button type="button" class="btn btn-ghost btn-sm" onclick="clearProjectImage(${i})" style="align-self:flex-start;">Remove image</button>` : ''}
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Tags (comma-separated)</label>
                <input type="text" data-proj-tags="${i}" value="${esc((p.tags || []).join(', '))}" placeholder="React, CSS, JS">
            </div>
        </div>`;
    }).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveProjects()" style="margin-top:14px;">Save All Projects</button>`;
}

window.deleteProject = function(i) {
    if (!confirm('Delete this project?')) return;
    const data = DataStore.get();
    data.projects.splice(i, 1);
    DataStore.set(data);
    renderProjectsEditor();
    refreshDashboard();
    showToast('Project deleted');
};

window.saveProjects = function() {
    const data = DataStore.get();
    data.projects = data.projects.map((_, i) => ({
        title: document.querySelector(`[data-proj-title="${i}"]`).value,
        link: document.querySelector(`[data-proj-link="${i}"]`).value,
        description: document.querySelector(`[data-proj-desc="${i}"]`).value,
        image: document.querySelector(`[data-proj-image="${i}"]`).value,
        tags: document.querySelector(`[data-proj-tags="${i}"]`).value.split(',').map(t => t.trim()).filter(Boolean)
    }));
    DataStore.set(data);
    renderProjectsEditor();
    refreshDashboard();
    showToast('Projects saved');
};

window.uploadProjectImage = function(i, input) {
    const file = input.files && input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large. Max 2MB allowed.', 'error');
        input.value = '';
        return;
    }
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        input.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        compressImage(e.target.result, 1200, 0.82, (compressed) => {
            const urlInput = document.querySelector(`[data-proj-image="${i}"]`);
            if (urlInput) urlInput.value = compressed;
            updateProjImgPreview(i, compressed);
            showToast('Image loaded. Click "Save All Projects" to publish.');
        });
    };
    reader.readAsDataURL(file);
};

window.updateProjImgPreview = function(i, src) {
    const preview = document.getElementById(`projImgPreview${i}`);
    if (!preview) return;
    if (src && src.length > 0) {
        preview.style.backgroundImage = `url("${String(src).replace(/"/g, '%22')}")`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
        preview.innerHTML = '';
    } else {
        preview.style.backgroundImage = '';
        preview.style.background = 'rgba(255,255,255,0.05)';
        preview.innerHTML = 'No image';
    }
};

window.clearProjectImage = function(i) {
    const urlInput = document.querySelector(`[data-proj-image="${i}"]`);
    const fileInput = document.querySelector(`[data-proj-file="${i}"]`);
    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';
    updateProjImgPreview(i, '');
};

function compressImage(dataUrl, maxWidth, quality, callback) {
    const img = new Image();
    img.onload = function() {
        const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => callback(dataUrl);
    img.src = dataUrl;
}

document.getElementById('addProjectBtn').addEventListener('click', () => {
    const data = DataStore.get();
    data.projects.unshift({
        title: 'New Project',
        description: 'Project description',
        image: '',
        link: '#',
        tags: []
    });
    DataStore.set(data);
    renderProjectsEditor();
    refreshDashboard();
    showToast('Project added');
});

// ========== EDUCATION ==========
function renderEducationEditor() {
    const data = DataStore.get();
    const el = document.getElementById('educationEditor');
    if (data.education.length === 0) {
        el.innerHTML = '<div class="empty-state">No education yet. Click "Add Item" to add one.</div>';
        return;
    }
    el.innerHTML = data.education.map((edu, i) => `
        <div class="item-card">
            <div class="item-card-header">
                <div class="item-card-title">${esc(edu.title)}</div>
                <div class="item-actions">
                    ${reorderButtons('education', i, data.education.length)}
                    <button class="icon-btn danger" onclick="deleteEdu(${i})" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Type</label>
                    <select data-edu-tag="${i}">
                        <option value="Degree" ${edu.tag === 'Degree' ? 'selected' : ''}>Degree</option>
                        <option value="Certificate" ${edu.tag === 'Certificate' ? 'selected' : ''}>Certificate</option>
                        <option value="Workshop" ${edu.tag === 'Workshop' ? 'selected' : ''}>Workshop</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="checkbox-row" style="margin-top:24px;">
                        <input type="checkbox" data-edu-featured="${i}" ${edu.featured ? 'checked' : ''}>
                        Featured (highlighted)
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Title</label>
                <input type="text" data-edu-title="${i}" value="${esc(edu.title)}">
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>School / Issuer</label>
                    <input type="text" data-edu-school="${i}" value="${esc(edu.school)}">
                </div>
                <div class="form-group">
                    <label>Location / Year</label>
                    <input type="text" data-edu-location="${i}" value="${esc(edu.location)}">
                </div>
            </div>
        </div>
    `).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveEducation()" style="margin-top:14px;">Save All Education</button>`;
}

window.deleteEdu = function(i) {
    if (!confirm('Delete this education item?')) return;
    const data = DataStore.get();
    data.education.splice(i, 1);
    DataStore.set(data);
    renderEducationEditor();
    showToast('Item deleted');
};

window.saveEducation = function() {
    const data = DataStore.get();
    data.education = data.education.map((_, i) => ({
        tag: document.querySelector(`[data-edu-tag="${i}"]`).value,
        title: document.querySelector(`[data-edu-title="${i}"]`).value,
        school: document.querySelector(`[data-edu-school="${i}"]`).value,
        location: document.querySelector(`[data-edu-location="${i}"]`).value,
        featured: document.querySelector(`[data-edu-featured="${i}"]`).checked
    }));
    DataStore.set(data);
    renderEducationEditor();
    showToast('Education saved');
};

document.getElementById('addEduBtn').addEventListener('click', () => {
    const data = DataStore.get();
    data.education.push({
        tag: 'Certificate',
        title: 'New Item',
        school: 'Issuer',
        location: 'Location',
        featured: false
    });
    DataStore.set(data);
    renderEducationEditor();
    showToast('Item added');
});

// ========== TESTIMONIALS ==========
function renderTestimonialsEditor() {
    const data = DataStore.get();
    const list = data.testimonials || [];
    const el = document.getElementById('testimonialsEditor');
    if (!el) return;
    if (list.length === 0) {
        el.innerHTML = '<div class="empty-state">No testimonials yet. Click "Add Testimonial" to add one.</div>';
        return;
    }
    el.innerHTML = list.map((t, i) => `
        <div class="item-card">
            <div class="item-card-header">
                <div class="item-card-title">${esc(t.name || 'Untitled')}</div>
                <div class="item-actions">
                    ${reorderButtons('testimonials', i, list.length)}
                    <button class="icon-btn danger" onclick="deleteTestimonial(${i})" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" data-tst-name="${i}" value="${esc(t.name || '')}">
                </div>
                <div class="form-group">
                    <label>Avatar Letter (optional)</label>
                    <input type="text" data-tst-avatar="${i}" value="${esc(t.avatar || '')}" maxlength="2" placeholder="First letter of name">
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Role / Job Title</label>
                    <input type="text" data-tst-role="${i}" value="${esc(t.role || '')}" placeholder="CEO, Manager, etc.">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" data-tst-company="${i}" value="${esc(t.company || '')}">
                </div>
            </div>
            <div class="form-group">
                <label>Testimonial Quote</label>
                <textarea data-tst-quote="${i}" rows="3">${esc(t.quote || '')}</textarea>
            </div>
        </div>
    `).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveTestimonials()" style="margin-top:14px;">Save All Testimonials</button>`;
}

window.deleteTestimonial = function(i) {
    if (!confirm('Delete this testimonial?')) return;
    const data = DataStore.get();
    data.testimonials.splice(i, 1);
    DataStore.set(data);
    renderTestimonialsEditor();
    showToast('Testimonial deleted');
};

window.saveTestimonials = function() {
    const data = DataStore.get();
    const list = data.testimonials || [];
    data.testimonials = list.map((_, i) => ({
        name: document.querySelector(`[data-tst-name="${i}"]`).value,
        role: document.querySelector(`[data-tst-role="${i}"]`).value,
        company: document.querySelector(`[data-tst-company="${i}"]`).value,
        quote: document.querySelector(`[data-tst-quote="${i}"]`).value,
        avatar: document.querySelector(`[data-tst-avatar="${i}"]`).value
    }));
    DataStore.set(data);
    renderTestimonialsEditor();
    showToast('Testimonials saved');
};

document.getElementById('addTestimonialBtn').addEventListener('click', () => {
    const data = DataStore.get();
    if (!data.testimonials) data.testimonials = [];
    data.testimonials.push({
        name: 'Client Name',
        role: 'Job Title',
        company: 'Company',
        quote: 'What the client said about working with you.',
        avatar: ''
    });
    DataStore.set(data);
    renderTestimonialsEditor();
    showToast('Testimonial added');
});

// ========== RESUME ==========
function ensureResume(data) {
    if (!data.resume) data.resume = {};
    const r = data.resume;
    if (!Array.isArray(r.summary)) r.summary = [];
    if (!Array.isArray(r.onlineLinks)) r.onlineLinks = [];
    if (!Array.isArray(r.technicalSkills)) r.technicalSkills = [];
    if (!Array.isArray(r.designSkills)) r.designSkills = [];
    if (!Array.isArray(r.featuredProjects)) r.featuredProjects = [];
    if (!Array.isArray(r.experienceDetails)) r.experienceDetails = [];
    return data;
}

function loadResumeForms() {
    const data = ensureResume(DataStore.get());
    const r = data.resume;

    const metaForm = document.getElementById('resumeMetaForm');
    if (metaForm) {
        metaForm.title.value = r.title || '';
        metaForm.summary.value = (r.summary || []).join('\n');
    }

    const designForm = document.getElementById('resumeDesignForm');
    if (designForm) {
        designForm.designSkills.value = (r.designSkills || []).join('\n');
    }
}

function renderResumeLinksEditor() {
    const data = ensureResume(DataStore.get());
    const links = data.resume.onlineLinks;
    const el = document.getElementById('resumeLinksEditor');
    if (!el) return;
    if (links.length === 0) {
        el.innerHTML = '<div class="empty-state">No links yet. Click "Add Link" to add one.</div>';
        return;
    }
    el.innerHTML = links.map((l, i) => `
        <div class="item-card">
            <div class="item-card-header">
                <div class="item-card-title">${esc(l.label || 'Untitled')}</div>
                <div class="item-actions">
                    <button class="icon-btn danger" onclick="deleteResumeLink(${i})" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Display Label</label>
                    <input type="text" data-rlnk-label="${i}" value="${esc(l.label || '')}" placeholder="linkedin.com/in/...">
                </div>
                <div class="form-group">
                    <label>URL</label>
                    <input type="url" data-rlnk-url="${i}" value="${esc(l.url || '')}" placeholder="https://...">
                </div>
            </div>
        </div>
    `).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveResumeLinks()" style="margin-top:14px;">Save All Links</button>`;
}

window.deleteResumeLink = function(i) {
    if (!confirm('Delete this link?')) return;
    const data = ensureResume(DataStore.get());
    data.resume.onlineLinks.splice(i, 1);
    DataStore.set(data);
    renderResumeLinksEditor();
    showToast('Link deleted');
};

window.saveResumeLinks = function() {
    const data = ensureResume(DataStore.get());
    data.resume.onlineLinks = data.resume.onlineLinks.map((_, i) => ({
        label: document.querySelector(`[data-rlnk-label="${i}"]`).value,
        url: document.querySelector(`[data-rlnk-url="${i}"]`).value
    }));
    DataStore.set(data);
    renderResumeLinksEditor();
    showToast('Links saved');
};

document.getElementById('addResumeLinkBtn').addEventListener('click', () => {
    const data = ensureResume(DataStore.get());
    data.resume.onlineLinks.push({ label: 'New Link', url: 'https://' });
    DataStore.set(data);
    renderResumeLinksEditor();
    showToast('Link added');
});

function renderResumeTechEditor() {
    const data = ensureResume(DataStore.get());
    const groups = data.resume.technicalSkills;
    const el = document.getElementById('resumeTechEditor');
    if (!el) return;
    if (groups.length === 0) {
        el.innerHTML = '<div class="empty-state">No categories yet. Click "Add Category" to add one.</div>';
        return;
    }
    el.innerHTML = groups.map((g, i) => `
        <div class="item-card">
            <div class="item-card-header">
                <div class="item-card-title">${esc(g.category || 'Category')}</div>
                <div class="item-actions">
                    <button class="icon-btn danger" onclick="deleteResumeTech(${i})" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Category Name</label>
                <input type="text" data-rtech-cat="${i}" value="${esc(g.category || '')}" placeholder="Frontend, Backend, etc.">
            </div>
            <div class="form-group">
                <label>Items (one item per line)</label>
                <textarea data-rtech-items="${i}" rows="3">${esc(g.items || '')}</textarea>
            </div>
        </div>
    `).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveResumeTech()" style="margin-top:14px;">Save All Categories</button>`;
}

window.deleteResumeTech = function(i) {
    if (!confirm('Delete this category?')) return;
    const data = ensureResume(DataStore.get());
    data.resume.technicalSkills.splice(i, 1);
    DataStore.set(data);
    renderResumeTechEditor();
    showToast('Category deleted');
};

window.saveResumeTech = function() {
    const data = ensureResume(DataStore.get());
    data.resume.technicalSkills = data.resume.technicalSkills.map((_, i) => ({
        category: document.querySelector(`[data-rtech-cat="${i}"]`).value,
        items: document.querySelector(`[data-rtech-items="${i}"]`).value
    }));
    DataStore.set(data);
    renderResumeTechEditor();
    showToast('Technical skills saved');
};

document.getElementById('addResumeTechBtn').addEventListener('click', () => {
    const data = ensureResume(DataStore.get());
    data.resume.technicalSkills.push({ category: 'New Category', items: 'Item 1\nItem 2' });
    DataStore.set(data);
    renderResumeTechEditor();
    showToast('Category added');
});

function renderResumeProjectsEditor() {
    const data = ensureResume(DataStore.get());
    const projects = data.resume.featuredProjects;
    const el = document.getElementById('resumeProjectsEditor');
    if (!el) return;
    if (projects.length === 0) {
        el.innerHTML = '<div class="empty-state">No projects yet. Click "Add Project" to add one.</div>';
        return;
    }
    el.innerHTML = projects.map((p, i) => `
        <div class="item-card">
            <div class="item-card-header">
                <div class="item-card-title">${esc(p.name || 'Untitled')}</div>
                <div class="item-actions">
                    <button class="icon-btn danger" onclick="deleteResumeProject(${i})" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Project Name</label>
                    <input type="text" data-rprj-name="${i}" value="${esc(p.name || '')}">
                </div>
                <div class="form-group">
                    <label>Year(s)</label>
                    <input type="text" data-rprj-year="${i}" value="${esc(p.year || '')}" placeholder="2026">
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>URL Label</label>
                    <input type="text" data-rprj-urllabel="${i}" value="${esc(p.urlLabel || '')}" placeholder="ozawatraders.org">
                </div>
                <div class="form-group">
                    <label>URL</label>
                    <input type="url" data-rprj-url="${i}" value="${esc(p.url || '')}" placeholder="https://...">
                </div>
            </div>
            <div class="form-group">
                <label>Project Type</label>
                <input type="text" data-rprj-type="${i}" value="${esc(p.type || '')}" placeholder="Corporate Website with Custom Admin Panel">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea data-rprj-desc="${i}" rows="4">${esc(p.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label>Tech Stack (comma-separated)</label>
                <input type="text" data-rprj-stack="${i}" value="${esc(p.stack || '')}" placeholder="HTML5, CSS3, JavaScript, Node.js">
            </div>
        </div>
    `).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveResumeProjects()" style="margin-top:14px;">Save All Projects</button>`;
}

window.deleteResumeProject = function(i) {
    if (!confirm('Delete this project?')) return;
    const data = ensureResume(DataStore.get());
    data.resume.featuredProjects.splice(i, 1);
    DataStore.set(data);
    renderResumeProjectsEditor();
    showToast('Project deleted');
};

window.saveResumeProjects = function() {
    const data = ensureResume(DataStore.get());
    data.resume.featuredProjects = data.resume.featuredProjects.map((_, i) => ({
        name: document.querySelector(`[data-rprj-name="${i}"]`).value,
        year: document.querySelector(`[data-rprj-year="${i}"]`).value,
        urlLabel: document.querySelector(`[data-rprj-urllabel="${i}"]`).value,
        url: document.querySelector(`[data-rprj-url="${i}"]`).value,
        type: document.querySelector(`[data-rprj-type="${i}"]`).value,
        description: document.querySelector(`[data-rprj-desc="${i}"]`).value,
        stack: document.querySelector(`[data-rprj-stack="${i}"]`).value
    }));
    DataStore.set(data);
    renderResumeProjectsEditor();
    showToast('Resume projects saved');
};

document.getElementById('addResumeProjectBtn').addEventListener('click', () => {
    const data = ensureResume(DataStore.get());
    data.resume.featuredProjects.push({
        name: 'New Project',
        year: '2026',
        urlLabel: '',
        url: '',
        type: 'Project Type',
        description: 'Project description goes here.',
        stack: ''
    });
    DataStore.set(data);
    renderResumeProjectsEditor();
    showToast('Project added');
});

function renderResumeExpEditor() {
    const data = ensureResume(DataStore.get());
    const exp = data.resume.experienceDetails;
    const el = document.getElementById('resumeExpEditor');
    if (!el) return;
    if (exp.length === 0) {
        el.innerHTML = '<div class="empty-state">No experience yet. Click "Add Experience" to add one.</div>';
        return;
    }
    el.innerHTML = exp.map((e, i) => `
        <div class="item-card">
            <div class="item-card-header">
                <div class="item-card-title">${esc(e.title || 'Untitled')}</div>
                <div class="item-actions">
                    <button class="icon-btn danger" onclick="deleteResumeExp(${i})" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" data-rexp-title="${i}" value="${esc(e.title || '')}">
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Company / Location</label>
                    <input type="text" data-rexp-company="${i}" value="${esc(e.company || '')}" placeholder="Company Name, City — Country">
                </div>
                <div class="form-group">
                    <label>Period</label>
                    <input type="text" data-rexp-period="${i}" value="${esc(e.period || '')}" placeholder="Mar 2022 – Present">
                </div>
            </div>
            <div class="form-group">
                <label>Bullet Points (one per line)</label>
                <textarea data-rexp-bullets="${i}" rows="5">${esc((e.bullets || []).join('\n'))}</textarea>
            </div>
        </div>
    `).join('');
    el.innerHTML += `<button class="btn btn-primary" onclick="saveResumeExp()" style="margin-top:14px;">Save All Experience</button>`;
}

window.deleteResumeExp = function(i) {
    if (!confirm('Delete this experience?')) return;
    const data = ensureResume(DataStore.get());
    data.resume.experienceDetails.splice(i, 1);
    DataStore.set(data);
    renderResumeExpEditor();
    showToast('Experience deleted');
};

window.saveResumeExp = function() {
    const data = ensureResume(DataStore.get());
    data.resume.experienceDetails = data.resume.experienceDetails.map((_, i) => ({
        title: document.querySelector(`[data-rexp-title="${i}"]`).value,
        company: document.querySelector(`[data-rexp-company="${i}"]`).value,
        period: document.querySelector(`[data-rexp-period="${i}"]`).value,
        bullets: document.querySelector(`[data-rexp-bullets="${i}"]`).value
            .split('\n').map(s => s.trim()).filter(Boolean)
    }));
    DataStore.set(data);
    renderResumeExpEditor();
    showToast('Resume experience saved');
};

document.getElementById('addResumeExpBtn').addEventListener('click', () => {
    const data = ensureResume(DataStore.get());
    data.resume.experienceDetails.push({
        title: 'Job Title',
        company: 'Company, City — Country',
        period: 'Year – Year',
        bullets: ['First responsibility', 'Second responsibility']
    });
    DataStore.set(data);
    renderResumeExpEditor();
    showToast('Experience added');
});

document.getElementById('resumeMetaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = ensureResume(DataStore.get());
    data.resume.title = e.target.title.value.trim();
    data.resume.summary = e.target.summary.value.split('\n').map(s => s.trim()).filter(Boolean);
    DataStore.set(data);
    showToast('Resume title & summary saved');
});

document.getElementById('resumeDesignForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = ensureResume(DataStore.get());
    data.resume.designSkills = e.target.designSkills.value.split('\n').map(s => s.trim()).filter(Boolean);
    DataStore.set(data);
    showToast('Design skills saved');
});

// ========== MESSAGES ==========
async function renderMessages() {
    cachedMessages = await DataStore.fetchMessages();
    const el = document.getElementById('messagesContainer');
    if (cachedMessages.length === 0) {
        el.innerHTML = '<div class="empty-state">No messages yet. Submissions from the contact form will appear here.</div>';
        return;
    }
    el.innerHTML = cachedMessages.map(s => {
        let waNumber = String(s.phone || '').replace(/[^\d]/g, '');
        if (waNumber.startsWith('00')) waNumber = waNumber.slice(2);
        else if (waNumber.startsWith('0')) waNumber = '92' + waNumber.slice(1);
        const waPrefill = encodeURIComponent(`Hi ${s.name}, thanks for reaching out via my portfolio. Regarding "${s.subject || 'your inquiry'}" — `);
        const phoneRow = s.phone ? `<a href="tel:${esc(s.phone)}" class="message-email">${esc(s.phone)}</a>` : '';
        const waBtn = waNumber ? `<a href="https://wa.me/${waNumber}?text=${waPrefill}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" style="color:#25d366; border-color:#25d366;">WhatsApp</a>` : '';
        return `
        <div class="message-item">
            <div class="message-header">
                <div class="message-meta">
                    <span class="message-name">${esc(s.name)}</span>
                    <a href="mailto:${esc(s.email)}" class="message-email">${esc(s.email)}</a>
                    ${phoneRow}
                </div>
                <span class="message-time">${formatDate(s.timestamp)}</span>
            </div>
            <div class="message-subject">📌 ${esc(s.subject)}</div>
            <div class="message-body">${esc(s.message)}</div>
            <div class="message-actions">
                <a href="mailto:${esc(s.email)}?subject=Re: ${encodeURIComponent(s.subject)}" class="btn btn-ghost btn-sm">Reply</a>
                ${waBtn}
                <button class="btn btn-danger btn-sm" onclick="deleteMessage(${s.id})">Delete</button>
            </div>
        </div>`;
    }).join('');
}

window.deleteMessage = async function(id) {
    if (!confirm('Delete this message?')) return;
    const ok = await DataStore.deleteMessage(id);
    if (ok) {
        await renderMessages();
        await refreshDashboard();
        showToast('Message deleted');
    } else {
        showToast('Failed to delete message', 'error');
    }
};

document.getElementById('clearMessagesBtn').addEventListener('click', async () => {
    if (!confirm('Delete ALL messages? This cannot be undone.')) return;
    const ok = await DataStore.clearAllMessages();
    if (ok) {
        await renderMessages();
        await refreshDashboard();
        showToast('All messages cleared');
    } else {
        showToast('Failed to clear messages', 'error');
    }
});

function formatDate(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch {
        return iso;
    }
}

// ========== SOCIAL ==========
function loadSocialForm() {
    const data = DataStore.get();
    const f = document.getElementById('socialForm');
    f.behance.value = data.social.behance;
    f.linkedin.value = data.social.linkedin;
    f.instagram.value = data.social.instagram;
    f.whatsapp.value = data.social.whatsapp;
    f.github.value = data.social.github || '';
}

// ========== FORMS ==========
function setupForms() {
    document.getElementById('heroForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = DataStore.get();
        data.hero.badge = e.target.badge.value;
        data.hero.name = e.target.name.value;
        data.hero.subtitle = e.target.subtitle.value;
        data.hero.description = e.target.description.value;
        const statNums = document.querySelectorAll('[data-stat-num]');
        const newStats = [];
        statNums.forEach(input => {
            const i = input.getAttribute('data-stat-num');
            const labelInput = document.querySelector(`[data-stat-label="${i}"]`);
            if (input.value.trim() || (labelInput && labelInput.value.trim())) {
                newStats.push({ num: input.value, label: labelInput ? labelInput.value : '' });
            }
        });
        data.hero.stats = newStats;
        DataStore.set(data);
        showToast('Hero saved');
    });

    document.getElementById('addStatBtn').addEventListener('click', () => {
        const data = DataStore.get();
        data.hero.stats.push({ num: '0', label: 'New Stat' });
        DataStore.set(data);
        renderStatsEditor(data.hero.stats);
        showToast('Stat added — fill in and save');
    });

    document.getElementById('aboutForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = DataStore.get();
        data.about.profileImage = e.target.profileImage.value || 'assets/profile.jpg';
        data.about.lead = e.target.lead.value;
        data.about.paragraph = e.target.paragraph.value;
        data.about.traits = e.target.traits.value.split(',').map(t => t.trim()).filter(Boolean);
        data.about.info = {
            location: e.target.location.value,
            phone: e.target.phone.value,
            email: e.target.email.value,
            education: e.target.education.value,
            languages: e.target.languages.value,
            stack: e.target.stack.value
        };
        DataStore.set(data);
        showToast('About saved');
    });

    document.getElementById('socialForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = DataStore.get();
        data.social = {
            behance: e.target.behance.value,
            linkedin: e.target.linkedin.value,
            instagram: e.target.instagram.value,
            whatsapp: e.target.whatsapp.value,
            github: e.target.github.value
        };
        DataStore.set(data);
        showToast('Social links saved');
    });

    const credForm = document.getElementById('credentialsForm');
    if (credForm) {
        credForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target.username.value.trim();
            const currentPass = e.target.currentPassword.value;
            const newPass = e.target.newPassword.value;
            const confirmPass = e.target.confirmPassword.value;
            if (!currentPass) {
                showToast('Current password is required', 'error');
                return;
            }
            if (newPass !== confirmPass) {
                showToast('Passwords do not match', 'error');
                return;
            }
            if (newPass === currentPass) {
                showToast('New password must be different from current password', 'error');
                return;
            }
            const btn = credForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.style.opacity = '0.6';
            try {
                const result = await AdminStore.updateCredentials(username, newPass, currentPass);
                if (result.ok) {
                    showToast('Credentials updated. Use new login next time.', 'success', 4000);
                    e.target.currentPassword.value = '';
                    e.target.newPassword.value = '';
                    e.target.confirmPassword.value = '';
                } else {
                    showToast(result.error || 'Failed to update', 'error', 4000);
                }
            } finally {
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        });
    }
}

// ========== GLOBAL ACTIONS ==========
function setupGlobalActions() {
    document.getElementById('exportBtn').addEventListener('click', () => {
        const data = DataStore.get();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mubashir-portfolio-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Data exported');
    });

    const importFile = document.getElementById('importFile');
    document.getElementById('importBtn').addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target.result);
                DataStore.set(imported);
                showToast('Data imported');
                location.reload();
            } catch {
                showToast('Invalid JSON file', 'error');
            }
        };
        reader.readAsText(file);
    });

    const reset = async () => {
        if (!confirm('Reset ALL content to defaults? This affects all visitors. Cannot be undone.')) return;
        DataStore.reset();
        const token = AdminStore.getToken();
        if (token) {
            try {
                await fetch('/api/portfolio', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch {}
        }
        showToast('Content reset to defaults');
        setTimeout(() => location.reload(), 1000);
    };
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('resetBtn2').addEventListener('click', reset);
}

// ----- Helpers -----
function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

function reorderButtons(type, i, total) {
    return `
        <button class="icon-btn" onclick="moveItem('${type}', ${i}, -1)" ${i === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''} title="Move up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <button class="icon-btn" onclick="moveItem('${type}', ${i}, 1)" ${i === total - 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''} title="Move down">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
    `;
}

window.moveItem = function(type, from, direction) {
    const saveFns = {
        skills: window.saveSkills,
        tools: window.saveTools,
        languages: window.saveLanguages,
        markets: window.saveMarkets,
        projects: window.saveProjects,
        experience: window.saveExperience,
        education: window.saveEducation,
        testimonials: window.saveTestimonials
    };
    const renderFns = {
        skills: renderSkillsEditor,
        tools: renderToolsEditor,
        languages: renderLanguagesEditor,
        markets: renderMarketsEditor,
        projects: renderProjectsEditor,
        experience: renderExperienceEditor,
        education: renderEducationEditor,
        testimonials: renderTestimonialsEditor
    };
    if (saveFns[type]) saveFns[type]();
    const data = DataStore.get();
    const list = data[type];
    if (!list) return;
    const to = from + direction;
    if (to < 0 || to >= list.length) return;
    [list[from], list[to]] = [list[to], list[from]];
    DataStore.set(data);
    if (renderFns[type]) renderFns[type]();
};

// ----- Boot -----
checkAuth();
