function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин назад`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} дн назад`;
    return d.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function getStatusColor(sentiment) {
    const colors = { positive: '#22C55E', negative: '#EF4444', neutral: '#64748B' };
    return colors[sentiment] || '#64748B';
}

function truncate(str, len = 60) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
}

function getInitials(name) {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
}

function getRoleBadgeClass(role) {
    return `admin-badge role-${role || 'user'}`;
}

function getSentimentBadgeClass(sentiment) {
    return `admin-badge sentiment-${sentiment || 'neutral'}`;
}

function getActivityIcon(action) {
    const icons = {
        register: 'person_add',
        login: 'login',
        update_role: 'admin_panel_settings',
        delete_user: 'person_remove',
        delete_message: 'delete',
        update_settings: 'settings',
    };
    return icons[action] || 'info';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

function toggleTheme() {
    const current = getTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
    setTheme(getTheme());
}

function getPaginationRange(current, total, maxButtons = 5) {
    if (total <= maxButtons) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(current - half, 1);
    let end = start + maxButtons - 1;
    if (end > total) {
        end = total;
        start = Math.max(end - maxButtons + 1, 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
