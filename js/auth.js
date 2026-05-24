document.addEventListener('DOMContentLoaded', function () {
    if (isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    const authError = document.getElementById('authError');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab + 'Form').classList.add('active');
            authError.classList.remove('visible');
            authError.textContent = '';
        });
    });

    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('loginBtn');

        if (!username || !password) {
            showAuthError('Заполните все поля');
            return;
        }

        setLoading(btn, true);

        try {
            await login(username, password);
            showToast('Вход выполнен успешно!', 'success');
            setTimeout(() => { window.location.href = '/'; }, 500);
        } catch (err) {
            showAuthError(err.message);
            setLoading(btn, false);
        }
    });

    document.getElementById('registerForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        const btn = document.getElementById('registerBtn');

        if (!username || !email || !password || !confirm) {
            showAuthError('Заполните все поля');
            return;
        }

        if (password !== confirm) {
            showAuthError('Пароли не совпадают');
            return;
        }

        if (password.length < 6) {
            showAuthError('Пароль должен быть минимум 6 символов');
            return;
        }

        setLoading(btn, true);

        try {
            await register(username, email, password);
            showToast('Аккаунт создан!', 'success');
            setTimeout(() => { window.location.href = '/'; }, 500);
        } catch (err) {
            showAuthError(err.message);
            setLoading(btn, false);
        }
    });
});

function setLoading(btn, loading) {
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

function showAuthError(message) {
    const el = document.getElementById('authError');
    el.textContent = message;
    el.classList.add('visible');
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}
