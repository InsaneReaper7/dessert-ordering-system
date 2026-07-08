let token = localStorage.getItem('adminToken');
let socket = null;

// ==========================================
// Multi-lingual Translation System (EN / ES)
// ==========================================

const TRANSLATIONS = {
  en: {
    logo_title: "Admin Portal",
    logo_subtitle: "Sugar & Crumb Bakery",
    logout: "Logout",
    view_menu: "View Menu",
    admin_login: "Admin Login",
    admin_login_subtitle: "Enter the password to access the sales tracker and manage customer orders.",
    password_label: "Dashboard Password",
    enter_dashboard: "Enter Dashboard",
    ws_connected: "WebSocket: Connected",
    ws_disconnected: "WebSocket: Disconnected",
    test_phone_chime: "Test Phone Chime",
    tab_orders: "Orders & Analytics",
    tab_inventory: "Ingredient Cost Manager",
    tab_recipes: "Current Recipes",
    tab_pricing: "Dessert Pricing Manager",
    pricing_manager_title: "Dessert Pricing Manager",
    pricing_manager_desc: "Manage the customer-facing selling prices for your desserts in 8\"x5\" and 8\"x8\" molds. Set to blank (TBD) if pricing is not yet finalized.",
    col_image: "Image",
    col_name: "Dessert Name",
    col_price_8x5: "Price (8\" x 5\")",
    col_price_9x9: "Price (9\" x 9\")",
    col_price_8x8: "Price (8\" x 8\")",
    col_actions: "Actions",
    cinnamon_rolls_pricing_title: "Artisan Cinnamon Rolls Pricing",
    cinnamon_rolls_pricing_desc: "Configure the pricing for individual rolls, and packs of 4, 6, and 12.",
    price_1_roll_label: "Individual Roll (1 Roll)",
    price_4_pack_label: "Pack of 4",
    price_6_pack_label: "Pack of 6",
    price_12_pack_label: "Pack of 12 (Full Tray)",
    btn_save_roll_prices: "Save Cinnamon Rolls Prices",
    sales_today: "Sales (Today)",
    sales_month: "Sales (This Month)",
    sales_year: "Sales (This Year)",
    excluding_tbd: "*Excluding TBD orders",
    dessert_qtys_sold: "Dessert Item Quantities Sold",
    top_toppings_popularity: "Top Toppings Popularity",
    customer_orders_log: "Customer Orders Log",
    th_order_id: "Order ID",
    th_date: "Date",
    th_customer: "Customer",
    th_details: "Item Details",
    th_fulfillment: "Fulfillment",
    th_total_price: "Total Price",
    th_status: "Status",
    th_actions: "Actions",
    pricing_title: "Ingredient Inventory Pricing",
    th_ing_name: "Ingredient Name",
    th_bulk_cost: "Bulk Cost ($)",
    th_bulk_qty: "Bulk Quantity",
    th_tax: "Tax %",
    th_unit: "Unit",
    base_batch_costs: "Base Batch Costs",
    stock_calc_title: "Baking Stock & Shopping Calculator",
    stock_calc_btn: "Show/Hide Calculator",
    stock_calc_desc: "Select the number of batches you plan to bake for each recipe, and the calculator will aggregate your shopping list.",
    calculate_stock_btn: "Calculate Stock Needed",
    stocking_list_title: "Required Stocking List",
    copy_shopping_list: "📋 Copy Shopping List",
    recipes_title: "Recipe Formulations",
    add_ingredient_btn: "+ Add Ingredient to Recipe",
    add_ing_form_title: "Add Ingredient to Recipe",
    label_select_dessert: "Select Dessert / Recipe",
    label_ing_name: "Ingredient Name",
    label_amount: "Amount Needed",
    label_part: "Recipe Part / Section",
    label_unit: "Unit:",
    option_grams: "Grams (g)",
    option_whole: "Whole Item (e.g. eggs)",
    option_teaspoon: "Teaspoon (tsp)",
    option_tablespoon: "Tablespoon (tbsp)",
    label_topping: "Is an Optional Topping",
    label_topping_val: "Topping Value:",
    btn_cancel: "Cancel",
    btn_save_ing: "Save Ingredient",
    expand_all: "📂 Expand All",
    collapse_all: "📁 Collapse All",
    
    // Form Placeholders & Unit Values
    placeholder_butter: "e.g. Butter",
    placeholder_amount: "e.g. 150",
    placeholder_section: "e.g. Dough, Filling",
    walnuts: "Walnuts",
    pecans: "Pecans",
    marshmallow: "Marshmallow",
    caramel_dots: "Caramel Dots",
    chocolate_chips: "Chocolate Chips",
    butterscotch_chips: "Butterscotch Chips",
    reeses_peanut_butter_chips: "Reese's Peanut Butter Chips",
    vanilla_chips: "Vanilla Chips",

    // Dynamic strings / mappings
    no_orders_yet: "No orders recorded yet.",
    no_ingredients: "No ingredients registered. Build recipes on the 'Current Recipes' tab first!",
    no_recipes_yet: "No ingredients added to this recipe yet. Click '+ Add Ingredient to Recipe' above.",
    original_batch: "Original (1 Batch)",
    original: "Original",
    batches: "Batches",
    yield: "Yield:",
    base_mold: "Base Mold:",
    scale_to: "Scale To:",
    base_cost: "Base Cost",
    section_label: "Section:",
    type_topping: "Topping",
    type_base: "Base Ingredient",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    pickup: "Pickup",
    delivery: "Delivery",
    tbd: "TBD",
    none: "None",
    of: "of",
    cost_label: "Cost:",
    action_edit: "Edit",
    action_reset: "Reset",
    action_delete: "Delete",
    action_remove: "Remove",
    action_complete: "Complete",
    action_cancel: "Cancel",
    action_save: "Save",
    action_close: "Close",
    action_delete_log: "Delete Log",
    grand_total_batch: "Total Batch Cost:",
    
    // Dessert Names Mapping
    brownies: "Fudge Brownies",
    blondies: "Classic Blondies",
    lemon_bars: "Tangy Lemon Bars",
    mango_bars: "Tangy Mango Bars",
    pineapple_bars: "Sweet Pineapple Bars",
    butterscotch_blondies: "Golden Butterscotch Blondies",
    caramel_butterscotch_crunch_blondies: "Caramel Butterscotch Crunch Blondies",
    marshmallow_swirl_brownies: "Marshmallow Swirl Brownies",
    pina_colada_bars: "Piña Colada Bars",
    coconut_cream_bars: "Coconut Cream Bars",
    cinnamon_rolls: "Artisan Cinnamon Rolls",
    carrot_cake_bars: "Carrot Cake Bars",
    banana_bread_bars: "Banana Bread Bars",

    // Sizes Mapping
    "8x5": "8x5",
    "9x9": "9x9",
    "8x8": "8x8",
    "1_roll": "1 Roll",
    "4_pack": "4 Pack",
    "6_pack": "6 Pack",
    "full_tray": "Full Tray",

    // Alerts/Prompts
    confirm_reset_ing: "Are you sure you want to reset the bulk cost, quantity, and tax of this ingredient?",
    confirm_change_ing: "Are you sure you want to change the bulk cost, quantity, and tax of this ingredient?",
    confirm_delete_ing: "Are you sure you want to delete this ingredient from inventory?",
    confirm_remove_recipe_ing: "Are you sure you want to remove this ingredient from the recipe?",
    confirm_delete_order: "Are you sure you want to permanently delete this order log?",
    confirm_cancel_order: "Are you sure you want to cancel this order?",
    error_update_status: "Failed to update order status",
    error_delete_order: "Failed to delete order",
    error_remove_ing: "Failed to remove ingredient",
    alert_valid_cost_qty: "Please enter a valid cost (0 or greater) and quantity (greater than 0)",
    alert_copied_list: "Shopping list copied to clipboard successfully!",
    alert_copied_failed: "Failed to copy. Here is the text list:\n\n",
    shopping_list_header: "BAKING SHOPPING LIST & STOCK ESTIMATE",
    shopping_list_generated: "Generated:",
    planned_batches: "Planned Bake Batches:",
    consolidated_materials: "Consolidated Raw Materials to Stock Up:",
    total_est_cost: "Total Estimated Raw Materials Cost:",
  },
  es: {
    logo_title: "Portal de Administración",
    logo_subtitle: "Pastelería Sugar & Crumb",
    logout: "Cerrar Sesión",
    view_menu: "Ver Menú",
    admin_login: "Inicio de Sesión de Administrador",
    admin_login_subtitle: "Ingrese la contraseña para acceder al rastreador de ventas y gestionar los pedidos.",
    password_label: "Contraseña del Panel",
    enter_dashboard: "Entrar al Panel",
    ws_connected: "WebSocket: Conectado",
    ws_disconnected: "WebSocket: Desconectado",
    test_phone_chime: "Probar Timbre de Teléfono",
    tab_orders: "Pedidos y Analíticas",
    tab_inventory: "Gestor de Costos de Ingredientes",
    tab_recipes: "Recetas Actuales",
    tab_pricing: "Gestor de Precios de Postres",
    pricing_manager_title: "Gestor de Precios de Postres",
    pricing_manager_desc: "Administre los precios de venta al público para sus postres en moldes de 8\"x5\" y 8\"x8\". Deje en blanco (TBD) si el precio aún no está finalizado.",
    col_image: "Imagen",
    col_name: "Nombre del Postre",
    col_price_8x5: "Precio (8\" x 5\")",
    col_price_9x9: "Precio (9\" x 9\")",
    col_price_8x8: "Precio (8\" x 8\")",
    col_actions: "Acciones",
    cinnamon_rolls_pricing_title: "Precios de Rollos de Canela Artesanales",
    cinnamon_rolls_pricing_desc: "Configure los precios para rollos individuales y paquetes de 4, 6 y 12.",
    price_1_roll_label: "Rollo Individual (1 Rollo)",
    price_4_pack_label: "Paquete de 4",
    price_6_pack_label: "Paquete de 6",
    price_12_pack_label: "Paquete de 12 (Bandeja Completa)",
    btn_save_roll_prices: "Guardar Precios de Rollos de Canela",
    sales_today: "Ventas (Hoy)",
    sales_month: "Ventas (Este Mes)",
    sales_year: "Ventas (Este Año)",
    excluding_tbd: "*Excluyendo pedidos TBD",
    dessert_qtys_sold: "Cantidades de Postres Vendidos",
    top_toppings_popularity: "Popularidad de Toppings",
    customer_orders_log: "Registro de Pedidos de Clientes",
    th_order_id: "ID de Pedido",
    th_date: "Fecha",
    th_customer: "Cliente",
    th_details: "Detalles del Artículo",
    th_fulfillment: "Fulfillment",
    th_total_price: "Precio Total",
    th_status: "Estado",
    th_actions: "Acciones",
    pricing_title: "Precios de Inventario de Ingredientes",
    th_ing_name: "Nombre del Ingrediente",
    th_bulk_cost: "Costo a Granel ($)",
    th_bulk_qty: "Cantidad a Granel",
    th_tax: "Impuesto %",
    th_unit: "Unidad",
    base_batch_costs: "Costos de Lote Base",
    stock_calc_title: "Calculadora de Lotes y Lista de Compras",
    stock_calc_btn: "Mostrar/Ocultar Calculadora",
    stock_calc_desc: "Seleccione el número de lotes que planea hornear para cada receta, y la calculadora generará su lista de compras.",
    calculate_stock_btn: "Calcular Material Necesario",
    stocking_list_title: "Lista de Material Requerido",
    copy_shopping_list: "📋 Copiar Lista de Compras",
    recipes_title: "Formulación de Recetas",
    add_ingredient_btn: "+ Agregar Ingrediente a Receta",
    add_ing_form_title: "Agregar Ingrediente a Receta",
    label_select_dessert: "Seleccionar Postre / Receta",
    label_ing_name: "Nombre del Ingrediente",
    label_amount: "Cantidad Necesaria",
    label_part: "Sección de la Receta",
    label_unit: "Unidad:",
    option_grams: "Gramos (g)",
    option_whole: "Artículo Entero (ej. huevos)",
    option_teaspoon: "Cucharadita (tsp)",
    option_tablespoon: "Cucharada (tbsp)",
    label_topping: "Es un Topping Opcional",
    label_topping_val: "Valor del Topping:",
    btn_cancel: "Cancelar",
    btn_save_ing: "Guardar Ingrediente",
    expand_all: "📂 Expandir Todo",
    collapse_all: "📁 Colapsar Todo",
    
    // Form Placeholders & Unit Values
    placeholder_butter: "ej. Mantequilla",
    placeholder_amount: "ej. 150",
    placeholder_section: "ej. Masa, Relleno",
    walnuts: "Nueces",
    pecans: "Pacanas",
    marshmallow: "Malvavisco",
    caramel_dots: "Dulce de Leche",
    chocolate_chips: "Chispas de Chocolate",
    butterscotch_chips: "Chispas de Butterscotch",
    reeses_peanut_butter_chips: "Chips de Mantequilla de Maní Reese's",
    vanilla_chips: "Chispas de Vainilla",

    // Dynamic strings / mappings
    no_orders_yet: "Aún no hay pedidos registrados.",
    no_ingredients: "¡No hay ingredientes registrados. Cree recetas en la pestaña 'Recetas Actuales' primero!",
    no_recipes_yet: "Aún no se han añadido ingredientes a esta receta. Haga clic en '+ Agregar Ingrediente a Receta' arriba.",
    original_batch: "Original (1 Lote)",
    original: "Original",
    batches: "Lotes",
    yield: "Rendimiento:",
    base_mold: "Molde Base:",
    scale_to: "Escalar A:",
    base_cost: "Costo Base",
    section_label: "Sección:",
    type_topping: "Topping",
    type_base: "Ingrediente Base",
    pending: "Pendiente",
    completed: "Completado",
    cancelled: "Cancelado",
    pickup: "Recogida",
    delivery: "Entrega a domicilio",
    tbd: "TBD",
    none: "Ninguno",
    of: "de",
    cost_label: "Costo:",
    action_edit: "Editar",
    action_reset: "Restablecer",
    action_delete: "Eliminar",
    action_remove: "Quitar",
    action_complete: "Completar",
    action_cancel: "Cancelar",
    action_save: "Guardar",
    action_close: "Cerrar",
    action_delete_log: "Eliminar Registro",
    grand_total_batch: "Costo Total del Lote:",

    // Dessert Names Mapping
    brownies: "Brownies de Fudge",
    blondies: "Blondies Clásicos",
    lemon_bars: "Barras de Limón",
    mango_bars: "Barras de Mango",
    pineapple_bars: "Barras de Piña",
    butterscotch_blondies: "Blondies de Butterscotch Dorado",
    caramel_butterscotch_crunch_blondies: "Blondies Crujientes de Caramelo y Butterscotch",
    marshmallow_swirl_brownies: "Brownies con Remolino de Malvavisco",
    pina_colada_bars: "Barras de Piña Colada",
    coconut_cream_bars: "Barras de Crema de Coco",
    cinnamon_rolls: "Rollos de Canela Artesanales",
    carrot_cake_bars: "Barras de Pastel de Zanahoria",
    banana_bread_bars: "Barras de Pan de Guineo",

    // Sizes Mapping
    "8x5": "8x5",
    "9x9": "9x9",
    "8x8": "8x8",
    "1_roll": "1 Rollo",
    "4_pack": "Paquete de 4",
    "6_pack": "Paquete de 6",
    "full_tray": "Bandeja Completa",

    // Alerts/Prompts
    confirm_reset_ing: "¿Está seguro de que desea restablecer el costo, la cantidad y el impuesto de este ingrediente?",
    confirm_change_ing: "¿Está seguro de que desea cambiar el costo, la cantidad y el impuesto de este ingrediente?",
    confirm_delete_ing: "¿Está seguro de que desea eliminar este ingrediente del inventario?",
    confirm_remove_recipe_ing: "¿Está seguro de que desea eliminar este ingrediente de la receta?",
    confirm_delete_order: "¿Está seguro de que desea eliminar este registro de pedido de forma permanente?",
    confirm_cancel_order: "¿Está seguro de que desea cancelar este pedido?",
    error_update_status: "Error al actualizar el estado del pedido",
    error_delete_order: "Error al eliminar el pedido",
    error_remove_ing: "Error al quitar el ingrediente",
    alert_valid_cost_qty: "Por favor ingrese un costo válido (0 o mayor) y cantidad (mayor a 0)",
    alert_copied_list: "¡Lista de compras copiada al portapapeles con éxito!",
    alert_copied_failed: "Error al copiar. Aquí está la lista de texto:\n\n",
    shopping_list_header: "LISTA DE COMPRAS Y ESTIMACIÓN DE MATERIALES",
    shopping_list_generated: "Generada:",
    planned_batches: "Lotes de Horneado Planificados:",
    consolidated_materials: "Materiales Consolidados para Abastecerse:",
    total_est_cost: "Costo Total Estimado de Materiales:",
  }
};

