let token = localStorage.getItem('adminToken');
let socket = null;

document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    showDashboard();
  } else {
    showLogin();
  }

  // Setup login form submission
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  
  // Request notification permissions
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
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
    itemsContainer.innerHTML = '<div class="text-center" style="font-size: 13px; color: var(--text-muted);">No sales data yet</div>';
  } else {
    // Sort descending
    itemSalesArray.sort((a, b) => b.count - a.count).forEach(item => {
      const pct = (item.count / maxItemCount) * 100;
      const row = document.createElement('div');
      row.className = 'chart-bar-row';
      row.innerHTML = `
        <div class="chart-bar-label-container">
          <span class="chart-bar-name">${item.name}</span>
          <span class="chart-bar-value">${item.count} sold</span>
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
    toppingsContainer.innerHTML = '<div class="text-center" style="font-size: 13px; color: var(--text-muted);">No toppings sold yet</div>';
  } else {
    // Sort descending
    toppingsArray.sort((a, b) => b.count - a.count).forEach(topping => {
      const pct = (topping.count / maxToppingCount) * 100;
      const row = document.createElement('div');
      row.className = 'chart-bar-row';
      
      // Capitalize topping name
      const formattedName = topping.name.charAt(0).toUpperCase() + topping.name.slice(1);
      row.innerHTML = `
        <div class="chart-bar-label-container">
          <span class="chart-bar-name">${formattedName}</span>
          <span class="chart-bar-value">${topping.count} times</span>
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
  document.getElementById('order-count').textContent = `${orders.length} Order${orders.length !== 1 ? 's' : ''}`;
  tbody.innerHTML = '';

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 40px; color: var(--text-muted);">No orders recorded yet.</td></tr>`;
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
      ? parsedToppings.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') 
      : 'None';
      
    // Format dessert title nicely
    let dessertTitle = order.dessert_id.replace('_', ' ');
    dessertTitle = dessertTitle.charAt(0).toUpperCase() + dessertTitle.slice(1);

    // Pricing display
    const priceDisplay = order.total_price === null 
      ? '<span style="color: var(--text-muted); font-style: italic;">TBD</span>' 
      : `$${order.total_price.toFixed(2)}`;

    // Status action buttons
    let actionButtons = '';
    if (order.status === 'pending') {
      actionButtons = `
        <button class="btn-action btn-complete" onclick="updateStatus(${order.id}, 'completed')">Complete</button>
        <button class="btn-action btn-cancel" onclick="updateStatus(${order.id}, 'cancelled')">Cancel</button>
      `;
    } else {
      actionButtons = `
        <button class="btn-action btn-delete" onclick="deleteOrder(${order.id})">Delete Log</button>
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
        <div class="order-details-title">${dessertTitle} (${order.size})</div>
        <div class="order-details-sub"><strong>Toppings:</strong> ${toppingsFormatted}</div>
        ${order.notes ? `<div class="order-details-sub" style="margin-top: 4px; font-style: italic;">"${order.notes}"</div>` : ''}
      </td>
      <td>
        <span style="font-weight: 500; font-size: 13px; text-transform: capitalize;">${order.pickup_delivery}</span>
      </td>
      <td>
        <strong>${priceDisplay}</strong>
        ${order.cost_of_making !== undefined && order.cost_of_making !== null ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; font-weight: normal;">Cost: $${order.cost_of_making.toFixed(2)}</div>` : ''}
      </td>
      <td>
        <span class="status-badge ${order.status}">${order.status}</span>
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

async function updateStatus(orderId, status) {
  if (status === 'cancelled' && !confirm('Are you sure you want to cancel this order?')) {
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

    if (!response.ok) throw new Error('Failed to update order status');
    
    loadOrders();
    loadStats();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteOrder(orderId) {
  if (!confirm('Are you sure you want to permanently delete this order log?')) return;

  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to delete order');
    
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
  }
}

let dessertsCache = [];

async function fetchDessertsCache() {
  if (dessertsCache.length === 0) {
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
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding: 40px; color: var(--text-muted);">No ingredients registered. Build recipes on the 'Current Recipes' tab first!</td></tr>`;
    renderRecipeCostsList({}, 'recipe-costs-list');
    return;
  }
  
  ingredients.forEach(ing => {
    const tr = document.createElement('tr');
    tr.dataset.id = ing.id;
    tr.dataset.name = ing.name;
    tr.dataset.unit = ing.unit;
    
    tr.innerHTML = `
      <td><strong>${ing.name}</strong></td>
      <td>
        $ <input type="number" class="cost-input" value="${ing.bulk_cost.toFixed(2)}" readonly step="0.01">
      </td>
      <td>
        <input type="number" class="cost-input" value="${ing.bulk_qty}" readonly step="0.01">
      </td>
      <td>
        <span class="status-badge completed" style="font-size: 11px;">${ing.unit}</span>
      </td>
      <td>
        <button class="btn-action btn-complete" onclick="editIngredientRow(this, ${ing.id})">Edit</button>
        <button class="btn-action btn-delete" onclick="deleteIngredient(${ing.id})">Delete</button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  // Calculate base batch costs for each recipe using inventory unit prices
  const costMap = {};
  ingredients.forEach(item => {
    costMap[item.name.toLowerCase().trim()] = item.bulk_cost / item.bulk_qty;
  });
  
  const baseCosts = {};
  dessertsCache.forEach(d => {
    baseCosts[d.id] = 0;
  });
  
  recipeIngredients.forEach(ing => {
    if (!ing.is_topping) {
      const unitCost = costMap[ing.ingredient_name.toLowerCase().trim()] || 0.0;
      baseCosts[ing.dessert_id] += ing.amount * unitCost;
    }
  });
  
  renderRecipeCostsList(baseCosts, 'recipe-costs-list');
}

function renderRecipeCostsList(baseCosts, containerId) {
  const listContainer = document.getElementById(containerId);
  if (!listContainer) return;
  listContainer.innerHTML = '';
  
  dessertsCache.forEach(d => {
    const cost = baseCosts[d.id] || 0;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'recipe-cost-item';
    itemDiv.innerHTML = `
      <span class="recipe-cost-name">${d.name}</span>
      <span class="recipe-cost-val">$${cost.toFixed(2)}</span>
    `;
    listContainer.appendChild(itemDiv);
  });
}

function editIngredientRow(btn, id) {
  const tr = btn.closest('tr');
  const inputs = tr.querySelectorAll('.cost-input');
  
  // Make inputs editable
  inputs.forEach(input => {
    input.removeAttribute('readonly');
    input.dataset.original = input.value;
  });
  
  inputs[0].focus();
  inputs[0].select();
  
  // Replace buttons
  const actionsCell = btn.parentNode;
  actionsCell.innerHTML = `
    <button class="btn-action btn-complete" onclick="saveIngredientCost(this, ${id})">Save</button>
    <button class="btn-action btn-cancel" onclick="cancelEditIngredientRow(this)">Cancel</button>
  `;
}

function cancelEditIngredientRow(btn) {
  const tr = btn.closest('tr');
  const inputs = tr.querySelectorAll('.cost-input');
  
  inputs.forEach(input => {
    input.value = input.dataset.original;
    input.setAttribute('readonly', 'true');
  });
  
  // Restore action buttons
  const actionsCell = btn.parentNode;
  const id = tr.dataset.id;
  actionsCell.innerHTML = `
    <button class="btn-action btn-complete" onclick="editIngredientRow(this, ${id})">Edit</button>
    <button class="btn-action btn-delete" onclick="deleteIngredient(${id})">Delete</button>
  `;
}

async function saveIngredientCost(btn, id) {
  const tr = btn.closest('tr');
  const inputs = tr.querySelectorAll('.cost-input');
  const newCost = parseFloat(inputs[0].value);
  const newQty = parseFloat(inputs[1].value);
  const unit = tr.dataset.unit;
  
  if (isNaN(newCost) || newCost < 0 || isNaN(newQty) || newQty <= 0) {
    alert('Please enter a valid cost (0 or greater) and quantity (greater than 0)');
    return;
  }
  
  const confirmChange = confirm("Are you sure you want to change the bulk cost and quantity of this ingredient?");
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
        bulk_cost: newCost,
        bulk_qty: newQty,
        unit: unit
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
  if (!confirm('Are you sure you want to delete this ingredient from inventory?')) return;

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

// ==========================================
// Tab 3: Current Recipes (Formulation)
// ==========================================

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
    
    // Fetch inventory costs to compute granular costs per ingredient usage
    const ingResponse = await fetch('/api/admin/ingredients', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const inventory = ingResponse.ok ? await ingResponse.json() : [];
    
    renderRecipes(recipeIngredients, inventory);
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
  
  // Create unit cost lookup map
  const costMap = {};
  inventory.forEach(item => {
    costMap[item.name.toLowerCase().trim()] = item.bulk_cost / item.bulk_qty;
  });
  
  const baseCosts = {};
  
  dessertsCache.forEach(d => {
    const list = recipeGroups[d.id] || [];
    const sectionCard = document.createElement('div');
    sectionCard.className = 'recipe-section-card';
    
    let tableHtml = '';
    let totalRecipeBaseCost = 0;
    
    if (list.length === 0) {
      tableHtml = `<div style="padding: 10px; color: var(--text-muted); font-style: italic;">No ingredients added to this recipe yet. Click '+ Add Ingredient to Recipe' above.</div>`;
    } else {
      tableHtml = `
        <div class="table-responsive">
          <table class="orders-table" style="margin-top: 10px;">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Amount Needed</th>
                <th>Unit</th>
                <th>Type</th>
                <th>Cost in Batch ($)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      list.forEach(ing => {
        const unitCost = costMap[ing.ingredient_name.toLowerCase().trim()] || 0.0;
        const computedCost = ing.amount * unitCost;
        
        if (!ing.is_topping) {
          totalRecipeBaseCost += computedCost;
        }
        
        const typeLabel = ing.is_topping ? `Topping (${ing.topping_value})` : 'Base Ingredient';
        
        tableHtml += `
          <tr data-id="${ing.id}" data-name="${ing.ingredient_name}">
            <td><strong>${ing.ingredient_name}</strong></td>
            <td>
              <input type="number" class="cost-input recipe-amount-input" value="${ing.amount}" readonly step="0.01" style="width: 80px; text-align: center;">
            </td>
            <td><code>${ing.unit}</code></td>
            <td><span class="status-badge ${ing.is_topping ? 'cancelled' : 'completed'}" style="font-size: 11px;">${typeLabel}</span></td>
            <td>$${computedCost.toFixed(2)}</td>
            <td class="recipe-actions-cell">
              <button class="btn-action btn-complete" onclick="editRecipeRow(this, ${ing.id})">Edit</button>
              <button class="btn-action btn-delete" onclick="deleteRecipeIngredient(${ing.id})">Remove</button>
            </td>
          </tr>
        `;
      });
      
      tableHtml += `
            </tbody>
          </table>
        </div>
      `;
    }
    
    baseCosts[d.id] = totalRecipeBaseCost;
    
    sectionCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid var(--border); padding-bottom: 6px; margin-bottom: 12px;">
        <h4 class="recipe-section-title" style="margin: 0; border: none; padding: 0;">${d.name}</h4>
        <span style="font-weight: bold; color: var(--primary);">Base Cost: $${totalRecipeBaseCost.toFixed(2)}</span>
      </div>
      ${tableHtml}
    `;
    
    container.appendChild(sectionCard);
  });
  
  // Render sidebar costs on recipe tab
  renderRecipeCostsList(baseCosts, 'recipe-costs-list-recipe-tab');
}

async function populateRecipeDessertsDropdown() {
  const dropdown = document.getElementById('recipe-dessert-select');
  if (!dropdown) return;
  
  await fetchDessertsCache();

  let html = '<option value="">-- Select Dessert / Recipe --</option>';
  dessertsCache.forEach(d => {
    html += `<option value="${d.id}">${d.name}</option>`;
  });
  dropdown.innerHTML = html;
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
  const amount = document.getElementById('recipe-ing-amount').value;
  const unit = document.getElementById('recipe-ing-unit').value;
  const is_topping = document.getElementById('recipe-ing-is-topping').checked ? 1 : 0;
  const topping_value = is_topping ? document.getElementById('recipe-ing-topping-value').value : null;

  try {
    const response = await fetch('/api/admin/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ dessert_id, ingredient_name, amount, unit, is_topping, topping_value })
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to add recipe ingredient');
    }

    // Reset form
    document.getElementById('add-recipe-ingredient-form').reset();
    toggleRecipeToppingFields(false);
    toggleAddRecipeIngredientForm();

    // Refresh lists
    loadRecipes();
    loadOrders();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteRecipeIngredient(id) {
  if (!confirm('Are you sure you want to remove this ingredient from the recipe?')) return;

  try {
    const response = await fetch(`/api/admin/recipes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to remove ingredient');
    }

    loadRecipes();
    loadOrders();
  } catch (err) {
    alert(err.message);
  }
}

function editRecipeRow(btn, id) {
  const tr = btn.closest('tr');
  const input = tr.querySelector('.recipe-amount-input');
  
  input.removeAttribute('readonly');
  input.dataset.original = input.value;
  input.focus();
  input.select();
  
  const cell = tr.querySelector('.recipe-actions-cell');
  cell.innerHTML = `
    <button class="btn-action btn-complete" onclick="saveRecipeIngredientAmount(this, ${id})">Save</button>
    <button class="btn-action btn-cancel" onclick="cancelEditRecipeRow(this)">Cancel</button>
  `;
}

function cancelEditRecipeRow(btn) {
  const tr = btn.closest('tr');
  const input = tr.querySelector('.recipe-amount-input');
  
  input.value = input.dataset.original;
  input.setAttribute('readonly', 'true');
  
  const cell = tr.querySelector('.recipe-actions-cell');
  const id = tr.dataset.id;
  cell.innerHTML = `
    <button class="btn-action btn-complete" onclick="editRecipeRow(this, ${id})">Edit</button>
    <button class="btn-action btn-delete" onclick="deleteRecipeIngredient(${id})">Remove</button>
  `;
}

async function saveRecipeIngredientAmount(btn, id) {
  const tr = btn.closest('tr');
  const input = tr.querySelector('.recipe-amount-input');
  const newAmount = parseFloat(input.value);
  const ingredientName = tr.dataset.name;
  
  if (isNaN(newAmount) || newAmount <= 0) {
    alert('Please enter a valid amount greater than 0');
    return;
  }
  
  const confirmChange = confirm(`Are you sure you want to change the amount of '${ingredientName}' in this recipe?`);
  if (!confirmChange) return;
  
  try {
    const response = await fetch(`/api/admin/recipes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: newAmount })
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
