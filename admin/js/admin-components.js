function openModal(html) {
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="modal">${html}</div>`;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('open'));

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', handleModalEscape);
    return overlay;
}

function handleModalEscape(e) {
    if (e.key === 'Escape') closeModal();
}

function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.classList.remove('open');
        setTimeout(() => overlay.remove(), 250);
    }
    document.removeEventListener('keydown', handleModalEscape);
}

function showConfirmModal({ title, message, confirmText = 'Подтвердить', cancelText = 'Отмена', type = 'danger', onConfirm }) {
    const icon = type === 'danger' ? '⚠️' : 'ℹ️';
    const overlay = openModal(`
        <div class="modal-header">
            <h2>${escapeHtml(title)}</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="confirm-icon ${type}">${icon}</div>
            <div class="confirm-text">
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(message)}</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeModal()">${escapeHtml(cancelText)}</button>
            <button class="btn btn-accent" id="confirmBtn" style="background:${type === 'danger' ? '#EF4444' : 'var(--primary)'}">${escapeHtml(confirmText)}</button>
        </div>
    `);

    document.getElementById('confirmBtn').addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
    });
}

function showFormModal({ title, html, onSubmit, submitText = 'Сохранить', width }) {
    const overlay = openModal(`
        <div class="modal-header">
            <h2>${escapeHtml(title)}</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <form id="modalForm" onsubmit="return false">
            <div class="modal-body">
                ${html}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Отмена</button>
                <button type="submit" class="btn btn-accent" id="formSubmitBtn">${escapeHtml(submitText)}</button>
            </div>
        </form>
    `);

    if (width) {
        overlay.querySelector('.modal').style.maxWidth = width;
    }

    document.getElementById('modalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (onSubmit) {
            const form = document.getElementById('modalForm');
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });
            onSubmit(data);
        }
    });
}

function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: '\u2713', error: '\u2715', info: '\u2139' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || '\u2139'}</span>
        <span>${escapeHtml(message)}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function renderPagination(current, total, limit, onChange) {
    const totalPages = Math.ceil(total / limit) || 1;
    if (totalPages <= 1) return '<div class="admin-pagination-info">Нет результатов</div>';

    let html = `<span class="admin-pagination-info">${Math.min((current - 1) * limit + 1, total)}-${Math.min(current * limit, total)} из ${total}</span>`;
    html += '<div class="admin-pagination">';

    html += `<button class="page-btn" onclick="(${onChange})(${current - 1})" ${current <= 1 ? 'disabled' : ''}>&laquo;</button>`;

    const range = getPaginationRange(current, totalPages);
    range.forEach(p => {
        html += `<button class="page-btn ${p === current ? 'active' : ''}" onclick="(${onChange})(${p})">${p}</button>`;
    });

    html += `<button class="page-btn" onclick="(${onChange})(${current + 1})" ${current >= totalPages ? 'disabled' : ''}>&raquo;</button>`;
    html += '</div>';
    return html;
}

function renderSkeleton(count = 4) {
    let html = '<div class="admin-stats-grid">';
    for (let i = 0; i < count; i++) {
        html += '<div class="admin-stat-card"><div class="skeleton skeleton-stat"></div></div>';
    }
    html += '</div>';
    return html;
}

function renderTableSkeleton(rows = 5, cols = 5) {
    let html = '<table class="admin-table">';
    html += '<thead><tr>';
    for (let i = 0; i < cols; i++) {
        html += '<th><div class="skeleton" style="height:14px;width:60px"></div></th>';
    }
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r++) {
        html += '<tr>';
        for (let c = 0; c < cols; c++) {
            html += `<td><div class="skeleton" style="height:14px;width:${40 + Math.random() * 40}px"></div></td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
}

function showError(container, message, onRetry) {
    container.innerHTML = `
        <div class="admin-error-state">
            <div class="error-icon">&#9888;</div>
            <h3>Ошибка загрузки данных</h3>
            <p>${escapeHtml(message)}</p>
            ${onRetry ? '<button class="btn btn-outline" onclick="(' + onRetry + ')()">Повторить</button>' : ''}
        </div>
    `;
}

function showLoading(container, message = 'Загрузка...') {
    container.innerHTML = `
        <div class="admin-loading">
            <div class="spinner dark"></div>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function showEmpty(container, icon, title, message) {
    container.innerHTML = `
        <div class="admin-empty-state">
            <div class="empty-icon">${icon}</div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}