let currentLanguage = localStorage.getItem('admin_lang') || 'en';

function t(key, defaultValue = '') {
  const dict = TRANSLATIONS[currentLanguage];
  if (dict && dict[key] !== undefined) {
    return dict[key];
  }
  return defaultValue || key;
}

function applyTranslations() {
  // Translate static text elements
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    el.textContent = t(key);
  });

  // Translate placeholders
  document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
    const key = el.getAttribute('data-translate-placeholder');
    el.placeholder = t(key);
  });

  // Update language selector active buttons
  const btnEn = document.getElementById('lang-btn-en');
  const btnEs = document.getElementById('lang-btn-es');
  if (btnEn && btnEs) {
    if (currentLanguage === 'en') {
      btnEn.classList.add('active');
      btnEs.classList.remove('active');
    } else {
      btnEs.classList.add('active');
      btnEn.classList.remove('active');
    }
  }

  // Update dynamic elements currently rendered by triggering re-render if active
  if (token) {
    loadStats();
    loadOrders();
    loadIngredients();
    loadRecipes();
    loadDessertsPricing();
  }
}

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('admin_lang', currentLanguage);
  applyTranslations();
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  if (token) {
    showDashboard();
  } else {
    showLogin();
  }

  // Setup login form submission
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  
  // Toggle recipe amount input based on unit
  const recipeUnitSelect = document.getElementById('recipe-ing-unit');
  if (recipeUnitSelect) {
    recipeUnitSelect.addEventListener('change', (e) => {
      const unit = e.target.value;
      const numInput = document.getElementById('recipe-ing-amount');
      const fractionContainer = document.getElementById('recipe-ing-amount-fraction-container');
      
      if (unit === 'tsp' || unit === 'tbsp') {
        numInput.classList.add('hidden');
        numInput.removeAttribute('required');
        
        fractionContainer.classList.remove('hidden');
      } else {
        numInput.classList.remove('hidden');
        numInput.setAttribute('required', 'true');
        
        fractionContainer.classList.add('hidden');
      }
    });
  }

  // Populate sections when a dessert is selected
  const dessertSelect = document.getElementById('recipe-dessert-select');
  if (dessertSelect) {
    dessertSelect.addEventListener('change', (e) => {
      updateRecipePartOptions(e.target.value);
    });
  }

  // Toggle new section input field when create new is chosen
  const partSelect = document.getElementById('recipe-ing-part-select');
  if (partSelect) {
    partSelect.addEventListener('change', () => {
      toggleNewRecipePartField();
    });
  }
  
  // Request notification permissions
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCostBreakdownModal();
  });
});

function showLogin() {
  document.getElementById('login-container').classList.remove('hidden');
  document.getElementById('dashboard-container').classList.add('hidden');
  document.getElementById('logout-btn').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('dashboard-container').classList.remove('hidden');
  document.getElementById('logout-btn').classList.remove('hidden');
  
  // Load data
  loadStats();
  loadOrders();
  
  // Connect WebSocket for real-time notifications
  connectWebSocket();
}

async function handleLogin(e) {
  e.preventDefault();
  const password = document.getElementById('admin-password').value;
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    const result = await response.json();
    
    if (!response.ok) throw new Error(result.error || 'Login failed');
    
    token = result.token;
    localStorage.setItem('adminToken', token);
    showDashboard();
    
  } catch (err) {
    alert(err.message);
  }
}

function handleLogout() {
  token = null;
  localStorage.removeItem('adminToken');
  if (socket) {
    socket.close();
  }
  showLogin();
}

// Fetch stats and render progress charts
async function loadStats() {
  try {
    const response = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }
    
    if (!response.ok) throw new Error('Failed to fetch stats');
    
    const stats = await response.json();
    renderStats(stats);
  } catch (err) {
    console.error(err);
  }
}

function renderStats(stats) {
  // Update overview stats
  document.getElementById('stats-sales-today').textContent = `$${stats.sales.today.toFixed(2)}`;
  document.getElementById('stats-sales-month').textContent = `$${stats.sales.month.toFixed(2)}`;
  document.getElementById('stats-sales-year').textContent = `$${stats.sales.year.toFixed(2)}`;

  // Render Dessert quantities bars
  const itemsContainer = document.getElementById('item-sales-bars');
  itemsContainer.innerHTML = '';
  const itemSalesArray = Object.entries(stats.itemSales).map(([id, data]) => ({ id, ...data }));
  const maxItemCount = Math.max(...itemSalesArray.map(item => item.count), 1);

  if (itemSalesArray.length === 0) {
    itemsContainer.innerHTML = `<div class="text-center" style="font-size: 13px; color: var(--text-muted);">${t('no_sales_data', 'No sales data yet')}</div>`;
  } else {
    // Sort descending
    itemSalesArray.sort((a, b) => b.count - a.count).forEach(item => {
      const pct = (item.count / maxItemCount) * 100;
      const row = document.createElement('div');
      row.className = 'chart-bar-row';
      row.innerHTML = `
        <div class="chart-bar-label-container">
          <span class="chart-bar-name">${t(item.id, item.name)}</span>
          <span class="chart-bar-value">${item.count} ${currentLanguage === 'es' ? 'vendidos' : 'sold'}</span>
        </div>
        <div class="chart-bar-outer">
          <div class="chart-bar-inner" style="width: ${pct}%"></div>
        </div>
      `;
      itemsContainer.appendChild(row);
    });
  }

  // Render Topping popularity bars
  const toppingsContainer = document.getElementById('topping-popularity-bars');
  toppingsContainer.innerHTML = '';
  const toppingsArray = Object.entries(stats.toppingPopularity).map(([name, count]) => ({ name, count }));
  const maxToppingCount = Math.max(...toppingsArray.map(t => t.count), 1);

  if (toppingsArray.length === 0) {
    toppingsContainer.innerHTML = `<div class="text-center" style="font-size: 13px; color: var(--text-muted);">${t('no_toppings_sold', 'No toppings sold yet')}</div>`;
  } else {
    // Sort descending
    toppingsArray.sort((a, b) => b.count - a.count).forEach(topping => {
      const pct = (topping.count / maxToppingCount) * 100;
      const row = document.createElement('div');
      row.className = 'chart-bar-row';
      
      // Capitalize topping name
      const transTopping = t(topping.name.toLowerCase(), topping.name);
      const formattedName = transTopping.charAt(0).toUpperCase() + transTopping.slice(1);
      row.innerHTML = `
        <div class="chart-bar-label-container">
          <span class="chart-bar-name">${formattedName}</span>
          <span class="chart-bar-value">${topping.count} ${currentLanguage === 'es' ? 'veces' : 'times'}</span>
        </div>
        <div class="chart-bar-outer">
          <div class="chart-bar-inner" style="width: ${pct}%"></div>
        </div>
      `;
      toppingsContainer.appendChild(row);
    });
  }
}

