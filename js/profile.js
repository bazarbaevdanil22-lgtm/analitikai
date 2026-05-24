document.addEventListener('DOMContentLoaded', function () {
    updateAuthUI();

    if (!isAuthenticated()) {
        showToast('Пожалуйста, войдите в систему', 'error');
        setTimeout(() => { window.location.href = '/auth.html'; }, 1000);
        return;
    }

    loadProfile();

    initSectionTabs();
    initProfileForm();
    initPasswordForm();
    initPasswordStrength();

    if (window.location.hash === '#password') {
        switchSection('password');
    }
});

async function loadProfile() {
    try {
        const data = await getProfile();
        const user = data.user;
        const initial = (user.username || 'U')[0].toUpperCase();

        document.getElementById('profileAvatarLarge').textContent = initial;
        document.getElementById('profileName').textContent = user.username;
        document.getElementById('profileEmailDisplay').textContent = user.email;
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('profileId').textContent = '#' + user.id;

        if (user.created_at) {
            const d = new Date(user.created_at);
            document.getElementById('profileJoined').textContent =
                d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    } catch (err) {
        showToast(err.message || 'Ошибка загрузки профиля', 'error');
    }
}

function initSectionTabs() {
    document.querySelectorAll('.profile-nav-item').forEach(btn => {
        btn.addEventListener('click', function () {
            switchSection(this.dataset.section);
        });
    });
}

function switchSection(section) {
    document.querySelectorAll('.profile-nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));

    const navBtn = document.querySelector(`.profile-nav-item[data-section="${section}"]`);
    const sectionEl = document.getElementById('section' + section.charAt(0).toUpperCase() + section.slice(1));

    if (navBtn) navBtn.classList.add('active');
    if (sectionEl) sectionEl.classList.add('active');
}

function initProfileForm() {
    document.getElementById('profileForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('editUsername').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const btn = document.getElementById('saveProfileBtn');

        if (!username || username.length < 3) {
            showToast('Имя должно быть минимум 3 символа', 'error');
            return;
        }
        if (!email || !email.includes('@')) {
            showToast('Введите корректный email', 'error');
            return;
        }

        setProfileLoading(btn, true);

        try {
            const result = await updateProfile(username, email);
            showToast('Профиль обновлён', 'success');

            document.getElementById('profileName').textContent = result.user.username;
            document.getElementById('profileEmailDisplay').textContent = result.user.email;

            const initial = (result.user.username || 'U')[0].toUpperCase();
            document.getElementById('profileAvatarLarge').textContent = initial;

            updateAuthUI();
        } catch (err) {
            showToast(err.message || 'Ошибка обновления профиля', 'error');
        } finally {
            setProfileLoading(btn, false);
        }
    });
}

function initPasswordForm() {
    document.getElementById('passwordForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmNewPassword').value;
        const btn = document.getElementById('changePasswordBtn');

        if (!current) {
            showToast('Введите текущий пароль', 'error');
            return;
        }
        if (newPass.length < 6) {
            showToast('Новый пароль должен быть минимум 6 символов', 'error');
            return;
        }
        if (newPass !== confirm) {
            showToast('Новые пароли не совпадают', 'error');
            return;
        }

        setProfileLoading(btn, true);

        try {
            await changePassword(current, newPass, confirm);
            showToast('Пароль успешно изменён', 'success');
            resetPasswordForm();
        } catch (err) {
            showToast(err.message || 'Ошибка смены пароля', 'error');
        } finally {
            setProfileLoading(btn, false);
        }
    });
}

function initPasswordStrength() {
    const input = document.getElementById('newPassword');
    const bar = document.getElementById('strengthBar');

    input.addEventListener('input', function () {
        const val = this.value;
        if (!val) {
            bar.className = 'strength-bar';
            bar.style.width = '0';
            return;
        }

        let score = 0;
        if (val.length >= 6) score += 1;
        if (val.length >= 10) score += 1;
        if (/[A-Z]/.test(val)) score += 1;
        if (/[0-9]/.test(val)) score += 1;
        if (/[^A-Za-z0-9]/.test(val)) score += 1;

        if (score <= 1) bar.className = 'strength-bar weak';
        else if (score === 2) bar.className = 'strength-bar medium';
        else if (score <= 3) bar.className = 'strength-bar good';
        else bar.className = 'strength-bar strong';
    });
}

function resetProfileForm() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('editUsername').value = user.username || '';
        document.getElementById('editEmail').value = user.email || '';
    }
}

function resetPasswordForm() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    document.getElementById('strengthBar').className = 'strength-bar';
    document.getElementById('strengthBar').style.width = '0';
}

function setProfileLoading(btn, loading) {
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner');
    btn.disabled = loading;
    if (loading) {
        text.style.display = 'none';
        spinner.style.display = 'inline-block';
    } else {
        text.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

window.addEventListener('hashchange', function () {
    if (window.location.hash === '#password') {
        switchSection('password');
    } else {
        switchSection('general');
    }
});
