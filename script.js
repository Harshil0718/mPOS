// --- GLOBAL APPLICATION STATE ---
window.restaurantState = {
    tables: [],
    salesData: [],
    currentView: 'tableView',
    selectedTableId: null,
    gstRate: 0.05,
    totalTables: 30,
    isAuthenticated: false,
    runtimeInterval: null
};

let isSettlingBill = false;

// --- MENU DATA ---
window.menuData = {
    soups: { 
        name: "Soups", 
        items: [ 
            { id: "sp_1", name: "Cantonese soup", price: 199 },
            { id: "sp_2", name: "Lemon coriander", price: 199 },
            { id: "sp_3", name: "Cream tomato soup", price: 199 },
            { id: "sp_4", name: "Sweet corn soup (Veg)", price: 199 },
            { id: "sp_5", name: "Sweet corn soup (Non-Veg)", price: 219 },
            { id: "sp_6", name: "Manchow soup (Veg)", price: 199 },
            { id: "sp_7", name: "Manchow soup (Non-Veg)", price: 219 },
            { id: "sp_8", name: "Hot and sour soup (Veg)", price: 199 },
            { id: "sp_9", name: "Hot and sour soup (Non-Veg)", price: 219 },
            { id: "sp_10", name: "Wild mushroom cappuccino", price: 219 },
            { id: "sp_11", name: "Cream of broccoli", price: 219 },
            { id: "sp_12", name: "Roasted chicken and garlic soup", price: 229 },
            { id: "sp_13", name: "Chicken Egg Drop Soup", price: 229 }
        ] 
    },
    appetizers: { 
        name: "Appetizers", 
        items: [ 
            { id: "ap_1", name: "Jalapeno cheese poppers", price: 289 },
            { id: "ap_2", name: "Crispy corn", price: 269 },
            { id: "ap_3", name: "Veg Manchurian", price: 269 },
            { id: "ap_4", name: "Crispy baby corn", price: 269 },
            { id: "ap_5", name: "Crispy butter garlic mushroom", price: 289 },
            { id: "ap_6", name: "Honey chilli potatoes", price: 259 },
            { id: "ap_7", name: "Crispy fried veg", price: 259 },
            { id: "ap_8", name: "Spring rolls", price: 269 },
            { id: "ap_9", name: "Mini wonton roll", price: 279 },
            { id: "ap_10", name: "Paneer 65", price: 289 },
            { id: "ap_11", name: "Paneer majestic", price: 289 },
            { id: "ap_12", name: "Chilli paneer", price: 289 },
            { id: "ap_13", name: "Paneer tikka", price: 309 },
            { id: "ap_14", name: "Spl veg assorted platter", price: 849 },
            { id: "ap_15", name: "BGC zesty chicken", price: 309 },
            { id: "ap_16", name: "Chicken satay", price: 309 },
            { id: "ap_17", name: "Peri peri chicken nuggets", price: 309 },
            { id: "ap_18", name: "Kung pao chicken", price: 309 },
            { id: "ap_19", name: "Chilli chicken", price: 309 },
            { id: "ap_20", name: "Chicken majestic", price: 309 },
            { id: "ap_21", name: "Chicken Popcorn", price: 309 },
            { id: "ap_22", name: "Pepper chicken", price: 309 },
            { id: "ap_23", name: "Chicken 65", price: 309 },
            { id: "ap_24", name: "Chicken 555", price: 309 },
            { id: "ap_25", name: "Angry wild wings", price: 319 },
            { id: "ap_26", name: "Drums of heaven", price: 319 },
            { id: "ap_27", name: "Chicken assorted platter", price: 1099 },
            { id: "ap_28", name: "Chilli fish", price: 369 },
            { id: "ap_29", name: "Fish N chips", price: 369 },
            { id: "ap_30", name: "Sch fish", price: 369 },
            { id: "ap_31", name: "Crispy fish fry", price: 369 },
            { id: "ap_32", name: "Apollo Fish", price: 369 },
            { id: "ap_33", name: "Chilli prawns", price: 379 },
            { id: "ap_34", name: "Crispy fried prawns", price: 379 },
            { id: "ap_35", name: "Loose prawns", price: 379 },
            { id: "ap_36", name: "Scz prawns", price: 379 },
            { id: "ap_37", name: "BGC prawns", price: 379 }
        ] 
    },
    pizza: { 
        name: "Pizza", 
        items: [
            { id: "pz_1", name: "Indian veggie", price: 299 },
            { id: "pz_2", name: "Margrita", price: 309 },
            { id: "pz_3", name: "American corn cheese", price: 329 },
            { id: "pz_4", name: "Exotic BBQ Mexican", price: 309 },
            { id: "pz_5", name: "Veg supreme", price: 349 },
            { id: "pz_6", name: "Panner tikka Pizza", price: 349 },
            { id: "pz_7", name: "Scz paneer Pizza", price: 349 },
            { id: "pz_8", name: "BBQ chicken Pizza", price: 359 },
            { id: "pz_9", name: "Chicken tikka Pizza", price: 359 },
            { id: "pz_10", name: "Chicken delight pizza", price: 359 },
            { id: "pz_11", name: "SCZ chicken Pizza", price: 359 },
            { id: "pz_12", name: "American paperoni", price: 379 }
        ] 
    },
    'quick-bites': { 
        name: "Quick Bites", 
        items: [
            { id: "qb_1", name: "Crispy Noodle Bhel", price: 219 },
            { id: "qb_2", name: "French Fries", price: 219 },
            { id: "qb_3", name: "Peri Peri Fries", price: 219 },
            { id: "qb_4", name: "Cheese fries", price: 229 },
            { id: "qb_5", name: "Cheese Peri Peri Fries", price: 239 },
            { id: "qb_6", name: "Cheese Chilli toast", price: 229 },
            { id: "qb_7", name: "Cheese garlic bread", price: 229 },
            { id: "qb_8", name: "Scz cheese garlic bread", price: 239 },
            { id: "qb_9", name: "Veg nachos", price: 229 },
            { id: "qb_10", name: "Cheese nachos", price: 249 },
            { id: "qb_11", name: "Plain veg Maggie", price: 159 },
            { id: "qb_12", name: "Veg Cheese Maggie", price: 169 },
            { id: "qb_13", name: "Scz Maggie", price: 169 },
            { id: "qb_14", name: "Veg Momo", price: 179 },
            { id: "qb_15", name: "Veg scz momo", price: 199 },
            { id: "qb_16", name: "Chicken momo", price: 199 },
            { id: "qb_17", name: "Chicken scz momo", price: 209 },
            { id: "qb_18", name: "Extra mayo", price: 20 }
        ] 
    },
    'main-course': { 
        name: "Main Course", 
        items: [
            { id: "mc_1", name: "Veg Stroganoff", price: 409 },
            { id: "mc_2", name: "Chicken stroganoff", price: 459 },
            { id: "mc_3", name: "Grilled chicken steak", price: 459 },
            { id: "mc_4", name: "Prawns Newberg", price: 479 }
        ] 
    },
    'burgers-sandwiches': { 
        name: "Burgers & Sandwiches", 
        items: [
            { id: "bs_1", name: "Veg cheese burger", price: 209 },
            { id: "bs_2", name: "Couch potato burger", price: 219 },
            { id: "bs_3", name: "Panner tikka burger", price: 269 },
            { id: "bs_4", name: "Peri peri cottage cheese burger", price: 269 },
            { id: "bs_5", name: "Crispy chicken burger", price: 279 },
            { id: "bs_6", name: "Classic chicken burger", price: 279 },
            { id: "bs_7", name: "Grilled chicken burger", price: 279 },
            { id: "bs_8", name: "Jerk spiced chicken burger", price: 279 },
            { id: "bs_9", name: "Mumbai sandwich", price: 209 },
            { id: "bs_10", name: "Couch potato sandwich", price: 209 },
            { id: "bs_11", name: "Egg n cheese sandwich", price: 219 },
            { id: "bs_12", name: "Veg club sandwich", price: 229 },
            { id: "bs_13", name: "Junglee Paneer Sandwich", price: 229 },
            { id: "bs_14", name: "Peri peri paneer sandwich", price: 249 },
            { id: "bs_15", name: "Mushroom sandwich", price: 249 },
            { id: "bs_16", name: "BGC chicken sandwich", price: 269 },
            { id: "bs_17", name: "Grilled chicken sandwich", price: 259 },
            { id: "bs_18", name: "Chicken club sandwich", price: 249 }
        ] 
    },
    'pasta-lasagne': { 
        name: "Pasta & Lasagne", 
        items: [
            { id: "pl_1", name: "Alfredo pasta (Veg)", price: 329 },
            { id: "pl_2", name: "Alfredo pasta (Non-Veg)", price: 349 },
            { id: "pl_3", name: "Arrabbiata pasta (Veg)", price: 329 },
            { id: "pl_4", name: "Arrabbiata pasta (Non-Veg)", price: 349 },
            { id: "pl_5", name: "Pink sauce pasta (Veg)", price: 329 },
            { id: "pl_6", name: "Pink sauce pasta (Non-Veg)", price: 349 },
            { id: "pl_7", name: "Baked mac n cheese (Veg)", price: 329 },
            { id: "pl_8", name: "Baked mac n cheese (Non-Veg)", price: 359 },
            { id: "pl_9", name: "Alfredo Lasagne (Veg)", price: 379 },
            { id: "pl_10", name: "Alfredo Lasagne (Non-Veg)", price: 399 },
            { id: "pl_11", name: "Arrabbiata Lasagne (Veg)", price: 379 },
            { id: "pl_12", name: "Arrabbiata Lasagne (Non-Veg)", price: 399 }
        ] 
    },
    'rice-noodles': { 
        name: "Rice & Noodles", 
        items: [
            { id: "rn_1", name: "Fried rice (Veg)", price: 259 },
            { id: "rn_2", name: "Schezwan rice (Veg)", price: 269 },
            { id: "rn_3", name: "Singapore rice (Veg)", price: 269 },
            { id: "rn_4", name: "Burnt chilli garlic rice (Veg)", price: 269 },
            { id: "rn_5", name: "Veg rice combo", price: 379 },
            { id: "rn_6", name: "Chicken rice combo", price: 429 },
            { id: "rn_7", name: "Hakka noodles (Veg)", price: 269 },
            { id: "rn_8", name: "Scz noodles (Veg)", price: 269 },
            { id: "rn_9", name: "Singapore noodles (Veg)", price: 269 },
            { id: "rn_10", name: "Veg noodles combo", price: 379 },
            { id: "rn_11", name: "Chicken noodles combo", price: 429 },
            { id: "rn_12", name: "American chopsuey (Veg)", price: 339 },
            { id: "rn_13", name: "American chopsuey (Non-Veg)", price: 359 }
        ] 
    },
    sizzlers: { 
        name: "Sizzlers", 
        items: [
            { id: "sz_1", name: "Creamy Alfredo Sizzler (Veg)", price: 479 },
            { id: "sz_2", name: "Scz Sizzler (Veg)", price: 479 },
            { id: "sz_3", name: "BBQ Sizzler (Chicken)", price: 499 },
            { id: "sz_4", name: "Mushroom pepper Sizzler (Fish)", price: 549 }
        ] 
    },
    salads: { 
        name: "Salads", 
        items: [
            { id: "sl_1", name: "Russian Salad", price: 249 },
            { id: "sl_2", name: "Caesar salad (Veg)", price: 249 },
            { id: "sl_3", name: "Grilled chicken salad", price: 269 },
            { id: "sl_4", name: "American egg salad", price: 259 },
            { id: "sl_5", name: "Italian pasta salad", price: 249 },
            { id: "sl_6", name: "Protein salad", price: 279 }
        ] 
    },
    'drinks-desserts': { 
        name: "Shakes & Desserts", 
        items: [
            { id: "dd_1", name: "Coffee", price: 129 },
            { id: "dd_2", name: "Vanilla Shake", price: 209 },
            { id: "dd_3", name: "Strawberry Shake", price: 209 },
            { id: "dd_4", name: "Butterscotch Shake", price: 229 },
            { id: "dd_5", name: "Chocolate Shake", price: 229 },
            { id: "dd_6", name: "Cappuccino Shake", price: 229 },
            { id: "dd_7", name: "Banana Caramel Shake", price: 249 },
            { id: "dd_8", name: "Oreo Shake", price: 249 },
            { id: "dd_9", name: "Kitkat Shake", price: 249 },
            { id: "dd_10", name: "Nutella Shake", price: 289 },
            { id: "dd_11", name: "Belgium Dark Chocolate", price: 289 },
            { id: "dd_12", name: "Pina Colada Shake", price: 249 },
            { id: "dd_13", name: "Biscotti Cheese Cake", price: 229 },
            { id: "dd_14", name: "Sizzling Brownie with Ice Cream", price: 289 },
            { id: "dd_15", name: "Flavoured Icecream", price: 149 },
            { id: "dd_16", name: "Tiramisu", price: 299 },
            { id: "dd_17", name: "Choco Lava Cake", price: 229 }
        ] 
    },
    mocktails: { 
        name: "Mocktails", 
        items: [
            { id: "mt_1", name: "Sunset Elixir", price: 209 },
            { id: "mt_2", name: "Crimson Bloom", price: 219 },
            { id: "mt_3", name: "Blush Cosmique", price: 219 },
            { id: "mt_4", name: "Peach Inferno", price: 209 },
            { id: "mt_5", name: "Ocean Lush", price: 219 },
            { id: "mt_6", name: "Citrus Ember", price: 209 },
            { id: "mt_7", name: "Guava Rouge", price: 209 },
            { id: "mt_8", name: "Tropical Tease", price: 229 },
            { id: "mt_9", name: "Sex on the Beach", price: 229 },
            { id: "mt_10", name: "Last Night in Paris", price: 249 },
            { id: "mt_11", name: "Pink Velvet", price: 249 }
        ]
    }
};