// Fetch and load orders list
async function loadOrders() {
  try {
    const response = await fetch('/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }
    
    if (!response.ok) throw new Error('Failed to fetch orders');
    
    const orders = await response.json();
    renderOrders(orders);
  } catch (err) {
    console.error(err);
    document.getElementById('orders-tbody').innerHTML = 
      `<tr><td colspan="8" class="text-center" style="color: red;">Error: ${err.message}</td></tr>`;
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById('orders-tbody');
  const ordersLabel = currentLanguage === 'es' ? 'Pedido' : 'Order';
  const ordersSuffix = orders.length !== 1 ? (currentLanguage === 'es' ? 's' : 's') : '';
  document.getElementById('order-count').textContent = `${orders.length} ${ordersLabel}${ordersSuffix}`;
  tbody.innerHTML = '';

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 40px; color: var(--text-muted);">${t('no_orders_yet', 'No orders recorded yet.')}</td></tr>`;
    return;
  }

  orders.forEach(order => {
    const tr = document.createElement('tr');
    
    const dateStr = new Date(order.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const parsedToppings = order.toppings ? JSON.parse(order.toppings) : [];
    const toppingsFormatted = parsedToppings.length > 0 
      ? parsedToppings.map(tKey => {
          const trans = t(tKey.toLowerCase());
          return trans.charAt(0).toUpperCase() + trans.slice(1);
        }).join(', ') 
      : t('none', 'None');
      
    // Format dessert title nicely with translations lookup
    let dessertTitle = t(order.dessert_id);
    if (dessertTitle === order.dessert_id) {
      // Fallback formatting if key is not translated
      dessertTitle = order.dessert_id.replace('_', ' ');
      dessertTitle = dessertTitle.charAt(0).toUpperCase() + dessertTitle.slice(1);
    }

    // Format size
    const sizeFormatted = t(order.size, order.size);

    // Pricing display — TBD orders get an inline price setter
    const priceDisplay = order.total_price === null
      ? `<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
           <span style="color:var(--text-muted); font-style:italic; font-size:12px;">TBD</span>
           <div style="display:flex; align-items:center; gap:4px;">
             <span style="font-size:12px; color:var(--text-muted);">$</span>
             <input
               id="price-input-${order.id}"
               type="number"
               min="0"
               step="0.01"
               placeholder="0.00"
               style="width:72px; padding:4px 6px; border:1px solid var(--border); border-radius:6px; font-size:13px; font-family:inherit;"
             />
             <button
               onclick="setOrderPrice(${order.id})"
               style="padding:4px 10px; background:var(--primary); color:#fff; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;"
             >✓ Set</button>
           </div>
         </div>`
      : `$${order.total_price.toFixed(2)}`;

    // Status action buttons
    let actionButtons = '';
    if (order.status === 'pending') {
      actionButtons = `
        <button class="btn-action btn-complete" onclick="updateStatus(${order.id}, 'completed')">${t('action_complete', 'Complete')}</button>
        <button class="btn-action btn-cancel" onclick="updateStatus(${order.id}, 'cancelled')">${t('action_cancel', 'Cancel')}</button>
      `;
    } else {
      actionButtons = `
        <button class="btn-action btn-delete" onclick="deleteOrder(${order.id})">${t('action_delete_log', 'Delete Log')}</button>
      `;
    }

    tr.innerHTML = `
      <td>#${order.id}</td>
      <td>${dateStr}</td>
      <td>
        <div class="order-customer-info">
          <strong>${order.customer_name}</strong>
          <span class="order-customer-phone">${order.customer_phone}</span>
          <span class="order-customer-email">${order.customer_email}</span>
        </div>
      </td>
      <td>
        <div class="order-details-title">${dessertTitle} (${sizeFormatted})</div>
        <div class="order-details-sub"><strong>Toppings:</strong> ${toppingsFormatted}</div>
        ${order.notes ? `<div class="order-details-sub" style="margin-top: 4px; font-style: italic;">"${order.notes}"</div>` : ''}
      </td>
      <td>
        <span style="font-weight: 500; font-size: 13px; text-transform: capitalize;">${t(order.pickup_delivery.toLowerCase(), order.pickup_delivery)}</span>
      </td>
      <td>
        <strong>${priceDisplay}</strong>
        ${order.cost_of_making !== undefined && order.cost_of_making !== null ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; font-weight: normal;">${t('cost_label', 'Cost:')} $${order.cost_of_making.toFixed(2)}</div>` : ''}
      </td>
      <td>
        <span class="status-badge ${order.status}">${t(order.status.toLowerCase(), order.status)}</span>
      </td>
      <td>
        <div class="order-actions">
          ${actionButtons}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function setOrderPrice(orderId) {
  const input = document.getElementById(`price-input-${orderId}`);
  const val = parseFloat(input ? input.value : '');
  if (!input || isNaN(val) || val < 0) {
    alert('Please enter a valid price (e.g. 15.00)');
    return;
  }

  try {
    const resp = await fetch(`/api/admin/orders/${orderId}/price`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ price: val })
    });
    if (!resp.ok) throw new Error('Failed');
    await loadOrders();
    await loadStats();
  } catch (err) {
    alert('Failed to set price. Please try again.');
    console.error(err);
  }
}

async function updateStatus(orderId, status) {
  if (status === 'cancelled' && !confirm(t('confirm_cancel_order', 'Are you sure you want to cancel this order?'))) {
    return;
  }

  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error(t('error_update_status', 'Failed to update order status'));
    
    loadOrders();
    loadStats();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteOrder(orderId) {
  if (!confirm(t('confirm_delete_order', 'Are you sure you want to permanently delete this order log?'))) return;

  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(t('error_delete_order', 'Failed to delete order'));
    
    loadOrders();
    loadStats();
  } catch (err) {
    alert(err.message);
  }
}

// Real-time WebSocket handlers
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws?type=admin`;
  
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    updateConnectionIndicator(true, 'Connected (Real-time Active)');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_order') {
        playDingSound();
        loadOrders();
        loadStats();
        
        // Show Browser Notification
        showBrowserNotification(data.order);
      } else if (data.type === 'order_updated' || data.type === 'order_deleted') {
        loadOrders();
        loadStats();
      }

    } catch (e) {
      console.error(e);
    }
  };

  socket.onclose = () => {
    updateConnectionIndicator(false, 'Disconnected (Reconnecting...)');
    // Try reconnecting in 5 seconds
    setTimeout(connectWebSocket, 5000);
  };

  socket.onerror = (err) => {
    console.error('WebSocket error:', err);
    socket.close();
  };
}

function updateConnectionIndicator(isOnline, text) {
  const indicator = document.getElementById('connection-indicator');
  const label = document.getElementById('connection-text');
  
  if (isOnline) {
    indicator.className = 'status-indicator online';
    label.textContent = text;
  } else {
    indicator.className = 'status-indicator offline';
    label.textContent = text;
  }
}

function playDingSound() {
  const audio = document.getElementById('ding-audio');
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.warn('Audio auto-play blocked by browser. Click page to enable audio.'));
  }
}

function showBrowserNotification(order) {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    let dessertTitle = order.dessert_id.replace('_', ' ');
    dessertTitle = dessertTitle.charAt(0).toUpperCase() + dessertTitle.slice(1);
    
    const notification = new Notification(`New Order Placed! 🎉`, {
      body: `${order.customer_name} ordered ${dessertTitle} (${order.size}) for ${order.pickup_delivery}.`,
      icon: '/favicon.ico'
    });
    
    notification.onclick = () => {
      window.focus();
    };
  }
}

// Test trigger to make all connected devices ding
async function sendTestPing() {
  const btn = document.getElementById('test-ping-btn');
  btn.disabled = true;
  btn.innerHTML = '⚡ Sending Chime...';
  
  try {
    const response = await fetch('/api/admin/ping', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to trigger ping');
    
    alert(`Success: Chime signal sent! Devices notified: ${result.pingsSent}`);
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🔊</span> Test Phone Chime';
  }
}

// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(tabId).classList.remove('hidden');
  if (tabId === 'orders-tab') {
    document.getElementById('tab-btn-orders').classList.add('active');
  } else if (tabId === 'ingredients-tab') {
    document.getElementById('tab-btn-ingredients').classList.add('active');
    loadIngredients();
  } else if (tabId === 'recipes-tab') {
    document.getElementById('tab-btn-recipes').classList.add('active');
    loadRecipes();
    populateRecipeDessertsDropdown();
  } else if (tabId === 'pricing-tab') {
    document.getElementById('tab-btn-pricing').classList.add('active');
    loadDessertsPricing();
  }
}

let dessertsCache = [];

async function fetchDessertsCache(force = false) {
  if (dessertsCache.length === 0 || force) {
    try {
      const response = await fetch('/api/desserts');
      if (response.ok) {
        dessertsCache = await response.json();
      }
    } catch (e) {
      console.error('Failed to fetch desserts cache:', e);
    }
  }
}

// ==========================================
// Tab 2: Ingredient Cost Manager (Inventory)
// ==========================================

async function loadIngredients() {
  try {
    await fetchDessertsCache();

    // Fetch recipe ingredients (usage) to sum base batch costs
    const recipesResponse = await fetch('/api/admin/recipes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const recipeIngredients = recipesResponse.ok ? await recipesResponse.json() : [];

    // Fetch inventory ingredients (pricing)
    const response = await fetch('/api/admin/ingredients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }
    
    if (!response.ok) throw new Error('Failed to fetch ingredients');
    
    const ingredients = await response.json();
    renderIngredients(ingredients, recipeIngredients);
  } catch (err) {
    console.error(err);
    document.getElementById('ingredients-tbody').innerHTML = 
      `<tr><td colspan="5" class="text-center" style="color: red;">Error: ${err.message}</td></tr>`;
  }
}

function renderIngredients(ingredients, recipeIngredients) {
  const tbody = document.getElementById('ingredients-tbody');
  tbody.innerHTML = '';
  
  if (ingredients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">${t('no_ingredients')}</td></tr>`;
    renderRecipeCostsList({}, 'recipe-costs-list');
    return;
  }
  
  ingredients.forEach(ing => {
    const tr = document.createElement('tr');
    tr.dataset.id = ing.id;
    tr.dataset.name = ing.name;
    tr.dataset.unit = ing.unit;
    tr.dataset.tax = ing.tax_rate || 0.0;
    
    tr.innerHTML = `
      <td><strong>${ing.name}</strong></td>
      <td>
        $ <input type="number" class="cost-input" value="${ing.bulk_cost.toFixed(2)}" readonly step="0.01">
      </td>
      <td>
        <input type="number" class="cost-input" value="${ing.bulk_qty}" readonly step="0.01">
      </td>
      <td>
        <span class="status-badge ${ing.tax_rate > 0 ? 'cancelled' : 'completed'}" style="font-size: 11px;">
          ${((ing.tax_rate || 0.0) * 100).toFixed(1)}%
        </span>
      </td>
      <td>
        <span class="status-badge completed" style="font-size: 11px;">${ing.unit}</span>
      </td>
      <td>
        <button class="btn-action btn-complete" onclick="editIngredientRow(this, ${ing.id})">${t('action_edit')}</button>
        <button class="btn-action btn-reset" onclick="resetIngredientCost(${ing.id})">${t('action_reset')}</button>
        <button class="btn-action btn-delete" onclick="deleteIngredient(${ing.id})">${t('action_delete')}</button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  // Calculate base batch costs for each recipe using inventory unit prices
  const costMap = {};
  ingredients.forEach(item => {
    const costWithTax = item.bulk_cost * (1 + (item.tax_rate || 0.0));
    costMap[item.name.toLowerCase().trim()] = costWithTax / item.bulk_qty;
  });
  
  const baseCosts = {};
  dessertsCache.forEach(d => {
    baseCosts[d.id] = 0;
  });
  
  recipeIngredients.forEach(ing => {
    if (!ing.is_topping) {
      const nameLower = ing.ingredient_name.toLowerCase().trim();
      const unitCost = costMap[nameLower] || 0.0;
      const inventoryItem = ingredients.find(item => item.name.toLowerCase().trim() === nameLower);
      const inventoryUnit = inventoryItem ? inventoryItem.unit : 'g';
      const convertedAmount = convertRecipeAmountToInventoryUnit(ing.ingredient_name, ing.amount, ing.unit, inventoryUnit);
      baseCosts[ing.dessert_id] += convertedAmount * unitCost;
    }
  });
  
  renderRecipeCostsList(baseCosts, 'recipe-costs-list', ingredients);
}

// Returns the area (sq inches) for a mold string, or null for special batches
function getMoldArea(moldStr) {
  if (!moldStr) return null;
  const m = moldStr.toLowerCase().trim();
  if (m === '9x9') return 81;
  if (m === '11x7') return 77;
  if (m === '8x5') return 40;
  if (m === '8x8') return 64;
  if (m === '9x13') return 117;
  return null; // e.g. '1 Batch', rolls
}

function renderRecipeCostsList(baseCosts, containerId, inventoryItems) {
  const listContainer = document.getElementById(containerId);
  if (!listContainer) return;
  listContainer.innerHTML = '';

  const inv = inventoryItems || inventoryCache || [];

  dessertsCache.forEach(d => {
    const baseCost = baseCosts[d.id] || 0;
    const baseMold = d.base_mold || '9x9';
    const baseArea = getMoldArea(baseMold);
    const isRolls = (d.id === 'cinnamon_rolls');

    // Compute multipliers relative to the recipe's base
    const area8x5 = 40;
    const area8x8 = 64;
    const mult8x5 = baseArea ? (area8x5 / baseArea) : 1.0;
    const mult8x8 = baseArea ? (area8x8 / baseArea) : 1.0;

    const cost8x5 = baseCost * mult8x5;
    const cost8x8 = baseCost * mult8x8;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'recipe-cost-item';
    itemDiv.style.flexDirection = 'column';
    itemDiv.style.alignItems = 'stretch';
    itemDiv.style.gap = '8px';

    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center;';
    headerRow.innerHTML = `
      <span class="recipe-cost-name" style="font-size:13px;">${d.name}</span>
      <span style="font-size:11px; color:var(--text-muted);" title="${currentLanguage === 'es' ? 'Haz clic en un tamaño para ver desglose' : 'Click a size for breakdown'}">🔍</span>
    `;
    itemDiv.appendChild(headerRow);

    if (isRolls) {
      // For rolls just show base cost with no mold sizing
      const rollRow = document.createElement('div');
      rollRow.style.cssText = 'display:flex; justify-content:center;';
      rollRow.innerHTML = `
        <button class="recipe-size-pill" style="background:var(--primary); color:#fff;" onclick="openCostBreakdownModal(${JSON.stringify(JSON.stringify(d))}, 1.0, 'Base')">
          <span>Base (1 Roll)</span>
          <span>$${baseCost.toFixed(2)}</span>
        </button>
      `;
      itemDiv.appendChild(rollRow);
    } else {
      const sizesRow = document.createElement('div');
      sizesRow.style.cssText = 'display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;';

      const makeBtn = (label, cost, mult, sizeLabel) => {
        const btn = document.createElement('button');
        btn.className = 'recipe-size-pill';
        btn.innerHTML = `<span style="font-size:10px; font-weight:600; opacity:0.85;">${label}</span><span style="font-size:13px; font-weight:700;">$${cost.toFixed(2)}</span>`;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCostBreakdownModal(d, mult, sizeLabel);
        });
        return btn;
      };

      sizesRow.appendChild(makeBtn(`Base (${baseMold})`, baseCost, 1.0, `Base (${baseMold})`));
      sizesRow.appendChild(makeBtn('8×5', cost8x5, mult8x5, '8×5'));
      sizesRow.appendChild(makeBtn('8×8', cost8x8, mult8x8, '8×8'));
      itemDiv.appendChild(sizesRow);
    }

    listContainer.appendChild(itemDiv);
  });
}

function openCostBreakdownModal(dessert, sizeMultiplier, sizeLabel) {
  // dessert may arrive as a double-stringified JSON when called from onclick attr
  if (typeof dessert === 'string') {
    try { dessert = JSON.parse(dessert); } catch(e) {}
  }

  const mult = (sizeMultiplier !== undefined && sizeMultiplier !== null) ? Number(sizeMultiplier) : 1.0;
  const label = sizeLabel || 'Base';

  const modal = document.getElementById('cost-breakdown-modal');
  const title = document.getElementById('cb-modal-title');
  const tbody = document.getElementById('cb-modal-tbody');
  const totalEl = document.getElementById('cb-modal-total');

  if (!modal) return;

  title.innerHTML = `${dessert.name} <span style="font-size:13px; font-weight:500; color:var(--text-muted); background:#f3f4f6; padding:3px 9px; border-radius:999px; margin-left:8px; white-space:nowrap;">${label}</span>`;
  tbody.innerHTML = '';

  const costMap = {};
  const unitMap = {};
  inventoryCache.forEach(item => {
    const nameLower = item.name.toLowerCase().trim();
    const costWithTax = item.bulk_cost * (1 + (item.tax_rate || 0.0));
    costMap[nameLower] = costWithTax / item.bulk_qty;
    unitMap[nameLower] = item.unit || 'g';
  });

  const ingredients = recipeIngredientsCache.filter(ing => ing.dessert_id === dessert.id && !ing.is_topping);
  let grandTotal = 0;

  if (ingredients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:24px; color:var(--text-muted); font-style:italic;">${currentLanguage === 'es' ? 'Sin ingredientes aún' : 'No ingredients yet'}</td></tr>`;
  } else {
    const parts = {};
    ingredients.forEach(ing => {
      const part = ing.recipe_part || 'Main';
      if (!parts[part]) parts[part] = [];
      parts[part].push(ing);
    });

    Object.keys(parts).forEach(part => {
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `<td colspan="3" style="font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); padding:10px 8px 4px; background:#f9fafb;">${part}</td>`;
      tbody.appendChild(headerRow);

      parts[part].forEach(ing => {
        const nameLower = ing.ingredient_name.toLowerCase().trim();
        const unitCost = costMap[nameLower] || 0.0;
        const inventoryUnit = unitMap[nameLower] || 'g';
        // Scale the ingredient amount by the mold-size multiplier
        const scaledAmount = ing.amount * mult;
        const convertedAmount = convertRecipeAmountToInventoryUnit(ing.ingredient_name, scaledAmount, ing.unit, inventoryUnit);
        const cost = convertedAmount * unitCost;
        grandTotal += cost;

        const displayAmount = formatIngredientAmount(scaledAmount, ing.unit);
        const hasPrice = unitCost > 0;

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border)';
        tr.innerHTML = `
          <td style="padding:10px 8px;">
            <span style="font-weight:500;">${ing.ingredient_name}</span>
          </td>
          <td style="padding:10px 8px; text-align:right; color:var(--text-muted); font-size:13px;">
            ${displayAmount} ${ing.unit}
          </td>
          <td style="padding:10px 8px; text-align:right; font-weight:600; color:${hasPrice ? 'var(--primary)' : 'var(--text-muted)'};">
            ${hasPrice ? `$${cost.toFixed(2)}` : '—'}
          </td>
        `;
        tbody.appendChild(tr);
      });
    });
  }

  totalEl.textContent = `$${grandTotal.toFixed(2)}`;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  modal.onclick = (e) => { if (e.target === modal) closeCostBreakdownModal(); };
}


