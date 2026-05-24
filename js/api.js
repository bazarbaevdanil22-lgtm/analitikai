const API_BASE = 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('token');
}

function isAuthenticated() {
    return !!getToken();
}

function getAuthHeaders() {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: getAuthHeaders(),
        ...options,
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
}

async function login(username, password) {
    const data = await apiRequest('/login', {
        method: 'POST',
        body: { username, password },
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
}

async function register(username, email, password) {
    const data = await apiRequest('/register', {
        method: 'POST',
        body: { username, email, password },
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
}

async function getProfile() {
    return await apiRequest('/profile');
}

async function updateProfile(username, email) {
    const data = await apiRequest('/profile', {
        method: 'PUT',
        body: { username, email },
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
}

async function changePassword(currentPassword, newPassword, confirmPassword) {
    return await apiRequest('/profile/change-password', {
        method: 'PUT',
        body: {
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
        },
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth.html';
}

async function analyzeText(text) {
    return await apiRequest('/analyze', {
        method: 'POST',
        body: { text },
    });
}

async function getMessages(sentiment = 'all') {
    return await apiRequest(`/messages?sentiment=${sentiment}`);
}

async function getStats() {
    return await apiRequest('/stats');
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

function initTheme() {
    setTheme(getTheme());
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

async function requireAdmin() {
    const user = getCurrentUser();
    if (user && user.role === 'admin') return true;

    try {
        const res = await fetch('http://localhost:5000/api/admin/check', {
            headers: getAuthHeaders(),
        });
        if (res.ok) {
            const data = await res.json();
            if (data.is_admin) {
                if (user) user.role = 'admin';
                localStorage.setItem('user', JSON.stringify(user || { role: 'admin' }));
                return true;
            }
        }
    } catch {}

    window.location.href = '/dashboard.html';
    return false;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ'}</span>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function updateAuthUI() {
    const authLink = document.getElementById('authLink');
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    const user = getCurrentUser();

    if (isAuthenticated()) {
        if (authLink) authLink.style.display = 'none';
        if (profileTrigger) {
            profileTrigger.style.display = 'flex';
            if (user) {
                const avatar = profileTrigger.querySelector('.user-avatar');
                const name = profileTrigger.querySelector('.user-name');
                if (avatar) avatar.textContent = (user.username || 'U')[0].toUpperCase();
                if (name) name.textContent = user.username || 'User';
            }
        }
        if (profileDropdown && user && (user.role === 'admin' || user.role === 'moderator')) {
            const adminLinks = profileDropdown.querySelectorAll('.admin-panel-link');
            if (!adminLinks.length) {
                const tokensLink = profileDropdown.querySelector('.dropdown-logout');
                if (tokensLink) {
                    const divider = document.createElement('div');
                    divider.className = 'dropdown-divider admin-panel-divider';
                    tokensLink.parentNode.insertBefore(divider, tokensLink);
                    const link = document.createElement('a');
                    link.href = '/admin/dashboard.html';
                    link.className = 'dropdown-item admin-panel-link';
                    link.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Admin Panel';
                    divider.parentNode.insertBefore(link, divider.nextSibling);
                }
            }
        }
    } else {
        if (authLink) authLink.style.display = 'inline-flex';
        if (profileTrigger) profileTrigger.style.display = 'none';
        if (profileDropdown) profileDropdown.classList.remove('open');
    }
}

function toggleProfileDropdown(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    updateAuthUI();

    document.addEventListener('click', function (e) {
        const dropdown = document.getElementById('profileDropdown');
        const trigger = document.getElementById('profileTrigger');
        if (dropdown && trigger && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
});

function handleLogout() {
    logout();
    showToast('Вы вышли из системы', 'info');
}
