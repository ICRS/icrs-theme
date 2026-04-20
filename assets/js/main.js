(function () {
    'use strict';

    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    var header = document.querySelector('.header-inner');

    if (toggle && nav) {
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            nav.classList.toggle('is-open');
            toggle.classList.toggle('is-active');
        });

        document.addEventListener('click', function (e) {
            if (header && !header.contains(e.target) && nav.classList.contains('is-open')) {
                nav.classList.remove('is-open');
                toggle.classList.remove('is-active');
            }
        });
    }

    function updateCompactNav() {
        if (!header) return;

        header.classList.remove('is-compact');
        if (nav) nav.classList.remove('is-open');
        if (toggle) toggle.classList.remove('is-active');

        if (header.scrollWidth > header.clientWidth + 1) {
            header.classList.add('is-compact');
        }
    }

    updateCompactNav();
    window.addEventListener('load', updateCompactNav);
    window.addEventListener('resize', updateCompactNav);

    // Lobstar hamburger nav
    var lobToggle = document.querySelector('.lobstar-nav-toggle');
    var lobLinks = document.querySelector('.lobstar-nav-links');
    var lobHeader = document.querySelector('.lobstar-nav');

    if (lobToggle && lobLinks) {
        lobToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            lobLinks.classList.toggle('is-open');
            lobToggle.classList.toggle('is-active');
        });

        document.addEventListener('click', function (e) {
            if (lobHeader && !lobHeader.contains(e.target) && lobLinks.classList.contains('is-open')) {
                lobLinks.classList.remove('is-open');
                lobToggle.classList.remove('is-active');
            }
        });

        // Close after following an in-page link
        lobLinks.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') {
                lobLinks.classList.remove('is-open');
                lobToggle.classList.remove('is-active');
            }
        });
    }
})();