function closeCostBreakdownModal() {
  const modal = document.getElementById('cost-breakdown-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}


function editIngredientRow(btn, id) {
  const tr = btn.closest('tr');
  const inputs = tr.querySelectorAll('.cost-input');
  
  // Make cost and qty editable
  inputs.forEach(input => {
    input.removeAttribute('readonly');
    input.dataset.original = input.value;
  });
  
  // Replace the tax column with a select dropdown
  const taxCell = tr.cells[3];
  const currentTax = parseFloat(tr.dataset.tax || 0.0);
  taxCell.innerHTML = `
    <select class="tax-select cost-input" style="padding: 4px 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; background: white; width: 100%; box-sizing: border-box;">
      <option value="0" ${currentTax === 0 ? 'selected' : ''}>0%</option>
      <option value="0.115" ${Math.abs(currentTax - 0.115) < 0.01 ? 'selected' : ''}>11.5%</option>
    </select>
  `;
  
  // Replace the unit column with a select dropdown
  const unitCell = tr.cells[4];
  const currentUnit = tr.dataset.unit;
  unitCell.innerHTML = `
    <select class="unit-select cost-input" style="padding: 4px 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; background: white; width: 100%; box-sizing: border-box;">
      <option value="g" ${currentUnit === 'g' ? 'selected' : ''}>g (Grams)</option>
      <option value="oz">oz (Ounces)</option>
      <option value="lb">lb (Pounds)</option>
      <option value="fl oz">fl oz (Fluid Oz)</option>
      <option value="ml" ${currentUnit === 'ml' ? 'selected' : ''}>ml (Milliliters)</option>
      <option value="dz">dz (Dozen)</option>
      <option value="unit" ${currentUnit === 'unit' ? 'selected' : ''}>unit (Whole)</option>
    </select>
  `;
  
  inputs[0].focus();
  inputs[0].select();
  
  // Replace buttons
  const actionsCell = btn.parentNode;
  actionsCell.innerHTML = `
    <button class="btn-action btn-complete" onclick="saveIngredientCost(this, ${id})">${t('action_save')}</button>
    <button class="btn-action btn-cancel" onclick="cancelEditIngredientRow(this)">${t('btn_cancel')}</button>
  `;
}

function cancelEditIngredientRow(btn) {
  const tr = btn.closest('tr');
  const inputs = tr.querySelectorAll('.cost-input');
  
  inputs.forEach(input => {
    input.value = input.dataset.original;
    input.setAttribute('readonly', 'true');
  });
  
  // Restore tax badge
  const taxCell = tr.cells[3];
  const taxVal = parseFloat(tr.dataset.tax) || 0.0;
  taxCell.innerHTML = `
    <span class="status-badge ${taxVal > 0 ? 'cancelled' : 'completed'}" style="font-size: 11px;">
      ${(taxVal * 100).toFixed(1)}%
    </span>
  `;
  
  // Restore unit badge
  const unitCell = tr.cells[4];
  unitCell.innerHTML = `<span class="status-badge completed" style="font-size: 11px;">${tr.dataset.unit}</span>`;
  
  // Restore action buttons
  const actionsCell = btn.parentNode;
  const id = tr.dataset.id;
  actionsCell.innerHTML = `
    <button class="btn-action btn-complete" onclick="editIngredientRow(this, ${id})">${t('action_edit')}</button>
    <button class="btn-action btn-reset" onclick="resetIngredientCost(${id})">${t('action_reset')}</button>
    <button class="btn-action btn-delete" onclick="deleteIngredient(${id})">${t('action_delete')}</button>
  `;
}

async function saveIngredientCost(btn, id) {
  const tr = btn.closest('tr');
  const inputs = tr.querySelectorAll('.cost-input');
  const newCost = parseFloat(inputs[0].value);
  const newQty = parseFloat(inputs[1].value);
  const selectedTax = parseFloat(tr.querySelector('.tax-select').value);
  const selectedUnit = tr.querySelector('.unit-select').value;
  
  if (isNaN(newCost) || newCost < 0 || isNaN(newQty) || newQty <= 0) {
    alert(t('alert_valid_cost_qty'));
    return;
  }
  
  const confirmChange = confirm(t('confirm_change_ing'));
  if (!confirmChange) {
    return;
  }

  // Convert unit to standard recipe units (g, ml, unit)
  let finalQty = newQty;
  let finalUnit = selectedUnit;
  
  if (selectedUnit === 'oz') {
    finalQty = newQty * 28.3495;
    finalUnit = 'g';
  } else if (selectedUnit === 'lb') {
    finalQty = newQty * 453.592;
    finalUnit = 'g';
  } else if (selectedUnit === 'fl oz') {
    finalQty = newQty * 29.5735;
    finalUnit = 'ml';
  } else if (selectedUnit === 'dz') {
    finalQty = newQty * 12;
    finalUnit = 'unit';
  }

  finalQty = Math.round(finalQty * 100) / 100; // Round to 2 decimal places
  
  try {
    const response = await fetch(`/api/admin/ingredients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bulk_cost: newCost,
        bulk_qty: finalQty,
        unit: finalUnit,
        tax_rate: selectedTax
      })
    });
    
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to update ingredient cost');
    }
    
    loadIngredients();
    loadOrders();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteIngredient(id) {
  if (!confirm(t('confirm_delete_ing'))) return;

  try {
    const response = await fetch(`/api/admin/ingredients/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to delete ingredient');
    }

    loadIngredients();
    loadOrders();
  } catch (err) {
    alert(err.message);
  }
}

async function resetIngredientCost(id) {
  const tr = document.querySelector(`tr[data-id="${id}"]`);
  const unit = tr ? tr.dataset.unit : 'g';
  
  const confirmChange = confirm(t('confirm_reset_ing'));
  if (!confirmChange) {
    return;
  }
  
  try {
    const response = await fetch(`/api/admin/ingredients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bulk_cost: 0.00,
        bulk_qty: 1.00,
        unit: unit,
        tax_rate: 0.0
      })
    });
    
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to reset ingredient cost');
    }
    
    loadIngredients();
    loadOrders();
  } catch (err) {
    alert(err.message);
  }
}

// ==========================================
// Tab 3: Current Recipes (Formulation)
// ====================================let recipeIngredientsCache = [];
let inventoryCache = [];

async function loadRecipes() {
  try {
    await fetchDessertsCache();
    
    // Fetch recipes usage
    const response = await fetch('/api/admin/recipes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 401 || response.status === 403) {
      handleLogout();
      return;
    }
    
    if (!response.ok) throw new Error('Failed to fetch recipes');
    
    const recipeIngredients = await response.json();
    recipeIngredientsCache = recipeIngredients; // Cache it for calculator
    
    // Fetch inventory costs to compute granular costs per ingredient usage
    const ingResponse = await fetch('/api/admin/ingredients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const inventory = ingResponse.ok ? await ingResponse.json() : [];
    inventoryCache = inventory; // Cache it for calculator
    
    renderRecipes(recipeIngredients, inventory);
    renderStockCalculatorInputs(); // Refresh batch input counters
  } catch (err) {
    console.error(err);
    document.getElementById('recipes-formulation-list').innerHTML = 
      `<div style="color: red; padding: 20px;">Error: ${err.message}</div>`;
  }
}

function renderRecipes(recipeIngredients, inventory) {
  const container = document.getElementById('recipes-formulation-list');
  if (!container) return;
  container.innerHTML = '';
  
  // Group recipe ingredients by dessert_id
  const recipeGroups = {};
  dessertsCache.forEach(d => {
    recipeGroups[d.id] = [];
  });
  
  recipeIngredients.forEach(ing => {
    if (recipeGroups[ing.dessert_id]) {
      recipeGroups[ing.dessert_id].push(ing);
    }
  });
  
  // Create unit cost lookup map (including tax_rate)
  const costMap = {};
  inventory.forEach(item => {
    const costWithTax = item.bulk_cost * (1 + (item.tax_rate || 0.0));
    costMap[item.name.toLowerCase().trim()] = costWithTax / item.bulk_qty;
  });
  
  const baseCosts = {};
  
  dessertsCache.forEach(d => {
    const list = recipeGroups[d.id] || [];
    const sectionCard = document.createElement('div');
    sectionCard.className = 'recipe-section-card';
    
    let tableHtml = '';
    let totalRecipeBaseCost = 0;
    
    if (list.length === 0) {
      tableHtml = `<div style="padding: 10px; color: var(--text-muted); font-style: italic;">${t('no_recipes_yet')}</div>`;
    } else {
      // Group recipe ingredients by recipe_part
      const partsMap = {};
      list.forEach(ing => {
        const part = ing.recipe_part || 'Main';
        if (!partsMap[part]) partsMap[part] = [];
        partsMap[part].push(ing);
      });
      
      tableHtml = `
        <div class="table-responsive">
          <table class="orders-table" id="recipe-table-${d.id}" style="margin-top: 10px;">
            <thead>
              <tr>
                <th>${t('label_ing_name')}</th>
                <th>${t('label_amount')}</th>
                <th>${t('th_unit')}</th>
                <th>${t('th_type', 'Type')}</th>
                <th>${t('cost_in_batch', 'Cost in Batch ($)')}</th>
                <th>${t('th_actions')}</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      // Render parts
      Object.keys(partsMap).forEach(part => {
        const partIngredients = partsMap[part];
        
        // Output part sub-heading row
        tableHtml += `
          <tr class="recipe-part-header">
            <td colspan="6">${t('section_label')} ${part}</td>
          </tr>
        `;
        
        partIngredients.forEach(ing => {
          const nameLower = ing.ingredient_name.toLowerCase().trim();
          const unitCost = costMap[nameLower] || 0.0;
          const inventoryItem = inventory.find(item => item.name.toLowerCase().trim() === nameLower);
          const inventoryUnit = inventoryItem ? inventoryItem.unit : 'g';
          const convertedAmount = convertRecipeAmountToInventoryUnit(ing.ingredient_name, ing.amount, ing.unit, inventoryUnit);
          const computedCost = convertedAmount * unitCost;
          
          if (!ing.is_topping) {
            totalRecipeBaseCost += computedCost;
          }
          
          const typeLabel = ing.is_topping 
            ? `${t('type_topping')} (${t(ing.topping_value.toLowerCase(), ing.topping_value)})` 
            : t('type_base');
          
          const formattedAmount = formatIngredientAmount(ing.amount, ing.unit);
          
          tableHtml += `
            <tr data-id="${ing.id}" data-name="${ing.ingredient_name}" data-unit="${ing.unit}" data-original-amount="${ing.amount}" data-unit-cost="${unitCost}">
              <td><strong>${ing.ingredient_name}</strong></td>
              <td>
                <span class="recipe-amount-text">${formattedAmount}</span>
                <input type="number" class="cost-input recipe-amount-input hidden" value="${ing.amount}" step="0.01" style="width: 80px; text-align: center;">
                <select class="recipe-amount-select hidden" style="width: 80px; padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; background: white;">
                  <option value="0.125">1/8</option>
                  <option value="0.25">1/4</option>
                  <option value="0.33">1/3</option>
                  <option value="0.375">3/8</option>
                  <option value="0.5">1/2</option>
                  <option value="0.625">5/8</option>
                  <option value="0.67">2/3</option>
                  <option value="0.75">3/4</option>
                  <option value="0.875">7/8</option>
                  <option value="1">1</option>
                </select>
              </td>
              <td><code>${ing.unit}</code></td>
              <td><span class="status-badge ${ing.is_topping ? 'cancelled' : 'completed'}" style="font-size: 11px;">${typeLabel}</span></td>
              <td class="recipe-cost-cell">$${computedCost.toFixed(2)}</td>
              <td class="recipe-actions-cell">
                <button class="btn-action btn-complete" onclick="editRecipeRow(this, ${ing.id})">${t('action_edit')}</button>
                <button class="btn-action btn-delete" onclick="deleteRecipeIngredient(${ing.id})">${t('action_remove')}</button>
              </td>
            </tr>
          `;
        });
      });
      
      tableHtml += `
            </tbody>
          </table>
        </div>
      `;
    }
    
    baseCosts[d.id] = totalRecipeBaseCost;
    
    const baseMold = d.base_mold || '9x9';
    const isBatchBased = baseMold.toLowerCase().includes('batch');
    
    let baseMoldHtml = '';
    let scaleSelectHtml = '';
    
    if (isBatchBased) {
      baseMoldHtml = `
        <span style="font-weight: 600; color: var(--primary); font-size: 12px; background: #f3f4f6; padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border);">${t('original_batch')}</span>
      `;
      scaleSelectHtml = `
        <select id="scale-target-${d.id}" onchange="handleScaleDisplay('${d.id}', this.value)" style="padding: 4px 6px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; background: white; font-weight: 600; color: #10b981; cursor: pointer;">
          <option value="original">${t('original_batch')}</option>
          <option value="2_batches">2 ${t('batches')}</option>
          <option value="3_batches">3 ${t('batches')}</option>
          <option value="4_batches">4 ${t('batches')}</option>
          <option value="5_batches">5 ${t('batches')}</option>
          <option value="6_batches">6 ${t('batches')}</option>
        </select>
      `;
    } else {
      baseMoldHtml = `
        <select onchange="updateRecipeBaseMold('${d.id}', this.value)" style="padding: 4px 6px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; background: white; font-weight: 600; color: var(--primary); cursor: pointer;">
          <option value="8x5" ${baseMold === '8x5' ? 'selected' : ''}>8x5</option>
          <option value="8x8" ${baseMold === '8x8' ? 'selected' : ''}>8x8</option>
          <option value="9x9" ${baseMold === '9x9' ? 'selected' : ''}>9x9</option>
          <option value="11x7" ${baseMold === '11x7' ? 'selected' : ''}>11x7</option>
        </select>
      `;
      scaleSelectHtml = `
        <select id="scale-target-${d.id}" onchange="handleScaleDisplay('${d.id}', this.value)" style="padding: 4px 6px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; background: white; font-weight: 600; color: #10b981; cursor: pointer;">
          <option value="original">${t('original')}</option>
          <option value="8x5">8x5 (Selling)</option>
          <option value="8x8">8x8 (Sellable)</option>
          <option value="9x9">9x9</option>
          <option value="11x7">11x7</option>
        </select>
      `;
    }

    sectionCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid var(--border); padding-bottom: 8px; margin-bottom: 12px; flex-wrap: wrap; gap: 12px;">
        <!-- Clickable Title & Caret for Collapse/Expand -->
        <div onclick="toggleRecipeCardCollapse('${d.id}')" style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
          <span id="collapse-icon-${d.id}" style="font-size: 14px; color: var(--text-muted); font-weight: bold; width: 14px; display: inline-block;">▶</span>
          <h4 class="recipe-section-title" style="margin: 0; border: none; padding: 0;">${t(d.id, d.name)}</h4>
        </div>
        
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
          <!-- Permanent Base Mold/Yield Selector -->
          <div style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 500;">${isBatchBased ? t('yield') : t('base_mold')}</span>
            ${baseMoldHtml}
          </div>
          
          <!-- Dynamic Display Scaler -->
          <div style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 500;">${t('scale_to')}</span>
            ${scaleSelectHtml}
            <span id="scale-badge-${d.id}" class="status-badge completed hidden" style="font-size: 11px; font-weight: 600; padding: 2px 6px;">1.0x</span>
          </div>
          
          <span id="base-cost-display-${d.id}" data-original-cost="${totalRecipeBaseCost}" style="font-weight: bold; color: var(--primary); font-size: 14px;">${t('base_cost')}: $${totalRecipeBaseCost.toFixed(2)}</span>
        </div>
      </div>
      
      <!-- Collapsible Body Container (hidden by default) -->
      <div id="recipe-body-${d.id}" class="recipe-card-body hidden" style="transition: all 0.2s ease;">
        ${tableHtml}
      </div>
    `;
    
    container.appendChild(sectionCard);
  });
  
  // Render sidebar costs on recipe tab
  renderRecipeCostsList(baseCosts, 'recipe-costs-list-recipe-tab', inventoryCache);
}

async function populateRecipeDessertsDropdown() {
  const dropdown = document.getElementById('recipe-dessert-select');
  if (!dropdown) return;
  
  await fetchDessertsCache();

  let html = `<option value="">-- ${currentLanguage === 'es' ? 'Seleccionar Postre / Receta' : 'Select Dessert / Recipe'} --</option>`;
  dessertsCache.forEach(d => {
    html += `<option value="${d.id}">${d.name}</option>`;
  });
  dropdown.innerHTML = html;
  updateRecipePartOptions(dropdown.value);
}

function toggleAddRecipeIngredientForm() {
  const card = document.getElementById('add-recipe-ingredient-card');
  if (card) {
    card.classList.toggle('hidden');
  }
}

function toggleRecipeToppingFields(checked) {
  const group = document.getElementById('recipe-ing-topping-value-group');
  if (group) {
    if (checked) {
      group.classList.remove('hidden');
    } else {
      group.classList.add('hidden');
    }
  }
}

async function handleAddRecipeIngredient(e) {
  e.preventDefault();
  const dessert_id = document.getElementById('recipe-dessert-select').value;
  const ingredient_name = document.getElementById('recipe-ing-name').value;
  const unit = document.getElementById('recipe-ing-unit').value;
  
  let amount = 0;
  if (unit === 'tsp' || unit === 'tbsp') {
    const whole = parseInt(document.getElementById('recipe-ing-amount-whole').value) || 0;
    const frac = parseFloat(document.getElementById('recipe-ing-amount-fraction').value) || 0;
    amount = whole + frac;
  } else {
    amount = parseFloat(document.getElementById('recipe-ing-amount').value);
  }
  
  const is_topping = document.getElementById('recipe-ing-is-topping').checked ? 1 : 0;
  const topping_value = is_topping ? document.getElementById('recipe-ing-topping-value').value : null;
  
  const selectPart = document.getElementById('recipe-ing-part-select');
  let recipe_part = selectPart.value;
  if (recipe_part === '__new__') {
    recipe_part = document.getElementById('recipe-ing-part-new').value.trim();
    if (!recipe_part) {
      alert(currentLanguage === 'es' ? 'Por favor ingrese un nombre para la nueva sección' : 'Please enter a name for the new section');
      return;
    }
  }
  if (!recipe_part) recipe_part = 'Main';

  try {
    const response = await fetch('/api/admin/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ dessert_id, ingredient_name, amount, unit, is_topping, topping_value, recipe_part })
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to add recipe ingredient');
    }

    // Reset form fields but keep selected recipe and part to let user input quickly
    document.getElementById('recipe-ing-name').value = '';
    document.getElementById('recipe-ing-amount').value = '';
    document.getElementById('recipe-ing-is-topping').checked = false;
    toggleRecipeToppingFields(false);

    // Refresh lists
    loadRecipes();
    loadOrders();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteRecipeIngredient(id) {
  if (!confirm(t('confirm_remove_recipe_ing'))) return;

  try {
    const response = await fetch(`/api/admin/recipes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || t('error_remove_ing'));
    }

    loadRecipes();
    loadOrders();
  } catch (err) {
    alert(err.message);
  }
}

