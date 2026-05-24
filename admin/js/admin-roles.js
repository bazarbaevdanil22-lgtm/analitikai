async function loadRoles() {
    const container = document.getElementById('rolesContent');
    showLoading(container, 'Loading roles...');

    try {
        const data = await getAdminUsers({ limit: 100, offset: 0 });
        const users = data.users || [];

        const roleCounts = { admin: 0, moderator: 0, user: 0 };
        users.forEach(u => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });

        container.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:32px">
                <div class="admin-stat-card">
                    <div class="admin-stat-card-header">
                        <div class="admin-stat-icon red">&#128274;</div>
                    </div>
                    <div class="admin-stat-value">${roleCounts.admin}</div>
                    <div class="admin-stat-label">Administrators</div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-card-header">
                        <div class="admin-stat-icon amber">&#128737;</div>
                    </div>
                    <div class="admin-stat-value">${roleCounts.moderator}</div>
                    <div class="admin-stat-label">Moderators</div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-card-header">
                        <div class="admin-stat-icon blue">&#128101;</div>
                    </div>
                    <div class="admin-stat-value">${roleCounts.user}</div>
                    <div class="admin-stat-label">Regular Users</div>
                </div>
            </div>

            <div class="admin-card">
                <div class="admin-card-header"><h3>Role Definitions</h3></div>
                <div class="admin-card-body">
                    <div class="admin-table-wrapper">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Role</th>
                                    <th>Badge</th>
                                    <th>Permissions</th>
                                    <th>Users Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Admin</strong></td>
                                    <td><span class="admin-badge role-admin">Admin</span></td>
                                    <td style="color:var(--text-secondary);font-size:13px">
                                        Full access: manage users, roles, messages, settings, view activity logs
                                    </td>
                                    <td>${roleCounts.admin}</td>
                                </tr>
                                <tr>
                                    <td><strong>Moderator</strong></td>
                                    <td><span class="admin-badge role-moderator">Moderator</span></td>
                                    <td style="color:var(--text-secondary);font-size:13px">
                                        Moderate messages, view users, view activity logs
                                    </td>
                                    <td>${roleCounts.moderator}</td>
                                </tr>
                                <tr>
                                    <td><strong>User</strong></td>
                                    <td><span class="admin-badge role-user">User</span></td>
                                    <td style="color:var(--text-secondary);font-size:13px">
                                        Analyze messages, view own dashboard and profile
                                    </td>
                                    <td>${roleCounts.user}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="admin-card">
                <div class="admin-card-header">
                    <h3>Users by Role</h3>
                    <a href="/admin/users.html" class="btn btn-outline" style="padding:6px 14px;font-size:13px">Manage Users</a>
                </div>
                <div class="admin-table-wrapper">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(u => `
                                <tr>
                                    <td><strong>${escapeHtml(u.username)}</strong></td>
                                    <td style="color:var(--text-secondary)">${escapeHtml(u.email)}</td>
                                    <td><span class="${getRoleBadgeClass(u.role)}">${u.role}</span></td>
                                    <td>
                                        <select class="role-select" onchange="quickRoleChange(${u.id}, this.value)">
                                            <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
                                            <option value="moderator" ${u.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                                            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                                        </select>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (err) {
        showError(container, err.message, 'loadRoles');
    }
}

async function quickRoleChange(userId, role) {
    try {
        await updateUserRole(userId, role);
        showToast('Role updated', 'success');
    } catch (err) {
        showToast(err.message, 'error');
        loadRoles();
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
    if (ok) loadRoles();
});
