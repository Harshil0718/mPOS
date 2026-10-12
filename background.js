// Live gaming-cafe background: runs all the time, reacts to touch / mouse.
(() => {
    const cv = document.getElementById('bgCanvas'), c = cv.getContext('2d');
    let W, H, floorY, t = 0, last = performance.now();
    const CR = '#f3e6d3', DK = '#3a2a22';
    const PSC = ['#5fd38d', '#ff6b6b', '#6ea8ff', '#ff9ff3'];   // triangle, circle, cross, square
    const GL = ['▲', '●', '✕', '■'];
    const rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const rr = (x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
    const dot = (x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
    const ell = (x, y, a, b, rot) => { c.beginPath(); c.ellipse(x, y, a, b, rot, 0, 7); c.fill(); };
    const ptr = { x: -999, y: -999 };
    const props = [], parts = [], ripples = [], bullets = [];

    function resize() {
        const d = Math.min(devicePixelRatio || 1, 2);
        W = innerWidth; H = innerHeight; floorY = H - 16;
        cv.width = W * d; cv.height = H * d;
        c.setTransform(d, 0, 0, d, 0, 0);
    }

    // ---------- floating props ----------
    const DRAW = {
        pad() {
            c.fillStyle = CR; rr(-34, -17, 68, 32, 13); c.fill(); ell(-25, 9, 12, 17, .4); ell(25, 9, 12, 17, -.4);
            c.fillStyle = DK; c.fillRect(-26, -6, 12, 4); c.fillRect(-22, -10, 4, 12);
            [[26, -10, 0], [33, -5, 1], [26, 0, 2], [19, -5, 3]].forEach(([x, y, i]) => { c.fillStyle = PSC[i]; dot(x, y, 3.2); });
            c.fillStyle = DK; dot(-10, 6, 5); dot(10, 6, 5);
        },
        pizza() {
            c.fillStyle = '#e8a54b'; c.beginPath(); c.moveTo(-18, -22); c.lineTo(18, -22); c.lineTo(0, 26); c.fill();
            c.fillStyle = '#c0392b'; dot(-8, -12, 4); dot(6, -10, 4); dot(-1, 3, 4);
            c.fillStyle = '#b9772f'; c.fillRect(-19, -26, 38, 6);
        },
        cup() {
            c.fillStyle = CR; c.fillRect(-14, -10, 28, 26);
            c.strokeStyle = CR; c.lineWidth = 5; c.beginPath(); c.arc(16, 3, 8, -1.5, 1.5); c.stroke();
            c.lineWidth = 2.5;
            for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 8, -14); c.bezierCurveTo(i * 8 + 6, -22 + Math.sin(t * 2 + i) * 3, i * 8 - 6, -28, i * 8, -36); c.stroke(); }
        },
        burger() {
            c.fillStyle = '#e8a54b'; c.beginPath(); c.arc(0, -6, 20, Math.PI, 0); c.fill();
            c.fillStyle = '#7bb661'; c.fillRect(-21, -6, 42, 5); c.fillStyle = '#6b3f2a'; c.fillRect(-20, -1, 40, 8);
            c.fillStyle = '#e8a54b'; rr(-20, 8, 40, 8, 4); c.fill();
        },
        dice() {
            c.fillStyle = CR; rr(-18, -18, 36, 36, 8); c.fill(); c.fillStyle = DK;
            [[-8, -8], [8, -8], [0, 0], [-8, 8], [8, 8]].forEach(([x, y]) => dot(x, y, 3.2));
        },
        glyph(p) { c.font = 'bold 30px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = PSC[p.g]; c.fillText(GL[p.g], 0, 0); }
    };
    const KINDS = ['pad', 'pad', 'pizza', 'cup', 'burger', 'dice', 'glyph', 'glyph', 'glyph'];
    function spawnProp(init) {
        const k = KINDS[(Math.random() * KINDS.length) | 0];
        props.push({ k, g: (Math.random() * 4) | 0, x: rnd(0, W), y: init ? rnd(0, H) : H + 60, s: rnd(.8, 1.5), r: rnd(0, 6.3), vr: rnd(-.4, .4), vx: 0, vy: -rnd(8, 22) });
    }

    // ---------- effects ----------
    function burst(x, y, n, glyphs) {
        for (let i = 0; i < n; i++) {
            const a = rnd(0, 6.28), s = rnd(60, 240);
            parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 90, life: rnd(.6, 1.2), col: PSC[i % 4], g: glyphs && i % 3 === 0 ? GL[i % 4] : null });
        }
    }

    // ---------- gamer characters (original designs) ----------
    const mk = (col, vis, fx) => ({ col, vis, x: W * fx, dir: 1, z: 0, vz: 0, state: 'run', sh: 0, fl: 0, en: null, er: 0 });
    let heroes = [];
    function updHero(h, dt) {
        if (!h.en || h.en.hp <= 0) {
            h.er -= dt;
            if (h.er <= 0) h.en = { x: clamp(h.x + (Math.random() < .5 ? -1 : 1) * rnd(220, 480), 40, W - 40), hp: 3, fl: 0 };
        }
        const e = h.en;
        if (e && e.hp > 0) {
            const d = e.x - h.x; h.dir = d >= 0 ? 1 : -1;
            if (Math.abs(d) > 190) { h.state = 'run'; h.x += h.dir * 95 * dt; }
            else {
                h.state = 'shoot'; h.sh -= dt;
                if (h.sh <= 0) { h.sh = .28; h.fl = .06; bullets.push({ x: h.x + h.dir * 28, y: floorY - h.z - 36, vx: h.dir * 700, vy: 0, life: 1 }); }
            }
        } else {
            h.state = 'run'; h.x += h.dir * 70 * dt;
            if (h.x < 40) h.dir = 1; if (h.x > W - 40) h.dir = -1;
        }
        if (h.z > 0 || h.vz) { h.vz -= 1500 * dt; h.z += h.vz * dt; if (h.z <= 0) { h.z = 0; h.vz = 0; } }
        else if (Math.random() < dt * .15) h.vz = 330;
        h.fl -= dt; if (e) e.fl -= dt;
        h.x = clamp(h.x, 20, W - 20);
    }
    function drawHero(h) {
        const sw = h.state === 'run' ? Math.sin(t * 13 + h.x * .02) * 6 : 0;
        c.save(); c.translate(h.x, floorY - h.z); c.scale(h.dir * 1.5, 1.5);
        c.fillStyle = '#4a3a31'; c.fillRect(-6 + sw * .4, -12, 5, 12); c.fillRect(1 - sw * .4, -12, 5, 12);
        c.fillStyle = h.col; c.fillRect(-8, -28, 16, 18);
        c.fillStyle = '#f1c9a0'; dot(0, -35, 7);
        c.fillStyle = h.col; c.fillRect(-7, -43, 14, 4);
        c.fillStyle = h.vis; c.fillRect(1, -37, 8, 3);
        c.fillStyle = '#d9cbb8'; c.fillRect(6, -24, 14, 4);
        if (h.fl > 0) { c.fillStyle = '#fff3a0'; dot(24, -22, 6); }
        c.restore();
    }
    function drawEnemy(e) {
        if (e.hp <= 0) return;
        c.save(); c.translate(e.x, floorY + Math.sin(t * 4 + e.x) * 2);
        c.fillStyle = e.fl > 0 ? '#fff' : '#8d6e63'; rr(-12, -36, 24, 22, 5); c.fill(); c.fillRect(-9, -14, 18, 12);
        c.fillStyle = '#ff5a5a'; dot(0, -26, 4);
        c.strokeStyle = '#8d6e63'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -36); c.lineTo(0, -44); c.stroke(); dot(0, -45, 2.5);
        c.restore();
    }

    // ---------- chef tossing pizza ----------
    function drawChef() {
        const x = W - 110, ph = (t % 2.6) / 2.6;
        c.fillStyle = 'rgba(120,80,50,.55)'; c.fillRect(x - 60, floorY - 34, 120, 34);
        c.save(); c.translate(x - 20, floorY - 34);
        c.fillStyle = '#f7f0e6'; c.fillRect(-9, -38, 18, 26);
        c.fillStyle = '#f1c9a0'; dot(0, -46, 7);
        c.fillStyle = '#fff'; c.fillRect(-8, -64, 16, 10); dot(0, -64, 9);
        const lift = ph < .12 ? -14 : 0;
        c.strokeStyle = '#f7f0e6'; c.lineWidth = 5; c.beginPath(); c.moveTo(9, -32); c.lineTo(28, -28 + lift); c.stroke();
        c.fillStyle = '#2b1e19'; ell(30, -26 + lift, 13, 4, 0);
        const py = ph < .7 ? -32 - Math.sin(ph / .7 * Math.PI) * 120 : -32;
        c.save(); c.translate(30, py); c.scale(1, .35 + .25 * Math.abs(Math.cos(ph * 22)));
        c.fillStyle = '#e8a54b'; dot(0, 0, 14); c.fillStyle = '#c0392b'; dot(-5, -3, 3); dot(5, 2, 3); dot(0, 6, 3);
        c.restore();
        c.restore();
        if (t % 7.8 < 1.6) {
            c.font = '600 11px sans-serif'; c.textAlign = 'center';
            c.fillStyle = 'rgba(243,230,211,.92)'; rr(x - 72, floorY - 128, 66, 20, 8); c.fill();
            c.fillStyle = '#2a201b'; c.fillText('Order up!', x - 39, floorY - 114);
        }
    }

    // ---------- loop ----------
    function frame(now) {
        const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
        c.clearRect(0, 0, W, H);

        for (let i = 0; i < 3; i++) {   // warm lamp-light blobs
            const x = W * (.2 + .6 * (.5 + .5 * Math.sin(t * .08 + i * 2.1))), y = H * (.25 + .5 * (.5 + .5 * Math.cos(t * .06 + i * 1.7)));
            const g = c.createRadialGradient(x, y, 0, x, y, 320);
            g.addColorStop(0, 'rgba(255,170,80,.13)'); g.addColorStop(1, 'rgba(255,170,80,0)');
            c.fillStyle = g; c.fillRect(0, 0, W, H);
        }

        if (props.length < Math.min(26, 8 + W / 70) && Math.random() < dt * 1.2) spawnProp(false);
        for (let i = props.length - 1; i >= 0; i--) {
            const p = props[i], dx = p.x - ptr.x, dy = p.y - ptr.y, d = Math.hypot(dx, dy);
            if (d < 150) { p.vx += dx / d * 260 * dt * (1 - d / 150) * 6; p.vy += dy / d * 260 * dt * (1 - d / 150) * 6; p.vr += (dx > 0 ? 1 : -1) * dt * 2; }
            p.vx *= .985; p.vy += (-14 - p.vy) * dt * .4;
            p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
            if (p.y < -70 || p.x < -80 || p.x > W + 80) { props.splice(i, 1); continue; }
            c.save(); c.globalAlpha = .2; c.translate(p.x, p.y); c.rotate(p.r * .35); c.scale(p.s, p.s);
            DRAW[p.k](p); c.restore();
        }

        c.fillStyle = 'rgba(255,200,120,.07)'; c.fillRect(0, floorY, W, H - floorY);
        c.fillStyle = 'rgba(255,200,120,.25)'; c.fillRect(0, floorY, W, 1.5);

        heroes.forEach(h => { updHero(h, dt); if (h.en) drawEnemy(h.en); drawHero(h); });
        drawChef();

        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
            let hit = false;
            heroes.forEach(h => {
                const e = h.en;
                if (!hit && e && e.hp > 0 && Math.abs(b.x - e.x) < 16 && Math.abs(b.y - (floorY - 24)) < 30) {
                    hit = true; e.hp--; e.fl = .1; burst(e.x, floorY - 24, e.hp <= 0 ? 22 : 6, e.hp <= 0);
                    if (e.hp <= 0) h.er = 1.4;
                }
            });
            if (hit || b.life <= 0) { bullets.splice(i, 1); continue; }
            c.strokeStyle = 'rgba(255,243,160,.95)'; c.lineWidth = 3; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x - b.vx * .03, b.y - b.vy * .03); c.stroke();
        }

        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i]; p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
            if (p.life <= 0) { parts.splice(i, 1); continue; }
            c.globalAlpha = Math.min(1, p.life); c.fillStyle = p.col;
            if (p.g) { c.font = 'bold 16px sans-serif'; c.textAlign = 'center'; c.fillText(p.g, p.x, p.y); } else dot(p.x, p.y, 2.5);
        }
        for (let i = ripples.length - 1; i >= 0; i--) {
            const r = ripples[i]; r.r += 260 * dt; r.life -= dt * 1.8;
            if (r.life <= 0) { ripples.splice(i, 1); continue; }
            c.globalAlpha = r.life; c.strokeStyle = '#e8a54b'; c.lineWidth = 2.5; c.beginPath(); c.arc(r.x, r.y, r.r, 0, 7); c.stroke();
        }
        c.globalAlpha = 1;
        requestAnimationFrame(frame);
    }

    // ---------- touch / mouse response ----------
    addEventListener('pointermove', e => {
        ptr.x = e.clientX; ptr.y = e.clientY;
        if (Math.random() < .5) parts.push({ x: e.clientX, y: e.clientY, vx: rnd(-30, 30), vy: rnd(-60, -10), life: .5, col: '#f7c873', g: null });
    }, { passive: true });
    addEventListener('pointerdown', e => {
        ptr.x = e.clientX; ptr.y = e.clientY;
        ripples.push({ x: e.clientX, y: e.clientY, r: 4, life: 1 });
        burst(e.clientX, e.clientY, 14, true);
        heroes.forEach(h => {      // heroes jump and fire at the tap
            const sy = floorY - h.z - 36, a = Math.atan2(e.clientY - sy, e.clientX - h.x);
            h.dir = e.clientX >= h.x ? 1 : -1; if (!h.z) h.vz = 340; h.fl = .06;
            bullets.push({ x: h.x, y: sy, vx: Math.cos(a) * 760, vy: Math.sin(a) * 760, life: 1.3 });
        });
    }, { passive: true });
    addEventListener('pointerup', () => { ptr.x = ptr.y = -999; }, { passive: true });
    addEventListener('resize', resize);

    resize();
    heroes = [mk('#3fb8af', '#7cffe8', .2), mk('#ff6b81', '#ffd6dc', .5), mk('#f7b84b', '#fff3c4', .8)];
    for (let i = 0; i < 14; i++) spawnProp(true);
    requestAnimationFrame(frame);
})();