function editRecipeRow(btn, id) {
  const tr = btn.closest('tr');
  const textSpan = tr.querySelector('.recipe-amount-text');
  const numInput = tr.querySelector('.recipe-amount-input');
  const selectAmount = tr.querySelector('.recipe-amount-select');
  
  if (textSpan) textSpan.classList.add('hidden');
  
  const currentUnit = tr.dataset.unit;
  
  // Replace the unit column with a select dropdown
  const unitCell = tr.cells[2];
  unitCell.innerHTML = `
    <select class="recipe-unit-select" onchange="handleInlineUnitChange(this)" style="padding: 4px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; background: white;">
      <option value="g" ${currentUnit === 'g' ? 'selected' : ''}>g</option>
      <option value="unit" ${currentUnit === 'unit' ? 'selected' : ''}>unit</option>
      <option value="tsp" ${currentUnit === 'tsp' ? 'selected' : ''}>tsp</option>
      <option value="tbsp" ${currentUnit === 'tbsp' ? 'selected' : ''}>tbsp</option>
    </select>
  `;
  
  numInput.dataset.original = numInput.value;
  selectAmount.dataset.original = selectAmount.value;
  
  if (currentUnit === 'tsp' || currentUnit === 'tbsp') {
    selectAmount.classList.remove('hidden');
    // Set current select value to match closest original amount
    const origVal = parseFloat(numInput.value) || 0.5;
    let closestVal = "0.5";
    let minDiff = Infinity;
    Array.from(selectAmount.options).forEach(opt => {
      const optVal = parseFloat(opt.value);
      const diff = Math.abs(origVal - optVal);
      if (diff < minDiff) {
        minDiff = diff;
        closestVal = opt.value;
      }
    });
    selectAmount.value = closestVal;
    selectAmount.focus();
  } else {
    numInput.classList.remove('hidden');
    numInput.focus();
    numInput.select();
  }
  
  const cell = tr.querySelector('.recipe-actions-cell');
  cell.innerHTML = `
    <button class="btn-action btn-complete" onclick="saveRecipeIngredientAmount(this, ${id})">Save</button>
    <button class="btn-action btn-cancel" onclick="cancelEditRecipeRow(this)">Cancel</button>
  `;
}

