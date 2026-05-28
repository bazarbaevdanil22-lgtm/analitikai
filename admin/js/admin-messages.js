let messagesCurrentPage = 1;
let messagesSentimentFilter = 'all';
const MESSAGES_PER_PAGE = 20;

async function loadMessages() {
    const tbody = document.getElementById('messagesBody');
    const pagination = document.getElementById('messagesPagination');

    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px"><div class="spinner dark"></div><p style="margin-top:8px;color:var(--text-secondary)">Загрузка сообщений...</p></td></tr>`;

    try {
        const offset = (messagesCurrentPage - 1) * MESSAGES_PER_PAGE;
        const data = await getAdminMessages({
            sentiment: messagesSentimentFilter,
            limit: MESSAGES_PER_PAGE,
            offset: offset,
        });
        const messages = data.messages || [];
        const total = data.total || 0;

        if (!messages.length) {
            tbody.innerHTML = `<tr><td colspan="8"><div class="admin-empty-state" style="padding:40px"><div class="empty-icon">&#128172;</div><h3>Сообщения не найдены</h3><p>Нет сообщений, соответствующих фильтру</p></div></td></tr>`;
            pagination.innerHTML = renderPagination(messagesCurrentPage, total, MESSAGES_PER_PAGE, 'goToMessagesPage');
            return;
        }

        tbody.innerHTML = messages.map(msg => `
            <tr>
                <td style="font-weight:600;color:var(--text-light)">${msg.id}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:6px">
                        <span class="user-avatar" style="width:24px;height:24px;font-size:10px">${getInitials(msg.username)}</span>
                        <span style="font-size:13px">${escapeHtml(msg.username)}</span>
                    </div>
                </td>
                <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary);font-size:13px" title="${escapeHtml(msg.text)}">
                    ${escapeHtml(truncate(msg.text, 80))}
                </td>
                <td><span class="${getSentimentBadgeClass(msg.sentiment)}">${msg.sentiment === 'positive' ? 'Позитив' : msg.sentiment === 'negative' ? 'Негатив' : msg.sentiment || 'N/A'}</span></td>
                <td style="color:var(--text-secondary);font-size:13px">${msg.emotion === 'positive' ? 'Позитив' : msg.emotion === 'negative' ? 'Негатив' : msg.emotion === 'neutral' ? 'Нейтрально' : escapeHtml(msg.emotion || 'N/A')}</td>
                <td style="color:var(--text-secondary);font-size:13px">${escapeHtml(msg.complaint_category || 'N/A')}</td>
                <td style="color:var(--text-secondary);font-size:13px">${formatDate(msg.created_at)}</td>
                <td>
                    <div class="cell-actions">
                        <button class="btn-icon" onclick="viewMessage(${msg.id})" title="Просмотр">&#128065;</button>
                        <button class="btn-icon danger" onclick="confirmDeleteMessage(${msg.id})" title="Удалить сообщение">&#128465;</button>
                    </div>
                </td>
            </tr>
        `).join('');

        pagination.innerHTML = renderPagination(messagesCurrentPage, total, MESSAGES_PER_PAGE, 'goToMessagesPage');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:#EF4444">Ошибка загрузки: ${escapeHtml(err.message)}</td></tr>`;
        pagination.innerHTML = '';
    }
}

function goToMessagesPage(page) {
    messagesCurrentPage = page;
    loadMessages();
}

function filterBySentiment(filter) {
    messagesSentimentFilter = filter;
    messagesCurrentPage = 1;
    document.querySelectorAll('#sentimentFilters .admin-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    loadMessages();
}

function viewMessage(id) {
    showFormModal({
        title: 'Детали сообщения',
        width: '600px',
        submitText: 'Закрыть',
        html: `<p id="messageDetailContent" style="color:var(--text-secondary);text-align:center">Загрузка...</p>`,
        onSubmit: () => closeModal(),
    });
}

function confirmDeleteMessage(messageId) {
    showConfirmModal({
        title: 'Удаление сообщения',
        message: 'Вы уверены, что хотите удалить это сообщение? Это действие нельзя отменить.',
        confirmText: 'Удалить',
        type: 'danger',
        onConfirm: async () => {
            try {
                await deleteAdminMessage(messageId);
                showToast('Сообщение удалено', 'success');
                loadMessages();
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    });
}

function toggleMobileSidebar() {
    document.getElementById('adminSidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    updateAuthUI();
    const ok = await requireAdmin();
    if (ok) loadMessages();
});
