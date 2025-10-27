// This event listener ensures that the script runs only after the entire HTML document has been loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    const restaurantState = {
        tables: [],
        salesData: [], // To store records of all settled bills
        currentView: 'tableView',
        selectedTableId: null,
        gstRate: 0.05, // Tax rate is now 5%
        totalTables: 30 // Increased table count to 30
    };
    
    let isSettlingBill = false; // Lock to prevent bugs from fast double-clicks

    // --- DOM ELEMENT SELECTORS ---
    const views = {
        tableView: document.getElementById('tableView'),
        menuView: document.getElementById('menuView'),
        billingView: document.getElementById('billingView')
    };
    const tableGridContainer = document.getElementById('table-grid-container');
    const headerSubtitle = document.getElementById('header-subtitle');
    const kotHeader = document.getElementById('kot-header');
    const kotItems = document.getElementById('kot-items');
    const kotTotalPrice = document.getElementById('kot-total-price');
    const billItemsTbody = document.getElementById('billing-items-tbody');
    const billTableNumber = document.getElementById('bill-table-number');
    const billSubtotal = document.getElementById('bill-subtotal');
    const billGst = document.getElementById('bill-gst');
    const billGrandtotal = document.getElementById('bill-grandtotal');
    const menuItemsContainer = document.getElementById('menu-items-container');
    const categoryNav = document.getElementById('category-nav');
    const downloadReportBtn = document.getElementById('download-report-btn');

    // --- GLOBAL FUNCTIONS (accessible via onclick attributes) ---
    window.switchView = (viewName) => {
        restaurantState.currentView = viewName;
        Object.values(views).forEach(view => view.classList.remove('active'));
        if (views[viewName]) {
             views[viewName].classList.add('active');
        }

        if (viewName === 'tableView') {
            headerSubtitle.textContent = 'Table Management';
            renderTables();
        } else if (viewName === 'menuView' && restaurantState.selectedTableId) {
            headerSubtitle.textContent = `Ordering for Table ${restaurantState.selectedTableId}`;
        }
    };

    window.showCategory = (categoryId, event) => {
        if(event) event.preventDefault();
        document.querySelectorAll('.menu-category').forEach(c => { c.style.display = 'none'; });
        document.getElementById(categoryId).style.display = 'block';
        
        document.querySelectorAll('.category-link').forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('data-category-id') === categoryId) {
                l.classList.add('active');
            }
        });
    };

    window.addToOrder = (name, price) => {
        if (!restaurantState.selectedTableId) {
            alert("Please select a table first.");
            return;
        }
        const table = getTableById(restaurantState.selectedTableId);
        table.order.push({ name, price: Number(price) });
        renderKOT();
    };

    window.saveKOT = () => {
         if (!restaurantState.selectedTableId) return;
         const table = getTableById(restaurantState.selectedTableId);
         if (table.order.length === 0) {
             alert("No items to send to the kitchen.");
             return;
         }
         alert(`KOT for Table ${restaurantState.selectedTableId} has been sent to the kitchen!`);
    };

    window.showBillingView = () => {
        const table = getTableById(restaurantState.selectedTableId);
        if (!table || table.order.length === 0) {
            alert("Cannot generate a bill for an empty order.");
            return;
        }
        table.status = 'billing';
        renderBill();
        switchView('billingView');
    };

    window.settleBill = () => {
        if (isSettlingBill) return;
        isSettlingBill = true;

        const table = getTableById(restaurantState.selectedTableId);
        if (!table) {
            console.error("Settle bill called without a valid table.");
            isSettlingBill = false;
            return;
        }

        const paymentMode = document.getElementById('payment-mode').value;
        const subtotal = table.total;
        const gst = subtotal * restaurantState.gstRate;
        const grandTotal = subtotal + gst;

        // --- Store Data for Excel/CSV ---
        const billData = {
            billId: `B-${Date.now()}`,
            tableId: table.id,
            date: new Date().toLocaleString(),
            subtotal: subtotal,
            gst: gst,
            grandTotal: grandTotal,
            paymentMode: paymentMode,
            items: table.order
        };
        restaurantState.salesData.push(billData);

        alert(`Payment of ₹${grandTotal.toFixed(2)} received via ${paymentMode} for Table ${table.id}.\nThank you!`);

        table.status = 'available';
        table.order = [];
        table.total = 0;
        
        switchView('tableView');
        restaurantState.selectedTableId = null;
        isSettlingBill = false;
    };

    // --- HELPER FUNCTIONS ---
    const getTableById = (tableId) => restaurantState.tables.find(t => t.id === tableId);

    const initializeTables = () => {
        for (let i = 1; i <= restaurantState.totalTables; i++) {
            restaurantState.tables.push({
                id: i, status: 'available', order: [], total: 0
            });
        }
    };

    const renderTables = () => {
        tableGridContainer.innerHTML = '';
        restaurantState.tables.forEach(table => {
            const tableDiv = document.createElement('div');
            tableDiv.className = `table flex flex-col justify-center items-center rounded-lg shadow-lg text-white font-bold ${table.status}`;
            tableDiv.innerHTML = `<span class="text-3xl">${table.id}</span><span class="text-xs uppercase">${table.status}</span>`;
            tableDiv.onclick = () => {
                restaurantState.selectedTableId = table.id;
                const currentTable = getTableById(table.id);
                if (currentTable.status === 'available') {
                    currentTable.status = 'occupied';
                }
                renderKOT();
                switchView('menuView');
            };
            tableGridContainer.appendChild(tableDiv);
        });
    };

    const renderKOT = () => {
        const table = getTableById(restaurantState.selectedTableId);
        kotHeader.textContent = `Order for Table ${table.id}`;

        if (!table || table.order.length === 0) {
            kotItems.innerHTML = '<p class="text-gray-400">No items in order.</p>';
            kotTotalPrice.textContent = '₹0.00';
            table.total = 0;
            return;
        }

        const currentTotal = table.order.reduce((sum, item) => sum + item.price, 0);
        kotItems.innerHTML = table.order.map(item => `
            <div class="flex justify-between items-center">
                <span>${item.name}</span>
                <span>₹${item.price.toFixed(2)}</span>
            </div>`).join('');
        
        table.total = currentTotal;
        kotTotalPrice.textContent = `₹${currentTotal.toFixed(2)}`;
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
                <td>${name}</td>
                <td class="text-right">${data.quantity}</td>
                <td class="text-right">${data.price.toFixed(2)}</td>
                <td class="text-right">${(data.quantity * data.price).toFixed(2)}</td>
            </tr>`).join('');

        billTableNumber.textContent = `Table: ${table.id}`;
        billSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
        billGst.textContent = `₹${gst.toFixed(2)}`;
        billGrandtotal.textContent = `₹${grandTotal.toFixed(2)}`;
    };

    const downloadSalesReport = () => {
        if (restaurantState.salesData.length === 0) {
            alert("No sales data to export. Settle a bill first.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Bill ID,Date,Table ID,Payment Mode,Subtotal,GST,Grand Total,Items\r\n";

        restaurantState.salesData.forEach(bill => {
            const itemsStr = bill.items.map(item => item.name).join('; ');
            const row = [
                bill.billId, bill.date, bill.tableId, bill.paymentMode,
                bill.subtotal.toFixed(2), bill.gst.toFixed(2), bill.grandTotal.toFixed(2),
                `"${itemsStr}"`
            ].join(',');
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // --- MENU DATA & INJECTION ---
    const menuData = {
        soups: { 
            name: "Soups", 
            items: [ 
                { name: "Cantonese soup", price: 199 }, { name: "Lemon coriander", price: 199 }, { name: "Cream tomato soup", price: 199 },
                { name: "Sweet corn soup (Veg)", price: 199 }, { name: "Sweet corn soup (Non-Veg)", price: 219 },
                { name: "Manchow soup (Veg)", price: 199 }, { name: "Manchow soup (Non-Veg)", price: 219 },
                { name: "Hot and sour soup (Veg)", price: 199 }, { name: "Hot and sour soup (Non-Veg)", price: 219 },
                { name: "Wild mushroom cappuccino", price: 219 }, { name: "Cream of broccoli", price: 219 },
                { name: "Roasted chicken and garlic soup", price: 229 }, { name: "Chicken Egg Drop Soup", price: 229 }
            ] 
        },
        appetizers: { 
            name: "Appetizers", 
            items: [ 
                { name: "Jalapeno cheese poppers", price: 289 }, { name: "Crispy corn", price: 269 }, { name: "Veg Manchurian", price: 269 },
                { name: "Crispy baby corn", price: 269 }, { name: "Crispy butter garlic mushroom", price: 289 }, { name: "Honey chilli potatoes", price: 259 },
                { name: "Crispy fried veg", price: 259 }, { name: "Spring rolls", price: 269 }, { name: "Mini wonton roll", price: 279 },
                { name: "Paneer 65", price: 289 }, { name: "Paneer majestic", price: 289 }, { name: "Chilli paneer", price: 289 },
                { name: "Paneer tikka", price: 309 }, { name: "Spl veg assorted platter", price: 849 }, { name: "BGC zesty chicken", price: 309 },
                { name: "Chicken satay", price: 309 }, { name: "Peri peri chicken nuggets", price: 309 }, { name: "Kung pao chicken", price: 309 },
                { name: "Chilli chicken", price: 309 }, { name: "Chicken majestic", price: 309 }, { name: "Chicken Popcorn", price: 309 },
                { name: "Pepper chicken", price: 309 }, { name: "Chicken 65", price: 309 }, { name: "Chicken 555", price: 309}, { name: "Angry wild wings", price: 319 },
                { name: "Drums of heaven", price: 319 }, { name: "Chicken assorted platter", price: 1099 }, { name: "Chilli fish", price: 369 },
                { name: "Fish N chips", price: 369 }, { name: "Sch fish", price: 369}, { name: "Crispy fish fry", price: 369 }, { name: "Apollo Fish", price: 369},
                { name: "Chilli prawns", price: 379 }, { name: "Crispy fried prawns", price: 379}, { name: "Loose prawns", price: 379 },
                { name: "Scz prawns", price: 379}, { name: "BGC prawns", price: 379}
            ] 
        },
        pizza: { 
            name: "Pizza", 
            items: [
                { name: "Indian veggie", price: 299 }, { name: "Margrita", price: 309 }, { name: "American corn cheese", price: 329 },
                { name: "Exotic BBQ Mexican", price: 309 }, { name: "Veg supreme", price: 349 }, { name: "Panner tikka Pizza", price: 349 }, { name: "Scz paneer Pizza", price: 349},
                { name: "BBQ chicken Pizza", price: 359 }, { name: "Chicken tikka Pizza", price: 359 }, { name: "Chicken delight pizza", price: 359}, { name: "SCZ chicken Pizza", price: 359}, { name: "American paperoni", price: 379 }
            ] 
        },
        'quick-bites': { 
            name: "Quick Bites", 
            items: [
                { name: "Crispy Noodle Bhel", price: 219 }, { name: "French Fries", price: 219 }, { name: "Peri Peri Fries", price: 219 },
                { name: "Cheese fries", price: 229 }, { name: "Cheese Peri Peri Fries", price: 239}, { name: "Cheese Chilli toast", price: 229},
                { name: "Cheese garlic bread", price: 229}, { name: "Scz cheese garlic bread", price: 239},
                { name: "Veg nachos", price: 229 }, { name: "Cheese nachos", price: 249}, { name: "Plain veg Maggie", price: 159 },
                { name: "Veg Cheese Maggie", price: 169 }, { name: "Scz Maggie", price: 169}, { name: "Veg Momo", price: 179 }, { name: "Veg scz momo", price: 199},
                { name: "Chicken momo", price: 199 }, { name: "Chicken scz momo", price: 209}, { name: "Extra mayo", price: 20}
            ] 
        },
        'main-course': { 
            name: "Main Course", 
            items: [
                { name: "Veg Stroganoff", price: 409 }, { name: "Chicken stroganoff", price: 459 },
                { name: "Grilled chicken steak", price: 459 }, { name: "Prawns Newberg", price: 479 }
            ] 
        },
        'burgers-sandwiches': { 
            name: "Burgers & Sandwiches", 
            items: [
                { name: "Veg cheese burger", price: 209 }, { name: "Couch potato burger", price: 219}, { name: "Panner tikka burger", price: 269 }, { name: "Peri peri cottage cheese burger", price: 269},
                { name: "Crispy chicken burger", price: 279 }, { name: "Classic chicken burger", price: 279}, { name: "Grilled chicken burger", price: 279}, { name: "Jerk spiced chicken burger", price: 279},
                { name: "Mumbai sandwich", price: 209 }, { name: "Couch potato sandwich", price: 209}, { name: "Egg n cheese sandwich", price: 219}, { name: "Veg club sandwich", price: 229 }, 
                { name: "Junglee Paneer Sandwich", price: 229}, { name: "Peri peri paneer sandwich", price: 249}, { name: "Mushroom sandwich", price: 249},
                { name: "BGC chicken sandwich", price: 269 }, { name: "Grilled chicken sandwich", price: 259}, { name: "Chicken club sandwich", price: 249}
            ] 
        },
        'pasta-lasagne': { 
            name: "Pasta & Lasagne", 
            items: [
                { name: "Alfredo pasta (Veg)", price: 329 }, { name: "Alfredo pasta (Non-Veg)", price: 349 },
                { name: "Arrabbiata pasta (Veg)", price: 329 }, { name: "Arrabbiata pasta (Non-Veg)", price: 349 },
                { name: "Pink sauce pasta (Veg)", price: 329}, { name: "Pink sauce pasta (Non-Veg)", price: 349},
                { name: "Baked mac n cheese (Veg)", price: 329}, { name: "Baked mac n cheese (Non-Veg)", price: 359},
                { name: "Alfredo Lasagne (Veg)", price: 379 }, { name: "Alfredo Lasagne (Non-Veg)", price: 399 },
                { name: "Arrabbiata Lasagne (Veg)", price: 379}, { name: "Arrabbiata Lasagne (Non-Veg)", price: 399}
            ] 
        },
        'rice-noodles': { 
            name: "Rice & Noodles", 
            items: [
                { name: "Fried rice (Veg)", price: 259 }, { name: "Schezwan rice (Veg)", price: 269 }, { name: "Singapore rice (Veg)", price: 269}, { name: "Burnt chilli garlic rice (Veg)", price: 269},
                { name: "Veg rice combo", price: 379 }, { name: "Chicken rice combo", price: 429 },
                { name: "Hakka noodles (Veg)", price: 269 }, { name: "Scz noodles (Veg)", price: 269}, { name: "Singapore noodles (Veg)", price: 269},
                { name: "Veg noodles combo", price: 379 }, { name: "Chicken noodles combo", price: 429}, { name: "American chopsuey (Veg)", price: 339 }, { name: "American chopsuey (Non-Veg)", price: 359}
            ] 
        },
        sizzlers: { 
            name: "Sizzlers", 
            items: [
                { name: "Creamy Alfredo Sizzler (Veg)", price: 479 }, { name: "Scz Sizzler (Veg)", price: 479},
                { name: "BBQ Sizzler (Chicken)", price: 499 }, { name: "Mushroom pepper Sizzler (Fish)", price: 549 }
            ] 
        },
        salads: { 
            name: "Salads", 
            items: [
                { name: "Russian Salad", price: 249 }, { name: "Caesar salad (Veg)", price: 249 }, { name: "Grilled chicken salad", price: 269 },
                { name: "American egg salad", price: 259}, { name: "Italian pasta salad", price: 249}, { name: "Protein salad", price: 279 }
            ] 
        },
        'drinks-desserts': { 
            name: "Shakes & Desserts", 
            items: [
                { name: "Coffee", price: 129 },
                { name: "Vanilla Shake", price: 209 },
                { name: "Strawberry Shake", price: 209 },
                { name: "Butterscotch Shake", price: 229 },
                { name: "Chocolate Shake", price: 229 },
                { name: "Cappuccino Shake", price: 229 },
                { name: "Banana Caramel Shake", price: 249 },
                { name: "Oreo Shake", price: 249 },
                { name: "Kitkat Shake", price: 249 },
                { name: "Nutella Shake", price: 289 },
                { name: "Belgium Dark Chocolate", price: 289 },
                { name: "Pina Colada Shake", price: 249 },
                { name: "Biscotti Cheese Cake", price: 229 },
                { name: "Sizzling Brownie with Ice Cream", price: 289 },
                { name: "Flavoured Icecream", price: 149 },
                { name: "Tiramisu", price: 299 },
                { name: "Choco Lava Cake", price: 229 }
            ] 
        },
        'mocktails': {
            name: "Mocktails",
            items: [
                { name: "Sunset Elixir", price: 209 },
                { name: "Crimson Bloom", price: 219 },
                { name: "Blush Cosmique", price: 219 },
                { name: "Peach Inferno", price: 209 },
                { name: "Ocean Lush", price: 219 },
                { name: "Citrus Ember", price: 209 },
                { name: "Guava Rouge", price: 209 },
                { name: "Tropical Tease", price: 229 },
                { name: "Sex on the Beach", price: 229 },
                { name: "Last Night in Paris", price: 249 },
                { name: "Pink Velvet", price: 249 }
            ]
        }
    };

    const injectFullMenu = () => {
        let categoryLinksHTML = '';
        let menuItemsHTML = '';
        
        for (const [id, category] of Object.entries(menuData)) {
            categoryLinksHTML += `<a href="#" data-category-id="${id}" onclick="showCategory('${id}', event)" class="category-link block px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">${category.name}</a>`;
            
            menuItemsHTML += `<section id="${id}" class="menu-category" style="display: none;">
                <h2 class="text-3xl font-bold border-b-2 border-amber-400 pb-2 mb-6 text-white">${category.name}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;

            category.items.forEach(item => {
                menuItemsHTML += `
                    <div class="bg-gray-800 p-3 rounded-lg flex justify-between items-center gap-2">
                        <span class="text-sm">${item.name}</span>
                        <div class="flex items-center gap-3">
                            <span class="font-semibold text-sm">₹${item.price}</span>
                            <button onclick="addToOrder('${item.name.replace(/'/g, "\\'")}', ${item.price})" class="bg-amber-500 text-gray-900 px-3 py-1 rounded-md text-xs font-bold hover:bg-amber-400 transition-colors">ADD</button>
                        </div>
                    </div>`;
            });
            menuItemsHTML += `</div></section>`;
        }
        
        categoryNav.innerHTML = categoryLinksHTML;
        menuItemsContainer.innerHTML = menuItemsHTML;
        
        showCategory(Object.keys(menuData)[0], null);
    };


    // --- INITIAL APP START ---
    initializeTables();
    renderTables();
    injectFullMenu();
    downloadReportBtn.addEventListener('click', downloadSalesReport);
});
