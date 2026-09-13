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

    // --- MENU DATA ---
    const menuData = {
        soups: { 
            name: "Soups", 
            items: [ 
                { id: "sp_1", name: "Cantonese soup", price: 199 },
                { id: "sp_2", name: "Lemon coriander", price: 199 },
                { id: "sp_3", name: "Cream tomato soup", price: 199 },
                { id: "sp_4", name: "Sweet corn soup (Veg)", price: 199 },
                { id: "sp_5", name: "Sweet corn soup (Non-Veg)", price: 219 },
                { id: "sp_6", name: "Manchow soup (Veg)", price: 199 }
            ] 
        },
        appetizers: { 
            name: "Appetizers", 
            items: [ 
                { id: "ap_1", name: "Jalapeno cheese poppers", price: 289 },
                { id: "ap_2", name: "Crispy corn", price: 269 },
                { id: "ap_3", name: "Crispy butter garlic mushroom", price: 289 },
                { id: "ap_4", name: "Paneer 65", price: 289 },
                { id: "ap_5", name: "Chilli paneer", price: 289 },
                { id: "ap_6", name: "Chicken 65", price: 309 },
                { id: "ap_7", name: "Chicken Popcorn", price: 309 }
            ] 
        },
        pizza: { 
            name: "Pizza", 
            items: [
                { id: "pz_1", name: "Indian veggie", price: 299 },
                { id: "pz_2", name: "Margrita", price: 309 },
                { id: "pz_3", name: "BBQ chicken Pizza", price: 359 },
                { id: "pz_4", name: "Chicken tikka Pizza", price: 359 }
            ] 
        },
        'quick-bites': { 
            name: "Quick Bites", 
            items: [
                { id: "qb_1", name: "French Fries", price: 219 },
                { id: "qb_2", name: "Peri Peri Fries", price: 219 },
                { id: "qb_3", name: "Cheese garlic bread", price: 229 },
                { id: "qb_4", name: "Veg Cheese Maggie", price: 169 }
            ] 
        },
        'drinks-desserts': { 
            name: "Shakes & Desserts", 
            items: [
                { id: "dd_1", name: "Cold Coffee", price: 129 },
                { id: "dd_2", name: "Oreo Shake", price: 249 },
                { id: "dd_3", name: "Belgium Dark Chocolate", price: 289 },
                { id: "dd_4", name: "Sizzling Brownie with Ice Cream", price: 289 }
            ] 
        }
    };

    // --- AUTHENTICATION MODULE ---
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
            alert("Invalid PIN. Please enter 1234.");
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
        const diffInSeconds = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(diffInSeconds / 60);
        const secs = diffInSeconds % 60;
        return `${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
    };

    const startGlobalTimer = () => {
        if (restaurantState.runtimeInterval) clearInterval(restaurantState.runtimeInterval);
        restaurantState.runtimeInterval = setInterval(() => {
            // Update table grid elapsed tags in view
            document.querySelectorAll('[data-table-timer]').forEach(el => {
                const tableId = parseInt(el.getAttribute('data-table-timer'), 10);
                const table = getTableById(tableId);
                if (table && table.sessionStart && table.status !== 'available') {
                    el.textContent = formatDuration(table.sessionStart);
                }
            });

            // Update active KOT view stopwatch
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
        Object.values(views).forEach(view => view.classList.remove('active'));
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
                status: 'available', // available | occupied | reserved | billing
                order: [],
                total: 0,
                sessionStart: null,
                guestCount: 2
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
            if (!table.sessionStart) table.sessionStart = Date.now();
        }

        renderTables();
        if (restaurantState.currentView === 'menuView') {
            renderKOT();
        }
    };

    const renderTables = () => {
        tableGridContainer.innerHTML = '';
        restaurantState.tables.forEach(table => {
            const card = document.createElement('div');
            card.className = `table-card ${table.status} text-left`;

            const statusColors = {
                available: { text: 'text-emerald-400', label: 'Vacant', bg: 'bg-emerald-500/20' },
                occupied: { text: 'text-amber-400', label: 'Occupied', bg: 'bg-amber-500/20' },
                reserved: { text: 'text-cyan-400', label: 'Reserved', bg: 'bg-cyan-500/20' },
                billing: { text: 'text-rose-400', label: 'Billing', bg: 'bg-rose-500/20' }
            };
            const currentBadge = statusColors[table.status];

            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <span class="text-2xl font-black font-mono tracking-tight text-white">T-${table.id}</span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${currentBadge.bg} ${currentBadge.text} border border-white/10">
                        ${currentBadge.label}
                    </span>
                </div>

                <div class="space-y-1">
                    <div class="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <i class="fa-regular fa-clock text-[10px]"></i>
                        <span data-table-timer="${table.id}">
                            ${table.sessionStart && table.status !== 'available' ? formatDuration(table.sessionStart) : '--:--'}
                        </span>
                    </div>
                    <div class="text-xs font-bold text-slate-200">
                        ${table.order.length > 0 ? `₹${table.total.toFixed(0)} (${table.order.length} items)` : 'No active order'}
                    </div>
                </div>

                <div class="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                    <button onclick="event.stopPropagation(); toggleTableReservation(${table.id})" class="text-slate-400 hover:text-cyan-300 transition" title="Toggle Reservation">
                        <i class="fa-solid fa-bookmark text-xs"></i>
                    </button>
                    <span class="text-[11px] font-semibold text-amber-400/90">Open &rarr;</span>
                </div>
            `;

            card.onclick = () => {
                restaurantState.selectedTableId = table.id;
                if (table.status === 'available') {
                    table.status = 'occupied';
                    table.sessionStart = Date.now();
                }
                renderKOT();
                switchView('menuView');
            };

            tableGridContainer.appendChild(card);
        });
    };

    // --- KOT & ORDER MANAGEMENT ---
    window.addToOrder = (name, price) => {
        if (!restaurantState.selectedTableId) {
            alert("Please select a table first.");
            return;
        }
        const table = getTableById(restaurantState.selectedTableId);
        if (table.status === 'available') {
            table.status = 'occupied';
        }
        if (!table.sessionStart) {
            table.sessionStart = Date.now();
        }

        table.order.push({ name, price: Number(price) });
        renderKOT();
    };

    window.modifyItemQty = (name, delta) => {
        const table = getTableById(restaurantState.selectedTableId);
        if (!table) return;

        if (delta < 0) {
            const index = table.order.findLastIndex(i => i.name === name);
            if (index !== -1) table.order.splice(index, 1);
        } else {
            const existing = table.order.find(i => i.name === name);
            if (existing) {
                table.order.push({ name: existing.name, price: existing.price });
            }
        }
        renderKOT();
    };

    window.removeItemFromOrder = (name) => {
        const table = getTableById(restaurantState.selectedTableId);
        if (!table) return;
        table.order = table.order.filter(i => i.name !== name);
        renderKOT();
    };

    const renderKOT = () => {
        const table = getTableById(restaurantState.selectedTableId);
        if (!table) return;

        kotHeader.textContent = `Table ${table.id}`;
        tableQuickStatus.innerHTML = `
            <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                table.status === 'reserved' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }">
                ${table.status}
            </span>
        `;

        tableSessionMeta.innerHTML = `
            <span><i class="fa-solid fa-chair text-amber-400 mr-1"></i> Active Table: <strong>T-${table.id}</strong></span>
            <span>&bull;</span>
            <span>Started: <strong>${table.sessionStart ? new Date(table.sessionStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</strong></span>
        `;

        if (!table.order || table.order.length === 0) {
            kotItems.innerHTML = `
                <div class="h-40 flex flex-col items-center justify-center text-slate-500 text-xs text-center border border-dashed border-slate-800 rounded-xl">
                    <i class="fa-solid fa-utensils text-2xl mb-2 opacity-50"></i>
                    <p>No items added yet.</p>
                    <p class="text-[10px] text-slate-600 mt-1">Pick dishes from the menu to start</p>
                </div>
            `;
            kotTotalPrice.textContent = '₹0.00';
            table.total = 0;
            return;
        }

        // Aggregate counts
        const aggregated = table.order.reduce((acc, item) => {
            if (!acc[item.name]) {
                acc[item.name] = { price: item.price, quantity: 0 };
            }
            acc[item.name].quantity++;
            return acc;
        }, {});

        const currentTotal = table.order.reduce((sum, item) => sum + item.price, 0);
        table.total = currentTotal;
        kotTotalPrice.textContent = `₹${currentTotal.toFixed(2)}`;

        kotItems.innerHTML = Object.entries(aggregated).map(([name, data]) => `
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div class="overflow-hidden pr-2">
                    <p class="text-xs font-semibold text-slate-200 truncate">${name}</p>
                    <p class="text-[11px] font-mono text-slate-400">₹${data.price} &times; ${data.quantity} = ₹${(data.price * data.quantity).toFixed(0)}</p>
                </div>
                <div class="flex items-center gap-1.5">
                    <button onclick="modifyItemQty('${name.replace(/'/g, "\\'")}', -1)" class="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition">-</button>
                    <span class="w-5 text-center font-mono font-bold text-xs">${data.quantity}</span>
                    <button onclick="modifyItemQty('${name.replace(/'/g, "\\'")}', 1)" class="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition">+</button>
                    <button onclick="removeItemFromOrder('${name.replace(/'/g, "\\'")}')" class="w-6 h-6 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs ml-1 transition" title="Remove">
                        <i class="fa-regular fa-trash-can text-[10px]"></i>
                    </button>
                </div>
            </div>
        `).join('');
    };

    window.saveKOT = () => {
        if (!restaurantState.selectedTableId) return;
        const table = getTableById(restaurantState.selectedTableId);
        if (table.order.length === 0) {
            alert("No items in the order to dispatch.");
            return;
        }
        alert(`🛎️ KOT dispatched to Kitchen for Table ${table.id} (${table.order.length} items)!`);
    };

    // --- BILLING & SETTLEMENT ---
    window.showBillingView = () => {
        const table = getTableById(restaurantState.selectedTableId);
        if (!table || table.order.length === 0) {
            alert("Order is empty. Add items before generating a bill.");
            return;
        }
        table.status = 'billing';
        renderBill();
        switchView('billingView');
    };

    const renderBill = () => {
        const table = getTableById(restaurantState.selectedTableId);
        const subtotal = table.total;
        const gst = subtotal * restaurantState.gstRate;
        const grandTotal = subtotal + gst;

        const itemMap = table.order.reduce((acc, item) => {
            acc[item.name] = acc[item.name] || { price: item.price, quantity: 0 };
            acc[item.name].quantity++;
            return acc;
        }, {});

        billItemsTbody.innerHTML = Object.entries(itemMap).map(([name, data]) => `
            <tr>
                <td class="font-medium text-slate-800">${name}</td>
                <td class="text-right">${data.quantity}</td>
                <td class="text-right">₹${data.price.toFixed(0)}</td>
                <td class="text-right">₹${(data.quantity * data.price).toFixed(2)}</td>
            </tr>`).join('');

        billTableNumber.textContent = `Table: ${table.id}`;
        billCashierName.textContent = `Cashier: ${restaurantState.currentUser?.name || "Mithil"}`;
        billDurationText.textContent = `Session Runtime: ${formatDuration(table.sessionStart)}`;
        billSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
        billGst.textContent = `₹${gst.toFixed(2)}`;
        billGrandtotal.textContent = `₹${grandTotal.toFixed(2)}`;
    };

    window.settleBill = () => {
        if (isSettlingBill) return;
        isSettlingBill = true;

        const table = getTableById(restaurantState.selectedTableId);
        if (!table) {
            isSettlingBill = false;
            return;
        }

        const paymentMode = document.getElementById('payment-mode').value;
        const subtotal = table.total;
        const gst = subtotal * restaurantState.gstRate;
        const grandTotal = subtotal + gst;
        const duration = formatDuration(table.sessionStart);

        const billRecord = {
            billId: `B-${Date.now().toString().slice(-6)}`,
            cashier: restaurantState.currentUser?.name || "Staff",
            tableId: table.id,
            date: new Date().toLocaleString(),
            duration: duration,
            subtotal: subtotal,
            gst: gst,
            grandTotal: grandTotal,
            paymentMode: paymentMode,
            items: [...table.order]
        };
        restaurantState.salesData.push(billRecord);

        alert(`✅ Settlement Successful!\nTotal: ₹${grandTotal.toFixed(2)}\nMode: ${paymentMode}\nDuration: ${duration}`);

        table.status = 'available';
        table.order = [];
        table.total = 0;
        table.sessionStart = null;

        restaurantState.selectedTableId = null;
        switchView('tableView');
        isSettlingBill = false;
    };

    // --- MENU INJECTION & CUSTOMIZATION (ADD/DELETE ITEMS) ---
    window.showCategory = (categoryId, event) => {
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

    const injectFullMenu = () => {
        let categoryLinksHTML = '';
        let menuItemsHTML = '';
        let categoryOptionsHTML = '';

        for (const [id, category] of Object.entries(menuData)) {
            categoryLinksHTML += `
                <a href="#" data-category-id="${id}" onclick="showCategory('${id}', event)" class="category-link flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80">
                    <span>${category.name}</span>
                    <span class="text-[10px] text-slate-500 font-mono bg-slate-800 px-1.5 py-0.5 rounded-md">${category.items.length}</span>
                </a>
            `;

            categoryOptionsHTML += `<option value="${id}">${category.name}</option>`;

            menuItemsHTML += `
                <section id="${id}" class="menu-category animate-fade-in" style="display: none;">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
                        <h2 class="text-xl font-bold text-white tracking-wide">${category.name}</h2>
                        <span class="text-xs text-slate-500">${category.items.length} Dishes</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            `;

            category.items.forEach(item => {
                menuItemsHTML += `
                    <div class="glass-panel p-3.5 rounded-xl flex justify-between items-center gap-3 border border-slate-800/80 hover:border-slate-700 transition group">
                        <div class="overflow-hidden">
                            <h4 class="text-sm font-semibold text-slate-200 truncate">${item.name}</h4>
                            <span class="text-xs font-mono font-bold text-amber-400">₹${item.price}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="deleteMenuItem('${id}', '${item.id}')" class="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 text-xs p-1.5 transition" title="Delete Item">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                            <button onclick="addToOrder('${item.name.replace(/'/g, "\\'")}', ${item.price})" class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 active:scale-95 transition">
                                ADD
                            </button>
                        </div>
                    </div>
                `;
            });
            menuItemsHTML += `</div></section>`;
        }

        categoryNav.innerHTML = categoryLinksHTML;
        menuItemsContainer.innerHTML = menuItemsHTML;
        newItemCategory.innerHTML = categoryOptionsHTML;

        // Open first category by default
        const firstCategory = Object.keys(menuData)[0];
        if (firstCategory) showCategory(firstCategory, null);
    };

    window.openAddItemModal = () => itemModal.classList.remove('hidden');
    window.closeAddItemModal = () => itemModal.classList.add('hidden');

    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const catKey = newItemCategory.value;
        const name = newItemName.value.trim();
        const price = parseFloat(newItemPrice.value);

        if (!name || isNaN(price)) return;

        const newItem = {
            id: `custom_${Date.now()}`,
            name: name,
            price: price
        };

        if (menuData[catKey]) {
            menuData[catKey].items.push(newItem);
            injectFullMenu();
            showCategory(catKey, null);
            closeAddItemModal();
            addItemForm.reset();
        }
    });

    window.deleteMenuItem = (categoryId, itemId) => {
        if (!confirm("Are you sure you want to remove this dish from the menu?")) return;
        if (menuData[categoryId]) {
            menuData[categoryId].items = menuData[categoryId].items.filter(item => item.id !== itemId);
            injectFullMenu();
            showCategory(categoryId, null);
        }
    };

    // --- REPORT GENERATION ---
    const downloadSalesReport = () => {
        if (restaurantState.salesData.length === 0) {
            alert("No settled orders recorded in this session.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Bill ID,Cashier,Date,Session Runtime,Table ID,Payment Mode,Subtotal,GST (5%),Grand Total,Items\r\n";

        restaurantState.salesData.forEach(bill => {
            const itemsStr = bill.items.map(item => item.name).join('; ');
            const row = [
                bill.billId,
                `"${bill.cashier}"`,
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
        link.setAttribute("download", `BGC_Sales_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- APP STARTUP ---
    initializeTables();
    checkAuth();
    renderTables();
    injectFullMenu();
    startGlobalTimer();
    downloadReportBtn.addEventListener('click', downloadSalesReport);
});
