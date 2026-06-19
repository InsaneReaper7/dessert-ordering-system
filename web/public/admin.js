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
      <td><strong>${priceDisplay}</strong></td>
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

// REST endpoints for action buttons
async function updateStatus(orderId, status) {
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
