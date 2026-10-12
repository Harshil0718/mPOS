// Top-down cafe floor plan, rendered with React (no build step: plain createElement).
(() => {
    const h = React.createElement, S = () => window.restaurantState;

    function Tile({ t, kind }) {
        const st = STATUS[t.status] || STATUS.available;
        const timer = t.sessionStart && t.status !== 'available' ? formatDuration(t.sessionStart) : '--:--';
        const chairs = { round: ['t', 'r', 'b', 'l'], desk: ['b'], tv: ['b'], stool: ['l'] }[kind];
        return h('div', { className: `tile ${kind} ${t.status}`, onClick: () => window.openTable(t.id) },
            kind === 'desk' && h('span', { className: 'monitor' }),
            kind === 'tv' && h('span', { className: 'tv' }),
            chairs.map(c => h('span', { key: c, className: `ch ${c}` })),
            h('div', { className: 'tile-body' },
                h('div', { className: 'tile-top' }, h('b', null, t.short), h('i', { className: `dot ${st.dot}`, title: st.label })),
                h('div', { className: `tile-state ${st.text}` }, st.label),
                h('div', { className: 'tile-timer' }, timer),
                h('div', { className: 'tile-amt' }, t.order.length ? `₹${t.total.toFixed(0)}` : '')),
            h('button', { className: 'tile-book', title: 'Toggle booking', onClick: e => { e.stopPropagation(); window.toggleTableReservation(t.id); } },
                h('i', { className: 'fa-solid fa-bookmark' })));
    }

    function Room({ zone, cls, children }) {
        const busy = S().tables.filter(t => t.zone === zone.id && t.status !== 'available').length;
        return h('section', { className: `room ${cls}` },
            h('header', { className: 'room-head' }, h('i', { className: `fa-solid ${zone.icon}` }), h('span', null, zone.name),
                h('em', null, busy ? `${busy} in use` : 'all free')),
            children);
    }

    function Floor() {
        const [, tick] = React.useState(0);
        React.useEffect(() => {
            const f = () => tick(n => n + 1);
            window.addEventListener('floor:update', f);
            const id = setInterval(f, 1000);
            return () => { window.removeEventListener('floor:update', f); clearInterval(id); };
        }, []);
        const z = id => ZONES.find(x => x.id === id), tabs = (zone, grp) => S().tables.filter(t => t.zone === zone && (grp === undefined || t.group === grp));
        const tiles = (list, kind) => list.map(t => h(Tile, { key: t.id, t, kind }));
        if (!S().tables.length) return null;
        return h('div', { className: 'plan' },
            h(Room, { zone: z('balcony'), cls: 'room-balcony' }, h('div', { className: 'floor row4' }, tiles(tabs('balcony'), 'round'))),
            h(Room, { zone: z('dine'), cls: 'room-dine' }, h('div', { className: 'floor g5' }, tiles(tabs('dine'), 'round'))),
            h(Room, { zone: z('bar'), cls: 'room-bar' }, h('div', { className: 'floor col1' }, h('div', { className: 'counter' }, 'Counter'), tiles(tabs('bar'), 'stool'))),
            h(Room, { zone: z('pc'), cls: 'room-pc' },
                z('pc').groups.map(g => h('div', { key: g.label, className: 'pc-row' }, h('span', { className: 'row-label' }, g.label),
                    h('div', { className: 'floor g7' }, tiles(tabs('pc', g.label), 'desk'))))),
            h(Room, { zone: z('ps'), cls: 'room-ps' }, h('div', { className: 'floor row2' }, tiles(tabs('ps'), 'tv'))),
            h('div', { className: 'entrance' }, h('i', { className: 'fa-solid fa-door-open' }), ' Entrance'));
    }

    ReactDOM.createRoot(document.getElementById('floor-root')).render(h(Floor));
})();
