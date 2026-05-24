async function loadSettings() {
    const container = document.getElementById('settingsContent');
    showLoading(container, 'Loading settings...');

    try {
        const data = await getAdminSettings();
        const settings = data.settings || {};
        const appName = settings.app_name || 'AI Analyzer';
        const maxMessages = settings.max_messages_per_user || '100';
        const enableRegistration = settings.enable_registration !== 'false';
        const defaultRole = settings.default_role || 'user';
        const enableDarkMode = settings.enable_dark_mode !== 'false';

        container.innerHTML = `
            <div class="admin-card">
                <div class="admin-card-header"><h2>Application Settings</h2></div>
                <div class="admin-card-body">
                    <form id="settingsForm" onsubmit="saveSettings(event)">
                        <div class="settings-section">
                            <h3>General</h3>
                            <div class="settings-row">
                                <div class="settings-label">
                                    <h4>Application Name</h4>
                                    <p>The name displayed throughout the application</p>
                                </div>
                                <div class="settings-control" style="min-width:200px">
                                    <input type="text" name="app_name" value="${escapeHtml(appName)}" style="width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit;font-size:13px;background:var(--bg);color:var(--text);outline:none">
                                </div>
                            </div>
                            <div class="settings-row">
                                <div class="settings-label">
                                    <h4>Max Messages Per User</h4>
                                    <p>Maximum number of messages a user can analyze</p>
                                </div>
                                <div class="settings-control" style="min-width:100px">
                                    <input type="number" name="max_messages_per_user" value="${escapeHtml(maxMessages)}" min="1" max="10000" style="width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit;font-size:13px;background:var(--bg);color:var(--text);outline:none">
                                </div>
                            </div>
                            <div class="settings-row">
                                <div class="settings-label">
                                    <h4>Default User Role</h4>
                                    <p>Role assigned to newly registered users</p>
                                </div>
                                <div class="settings-control">
                                    <select name="default_role" style="padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit;font-size:13px;background:var(--bg);color:var(--text);outline:none">
                                        <option value="user" ${defaultRole === 'user' ? 'selected' : ''}>User</option>
                                        <option value="moderator" ${defaultRole === 'moderator' ? 'selected' : ''}>Moderator</option>
                                        <option value="admin" ${defaultRole === 'admin' ? 'selected' : ''}>Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="settings-section">
                            <h3>Features</h3>
                            <div class="settings-row">
                                <div class="settings-label">
                                    <h4>User Registration</h4>
                                    <p>Allow new users to register on the platform</p>
                                </div>
                                <div class="settings-control">
                                    <label class="toggle-switch">
                                        <input type="checkbox" name="enable_registration" value="true" ${enableRegistration ? 'checked' : ''}>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="settings-row">
                                <div class="settings-label">
                                    <h4>Dark Mode Default</h4>
                                    <p>Enable dark mode as the default theme</p>
                                </div>
                                <div class="settings-control">
                                    <label class="toggle-switch">
                                        <input type="checkbox" name="enable_dark_mode" value="true" ${enableDarkMode ? 'checked' : ''}>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:12px">
                            <button type="button" class="btn btn-outline" onclick="loadSettings()">Reset</button>
                            <button type="submit" class="btn btn-accent" id="saveSettingsBtn">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    } catch (err) {
        showError(container, err.message, 'loadSettings');
    }
}

async function saveSettings(event) {
    event.preventDefault();
    const form = document.getElementById('settingsForm');
    const formData = new FormData(form);
    const settings = {};

    formData.forEach((value, key) => {
        if (key === 'enable_registration' || key === 'enable_dark_mode') {
            settings[key] = 'true';
        } else {
            settings[key] = value;
        }
    });

    const btn = document.getElementById('saveSettingsBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Saving...';

    try {
        await updateAdminSettings(settings);
        showToast('Settings saved successfully', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Changes';
    }
}

function toggleMobileSidebar() {
    document.getElementById('adminSidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    updateAuthUI();
    const ok = await requireAdmin();
    if (ok) loadSettings();
});