// --- GLOBAL METHODS (Accessible from HTML onclick) ---

window.submitLogin = function() {
    const authPin = document.getElementById('authPin');
    const authModal = document.getElementById('authModal');
    const authErrorMsg = document.getElementById('authErrorMsg');

    const pin = authPin ? authPin.value.trim() : '';

    if (pin === "0718") {
        window.restaurantState.isAuthenticated = true;
        sessionStorage.setItem('bgc_pos_auth', 'true');
        if (authModal) authModal.style.display = 'none';
        if (authErrorMsg) authErrorMsg.classList.add('hidden');
        if (authPin) authPin.value = '';
        renderTables();
    } else {
        if (authErrorMsg) authErrorMsg.classList.remove('hidden');
        if (authPin) {
            authPin.value = '';
            authPin.focus();
        }
    }
};

window.handleLogout = function() {
    sessionStorage.removeItem('bgc_pos_auth');
    window.restaurantState.isAuthenticated = false;
    const authModal = document.getElementById('authModal');
    const authPin = document.getElementById('authPin');
    if (authModal) authModal.style.display = 'flex';
    if (authPin) {
        authPin.value = '';
        authPin.focus();
    }
};

window.switchView = function(viewName) {
    window.restaurantState.currentView = viewName;
    const views = {
        tableView: document.getElementById('tableView'),
        menuView: document.getElementById('menuView'),
        billingView: document.getElementById('billingView')
    };

    Object.keys(views).forEach(key => {
        if (views[key]) views[key].classList.remove('active');
    });
    if (views[viewName]) {
        views[viewName].classList.add('active');
    }

    if (viewName === 'tableView') {
        renderTables();
    } else if (viewName === 'menuView' && window.restaurantState.selectedTableId) {
        renderKOT();
    }
};

