async function loadSettings() {
    const container = document.getElementById('settingsContent');
    showLoading(container, 'Загрузка настроек...');

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
                <div class="admin-card-header"><h2>Настройки приложения</h2></div>
                <div class="admin-card-body">
                    <form id="settingsForm" onsubmit="saveSettings(event)">
                        <div class="settings-section">
                            <h3>Основные</h3>
                            <div class="settings-row">
                                <div class="settings-label">
                                    <h4>Название приложения</h4>
                                    <p>Название, отображаемое во всём приложении</p>
                                </div>
                                <div class="settings-control" style="min-width:200px">
                                    <input type="text" name="app_name" value="${escapeHtml(appName)}" style="width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit;font-size:13px;background:var(--bg);color:var(--text);outline:none">
                                </div>
                            </div>
                            <div class="settings-row">
                                <div class="settings-label">
                                    <h4>Макс. сообщений на пользователя</h4>
                                    <p>Максимальное количество сообщений для анализа одним пользователем</p>
                                </div>
                                <div class="settings-control" style="min-width:100px">
                                    <input type="number" name="max_messages_per_user" value="${escapeHtml(maxMessages)}" min="1" max="10000" style="width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit;font-size:13px;background:var(--bg);color:var(--text);outline:none">
                                </div>
                            </div>
                            <div class="settings-row">
                                <div class="settings-label">
                                    <h4>Роль по умолчанию</h4>
                                    <p>Роль, назначаемая новым пользователям</p>
                                </div>
                                <div class="settings-control">
                                    <select name="default_role" style="padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit;font-size:13px;background:var(--bg);color:var(--text);outline:none">
                                        <option value="user" ${defaultRole === 'user' ? 'selected' : ''}>Пользователь</option>
                                        <option value="moderator" ${defaultRole === 'moderator' ? 'selected' : ''}>Модератор</option>
                                        <option value="admin" ${defaultRole === 'admin' ? 'selected' : ''}>Администратор</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="settings-section">
                            <h3>Функции</h3>
                            <div class="settings-row">
                                <div class="settings-label">
                                    <h4>Регистрация</h4>
                                    <p>Разрешить регистрацию новых пользователей</p>
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
                                    <h4>Тёмная тема</h4>
                                    <p>Использовать тёмную тему по умолчанию</p>
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
                            <button type="button" class="btn btn-outline" onclick="loadSettings()">Сбросить</button>
                            <button type="submit" class="btn btn-accent" id="saveSettingsBtn">Сохранить</button>
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
    btn.innerHTML = '<span class="spinner"></span> Сохранение...';

    try {
        await updateAdminSettings(settings);
        showToast('Настройки сохранены', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Сохранить';
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