function handleInlineUnitChange(selectElement) {
  const tr = selectElement.closest('tr');
  const unit = selectElement.value;
  const numInput = tr.querySelector('.recipe-amount-input');
  const selectAmount = tr.querySelector('.recipe-amount-select');

  if (unit === 'tsp' || unit === 'tbsp') {
    numInput.classList.add('hidden');
    selectAmount.classList.remove('hidden');
    
    const currentVal = parseFloat(numInput.value) || 0.5;
    let closestVal = "0.5";
    let minDiff = Infinity;
    Array.from(selectAmount.options).forEach(opt => {
      const optVal = parseFloat(opt.value);
      const diff = Math.abs(currentVal - optVal);
      if (diff < minDiff) {
        minDiff = diff;
        closestVal = opt.value;
      }
    });
    selectAmount.value = closestVal;
  } else {
    numInput.classList.remove('hidden');
    selectAmount.classList.add('hidden');
  }
}

function cancelEditRecipeRow(btn) {
  const tr = btn.closest('tr');
  const textSpan = tr.querySelector('.recipe-amount-text');
  const numInput = tr.querySelector('.recipe-amount-input');
  const selectAmount = tr.querySelector('.recipe-amount-select');
  
  numInput.value = numInput.dataset.original;
  selectAmount.value = selectAmount.dataset.original;
  
  numInput.classList.add('hidden');
  selectAmount.classList.add('hidden');
  if (textSpan) textSpan.classList.remove('hidden');
  
  // Restore unit badge
  const unitCell = tr.cells[2];
  unitCell.innerHTML = `<code>${tr.dataset.unit}</code>`;
  
  const cell = tr.querySelector('.recipe-actions-cell');
  const id = tr.dataset.id;
  cell.innerHTML = `
    <button class="btn-action btn-complete" onclick="editRecipeRow(this, ${id})">${t('action_edit')}</button>
    <button class="btn-action btn-delete" onclick="deleteRecipeIngredient(${id})">${t('action_remove')}</button>
  `;
}