window.toggleTableReservation = function(tableId) {
    const table = window.restaurantState.tables.find(t => t.id === Number(tableId));
    if (!table) return;

    if (table.status === 'reserved') {
        table.status = table.order.length > 0 ? 'occupied' : 'available';
        if (table.status === 'available') table.sessionStart = null;
    } else if (table.status === 'available' || table.status === 'occupied') {
        table.status = 'reserved';
        if (!table.sessionStart) table.sessionStart = Date.now();
    }

    renderTables();
    if (window.restaurantState.currentView === 'menuView') {
        renderKOT();
    }
};

window.addToOrder = function(name, price) {
    if (!window.restaurantState.selectedTableId) {
        alert("Please select a table first.");
        return;
    }
    const table = window.restaurantState.tables.find(t => t.id === Number(window.restaurantState.selectedTableId));
    if (!table) return;

    if (table.status === 'available') {
        table.status = 'occupied';
    }
    if (!table.sessionStart) {
        table.sessionStart = Date.now();
    }

    table.order.push({ name, price: Number(price) });
    renderKOT();
};

window.modifyItemQty = function(name, delta) {
    const table = window.restaurantState.tables.find(t => t.id === Number(window.restaurantState.selectedTableId));
    if (!table) return;

    if (delta < 0) {
        for (let i = table.order.length - 1; i >= 0; i--) {
            if (table.order[i].name === name) {
                table.order.splice(i, 1);
                break;
            }
        }
    } else {
        const existing = table.order.find(i => i.name === name);
        if (existing) {
            table.order.push({ name: existing.name, price: existing.price });
        }
    }
    renderKOT();
};

