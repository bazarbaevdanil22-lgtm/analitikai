let usersCurrentPage = 1;
let usersSearchTerm = '';
const USERS_PER_PAGE = 20;

async function loadUsers() {
    const tbody = document.getElementById('usersBody');
    const pagination = document.getElementById('usersPagination');

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px"><div class="spinner dark"></div><p style="margin-top:8px;color:var(--text-secondary)">Загрузка пользователей...</p></td></tr>`;

    try {
        const offset = (usersCurrentPage - 1) * USERS_PER_PAGE;
        const data = await getAdminUsers({
            search: usersSearchTerm,
            limit: USERS_PER_PAGE,
            offset: offset,
        });
        const users = data.users || [];
        const total = data.total || 0;

        if (!users.length) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state" style="padding:40px"><div class="empty-icon">&#128101;</div><h3>Пользователи не найдены</h3><p>${usersSearchTerm ? 'Попробуйте другой запрос' : 'Пока нет зарегистрированных пользователей'}</p></div></td></tr>`;
            pagination.innerHTML = renderPagination(usersCurrentPage, total, USERS_PER_PAGE, 'goToUsersPage');
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td style="font-weight:600;color:var(--text-light)">${user.id}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px">
                        <span class="user-avatar" style="width:28px;height:28px;font-size:11px">${getInitials(user.username)}</span>
                        <strong>${escapeHtml(user.username)}</strong>
                        ${user.role === 'admin' ? '<span class="admin-badge role-admin" style="font-size:10px">АДМИН</span>' : ''}
                    </div>
                </td>
                <td style="color:var(--text-secondary)">${escapeHtml(user.email)}</td>
                <td>
                    <select class="role-select" data-user-id="${user.id}" onchange="onRoleChange(${user.id}, this.value)">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>Пользователь</option>
                        <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Модератор</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Админ</option>
                    </select>
                </td>
                <td style="color:var(--text-secondary);font-size:13px">${formatDate(user.created_at)}</td>
                <td>
                    <div class="cell-actions">
                        <button class="btn-icon danger" onclick="confirmDeleteUser(${user.id}, '${escapeHtml(user.username)}')" title="Удалить пользователя">&#128465;</button>
                    </div>
                </td>
            </tr>
        `).join('');

        pagination.innerHTML = renderPagination(usersCurrentPage, total, USERS_PER_PAGE, 'goToUsersPage');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#EF4444">Ошибка загрузки: ${escapeHtml(err.message)}</td></tr>`;
        pagination.innerHTML = '';
    }
}

function goToUsersPage(page) {
    usersCurrentPage = page;
    loadUsers();
}

async function onRoleChange(userId, newRole) {
    try {
        await updateUserRole(userId, newRole);
        showToast('Роль обновлена', 'success');
    } catch (err) {
        showToast(err.message, 'error');
        loadUsers();
    }
}

function confirmDeleteUser(userId, username) {
    showConfirmModal({
        title: 'Удаление пользователя',
        message: `Вы уверены, что хотите удалить "${username}"? Это безвозвратно удалит пользователя и все его сообщения.`,
        confirmText: 'Удалить',
        type: 'danger',
        onConfirm: async () => {
            try {
                await deleteUser(userId);
                showToast('Пользователь удалён', 'success');
                loadUsers();
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    });
}

const debouncedSearch = debounce(() => {
    usersCurrentPage = 1;
    loadUsers();
}, 300);

function onSearchChange() {
    const input = document.getElementById('searchInput');
    usersSearchTerm = input.value;
    debouncedSearch();
}

function toggleMobileSidebar() {
    document.getElementById('adminSidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    updateAuthUI();
    const ok = await requireAdmin();
    if (ok) loadUsers();
});
