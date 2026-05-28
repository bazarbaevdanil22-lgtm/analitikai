let dailyChartInstance = null;
let sentimentChartInstance = null;

async function loadDashboard() {
    const statsGrid = document.getElementById('statsGrid');
    const activityContainer = document.getElementById('recentActivity');

    statsGrid.innerHTML = renderSkeleton(6);

    try {
        const stats = await getAdminStats();
        renderStats(stats);
        renderCharts(stats);
        loadRecentActivity();
    } catch (err) {
        showError(statsGrid, err.message, 'loadDashboard');
    }
}

function renderStats(stats) {
    const grid = document.getElementById('statsGrid');
    const total = stats.total_messages || 0;
    const pos = stats.positive || 0;
    const neg = stats.negative || 0;
    const neu = stats.neutral || 0;
    const posPct = total ? Math.round(pos / total * 100) : 0;
    const negPct = total ? Math.round(neg / total * 100) : 0;

    grid.innerHTML = `
        <div class="admin-stat-card">
            <div class="admin-stat-card-header">
                <div class="admin-stat-icon blue">&#9993;</div>
            </div>
            <div class="admin-stat-value">${stats.total_messages}</div>
            <div class="admin-stat-label">Всего сообщений</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-card-header">
                <div class="admin-stat-icon green">&#128101;</div>
            </div>
            <div class="admin-stat-value">${stats.total_users}</div>
            <div class="admin-stat-label">Всего пользователей</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-card-header">
                <div class="admin-stat-icon purple">&#128737;</div>
            </div>
            <div class="admin-stat-value">${stats.total_admins}</div>
            <div class="admin-stat-label">Администраторы</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-card-header">
                <div class="admin-stat-icon amber">&#9881;</div>
            </div>
            <div class="admin-stat-value">${stats.total_activities}</div>
            <div class="admin-stat-label">Событий</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-card-header">
                <div class="admin-stat-icon green">&#128077;</div>
            </div>
            <div class="admin-stat-value">${posPct}%</div>
            <div class="admin-stat-label">Позитив (${pos})</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-card-header">
                <div class="admin-stat-icon red">&#128078;</div>
            </div>
            <div class="admin-stat-value">${negPct}%</div>
            <div class="admin-stat-label">Негатив (${neg})</div>
        </div>
    `;
}

function renderCharts(stats) {
    const dailyCtx = document.getElementById('dailyChart');
    const sentimentCtx = document.getElementById('sentimentChart');

    if (dailyChartInstance) { dailyChartInstance.destroy(); }
    if (sentimentChartInstance) { sentimentChartInstance.destroy(); }

    const isDark = getTheme() === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? '#94A3B8' : '#64748B';

    if (dailyCtx && stats.daily && stats.daily.length) {
        dailyChartInstance = new Chart(dailyCtx, {
            type: 'line',
            data: {
                labels: stats.daily.map(d => d.date),
                datasets: [{
                    label: 'Сообщения',
                    data: stats.daily.map(d => d.count),
                    borderColor: '#6366F1',
                    backgroundColor: 'rgba(99,102,241,0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 }, stepSize: 1 } }
                }
            }
        });
    }

    if (sentimentCtx) {
        const pos = stats.positive || 0;
        const neg = stats.negative || 0;
        const neu = stats.neutral || 0;
        sentimentChartInstance = new Chart(sentimentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Позитив', 'Негатив', 'Нейтрально'],
                datasets: [{
                    data: [pos, neg, neu],
                    backgroundColor: ['#22C55E', '#EF4444', '#64748B'],
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, font: { size: 12 }, padding: 16 }
                    }
                },
                cutout: '65%',
            }
        });
    }
}

async function loadRecentActivity() {
    const container = document.getElementById('recentActivity');
    try {
        const data = await getActivityLogs({ limit: 10, offset: 0 });
        const logs = data.logs || [];
        if (!logs.length) {
            showEmpty(container, '&#128203;', 'Нет активности', 'Действия пользователей появятся здесь');
            return;
        }
        container.innerHTML = logs.map(log => `
            <div class="activity-item">
                <div class="activity-icon ${log.action}">&#9679;</div>
                <div class="activity-content">
                    <div class="activity-action">
                        <strong>${escapeHtml(log.username)}</strong> ${escapeHtml(log.action.replace(/_/g, ' '))}
                    </div>
                    ${log.details ? `<div class="activity-details">${escapeHtml(log.details)}</div>` : ''}
                    <div class="activity-meta">
                        <span>${formatDateShort(log.created_at)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<p style="color:var(--text-secondary);font-size:13px">Ошибка загрузки: ${escapeHtml(err.message)}</p>`;
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
    if (ok) loadDashboard();
});