window.removeItemFromOrder = function(name) {
    const table = window.restaurantState.tables.find(t => t.id === Number(window.restaurantState.selectedTableId));
    if (!table) return;
    table.order = table.order.filter(i => i.name !== name);
    renderKOT();
};

window.saveKOT = function() {
    if (!window.restaurantState.selectedTableId) return;
    const table = window.restaurantState.tables.find(t => t.id === Number(window.restaurantState.selectedTableId));
    if (!table || table.order.length === 0) {
        alert("No items in the order to dispatch.");
        return;
    }
    alert(`KOT dispatched for Table ${table.id} (${table.order.length} items)`);
};

window.showBillingView = function() {
    const table = window.restaurantState.tables.find(t => t.id === Number(window.restaurantState.selectedTableId));
    if (!table || table.order.length === 0) {
        alert("Cannot generate a bill for an empty order.");
        return;
    }
    table.status = 'billing';
    renderBill();
    window.switchView('billingView');
};

window.settleBill = function() {
    if (isSettlingBill) return;
    isSettlingBill = true;

    const table = window.restaurantState.tables.find(t => t.id === Number(window.restaurantState.selectedTableId));
    if (!table) {
        isSettlingBill = false;
        return;
    }

    const paymentMode = document.getElementById('payment-mode').value;
    const subtotal = table.total;
    const gst = subtotal * window.restaurantState.gstRate;
    const grandTotal = subtotal + gst;
    const duration = formatDuration(table.sessionStart);

    const billRecord = {
        billId: `B-${Date.now().toString().slice(-6)}`,
        tableId: table.id,
        date: new Date().toLocaleString(),
        duration: duration,
        subtotal: subtotal,
        gst: gst,
        grandTotal: grandTotal,
        paymentMode: paymentMode,
        items: [...table.order]
    };
    window.restaurantState.salesData.push(billRecord);

    alert(`Payment of ₹${grandTotal.toFixed(2)} settled via ${paymentMode}`);

    table.status = 'available';
    table.order = [];
    table.total = 0;
    table.sessionStart = null;

    window.restaurantState.selectedTableId = null;
    window.switchView('tableView');
    isSettlingBill = false;
};

