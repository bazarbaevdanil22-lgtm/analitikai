(function () {
    var user, token, displayName, initial, email;

    try {
        token = localStorage.getItem('token');
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return;
    }

    if (!token || !user) return;

    displayName = user.username || user.email || 'User';
    initial = displayName[0].toUpperCase();
    email = user.email || '';

    function populateUI() {
        var el;
        el = document.querySelector('.user-avatar');
        if (el) el.textContent = initial;
        el = document.querySelector('.user-name');
        if (el) el.textContent = displayName;
        el = document.querySelector('.dropdown-avatar');
        if (el) el.textContent = initial;
        el = document.getElementById('dropdownUsername');
        if (el) el.textContent = displayName;
        el = document.getElementById('dropdownEmail');
        if (el) {
            el.textContent = email;
            el.style.display = email ? '' : 'none';
        }
    }

    if (document.body) {
        populateUI();
    } else {
        document.addEventListener('DOMContentLoaded', populateUI);
    }
})();

window.addEventListener('pageswap', function (e) {
    if (!e.viewTransition) return;
    var type = e.navigation && e.navigation.activation && e.navigation.activation.navigationType;
    sessionStorage.setItem('navType', type === 'traverse' ? 'back' : 'forward');

    try {
        var u = JSON.parse(localStorage.getItem('user'));
        if (u) {
            sessionStorage.setItem('vtUser', JSON.stringify({
                username: u.username,
                email: u.email
            }));
        }
    } catch (e) {}
});

window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    var navType = sessionStorage.getItem('navType');
    if (navType) {
        document.documentElement.dataset.navType = navType;
        sessionStorage.removeItem('navType');
    }
});