async function saveRecipeIngredientAmount(btn, id) {
  const tr = btn.closest('tr');
  const numInput = tr.querySelector('.recipe-amount-input');
  const selectAmount = tr.querySelector('.recipe-amount-select');
  const selectedUnit = tr.querySelector('.recipe-unit-select').value;
  const ingredientName = tr.dataset.name;
  
  let newAmount = 0;
  if (selectedUnit === 'tsp' || selectedUnit === 'tbsp') {
    newAmount = parseFloat(selectAmount.value);
  } else {
    newAmount = parseFloat(numInput.value);
  }
  
  if (isNaN(newAmount) || newAmount <= 0) {
    alert('Please enter a valid amount greater than 0');
    return;
  }
  
  const confirmChange = confirm(`Are you sure you want to change the amount and unit of '${ingredientName}' in this recipe?`);
  if (!confirmChange) return;
  
  try {
    const response = await fetch(`/api/admin/recipes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: newAmount, unit: selectedUnit })
    });
    
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to update recipe amount');
    }
    
    loadRecipes();
    loadOrders();
  } catch (err) {
    alert(err.message);
  }
}

// ==========================================
// Stock & Shopping Calculator Logic
// ==========================================

function toggleStockCalculator() {
  const container = document.getElementById('stock-calculator-container');
  if (container) {
    container.classList.toggle('hidden');
  }
}

function renderStockCalculatorInputs() {
  const container = document.getElementById('stock-calc-inputs');
  if (!container) return;
  
  // Store the current values of inputs so we don't lose them when refreshing
  const savedValues = {};
  dessertsCache.forEach(d => {
    const input = document.getElementById(`calc-qty-${d.id}`);
    if (input) {
      savedValues[d.id] = parseInt(input.value) || 0;
    }
  });

  container.innerHTML = '';
  
  dessertsCache.forEach(d => {
    const currentVal = savedValues[d.id] !== undefined ? savedValues[d.id] : 0;
    const div = document.createElement('div');
    div.style = "display: flex; flex-direction: column; gap: 6px; padding: 12px; background: #f9fafb; border: 1px solid var(--border); border-radius: var(--radius-sm);";
    div.innerHTML = `
      <label style="font-weight: 500; font-size: 13px; color: var(--text-main);">${d.name}</label>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" class="btn" onclick="adjustCalcQty('${d.id}', -1)" style="padding: 4px 10px; font-size: 14px; border-radius: 4px; background: #e5e7eb; border: none; cursor: pointer; font-weight: bold;">-</button>
        <input type="number" id="calc-qty-${d.id}" value="${currentVal}" min="0" style="width: 60px; text-align: center; padding: 6px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; box-sizing: border-box;" onchange="validateCalcQty(this)">
        <button type="button" class="btn" onclick="adjustCalcQty('${d.id}', 1)" style="padding: 4px 10px; font-size: 14px; border-radius: 4px; background: #e5e7eb; border: none; cursor: pointer; font-weight: bold;">+</button>
        <span style="font-size: 12px; color: var(--text-muted);">batches</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function adjustCalcQty(id, delta) {
  const input = document.getElementById(`calc-qty-${id}`);
  if (input) {
    let val = parseInt(input.value) || 0;
    val = Math.max(0, val + delta);
    input.value = val;
  }
}

function validateCalcQty(input) {
  let val = parseInt(input.value) || 0;
  input.value = Math.max(0, val);
}

function resetStockCalculator() {
  dessertsCache.forEach(d => {
    const input = document.getElementById(`calc-qty-${d.id}`);
    if (input) input.value = 0;
  });
  
  document.getElementById('stock-calc-results').classList.add('hidden');
  document.getElementById('stock-calc-results-tbody').innerHTML = '';
}

function calculateRequiredStock() {
  const tbody = document.getElementById('stock-calc-results-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const totals = {};
  let totalBakingBatches = 0;
  
  // Build lookup costs map (including tax_rate)
  const costMap = {};
  inventoryCache.forEach(item => {
    const costWithTax = item.bulk_cost * (1 + (item.tax_rate || 0.0));
    costMap[item.name.toLowerCase().trim()] = costWithTax / item.bulk_qty;
  });
  
  dessertsCache.forEach(d => {
    const input = document.getElementById(`calc-qty-${d.id}`);
    const batches = parseInt(input ? input.value : 0) || 0;
    if (batches > 0) {
      totalBakingBatches += batches;
      
      // Filter base ingredients (is_topping = 0)
      const ingredients = recipeIngredientsCache.filter(ing => ing.dessert_id === d.id && !ing.is_topping);
      
      ingredients.forEach(ing => {
        const nameTrim = ing.ingredient_name.trim();
        const nameLower = nameTrim.toLowerCase();
        
        // Convert tsp/tbsp to grams for required stock aggregation
        const convertedAmountSingle = convertRecipeAmountToInventoryGrams(ing.ingredient_name, ing.amount, ing.unit);
        const amountNeeded = convertedAmountSingle * batches;
        const unitCost = costMap[nameLower] || 0.0;
        const estimatedCost = amountNeeded * unitCost;
        
        // Find matching inventory item to get target stock unit (e.g. g, ml, unit)
        const inventoryItem = inventoryCache.find(item => item.name.toLowerCase().trim() === nameLower);
        const targetUnit = inventoryItem ? inventoryItem.unit : (ing.unit === 'tsp' || ing.unit === 'tbsp' ? 'g' : ing.unit);

        if (!totals[nameLower]) {
          totals[nameLower] = {
            name: nameTrim,
            amount: 0,
            unit: targetUnit,
            cost: 0
          };
        }
        totals[nameLower].amount += amountNeeded;
        totals[nameLower].cost += estimatedCost;
      });
    }
  });
  
  if (totalBakingBatches === 0) {
    alert('Please select at least 1 batch to calculate stock requirements!');
    return;
  }
  
  // Render results
  const sortedKeys = Object.keys(totals).sort();
  let grandTotalCost = 0;
  
  sortedKeys.forEach(key => {
    const item = totals[key];
    grandTotalCost += item.cost;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.name}</strong></td>
      <td>${Number(item.amount.toFixed(2))}</td>
      <td><span class="status-badge completed" style="font-size: 11px;">${item.unit}</span></td>
      <td><strong>$${item.cost.toFixed(2)}</strong></td>
    `;
    tbody.appendChild(tr);
  });
  
  // Append grand total row
  const totalTr = document.createElement('tr');
  totalTr.style = "background-color: #f9fafb; font-weight: bold; border-top: 2px solid var(--border);";
  totalTr.innerHTML = `
    <td colspan="3" class="text-right" style="padding: 16px;">Total Raw Materials Cost:</td>
    <td style="padding: 16px; color: var(--primary); font-size: 15px;">$${grandTotalCost.toFixed(2)}</td>
  `;
  tbody.appendChild(totalTr);
  
  // Show results pane
  document.getElementById('stock-calc-results').classList.remove('hidden');
}

function copyShoppingListToClipboard() {
  const totals = {};
  const selectedBatches = [];
  
  const costMap = {};
  inventoryCache.forEach(item => {
    const costWithTax = item.bulk_cost * (1 + (item.tax_rate || 0.0));
    costMap[item.name.toLowerCase().trim()] = costWithTax / item.bulk_qty;
  });

  dessertsCache.forEach(d => {
    const input = document.getElementById(`calc-qty-${d.id}`);
    const batches = parseInt(input ? input.value : 0) || 0;
    if (batches > 0) {
      selectedBatches.push(`- ${batches} ${currentLanguage === 'es' ? 'lote(s)' : 'batch(es)'} de ${t(d.id, d.name)}`);
      
      const ingredients = recipeIngredientsCache.filter(ing => ing.dessert_id === d.id && !ing.is_topping);
      ingredients.forEach(ing => {
        const nameTrim = ing.ingredient_name.trim();
        const nameLower = nameTrim.toLowerCase();
        
        const inventoryItem = inventoryCache.find(item => item.name.toLowerCase().trim() === nameLower);
        const inventoryUnit = inventoryItem ? inventoryItem.unit : (ing.unit === 'tsp' || ing.unit === 'tbsp' ? 'g' : ing.unit);

        const convertedAmountSingle = convertRecipeAmountToInventoryUnit(ing.ingredient_name, ing.amount, ing.unit, inventoryUnit);
        const amountNeeded = convertedAmountSingle * batches;
        const unitCost = costMap[nameLower] || 0.0;
        const estimatedCost = amountNeeded * unitCost;
        
        if (!totals[nameLower]) {
          totals[nameLower] = {
            name: nameTrim,
            amount: 0,
            unit: inventoryUnit,
            cost: 0
          };
        }
        totals[nameLower].amount += amountNeeded;
        totals[nameLower].cost += estimatedCost;
      });
    }
  });

  if (selectedBatches.length === 0) return;

  let text = `${t('shopping_list_header')}\n`;
  text += `${t('shopping_list_generated')} ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
  text += `------------------------------------------------\n\n`;
  text += `${t('planned_batches')}\n`;
  text += selectedBatches.join('\n') + `\n\n`;
  text += `${t('consolidated_materials')}\n`;
  
  const sortedKeys = Object.keys(totals).sort();
  let grandTotalCost = 0;
  
  sortedKeys.forEach(key => {
    const item = totals[key];
    grandTotalCost += item.cost;
    text += `- ${item.name}: ${Number(item.amount.toFixed(2))} ${item.unit} (Est. Cost: $${item.cost.toFixed(2)})\n`;
  });
  
  text += `\n${t('total_est_cost')} $${grandTotalCost.toFixed(2)}\n`;
  text += `------------------------------------------------\n`;

  navigator.clipboard.writeText(text)
    .then(() => {
      alert(t('alert_copied_list'));
    })
    .catch(err => {
      console.error('Could not copy shopping list to clipboard:', err);
      alert(t('alert_copied_failed') + text);
    });
}

// ==========================================
// Recipe Pan Mold Scaling Calculations
// ==========================================

const MOLD_AREAS = {
  '8x5': 8 * 5,   // 40 sq in (Selling pan)
  '8x8': 8 * 8,   // 64 sq in (Sellable square)
  '9x9': 9 * 9,   // 81 sq in (Original fruit bar pan)
  '11x7': 11 * 7  // 77 sq in (Original brownie/blondie pan)
};

function getScalingMultiplier(baseMold, targetMold) {
  if (!baseMold || !targetMold || baseMold === targetMold) return 1.0;
  const baseArea = MOLD_AREAS[baseMold];
  const targetArea = MOLD_AREAS[targetMold];
  if (!baseArea || !targetArea) return 1.0;
  return targetArea / baseArea;
}

async function updateRecipeBaseMold(dessertId, baseMold) {
  try {
    const response = await fetch(`/api/admin/desserts/${dessertId}/base-mold`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ base_mold: baseMold })
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to update recipe base mold');
    }

    // Refresh memory cache of desserts and reload recipes display
    await fetchDessertsCache(true); 
    
    // Auto-update display if a scaling selector is currently active
    const scaleSelect = document.getElementById(`scale-target-${dessertId}`);
    if (scaleSelect) {
      handleScaleDisplay(dessertId, scaleSelect.value);
    }
  } catch (err) {
    alert(err.message);
  }
}

function handleScaleDisplay(dessertId, targetMold) {
  const dessert = dessertsCache.find(d => d.id === dessertId);
  if (!dessert) return;

  const baseMold = dessert.base_mold || '9x9';
  let multiplier = 1.0;
  
  if (targetMold !== 'original') {
    if (targetMold.endsWith('_batches')) {
      multiplier = parseFloat(targetMold.split('_')[0]) || 1.0;
    } else {
      multiplier = getScalingMultiplier(baseMold, targetMold);
    }
  }

  // Update multiplier status badge
  const badge = document.getElementById(`scale-badge-${dessertId}`);
  if (badge) {
    if (multiplier === 1.0) {
      badge.classList.add('hidden');
    } else {
      badge.classList.remove('hidden');
      badge.innerText = `${multiplier.toFixed(2)}x`;
    }
  }

  // Auto-expand card if scaled
  const body = document.getElementById(`recipe-body-${dessertId}`);
  const icon = document.getElementById(`collapse-icon-${dessertId}`);
  if (body && body.classList.contains('hidden') && targetMold !== 'original') {
    body.classList.remove('hidden');
    if (icon) icon.innerText = '▼';
  }

  // Multiply ingredients list amounts and costs
  const table = document.getElementById(`recipe-table-${dessertId}`);
  if (table) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      if (row.dataset.originalAmount) {
        const originalAmount = parseFloat(row.dataset.originalAmount);
        const unitCost = parseFloat(row.dataset.unitCost || 0.0);
        const unit = row.dataset.unit || 'g';
        const name = row.dataset.name || '';
        
        const newAmount = originalAmount * multiplier;
        
        const inventoryItem = inventoryCache.find(item => item.name.toLowerCase().trim() === name.toLowerCase().trim());
        const inventoryUnit = inventoryItem ? inventoryItem.unit : 'g';
        
        const convertedNewAmount = convertRecipeAmountToInventoryUnit(name, newAmount, unit, inventoryUnit);
        const newCost = convertedNewAmount * unitCost;

        // Update amount input box value
        const amtInput = row.querySelector('.recipe-amount-input');
        if (amtInput) {
          amtInput.value = Number(newAmount.toFixed(2));
        }

        // Update cost cell text
        const costCell = row.querySelector('.recipe-cost-cell');
        if (costCell) {
          costCell.innerText = `$${newCost.toFixed(2)}`;
        }
      }
    });
  }

  // Update header base cost display
  const costDisplay = document.getElementById(`base-cost-display-${dessertId}`);
  if (costDisplay) {
    const originalCost = parseFloat(costDisplay.dataset.originalCost) || 0.0;
    const scaledCost = originalCost * multiplier;
    costDisplay.innerText = `Base Cost: $${scaledCost.toFixed(2)}`;
  }
}

// Toggle collapse/expand of a single recipe card
function toggleRecipeCardCollapse(dessertId) {
  const body = document.getElementById(`recipe-body-${dessertId}`);
  const icon = document.getElementById(`collapse-icon-${dessertId}`);
  if (!body) return;

  const isHidden = body.classList.contains('hidden');
  if (isHidden) {
    body.classList.remove('hidden');
    if (icon) icon.innerText = '▼';
  } else {
    body.classList.add('hidden');
    if (icon) icon.innerText = '▶';
  }
}

// Expand or Collapse all recipe cards
function toggleAllRecipeCards(expand) {
  dessertsCache.forEach(d => {
    const body = document.getElementById(`recipe-body-${d.id}`);
    const icon = document.getElementById(`collapse-icon-${d.id}`);
    if (body) {
      if (expand) {
        body.classList.remove('hidden');
        if (icon) icon.innerText = '▼';
      } else {
        body.classList.add('hidden');
        if (icon) icon.innerText = '▶';
      }
    }
  });
}

// ==========================================
// Tab 4: Dessert Pricing Manager
// ==========================================

async function loadDessertsPricing() {
  await fetchDessertsCache(true);
  renderDessertsPricing(dessertsCache);
}