window.showCategory = function(categoryId, event) {
    if (event) event.preventDefault();
    document.querySelectorAll('.menu-category').forEach(c => { c.style.display = 'none'; });
    const target = document.getElementById(categoryId);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.category-link').forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('data-category-id') === categoryId) {
            l.classList.add('active');
        }
    });
};

window.openAddItemModal = function() {
    const m = document.getElementById('itemModal');
    if (m) m.classList.remove('hidden');
};

window.closeAddItemModal = function() {
    const m = document.getElementById('itemModal');
    if (m) m.classList.add('hidden');
};

window.deleteMenuItem = function(categoryId, itemId) {
    if (!confirm("Remove this dish from the menu?")) return;
    if (window.menuData[categoryId]) {
        window.menuData[categoryId].items = window.menuData[categoryId].items.filter(item => item.id !== itemId);
        injectFullMenu();
        window.showCategory(categoryId, null);
    }
};

// --- HELPER RENDERING FUNCTIONS ---

function formatDuration(startTime) {
    if (!startTime) return "00m 00s";
    const diffInSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    const mins = Math.floor(diffInSeconds / 60);
    const secs = diffInSeconds % 60;
    return `${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
}

function renderTables() {
    const tableGridContainer = document.getElementById('table-grid-container');
    if (!tableGridContainer) return;

    tableGridContainer.innerHTML = '';
    window.restaurantState.tables.forEach(table => {
        const card = document.createElement('div');
        card.className = `table-card ${table.status}`;

        const badgeConfig = {
            available: { text: 'text-emerald-400', label: 'Vacant', dot: 'bg-emerald-400' },
            occupied: { text: 'text-amber-400', label: 'Occupied', dot: 'bg-amber-400' },
            reserved: { text: 'text-cyan-400', label: 'Reserved', dot: 'bg-cyan-400' },
            billing: { text: 'text-rose-400', label: 'Billing', dot: 'bg-rose-400' }
        };
        const currentBadge = badgeConfig[table.status] || badgeConfig.available;

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <span class="text-xl font-bold font-mono tracking-tight text-white">${table.id}</span>
                <span class="text-[10px] font-medium uppercase tracking-wider ${currentBadge.text} flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full ${currentBadge.dot}"></span>
                    ${currentBadge.label}
                </span>
            </div>

            <div class="space-y-0.5">
                <div class="text-[11px] font-mono text-neutral-400">
                    <span data-table-timer="${table.id}">
                        ${table.sessionStart && table.status !== 'available' ? formatDuration(table.sessionStart) : '--:--'}
                    </span>
                </div>
                <div class="text-xs font-semibold text-neutral-200 truncate">
                    ${table.order.length > 0 ? `₹${table.total.toFixed(0)} (${table.order.length})` : 'Empty'}
                </div>
            </div>

            <div class="pt-2 border-t border-neutral-800/80 flex justify-between items-center text-xs">
                <button onclick="event.stopPropagation(); toggleTableReservation(${table.id})" class="text-neutral-500 hover:text-cyan-400 transition cursor-pointer" title="Toggle Reservation">
                    <i class="fa-solid fa-bookmark text-[11px]"></i>
                </button>
                <span class="text-[11px] font-medium text-neutral-400 hover:text-white transition">Select &rarr;</span>
            </div>
        `;

        card.onclick = () => {
            window.restaurantState.selectedTableId = table.id;
            if (table.status === 'available') {
                table.status = 'occupied';
                table.sessionStart = Date.now();
            }
            renderKOT();
            window.switchView('menuView');
        };

        tableGridContainer.appendChild(card);
    });
}

