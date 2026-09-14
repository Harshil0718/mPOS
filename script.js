document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    const restaurantState = {
        tables: [],
        salesData: [],
        currentView: 'tableView',
        selectedTableId: null,
        gstRate: 0.05,
        totalTables: 30,
        currentUser: null,
        runtimeInterval: null
    };

    let isSettlingBill = false;

    // --- DOM ELEMENT SELECTORS ---
    const views = {
        tableView: document.getElementById('tableView'),
        menuView: document.getElementById('menuView'),
        billingView: document.getElementById('billingView')
    };
    const tableGridContainer = document.getElementById('table-grid-container');
    const kotHeader = document.getElementById('kot-header');
    const kotTimer = document.getElementById('kot-timer');
    const kotItems = document.getElementById('kot-items');
    const kotTotalPrice = document.getElementById('kot-total-price');
    const tableQuickStatus = document.getElementById('table-quick-status');
    const tableSessionMeta = document.getElementById('table-session-meta');
    
    const billItemsTbody = document.getElementById('billing-items-tbody');
    const billTableNumber = document.getElementById('bill-table-number');
    const billCashierName = document.getElementById('bill-cashier-name');
    const billDurationText = document.getElementById('bill-duration-text');
    const billSubtotal = document.getElementById('bill-subtotal');
    const billGst = document.getElementById('bill-gst');
    const billGrandtotal = document.getElementById('bill-grandtotal');

    const menuItemsContainer = document.getElementById('menu-items-container');
    const categoryNav = document.getElementById('category-nav');
    const downloadReportBtn = document.getElementById('download-report-btn');

    const authModal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const authUsername = document.getElementById('authUsername');
    const authPin = document.getElementById('authPin');
    const activeCashierLabel = document.getElementById('activeCashierLabel');

    const itemModal = document.getElementById('itemModal');
    const addItemForm = document.getElementById('addItemForm');
    const newItemCategory = document.getElementById('newItemCategory');
    const newItemName = document.getElementById('newItemName');
    const newItemPrice = document.getElementById('newItemPrice');

    // --- FULL MENU DATA WITH EXPLICIT IDs ---
    const menuData = {
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

    // --- AUTHENTICATION ---
    const checkAuth = () => {
        const savedUser = sessionStorage.getItem('bgc_pos_user');
        if (savedUser) {
            restaurantState.currentUser = JSON.parse(savedUser);
            authModal.classList.add('hidden');
            activeCashierLabel.textContent = `Staff: ${restaurantState.currentUser.name}`;
        } else {
            authModal.classList.remove('hidden');
        }
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = authPin.value.trim();
        const name = authUsername.value.trim();

        if (pin === "1234") {
            const user = { name: name || "Staff", role: "Cashier", loggedInAt: Date.now() };
            restaurantState.currentUser = user;
            sessionStorage.setItem('bgc_pos_user', JSON.stringify(user));
            authModal.classList.add('hidden');
            activeCashierLabel.textContent = `Staff: ${user.name}`;
            renderTables();
        } else {
            alert("Invalid PIN. Use 1234.");
        }
    });

    window.handleLogout = () => {
        sessionStorage.removeItem('bgc_pos_user');
        restaurantState.currentUser = null;
        authModal.classList.remove('hidden');
        authPin.value = '';
    };

    // --- RUNTIME & DURATION HELPERS ---
    const formatDuration = (startTime) => {
        if (!startTime) return "00m 00s";
        const diffInSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        const mins = Math.floor(diffInSeconds / 60);
        const secs = diffInSeconds % 60;
        return `${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
    };

    const startGlobalTimer = () => {
        if (restaurantState.runtimeInterval) clearInterval(restaurantState.runtimeInterval);
        restaurantState.runtimeInterval = setInterval(() => {
            // Update table grid elapsed labels
            document.querySelectorAll('[data-table-timer]').forEach(el => {
                const tableId = parseInt(el.getAttribute('data-table-timer'), 10);
                const table = getTableById(tableId);
                if (table && table.sessionStart && table.status !== 'available') {
                    el.textContent = formatDuration(table.sessionStart);
                }
            });

            // Update menu view timer
            if (restaurantState.currentView === 'menuView' && restaurantState.selectedTableId) {
                const selectedTable = getTableById(restaurantState.selectedTableId);
                if (selectedTable && selectedTable.sessionStart) {
                    kotTimer.innerHTML = `<i class="fa-regular fa-clock"></i> <span>${formatDuration(selectedTable.sessionStart)}</span>`;
                }
            }
        }, 1000);
    };

    // --- VIEW SWITCHER ---
    window.switchView = (viewName) => {
        restaurantState.currentView = viewName;
        Object.values(views).forEach(view => {
            if (view) view.classList.remove('active');
        });
        if (views[viewName]) {
            views[viewName].classList.add('active');
        }

        if (viewName === 'tableView') {
            renderTables();
        } else if (viewName === 'menuView' && restaurantState.selectedTableId) {
            renderKOT();
        }
    };

    // --- TABLE MANAGEMENT ---
    const getTableById = (id) => restaurantState.tables.find(t => t.id === Number(id));

    const initializeTables = () => {
        restaurantState.tables = [];
        for (let i = 1; i <= restaurantState.totalTables; i++) {
            restaurantState.tables.push({
                id: i,
                status: 'available',
                order: [],
                total: 0,
                sessionStart: null
            });
        }
    };

    window.toggleTableReservation = (tableId) => {
        const table = getTableById(tableId);
        if (!table) return;

        if (table.status === 'reserved') {
            table.status = table.order.length > 0 ? 'occupied' : 'available';
            if (table.status === 'available') table.sessionStart = null;
        } else if (table.status === 'available' || table.status === 'occupied') {
            table.status = 'reserved';
            if (!table.sessionStart) table.sessionStart = Date.now