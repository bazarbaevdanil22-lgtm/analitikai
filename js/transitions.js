window.addEventListener('pageswap', function (e) {
    if (!e.viewTransition) return;
    var type = e.navigation && e.navigation.activation && e.navigation.activation.navigationType;
    sessionStorage.setItem('navType', type === 'traverse' ? 'back' : 'forward');
});

window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    var navType = sessionStorage.getItem('navType');
    if (navType) {
        document.documentElement.dataset.navType = navType;
        sessionStorage.removeItem('navType');
    }
});