function renderKOT() {
    const table = window.restaurantState.tables.find(t => t.id === Number(window.restaurantState.selectedTableId));
    if (!table) return;

    const kotHeader = document.getElementById('kot-header');
    const tableQuickStatus = document.getElementById('table-quick-status');
    const tableSessionMeta = document.getElementById('table-session-meta');
    const kotItems = document.getElementById('kot-items');
    const kotTotalPrice = document.getElementById('kot-total-price');

    if (kotHeader) kotHeader.textContent = `Table ${table.id}`;
    if (tableQuickStatus) {
        tableQuickStatus.innerHTML = `
            <span class="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                table.status === 'reserved' ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800' : 'bg-amber-950/60 text-amber-400 border border-amber-800'
            }">
                ${table.status}
            </span>
        `;
    }

    if (tableSessionMeta) {
        tableSessionMeta.innerHTML = `
            <span>Table: <strong>${table.id}</strong></span>
            <span>&bull;</span>
            <span>Started: ${table.sessionStart ? new Date(table.sessionStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
        `;
    }

    if (!table.order || table.order.length === 0) {
        if (kotItems) {
            kotItems.innerHTML = `
                <div class="h-36 flex flex-col items-center justify-center text-neutral-500 text-xs text-center border border-dashed border-neutral-800 rounded-xl">
                    <p>No items added yet.</p>
                </div>
            `;
        }
        if (kotTotalPrice) kotTotalPrice.textContent = '₹0.00';
        table.total = 0;
        return;
    }

    const aggregated = table.order.reduce((acc, item) => {
        if (!acc[item.name]) {
            acc[item.name] = { price: item.price, quantity: 0 };
        }
        acc[item.name].quantity++;
        return acc;
    }, {});

    const currentTotal = table.order.reduce((sum, item) => sum + item.price, 0);
    table.total = currentTotal;
    if (kotTotalPrice) kotTotalPrice.textContent = `₹${currentTotal.toFixed(2)}`;

    if (kotItems) {
        kotItems.innerHTML = Object.entries(aggregated).map(([name, data]) => `
            <div class="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <div class="overflow-hidden pr-2">
                    <p class="text-xs font-medium text-neutral-200 truncate">${name}</p>
                    <p class="text-[11px] font-mono text-neutral-400">₹${data.price} &times; ${data.quantity}</p>
                </div>
                <div class="flex items-center gap-1.5">
                    <button onclick="modifyItemQty('${name.replace(/'/g, "\\'")}', -1)" class="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center text-xs transition cursor-pointer">-</button>
                    <span class="w-4 text-center font-mono font-medium text-xs">${data.quantity}</span>
                    <button onclick="modifyItemQty('${name.replace(/'/g, "\\'")}', 1)" class="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center text-xs transition cursor-pointer">+</button>
                    <button onclick="removeItemFromOrder('${name.replace(/'/g, "\\'")}')" class="text-neutral-500 hover:text-rose-400 text-xs ml-1 transition cursor-pointer" title="Delete">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function renderBill() {
    const table = window.restaurantState.tables.find(t => t.id === Number(window.restaurantState.selectedTableId));
    if (!table) return;

    const subtotal = table.total;
    const gst = subtotal * window.restaurantState.gstRate;
    const grandTotal = subtotal + gst;

    const billItemsTbody = document.getElementById('billing-items-tbody');
    const billTableNumber = document.getElementById('bill-table-number');
    const billDurationText = document.getElementById('bill-duration-text');
    const billSubtotal = document.getElementById('bill-subtotal');
    const billGst = document.getElementById('bill-gst');
    const billGrandtotal = document.getElementById('bill-grandtotal');

    const itemMap = table.order.reduce((acc, item) => {
        acc[item.name] = acc[item.name] || { price: item.price, quantity: 0 };
        acc[item.name].quantity++;
        return acc;
    }, {});

    if (billItemsTbody) {
        billItemsTbody.innerHTML = Object.entries(itemMap).map(([name, data]) => `
            <tr>
                <td class="font-normal text-neutral-800">${name}</td>
                <td class="text-right">${data.quantity}</td>
                <td class="text-right">₹${data.price.toFixed(0)}</td>
                <td class="text-right">₹${(data.quantity * data.price).toFixed(2)}</td>
            </tr>`).join('');
    }

    if (billTableNumber) billTableNumber.textContent = `Table: ${table.id}`;
    if (billDurationText) billDurationText.textContent = `Session: ${formatDuration(table.sessionStart)}`;
    if (billSubtotal) billSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
    if (billGst) billGst.textContent = `₹${gst.toFixed(2)}`;
    if (billGrandtotal) billGrandtotal.textContent = `₹${grandTotal.toFixed(2)}`;
}

function injectFullMenu() {
    const categoryNav = document.getElementById('category-nav');
    const menuItemsContainer = document.getElementById('menu-items-container');
    const newItemCategory = document.getElementById('newItemCategory');

    let categoryLinksHTML = '';
    let menuItemsHTML = '';
    let categoryOptionsHTML = '';

    for (const [id, category] of Object.entries(window.menuData)) {
        categoryLinksHTML += `
            <a href="#" data-category-id="${id}" onclick="showCategory('${id}', event)" class="category-link flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:bg-neutral-900">
                <span>${category.name}</span>
                <span class="text-[10px] text-neutral-500 font-mono">${category.items.length}</span>
            </a>
        `;

        categoryOptionsHTML += `<option value="${id}">${category.name}</option>`;

        menuItemsHTML += `
            <section id="${id}" class="menu-category" style="display: none;">
                <div class="flex items-center justify-between border-b border-neutral-800 pb-2 mb-4">
                    <h2 class="text-base font-semibold text-white tracking-tight">${category.name}</h2>
                    <span class="text-xs text-neutral-500">${category.items.length} items</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        `;

        category.items.forEach(item => {
            menuItemsHTML += `
                <div class="pos-panel p-3 rounded-xl flex justify-between items-center gap-3 border border-neutral-800/80 hover:border-neutral-700 transition group">
                    <div class="overflow-hidden">
                        <h4 class="text-xs font-medium text-neutral-200 truncate">${item.name}</h4>
                        <span class="text-xs font-mono font-semibold text-amber-400">₹${item.price}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="deleteMenuItem('${id}', '${item.id}')" class="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 text-xs p-1 transition cursor-pointer" title="Delete">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                        <button onclick="addToOrder('${item.name.replace(/'/g, "\\'")}', ${item.price})" class="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition cursor-pointer">
                            Add
                        </button>
                    </div>
                </div>
            `;
        });
        menuItemsHTML += `</div></section>`;
    }

    if (categoryNav) categoryNav.innerHTML = categoryLinksHTML;
    if (menuItemsContainer) menuItemsContainer.innerHTML = menuItemsHTML;
    if (newItemCategory) newItemCategory.innerHTML = categoryOptionsHTML;

    const firstCategory = Object.keys(window.menuData)[0];
    if (firstCategory) window.showCategory(firstCategory, null);
}

// --- BOOTSTRAPPER ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize tables
    window.restaurantState.tables = [];
    for (let i = 1; i <= window.restaurantState.totalTables; i++) {
        window.restaurantState.tables.push({
            id: i,
            status: 'available',
            order: [],
            total: 0,
            sessionStart: null
        });
    }

    // 2. Auth check
    const authModal = document.getElementById('authModal');
    const authPin = document.getElementById('authPin');
    const savedAuth = sessionStorage.getItem('bgc_pos_auth');

    if (savedAuth === 'true') {
        window.restaurantState.isAuthenticated = true;
        if (authModal) authModal.style.display = 'none';
    } else {
        window.restaurantState.isAuthenticated = false;
        if (authModal) authModal.style.display = 'flex';
        if (authPin) authPin.focus();
    }

    // 3. Enter key trigger on PIN input
    authPin?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            window.submitLogin();
        }
    });

    // 4. Render components
    renderTables();
    injectFullMenu();

    // 5. Setup ticker
    if (window.restaurantState.runtimeInterval) clearInterval(window.restaurantState.runtimeInterval);
    window.restaurantState.runtimeInterval = setInterval(() => {
        document.querySelectorAll('[data-table-timer]').forEach(el => {
            const tableId = parseInt(el.getAttribute('data-table-timer'), 10);
            const table = window.restaurantState.tables.find(t => t.id === tableId);
            if (table && table.sessionStart && table.status !== 'available') {
                el.textContent = formatDuration(table.sessionStart);
            }
        });

        if (window.restaurantState.currentView === 'menuView' && window.restaurantState.selectedTableId) {
            const selectedTable = window.restaurantState.tables.find(t => t.id === Number(window.restaurantState.selectedTableId));
            const kotTimer = document.getElementById('kot-timer');
            if (selectedTable && selectedTable.sessionStart && kotTimer) {
                kotTimer.innerHTML = `<i class="fa-regular fa-clock text-[10px]"></i> <span>${formatDuration(selectedTable.sessionStart)}</span>`;
            }
        }
    }, 1000);

    // 6. Bind Modal Form
    const addItemForm = document.getElementById('addItemForm');
    addItemForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const catKey = document.getElementById('newItemCategory').value;
        const name = document.getElementById('newItemName').value.trim();
        const price = parseFloat(document.getElementById('newItemPrice').value);

        if (!name || isNaN(price)) return;

        const newItem = { id: `custom_${Date.now()}`, name: name, price: price };
        if (window.menuData[catKey]) {
            window.menuData[catKey].items.push(newItem);
            injectFullMenu();
            window.showCategory(catKey, null);
            window.closeAddItemModal();
            addItemForm.reset();
        }
    });

    // 7. Bind CSV export
    document.getElementById('download-report-btn')?.addEventListener('click', () => {
        if (window.restaurantState.salesData.length === 0) {
            alert("No settled orders recorded in this session.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,Bill ID,Date,Session Runtime,Table ID,Payment Mode,Subtotal,GST (5%),Grand Total,Items\r\n";
        window.restaurantState.salesData.forEach(bill => {
            const itemsStr = bill.items.map(item => item.name).join('; ');
            const row = [
                bill.billId,
                `"${bill.date}"`,
                `"${bill.duration}"`,
                bill.tableId,
                bill.paymentMode,
                bill.subtotal.toFixed(2),
                bill.gst.toFixed(2),
                bill.grandTotal.toFixed(2),
                `"${itemsStr}"`
            ].join(',');
            csvContent += row + "\r\n";
        });

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});