function renderDessertsPricing(desserts) {
  const tbody = document.getElementById('pricing-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  desserts.forEach(item => {
    const translatedName = t(item.id);
    
    // Check if cinnamon rolls (which don't use 8x5 or 8x8 molds)
    if (item.id === 'cinnamon_rolls') {
      const rollsInput1 = document.getElementById('roll-price-1');
      const rollsInput4 = document.getElementById('roll-price-4');
      const rollsInput6 = document.getElementById('roll-price-6');
      const rollsInput12 = document.getElementById('roll-price-12');
      
      if (rollsInput1) rollsInput1.value = item.price_1_roll !== null ? item.price_1_roll.toFixed(2) : '';
      if (rollsInput4) rollsInput4.value = item.price_4_pack !== null ? item.price_4_pack.toFixed(2) : '';
      if (rollsInput6) rollsInput6.value = item.price_6_pack !== null ? item.price_6_pack.toFixed(2) : '';
      if (rollsInput12) rollsInput12.value = item.price_12_pack !== null ? item.price_12_pack.toFixed(2) : '';
    } else {
      const tr = document.createElement('tr');
      tr.id = `pricing-row-${item.id}`;

      const p8x5Text = item.price_8x5 !== null ? `$${item.price_8x5.toFixed(2)}` : 'TBD';
      const p9x9Text = item.price_9x9 !== null ? `$${item.price_9x9.toFixed(2)}` : 'TBD';
      const p8x8Text = item.price_8x8 !== null ? `$${item.price_8x8.toFixed(2)}` : 'TBD';
      
      const p8x5Val = item.price_8x5 !== null ? item.price_8x5 : '';
      const p9x9Val = item.price_9x9 !== null ? item.price_9x9 : '';
      const p8x8Val = item.price_8x8 !== null ? item.price_8x8 : '';

      tr.innerHTML = `
        <td>
          <img src="${item.image_url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border);">
        </td>
        <td style="font-weight: 600; color: var(--text-main);">${translatedName}</td>
        <td>
          <span class="price-text price-8x5-text">${p8x5Text}</span>
          <input type="number" class="price-input price-8x5-input hidden" step="0.01" min="0" value="${p8x5Val}" placeholder="TBD" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
        </td>
        <td>
          <span class="price-text price-9x9-text">${p9x9Text}</span>
          <input type="number" class="price-input price-9x9-input hidden" step="0.01" min="0" value="${p9x9Val}" placeholder="TBD" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
        </td>
        <td>
          <span class="price-text price-8x8-text">${p8x8Text}</span>
          <input type="number" class="price-input price-8x8-input hidden" step="0.01" min="0" value="${p8x8Val}" placeholder="TBD" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 6px;">
        </td>
        <td style="text-align: center;">
          <div class="row-actions">
            <button class="btn btn-edit-prices btn-primary" onclick="editDessertPricesRow(this, '${item.id}')" style="padding: 6px 12px; font-size: 13px;">${t('action_edit')}</button>
            <button class="btn btn-save-prices btn-success hidden" onclick="saveDessertPrices(this, '${item.id}')" style="padding: 6px 12px; font-size: 13px; margin-right: 6px;">${t('action_save')}</button>
            <button class="btn btn-cancel-prices btn-danger hidden" onclick="cancelEditDessertPrices(this)" style="padding: 6px 12px; font-size: 13px; background-color: #ef4444;">${t('action_cancel')}</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });
}

function editDessertPricesRow(btn, id) {
  const row = document.getElementById(`pricing-row-${id}`);
  if (!row) return;

  // Toggle classes
  row.querySelectorAll('.price-text').forEach(el => el.classList.add('hidden'));
  row.querySelectorAll('.price-input').forEach(el => el.classList.remove('hidden'));
  
  btn.classList.add('hidden');
  row.querySelector('.btn-save-prices').classList.remove('hidden');
  row.querySelector('.btn-cancel-prices').classList.remove('hidden');
}

function cancelEditDessertPrices(btn) {
  const row = btn.closest('tr');
  if (!row) return;

  // Toggle classes back
  row.querySelectorAll('.price-text').forEach(el => el.classList.remove('hidden'));
  row.querySelectorAll('.price-input').forEach(el => el.classList.add('hidden'));
  
  row.querySelector('.btn-edit-prices').classList.remove('hidden');
  row.querySelector('.btn-save-prices').classList.add('hidden');
  row.querySelector('.btn-cancel-prices').classList.add('hidden');

  // Reset inputs to original values
  row.querySelectorAll('.price-input').forEach(input => {
    input.value = input.defaultValue;
  });
}

async function saveDessertPrices(btn, id) {
  const row = document.getElementById(`pricing-row-${id}`);
  if (!row) return;

  const price8x5Input = row.querySelector('.price-8x5-input');
  const price9x9Input = row.querySelector('.price-9x9-input');
  const price8x8Input = row.querySelector('.price-8x8-input');

  const p8x5 = price8x5Input.value === '' ? null : parseFloat(price8x5Input.value);
  const p9x9 = price9x9Input.value === '' ? null : parseFloat(price9x9Input.value);
  const p8x8 = price8x8Input.value === '' ? null : parseFloat(price8x8Input.value);

  if (p8x5 !== null && isNaN(p8x5)) return alert(currentLanguage === 'es' ? 'Por favor ingrese un precio válido' : 'Please enter a valid price');
  if (p9x9 !== null && isNaN(p9x9)) return alert(currentLanguage === 'es' ? 'Por favor ingrese un precio válido' : 'Please enter a valid price');
  if (p8x8 !== null && isNaN(p8x8)) return alert(currentLanguage === 'es' ? 'Por favor ingrese un precio válido' : 'Please enter a valid price');

  try {
    const response = await fetch(`/api/admin/desserts/${id}/prices`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ price_8x5: p8x5, price_9x9: p9x9, price_8x8: p8x8 })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update prices');
    }

    // Success - reload pricing list
    alert(currentLanguage === 'es' ? 'Precios actualizados con éxito' : 'Prices updated successfully');
    loadDessertsPricing();
  } catch (err) {
    alert(err.message);
  }
}

async function saveCinnamonRollsPrices() {
  const p1 = document.getElementById('roll-price-1').value === '' ? null : parseFloat(document.getElementById('roll-price-1').value);
  const p4 = document.getElementById('roll-price-4').value === '' ? null : parseFloat(document.getElementById('roll-price-4').value);
  const p6 = document.getElementById('roll-price-6').value === '' ? null : parseFloat(document.getElementById('roll-price-6').value);
  const p12 = document.getElementById('roll-price-12').value === '' ? null : parseFloat(document.getElementById('roll-price-12').value);

  if (p1 !== null && isNaN(p1)) return alert(currentLanguage === 'es' ? 'Por favor ingrese un precio válido' : 'Please enter a valid price');
  if (p4 !== null && isNaN(p4)) return alert(currentLanguage === 'es' ? 'Por favor ingrese un precio válido' : 'Please enter a valid price');
  if (p6 !== null && isNaN(p6)) return alert(currentLanguage === 'es' ? 'Por favor ingrese un precio válido' : 'Please enter a valid price');
  if (p12 !== null && isNaN(p12)) return alert(currentLanguage === 'es' ? 'Por favor ingrese un precio válido' : 'Please enter a valid price');

  try {
    const response = await fetch(`/api/admin/desserts/cinnamon_rolls/prices`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        price_8x5: null, 
        price_8x8: null, 
        price_1_roll: p1, 
        price_4_pack: p4, 
        price_6_pack: p6, 
        price_12_pack: p12 
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update prices');
    }

    alert(currentLanguage === 'es' ? 'Precios de rollos de canela actualizados con éxito' : 'Cinnamon rolls prices updated successfully');
    loadDessertsPricing();
  } catch (err) {
    alert(err.message);
  }
}

function convertRecipeAmountToInventoryGrams(ingredientName, amount, recipeUnit) {
  if (recipeUnit !== 'tsp' && recipeUnit !== 'tbsp') {
    return amount;
  }
  const name = ingredientName.toLowerCase().trim();
  let tspToGrams = 4.0; // Default fallback
  
  if (name.includes('flour')) {
    tspToGrams = 2.6;
  } else if (name.includes('sugar')) {
    tspToGrams = 4.2;
  } else if (name.includes('salt')) {
    tspToGrams = 5.7;
  } else if (name.includes('baking powder') || name.includes('baking soda') || name.includes('yeast')) {
    tspToGrams = 4.8;
  } else if (name.includes('butter') || name.includes('oil') || name.includes('milk') || name.includes('water') || name.includes('honey') || name.includes('syrup') || name.includes('cream')) {
    tspToGrams = 4.8; // Liquids / fats
  } else if (name.includes('cocoa')) {
    tspToGrams = 2.5;
  } else if (name.includes('cinnamon') || name.includes('spice') || name.includes('nutmeg') || name.includes('vanilla')) {
    tspToGrams = 2.6; // Spices/extracts
  }

  const multiplier = recipeUnit === 'tbsp' ? 3 : 1;
  return amount * tspToGrams * multiplier;
}

function formatIngredientAmount(amount, unit) {
  if (unit === 'tsp' || unit === 'tbsp') {
    const rounded = Math.round(amount * 1000) / 1000;
    const fractionMap = {
      0.125: '1/8',
      0.25: '1/4',
      0.33: '1/3',
      0.333: '1/3',
      0.375: '3/8',
      0.5: '1/2',
      0.625: '5/8',
      0.67: '2/3',
      0.667: '2/3',
      0.75: '3/4',
      0.875: '7/8',
      1: '1',
      1.5: '1 1/2',
      2: '2',
      3: '3'
    };
    if (fractionMap[rounded] !== undefined) {
      return fractionMap[rounded];
    }
  }
  return amount;
}

function updateRecipePartOptions(dessertId) {
  const select = document.getElementById('recipe-ing-part-select');
  if (!select) return;
  select.innerHTML = '';

  const existingParts = new Set();
  
  if (dessertId) {
    recipeIngredientsCache.forEach(ing => {
      if (ing.dessert_id === dessertId && ing.recipe_part) {
        existingParts.add(ing.recipe_part.trim());
      }
    });
  }

  // Always make sure 'Main' is included
  existingParts.add('Main');

  existingParts.forEach(part => {
    const opt = document.createElement('option');
    opt.value = part;
    opt.textContent = part;
    select.appendChild(opt);
  });

  // Add the "Create New" option
  const newOpt = document.createElement('option');
  newOpt.value = '__new__';
  newOpt.textContent = currentLanguage === 'es' ? '+ Crear Nueva Sección...' : '+ Create New Section...';
  select.appendChild(newOpt);

  // Trigger toggle
  toggleNewRecipePartField();
}

function toggleNewRecipePartField() {
  const select = document.getElementById('recipe-ing-part-select');
  const inputNew = document.getElementById('recipe-ing-part-new');
  if (!select || !inputNew) return;

  if (select.value === '__new__') {
    inputNew.classList.remove('hidden');
    inputNew.setAttribute('required', 'true');
    inputNew.focus();
  } else {
    inputNew.classList.add('hidden');
    inputNew.removeAttribute('required');
    inputNew.value = '';
  }
}

function convertRecipeAmountToInventoryUnit(ingredientName, amount, recipeUnit, inventoryUnit) {
  const name = ingredientName.toLowerCase().trim();
  
  // 1. First, convert recipe amount to grams (if it is tsp, tbsp or g)
  let amountInGrams = amount;
  if (recipeUnit === 'tsp' || recipeUnit === 'tbsp') {
    amountInGrams = convertRecipeAmountToInventoryGrams(ingredientName, amount, recipeUnit);
  }
  
  // 2. Determine grams per unit for this ingredient
  let gramsPerUnit = 50.0; // Default fallback (e.g. eggs)
  if (name.includes('orange') && name.includes('zest')) {
    gramsPerUnit = 6.0; // 1 orange yields 6g of zest
  } else if (name.includes('orange')) {
    gramsPerUnit = 150.0; // 1 whole orange fruit is 150g
  } else if (name.includes('lemon') && name.includes('zest')) {
    gramsPerUnit = 4.0;
  } else if (name.includes('lemon')) {
    gramsPerUnit = 100.0;
  } else if (name.includes('lime') && name.includes('zest')) {
    gramsPerUnit = 3.0;
  } else if (name.includes('lime')) {
    gramsPerUnit = 80.0;
  } else if (name.includes('egg')) {
    gramsPerUnit = 50.0;
  }
  
  // 3. Convert based on inventory unit
  if (inventoryUnit === 'g' || inventoryUnit === 'ml') {
    // If inventory is in grams, and recipe is in units, convert recipe units to grams
    if (recipeUnit === 'unit') {
      return amount * gramsPerUnit;
    }
    // If recipe is already in grams/tsp/tbsp, it's already converted to grams in amountInGrams
    return amountInGrams;
  } else if (inventoryUnit === 'unit') {
    // If inventory is in units, and recipe is in grams/tsp/tbsp, convert grams to units
    if (recipeUnit !== 'unit') {
      return amountInGrams / gramsPerUnit;
    }
    // If both are units, return amount as-is
    return amount;
  }
  
  return amount; // Fallback
}
