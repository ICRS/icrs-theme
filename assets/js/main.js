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

    // ---- Sticky header: add .is-stuck when scrolled past initial padding ----
    var stickyContainer = document.querySelector('.sticky-header-container');
    if (stickyContainer) {
        var stuckThreshold = 10; // px scrolled before switching to stuck mode

        function updateStuck() {
            if (window.scrollY > stuckThreshold) {
                stickyContainer.classList.add('is-stuck');
            } else {
                stickyContainer.classList.remove('is-stuck');
            }
        }

        updateStuck();
        window.addEventListener('scroll', updateStuck, { passive: true });
    }

    // ---- Win-panel popup animation on page load ----
    var winPanel = document.querySelector('.win-panel');
    if (winPanel) {
        // Small delay so the animation is visible after page renders
        setTimeout(function () {
            winPanel.classList.add('is-visible');
        }, 500);
    }

    // ---- Event card: rewrite [data-event] placeholders into full chrome ----
    function renderEventCards() {
        var COLOR_VAR_MAP = {
            color: '--event-titlebar-bg',
            titleColor: '--event-titlebar-fg',
            bg: '--event-window-bg',
            fg: '--event-window-fg',
            shadow: '--event-shadow',
            accent: '--event-accent'
        };
        var META_FIELDS = [
            { key: 'when', label: 'When' },
            { key: 'where', label: 'Where' },
            { key: 'price', label: 'Price' }
        ];

        function el(tag, className) {
            var node = document.createElement(tag);
            if (className) node.className = className;
            return node;
        }

        function appendParagraphs(container, text) {
            text.split(/\n\s*\n/).forEach(function (chunk) {
                var trimmed = chunk.trim();
                if (!trimmed) return;
                var p = document.createElement('p');
                p.textContent = trimmed;
                container.appendChild(p);
            });
        }

        var placeholders = document.querySelectorAll('[data-event]');
        Array.prototype.forEach.call(placeholders, function (src) {
            var data = src.dataset;
            var description = src.textContent || '';

            var card = el('div', 'event-card');

            // Apply color overrides as CSS custom properties on the wrapper
            Object.keys(COLOR_VAR_MAP).forEach(function (key) {
                var val = data[key];
                if (val) card.style.setProperty(COLOR_VAR_MAP[key], val);
            });

            var win = el('div', 'event-card-window');
            card.appendChild(win);

            var titlebar = el('div', 'event-card-titlebar');
            var label = el('span', 'event-card-titlebar-label');
            label.textContent = data.label || 'EVENT';
            titlebar.appendChild(label);

            var btns = el('div', 'event-card-titlebar-buttons');
            ['−', '□', '×'].forEach(function (sym) {
                var b = document.createElement('span');
                b.textContent = sym;
                btns.appendChild(b);
            });
            titlebar.appendChild(btns);
            win.appendChild(titlebar);

            var body = el('div', 'event-card-body');
            win.appendChild(body);

            if (data.image) {
                var media = el('div', 'event-card-media');
                var img = document.createElement('img');
                img.src = data.image;
                img.alt = data.title || '';
                img.loading = 'lazy';
                media.appendChild(img);
                body.appendChild(media);
            }

            if (data.title) {
                var h = el('h3', 'event-card-title');
                h.textContent = data.title;
                body.appendChild(h);
            }

            var metaRows = META_FIELDS.filter(function (f) { return data[f.key]; });
            if (metaRows.length) {
                var dl = el('dl', 'event-card-meta');
                metaRows.forEach(function (f) {
                    var dt = document.createElement('dt');
                    dt.textContent = f.label;
                    var dd = document.createElement('dd');
                    dd.textContent = data[f.key];
                    dl.appendChild(dt);
                    dl.appendChild(dd);
                });
                body.appendChild(dl);
            }

            if (description.trim()) {
                var desc = el('div', 'event-card-description');
                appendParagraphs(desc, description);
                body.appendChild(desc);
            }

            var actions = el('div', 'event-card-actions');

            if (data.cta) {
                var a = document.createElement('a');
                a.className = 'event-card-cta';
                a.href = data.cta;
                a.textContent = data.ctaLabel || 'sign up';
                actions.appendChild(a);
            }

            if (data.start) {
                var calBtn = buildCalendarButton(data, description);
                if (calBtn) actions.appendChild(calBtn);
            }

            if (actions.childNodes.length) body.appendChild(actions);

            src.parentNode.replaceChild(card, src);
        });
    }

    function buildCalendarButton(data, description) {
        var start = parseEventDate(data.start);
        if (!start) return null;

        var end = parseEventDate(data.end);
        if (!end) {
            var minutes = parseInt(data.duration, 10);
            if (isNaN(minutes) || minutes <= 0) minutes = 60;
            end = new Date(start.getTime() + minutes * 60000);
        }

        var ev = {
            title: data.title || 'Event',
            location: data.where || '',
            description: (description || '').trim(),
            url: data.cta || '',
            start: start,
            end: end
        };

        var wrap = document.createElement('div');
        wrap.className = 'event-card-calendar-wrapper';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'event-card-calendar';
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', data.calendarLabel || 'add to calendar');
        btn.title = data.calendarLabel || 'add to calendar';
        btn.innerHTML = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true">'
            + '<rect x="1" y="2.5" width="12" height="10.5" stroke="currentColor" stroke-width="1.5"/>'
            + '<line x1="1" y1="5.5" x2="13" y2="5.5" stroke="currentColor" stroke-width="1.5"/>'
            + '<line x1="4" y1="0.75" x2="4" y2="3.75" stroke="currentColor" stroke-width="1.5"/>'
            + '<line x1="10" y1="0.75" x2="10" y2="3.75" stroke="currentColor" stroke-width="1.5"/>'
            + '</svg>';

        var menu = document.createElement('div');
        menu.className = 'event-card-calendar-menu';
        menu.setAttribute('role', 'menu');

        var providers = [
            { label: 'Google', fn: function () { window.open(googleCalendarUrl(ev), '_blank', 'noopener'); } },
            { label: 'Outlook', fn: function () { window.open(outlookCalendarUrl(ev), '_blank', 'noopener'); } },
            { label: 'Apple / iCal', fn: function () { downloadICS(ev); } }
        ];

        providers.forEach(function (p) {
            var item = document.createElement('button');
            item.type = 'button';
            item.className = 'event-card-calendar-option';
            item.setAttribute('role', 'menuitem');
            item.textContent = p.label;
            item.addEventListener('click', function () {
                closeMenu();
                p.fn();
            });
            menu.appendChild(item);
        });

        function openMenu() {
            wrap.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            document.addEventListener('click', outsideClick, true);
            document.addEventListener('keydown', escClose);
        }

        function closeMenu() {
            wrap.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click', outsideClick, true);
            document.removeEventListener('keydown', escClose);
        }

        function outsideClick(e) {
            if (!wrap.contains(e.target)) closeMenu();
        }

        function escClose(e) {
            if (e.key === 'Escape') closeMenu();
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (wrap.classList.contains('is-open')) closeMenu();
            else openMenu();
        });

        wrap.appendChild(btn);
        wrap.appendChild(menu);
        return wrap;
    }

    // Parse a data-start / data-end string. Strip any timezone suffix so the
    // value is always treated as floating local time (parsed in the browser's
    // local zone, then emitted without a UTC marker).
    function parseEventDate(raw) {
        if (!raw) return null;
        var stripped = String(raw).trim().replace(/(Z|[+-]\d{2}:?\d{2})$/, '');
        var d = new Date(stripped);
        return isNaN(d.getTime()) ? null : d;
    }

    function pad2(n) { return (n < 10 ? '0' : '') + n; }

    // Floating-time ICS date: YYYYMMDDTHHMMSS, no trailing Z.
    function toICSDate(d) {
        return d.getFullYear()
            + pad2(d.getMonth() + 1)
            + pad2(d.getDate())
            + 'T'
            + pad2(d.getHours())
            + pad2(d.getMinutes())
            + pad2(d.getSeconds());
    }

    // Local ISO 8601 without offset (for Outlook deeplink).
    function toLocalISO(d) {
        return d.getFullYear() + '-'
            + pad2(d.getMonth() + 1) + '-'
            + pad2(d.getDate()) + 'T'
            + pad2(d.getHours()) + ':'
            + pad2(d.getMinutes()) + ':'
            + pad2(d.getSeconds());
    }

    function buildQuery(params) {
        var pairs = [];
        Object.keys(params).forEach(function (k) {
            var v = params[k];
            if (v) pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        });
        return pairs.join('&');
    }

    function detailsWithUrl(ev) {
        var body = ev.description;
        if (ev.url) body = (body ? body + '\n\n' : '') + ev.url;
        return body;
    }

    function googleCalendarUrl(ev) {
        return 'https://calendar.google.com/calendar/render?' + buildQuery({
            action: 'TEMPLATE',
            text: ev.title,
            dates: toICSDate(ev.start) + '/' + toICSDate(ev.end),
            details: detailsWithUrl(ev),
            location: ev.location,
            ctz: '' // omit timezone so Google treats the times as floating-local
        });
    }

    function outlookCalendarUrl(ev) {
        return 'https://outlook.live.com/calendar/0/deeplink/compose?' + buildQuery({
            path: '/calendar/action/compose',
            rru: 'addevent',
            subject: ev.title,
            startdt: toLocalISO(ev.start),
            enddt: toLocalISO(ev.end),
            body: detailsWithUrl(ev),
            location: ev.location
        });
    }

    function escapeICS(s) {
        return String(s)
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\r?\n/g, '\\n');
    }

    function downloadICS(ev) {
        var uid = 'icrs-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '@icrs.io';
        var lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//ICRS//Event//EN',
            'CALSCALE:GREGORIAN',
            'BEGIN:VEVENT',
            'UID:' + uid,
            'DTSTAMP:' + toICSDate(new Date()),
            'DTSTART:' + toICSDate(ev.start),
            'DTEND:' + toICSDate(ev.end),
            'SUMMARY:' + escapeICS(ev.title)
        ];
        if (ev.location) lines.push('LOCATION:' + escapeICS(ev.location));
        if (ev.description) lines.push('DESCRIPTION:' + escapeICS(ev.description.trim()));
        if (ev.url) lines.push('URL:' + escapeICS(ev.url));
        lines.push('END:VEVENT', 'END:VCALENDAR');

        var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var slug = (ev.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event';

        var link = document.createElement('a');
        link.href = url;
        link.download = slug + '.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    renderEventCards();

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
