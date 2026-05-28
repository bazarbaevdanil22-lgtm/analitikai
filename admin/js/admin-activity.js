let activityCurrentPage = 1;
const ACTIVITY_PER_PAGE = 30;

async function loadActivity() {
    const container = document.getElementById('activityContent');
    const pagination = document.getElementById('activityPagination');

    showLoading(container, 'Загрузка журнала...');

    try {
        const offset = (activityCurrentPage - 1) * ACTIVITY_PER_PAGE;
        const data = await getActivityLogs({ limit: ACTIVITY_PER_PAGE, offset: offset });
        const logs = data.logs || [];
        const total = data.total || 0;

        if (!logs.length) {
            showEmpty(container, '&#128203;', 'Нет записей', 'Активность в системе появится здесь');
            pagination.innerHTML = renderPagination(activityCurrentPage, total, ACTIVITY_PER_PAGE, 'goToActivityPage');
            return;
        }

        const actionIcons = {
            register: '&#10004;',
            login: '&#128274;',
            update_role: '&#128737;',
            delete_user: '&#128465;',
            delete_message: '&#128465;',
            update_settings: '&#9881;',
        };

        container.innerHTML = `
            <div style="padding:0">
                ${logs.map(log => `
                    <div class="activity-item">
                        <div class="activity-icon ${log.action}">${actionIcons[log.action] || '&#9679;'}</div>
                        <div class="activity-content">
                            <div class="activity-action">
                                <strong>${escapeHtml(log.username || 'Система')}</strong>
                                <span style="color:var(--text-secondary)">${escapeHtml(log.action.replace(/_/g, ' '))}</span>
                            </div>
                            ${log.details ? `<div class="activity-details">${escapeHtml(log.details)}</div>` : ''}
                            <div class="activity-meta">
                                <span>${escapeHtml(log.ip_address || 'N/A')}</span>
                            </div>
                        </div>
                        <div class="activity-time">${formatDateShort(log.created_at)}</div>
                    </div>
                `).join('')}
            </div>
        `;

        pagination.innerHTML = renderPagination(activityCurrentPage, total, ACTIVITY_PER_PAGE, 'goToActivityPage');
    } catch (err) {
        showError(container, err.message, 'loadActivity');
        pagination.innerHTML = '';
    }
}

function goToActivityPage(page) {
    activityCurrentPage = page;
    loadActivity();
}

function toggleMobileSidebar() {
    document.getElementById('adminSidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    updateAuthUI();
    const ok = await requireAdmin();
    if (ok) loadActivity();
});
