const EMOTION_LABELS_RU = {
    'positive': 'Позитив', 'negative': 'Негатив', 'neutral': 'Нейтрально',
};
const EMOTION_COLORS = {
    'positive': '#22C55E', 'negative': '#EF4444', 'neutral': '#94A3B8',
};
const CATEGORY_LABELS_RU = {
    'complaint': 'Жалоба', 'suggestion': 'Предложение',
    'question': 'Вопрос', 'praise': 'Похвала', 'bugreport': 'Баг-репорт',
};
const CATEGORY_COLORS = [
    '#EF4444', '#8B5CF6', '#3B82F6', '#22C55E', '#F59E0B'
];

let charts = {};

document.addEventListener('DOMContentLoaded', function () {
    updateAuthUI();

    if (!isAuthenticated()) {
        document.getElementById('dashboardContent').innerHTML = `
            <div class="empty-state" style="padding-top:80px">
                <div class="empty-state-icon">🔒</div>
                <h3>Требуется авторизация</h3>
                <p>Войдите в систему для просмотра аналитики</p>
                <a href="/auth.html" class="btn btn-accent" style="margin-top:16px">Войти</a>
            </div>
        `;
        return;
    }

    loadDashboard();
});

async function loadDashboard() {
    try {
        const stats = await getStats();
        updateStats(stats);
        updateCharts(stats);
        await loadMessages('all');
    } catch (err) {
        showToast(err.message || 'Ошибка загрузки данных', 'error');
    }
}

function updateStats(stats) {
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statNegative').textContent = stats.negative_pct + '%';
    document.getElementById('statPositive').textContent = stats.positive_pct + '%';
    document.getElementById('statNeutral').textContent = stats.neutral_pct + '%';
    document.getElementById('statNegativeCount').textContent = stats.negative + ' обращений';
    document.getElementById('statPositiveCount').textContent = stats.positive + ' обращений';
    document.getElementById('statNeutralCount').textContent = stats.neutral + ' обращений';
}

function updateCharts(stats) {
    destroyCharts();
    createEmotionChart(stats.emotions);
    createDailyChart(stats.daily);
    createCategoryChart(stats.categories);
    createSentimentChart(stats.positive, stats.negative, stats.neutral);
}

function destroyCharts() {
    Object.values(charts).forEach(c => { if (c) c.destroy(); });
    charts = {};
}

function createEmotionChart(emotions) {
    const ctx = document.getElementById('emotionChart').getContext('2d');
    const labels = emotions.map(e => EMOTION_LABELS_RU[e.emotion] || e.emotion);
    const data = emotions.map(e => e.count);
    const colors = emotions.map(e => EMOTION_COLORS[e.emotion] || '#94A3B8');

    charts.emotion = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 16, usePointStyle: true, font: { size: 12 } }
                }
            },
            cutout: '65%',
        }
    });
}

function createDailyChart(daily) {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    const labels = daily.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    });
    const data = daily.map(d => d.count);

    charts.daily = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Обращений',
                data,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99,102,241,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#6366F1',
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function createCategoryChart(categories) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const labels = categories.map(c => CATEGORY_LABELS_RU[c.complaint_category] || c.complaint_category);
    const data = categories.map(c => c.count);

    charts.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Количество',
                data,
                backgroundColor: CATEGORY_COLORS.slice(0, labels.length),
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function createSentimentChart(positive, negative, neutral) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    charts.sentiment = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Позитивные', 'Негативные', 'Нейтральные'],
            datasets: [{
                data: [positive, negative, neutral],
                backgroundColor: ['#22C55E', '#EF4444', '#94A3B8'],
                borderWidth: 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 16, usePointStyle: true, font: { size: 12 } }
                }
            },
            cutout: '65%',
        }
    });
}

async function loadMessages(sentiment) {
    try {
        const data = await getMessages(sentiment);
        const messages = data.messages || [];
        const tbody = document.getElementById('messagesBody');
        const emptyState = document.getElementById('emptyState');

        tbody.innerHTML = '';

        if (messages.length === 0) {
            tbody.parentElement.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        tbody.parentElement.style.display = '';
        emptyState.style.display = 'none';

        const PRIORITY_LABELS = {
            'low': 'Низкий', 'medium': 'Средний', 'high': 'Высокий', 'critical': 'Критический',
        };
        const PRIORITY_CLASSES = {
            'low': 'priority-low', 'medium': 'priority-medium', 'high': 'priority-high', 'critical': 'priority-critical',
        };

        messages.forEach(msg => {
            const tr = document.createElement('tr');
            const emotionLabel = EMOTION_LABELS_RU[msg.emotion] || msg.emotion;
            const categoryLabel = CATEGORY_LABELS_RU[msg.category || msg.complaint_category] || (msg.category || msg.complaint_category);
            const priorityLabel = PRIORITY_LABELS[msg.priority] || msg.priority || '—';
            const priorityClass = PRIORITY_CLASSES[msg.priority] || '';
            const date = new Date(msg.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            tr.innerHTML = `
                <td><span class="message-text" title="${escapeHtml(msg.text)}">${escapeHtml(msg.text)}</span></td>
                <td><span class="sentiment-badge ${msg.emotion}">${emotionLabel}</span></td>
                <td><span class="category-badge">${categoryLabel}</span></td>
                <td><span class="priority-badge ${priorityClass}">${priorityLabel}</span></td>
                <td style="white-space:nowrap;color:var(--text-secondary);font-size:13px">${date}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        showToast(err.message || 'Ошибка загрузки сообщений', 'error');
    }
}

function filterMessages(sentiment) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === sentiment);
    });
    loadMessages(sentiment);
}

function refreshDashboard() {
    loadDashboard();
    showToast('Данные обновлены', 'success');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    header.classList.toggle('scrolled', window.scrollY > 20);
});
