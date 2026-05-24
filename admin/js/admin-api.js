const ADMIN_API_BASE = 'http://localhost:5000/api/admin';

function getToken() {
    return localStorage.getItem('token');
}

function getAuthHeaders() {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function adminRequest(endpoint, options = {}) {
    const url = `${ADMIN_API_BASE}${endpoint}`;
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

async function checkAdminAccess() {
    try {
        const data = await adminRequest('/check');
        return data.is_admin === true;
    } catch {
        return false;
    }
}

async function getAdminStats() {
    return await adminRequest('/stats');
}

async function getAdminUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit);
    if (params.offset) query.set('offset', params.offset);
    const qs = query.toString();
    return await adminRequest(`/users${qs ? '?' + qs : ''}`);
}

async function updateUserRole(userId, role) {
    return await adminRequest(`/users/${userId}/role`, {
        method: 'PUT',
        body: { role },
    });
}

async function deleteUser(userId) {
    return await adminRequest(`/users/${userId}`, { method: 'DELETE' });
}

async function getAdminMessages(params = {}) {
    const query = new URLSearchParams();
    if (params.sentiment) query.set('sentiment', params.sentiment);
    if (params.limit) query.set('limit', params.limit);
    if (params.offset) query.set('offset', params.offset);
    const qs = query.toString();
    return await adminRequest(`/messages${qs ? '?' + qs : ''}`);
}

async function deleteAdminMessage(messageId) {
    return await adminRequest(`/messages/${messageId}`, { method: 'DELETE' });
}

async function getActivityLogs(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', params.limit);
    if (params.offset) query.set('offset', params.offset);
    const qs = query.toString();
    return await adminRequest(`/activity${qs ? '?' + qs : ''}`);
}

async function getAdminSettings() {
    return await adminRequest('/settings');
}

async function updateAdminSettings(settings) {
    return await adminRequest('/settings', {
        method: 'PUT',
        body: settings,
    });
}
