// Realistic 3D background (Three.js r128): PS-style controller + burger.
// Parts split apart while you scroll, and re-assemble when you stop.
(() => {
    const T = THREE, cv = document.getElementById('bgCanvas');
    const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.15;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(38, 1, .1, 60);

    // --- studio environment for realistic reflections ---
    const pm = new T.PMREMGenerator(R), envS = new T.Scene();
    envS.add(new T.Mesh(new T.SphereGeometry(20, 32, 16), new T.MeshBasicMaterial({ color: 0x2b1d15, side: T.BackSide })));
    [[0, 9, 0, 14, 14, new T.Color(9, 8, 7), 'x'], [-9, 2, 4, 6, 10, new T.Color(8, 5, 2.5), 'y'], [9, 1, 3, 6, 10, new T.Color(2.5, 4, 8), 'y']].forEach(([x, y, z, w, hh, col, ax]) => {
        const m = new T.Mesh(new T.PlaneGeometry(w, hh), new T.MeshBasicMaterial({ color: col, side: T.DoubleSide }));
        m.position.set(x, y, z); m.lookAt(0, 0, 0); envS.add(m);
    });
    scene.environment = pm.fromScene(envS, .03).texture;
    scene.add(new T.HemisphereLight(0xffe2c0, 0x2a1a12, .5));
    const key = new T.DirectionalLight(0xffd7a0, 2.2); key.position.set(-4, 5, 6); scene.add(key);
    const rim = new T.DirectionalLight(0x8ab4ff, 1.4); rim.position.set(5, 2, -4); scene.add(rim);

    // --- helpers ---
    const noiseTex = (s = 128, k = 1) => {
        const c = document.createElement('canvas'); c.width = c.height = s; const x = c.getContext('2d'), d = x.createImageData(s, s);
        for (let i = 0; i < s * s; i++) { const v = 128 + (Math.random() - .5) * 255 * k; d.data.set([v, v, v, 255], i * 4); }
        x.putImageData(d, 0, 0); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 3); return t;
    };
    const bump = noiseTex();
    const mat = (o) => new T.MeshPhysicalMaterial(o);
    const rrect = (w, h, r) => { const s = new T.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
    const ext = (shape, d, b = 0.02) => new T.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 4, curveSegments: 24 });
    const symTex = (g, col) => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.strokeStyle = col; x.lineWidth = 7; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath();
        if (g === 0) { x.moveTo(32, 12); x.lineTo(52, 48); x.lineTo(12, 48); x.closePath(); } else if (g === 1) x.arc(32, 32, 19, 0, 7); else if (g === 2) { x.moveTo(14, 14); x.lineTo(50, 50); x.moveTo(50, 14); x.lineTo(14, 50); } else x.rect(14, 14, 36, 36);
        x.stroke(); return new T.CanvasTexture(c); };

    // each part: mesh/group, rest position, explode vector, spin
    const makeModel = () => ({ g: new T.Group(), parts: [] });
    const add = (m, mesh, pos, dir, spin = 0) => { mesh.position.copy(pos); m.g.add(mesh); m.parts.push({ mesh, base: pos.clone(), dir: new T.Vector3(...dir), spin, rb: mesh.rotation.clone() }); };
    const V = (x, y, z) => new T.Vector3(x, y, z);

    // ================= CONTROLLER =================
    const pad = makeModel();
    (() => {
        const white = mat({ color: 0xeeeae4, roughness: .32, clearcoat: .6, clearcoatRoughness: .25 });
        const black = mat({ color: 0x0c0c0e, roughness: .18, clearcoat: 1, clearcoatRoughness: .1 });
        const rubber = mat({ color: 0x141416, roughness: .75, bumpMap: bump, bumpScale: .6 });
        const s = new T.Shape();
        s.moveTo(-.9, .7); s.bezierCurveTo(-.5, .85, .5, .85, .9, .7); s.bezierCurveTo(1.5, .65, 1.85, .2, 1.9, -.4);
        s.bezierCurveTo(1.95, -1.1, 1.6, -1.4, 1.25, -1.35); s.bezierCurveTo(.9, -1.3, .8, -.8, .55, -.55);
        s.bezierCurveTo(.3, -.4, -.3, -.4, -.55, -.55); s.bezierCurveTo(-.8, -.8, -.9, -1.3, -1.25, -1.35);
        s.bezierCurveTo(-1.6, -1.4, -1.95, -1.1, -1.9, -.4); s.bezierCurveTo(-1.85, .2, -1.5, .65, -.9, .7);
        const body = new T.Mesh(ext(s, .3, .12), white); add(pad, body, V(0, 0, 0), [0, 0, -.7]);
        add(pad, new T.Mesh(ext(rrect(1.55, .95, .3), .02, .02), black), V(0, .12, .43), [0, .1, .5]);
        add(pad, new T.Mesh(ext(rrect(1.1, .5, .1), .02, .015), mat({ color: 0x1a1a1f, roughness: .1, clearcoat: 1 })), V(0, .3, .47), [0, .7, 1]);
        const lb = new T.Group(), lbm = new T.MeshStandardMaterial({ color: 0x1b6cff, emissive: 0x2a7bff, emissiveIntensity: 2.2 });
        [-.62, .62].forEach(x => { const m = new T.Mesh(ext(rrect(.05, .44, .02), .01, .005), lbm); m.position.x = x; lb.add(m); });
        add(pad, lb, V(0, .3, .5), [0, 1.1, 1.5]);
        [[-.55, -.5, -.9], [.55, -.5, .9]].forEach(([x, y, dx]) => {
            const g = new T.Group(), base = new T.Mesh(new T.CylinderGeometry(.27, .27, .1, 40), black), cap = new T.Mesh(new T.CylinderGeometry(.2, .22, .14, 40), rubber);
            base.rotation.x = cap.rotation.x = Math.PI / 2; cap.position.z = .09; g.add(base, cap);
            const ring = new T.Mesh(new T.TorusGeometry(.17, .018, 10, 40), rubber); ring.position.z = .165; g.add(ring);
            add(pad, g, V(x, y, .5), [dx * .55, -.6, 1.5], dx * .8);
        });
        const cross = new T.Shape(), a = .1, b = .34;
        cross.moveTo(-a, b); cross.lineTo(a, b); cross.lineTo(a, a); cross.lineTo(b, a); cross.lineTo(b, -a); cross.lineTo(a, -a); cross.lineTo(a, -b); cross.lineTo(-a, -b); cross.lineTo(-a, -a); cross.lineTo(-b, -a); cross.lineTo(-b, a); cross.lineTo(-a, a); cross.closePath();
        add(pad, new T.Mesh(ext(cross, .05, .03), mat({ color: 0xf2eee8, roughness: .3, clearcoat: .5 })), V(-1.15, .2, .45), [-1.2, .5, 1.1], -.6);
        [[0, .25, 0xdd5a68, 0], [.25, 0, 0xe34d4d, 1], [0, -.25, 0x4f86e6, 2], [-.25, 0, 0xe58fd0, 3]].forEach(([dx, dy, col, i]) => {
            const g = new T.Group(), b = new T.Mesh(new T.CylinderGeometry(.14, .14, .07, 32), mat({ color: 0x1a1a1f, roughness: .2, clearcoat: 1 }));
            b.rotation.x = Math.PI / 2; g.add(b);
            const sy = new T.Mesh(new T.PlaneGeometry(.17, .17), new T.MeshBasicMaterial({ map: symTex(i, ['#7be09a', '#ff6b6b', '#6ea8ff', '#ff9ff3'][i]), transparent: true })); sy.position.z = .042; g.add(sy);
            add(pad, g, V(1.15 + dx, .2 + dy, .46), [dx * 3 + .6, dy * 3 + .6, 1.1 + i * .15], .5 * (i - 1.5));
        });
        [-1, 1].forEach(sd => add(pad, new T.Mesh(ext(rrect(.95, .16, .07), .12, .03), white), V(sd * 1.3, .78, .1), [sd * .7, 1.1, .1], sd * .3));
    })();

    // ================= BURGER =================
    const burger = makeModel();
    (() => {
        const bunM = mat({ color: 0xd0883a, roughness: .55, bumpMap: bump, bumpScale: .5, clearcoat: .25, clearcoatRoughness: .5 });
        const domeG = new T.SphereGeometry(1.15, 56, 28, 0, Math.PI * 2, 0, Math.PI / 2); domeG.scale(1, .72, 1);
        const top = new T.Group(); top.add(new T.Mesh(domeG, bunM));
        const seedG = new T.SphereGeometry(.045, 10, 8), seedM = mat({ color: 0xf3e3b8, roughness: .45 }), inst = new T.InstancedMesh(seedG, seedM, 90), d = new T.Object3D();
        for (let i = 0; i < 90; i++) { const th = Math.acos(1 - Math.random() * .9), ph = Math.random() * 6.283, p = V(1.15 * Math.sin(th) * Math.cos(ph), 1.15 * .72 * Math.cos(th), 1.15 * Math.sin(th) * Math.sin(ph));
            d.position.copy(p); d.lookAt(p.clone().multiplyScalar(2)); d.rotateZ(Math.random() * 3); d.scale.set(1.5, .8, 1); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); }
        top.add(inst);
        const lg = new T.CylinderGeometry(1.28, 1.28, .07, 96, 1, true), lp = lg.attributes.position;
        for (let i = 0; i < lp.count; i++) { const a = Math.atan2(lp.getZ(i), lp.getX(i)), w = 1 + .07 * Math.sin(a * 11), y = lp.getY(i) + .05 * Math.sin(a * 7 + 1) * (lp.getY(i) > 0 ? 1 : .6); lp.setXYZ(i, lp.getX(i) * w, y, lp.getZ(i) * w); }
        lg.computeVertexNormals();
        const lettuce = new T.Mesh(lg, mat({ color: 0x6fb53a, roughness: .45, side: T.DoubleSide, bumpMap: bump, bumpScale: .3 }));
        const tomato = new T.Group(); [0, .13].forEach(y => { const m = new T.Mesh(new T.CylinderGeometry(.98, .98, .09, 64), mat({ color: 0xd3382c, roughness: .22, clearcoat: .8 })); m.position.y = y; tomato.add(m); });
        const cheese = new T.Mesh(new T.BoxGeometry(2.0, .045, 2.0), mat({ color: 0xf5b72a, roughness: .35, clearcoat: .6 })); cheese.rotation.y = Math.PI / 4;
        const pg = new T.CylinderGeometry(1.08, 1.08, .3, 64, 6), pp = pg.attributes.position;
        for (let i = 0; i < pp.count; i++) { const n = (Math.sin(i * 12.9898) * 43758.5453) % 1; pp.setY(i, pp.getY(i) + n * .025); }
        pg.computeVertexNormals();
        const patty = new T.Mesh(pg, mat({ color: 0x4a2a1a, roughness: .8, bumpMap: bump, bumpScale: 1.4 }));
        const botG = new T.SphereGeometry(1.12, 48, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); botG.scale(1, .32, 1);
        const bottom = new T.Mesh(botG, bunM);
        add(burger, bottom, V(0, -.62, 0), [0, -1.3, 0]); add(burger, patty, V(0, -.4, 0), [0, -.65, 0], .2);
        add(burger, cheese, V(0, -.2, 0), [.7, .05, .4], .3); add(burger, tomato, V(0, -.08, 0), [0, .6, 0], -.25);
        add(burger, lettuce, V(0, .1, 0), [0, 1.2, 0], .35); add(burger, top, V(0, .22, 0), [0, 2.1, 0], -.2);
    })();
    scene.add(pad.g, burger.g);

    // --- bokeh dust ---
    const N = 90, pp = new Float32Array(N * 3); for (let i = 0; i < N; i++) pp.set([(Math.random() - .5) * 16, (Math.random() - .5) * 9, -2 - Math.random() * 5], i * 3);
    const dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(pp, 3));
    const sc = document.createElement('canvas'); sc.width = sc.height = 32; const sx = sc.getContext('2d'), gr = sx.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,200,130,.9)'); gr.addColorStop(1, 'rgba(255,200,130,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 32, 32);
    const dust = new T.Points(dg, new T.PointsMaterial({ size: .22, map: new T.CanvasTexture(sc), transparent: true, depthWrite: false, opacity: .55 })); scene.add(dust);

    // --- layout, scroll energy, pointer ---
    let aspect = 1, energy = 0, spin = 0, intro = null, t0 = performance.now(), last = t0;
    const mouse = { x: 0, y: 0 }, ease = x => 1 - Math.pow(1 - x, 3), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    function resize() {
        const w = innerWidth, h = innerHeight; aspect = w / h; R.setSize(w, h, false); cam.aspect = aspect; cam.updateProjectionMatrix();
    }
    addEventListener('resize', resize);
    let lastY = scrollY, lastTouch = null;
    const kick = d => { energy = clamp(energy + Math.abs(d) * .0018, 0, 1.2); spin += d * .0022; };
    addEventListener('scroll', () => { kick(scrollY - lastY); lastY = scrollY; }, { passive: true });
    addEventListener('wheel', e => { if (document.documentElement.scrollHeight <= innerHeight + 2) kick(e.deltaY); }, { passive: true });
    addEventListener('touchstart', e => { lastTouch = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchmove', e => { const y = e.touches[0].clientY; if (lastTouch != null && document.documentElement.scrollHeight <= innerHeight + 2) kick((lastTouch - y) * 1.6); lastTouch = y; }, { passive: true });
    addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; }, { passive: true });
    addEventListener('pointerdown', () => { energy = clamp(energy + .55, 0, 1.2); spin += .6; }, { passive: true });

    window.BG3D = { startIntro(ms) { intro = { start: performance.now(), dur: ms }; } };

    function apply(m, e, extraSpin) {
        const k = e * e * (3 - 2 * Math.min(e, 1)) * (e > 1 ? e : 1);
        m.parts.forEach(p => { p.mesh.position.copy(p.base).addScaledVector(p.dir, k * 1.15); p.mesh.rotation.set(p.rb.x, p.rb.y + p.spin * k * 2 + extraSpin * 0, p.rb.z); });
    }
    function frame(now) {
        const dt = Math.min(.05, (now - last) / 1000); last = now; const t = (now - t0) / 1000;
        let e, camZ = 8.4, introSpin = 0;
        if (intro) {
            const p = clamp((now - intro.start) / intro.dur, 0, 1);
            e = 1 - ease(clamp(p / .72, 0, 1)); camZ = 8.4 + (1 - ease(p)) * 5; introSpin = (1 - ease(clamp(p / .8, 0, 1))) * Math.PI * 2;
            if (p >= 1) intro = null;
        } else { energy = Math.max(0, energy - dt * .32); e = energy; }
        const wide = aspect > .85, sc = wide ? 1 : .72;
        pad.g.position.set(wide ? 3.4 : .9, wide ? .3 : 2.4, 0); burger.g.position.set(wide ? -3.3 : -.8, wide ? -.15 : -2.4, 0);
        pad.g.scale.setScalar(.78 * sc); burger.g.scale.setScalar(.95 * sc);
        pad.g.rotation.set(-.55 + Math.sin(t * .5) * .06 + mouse.y * .3, -.45 + spin * .6 + introSpin + mouse.x * .5 + t * .12, .12);
        burger.g.rotation.set(.45 + Math.sin(t * .4) * .05 + mouse.y * .25, spin * -.5 - introSpin + t * .18 + mouse.x * .4, 0);
        pad.g.position.y += Math.sin(t * .9) * .08; burger.g.position.y += Math.cos(t * .8) * .08;
        apply(pad, e); apply(burger, e);
        dust.rotation.y = t * .02 + spin * .05; dust.position.y = Math.sin(t * .2) * .2;
        cam.position.set(mouse.x * .5, -mouse.y * .35, camZ); cam.lookAt(0, 0, 0);
        R.render(scene, cam); requestAnimationFrame(frame);
    }
    resize(); BG3D.startIntro(6800); requestAnimationFrame(frame);
})();
