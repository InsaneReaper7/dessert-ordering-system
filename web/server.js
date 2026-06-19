require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'dessert-shop-secret-key-12345';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Hash admin password for comparison (normally done on startup or saved in DB)
const adminPasswordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

// WebSocket Connections Map
const clients = {
  adminWeb: new Set(),
  adminApp: new Set()
};

// WebSocket Authentication & Connection handling
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws, request) => {
  const urlParams = new URLSearchParams(request.url.split('?')[1]);
  const clientType = urlParams.get('type'); // 'admin' (web) or 'app' (android)

  if (clientType === 'app') {
    clients.adminApp.add(ws);
    console.log(`Android App connected. Total apps: ${clients.adminApp.size}`);
  } else {
    clients.adminWeb.add(ws);
    console.log(`Admin Web portal connected. Total web clients: ${clients.adminWeb.size}`);
  }

  // Keep alive ping
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('close', () => {
    if (clientType === 'app') {
      clients.adminApp.delete(ws);
      console.log(`Android App disconnected. Total apps: ${clients.adminApp.size}`);
    } else {
      clients.adminWeb.delete(ws);
      console.log(`Admin Web portal disconnected. Total web clients: ${clients.adminWeb.size}`);
    }
  });

  // Echo test messages or test pings
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (e) {
      console.error('WebSocket message parsing error:', e);
    }
  });
});

// Periodically check for broken WebSocket connections
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

// Broadcast order notifications to all connected WebSockets
function broadcastNewOrder(order) {
  const payload = JSON.stringify({
    type: 'new_order',
    order: {
      id: order.id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      dessert_id: order.dessert_id,
      size: order.size,
      toppings: order.toppings || [],
      notes: order.notes || "",
      total_price: order.total_price,
      pickup_delivery: order.pickup_delivery,
      created_at: new Date().toISOString()
    }

  });

  // Send to Android app
  clients.adminApp.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });

  // Send to Web Admin portal
  clients.adminWeb.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

// Authentication Middleware
function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.admin = decoded;
    next();
  });
}

// REST API Endpoints

// Public: Get Desserts Menu
app.get('/api/desserts', async (req, res) => {
  try {
    const items = await db.getDesserts();
    res.json(items);
  } catch (err) {
    console.error('Failed to get desserts:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Public: Place order
app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_phone, customer_email, dessert_id, size, toppings, notes, pickup_delivery } = req.body;

  if (!customer_name || !customer_phone || !customer_email || !dessert_id || !size || !pickup_delivery) {
    return res.status(400).json({ error: 'Missing required customer or order details' });
  }

  try {
    // Get dessert config
    const dessert = await db.getDessertById(dessert_id);
    if (!dessert) {
      return res.status(404).json({ error: 'Dessert not found' });
    }

    // Determine price. If size price is null, then the total price is null (TBD)
    let total_price = null;
    const basePrice = size === '9x9' ? dessert.price_9x9 : dessert.price_8x5;
    
    if (basePrice !== null) {
      // Calculate price (Currently toppings are TBD, so if toppings are selected, total price becomes TBD / null)
      if (toppings && toppings.length > 0) {
        total_price = null; // Mark as TBD since toppings have no set pricing
      } else {
        total_price = basePrice;
      }
    }

    const orderObj = {
      customer_name,
      customer_phone,
      customer_email,
      dessert_id,
      size,
      toppings,
      notes,
      total_price,
      pickup_delivery
    };

    const result = await db.createOrder(orderObj);
    const orderId = result.insertId || result[0]?.id; // handles SQLite vs pg insert outputs

    const newOrder = { id: orderId, ...orderObj };
    
    // Broadcast notification to phone & web
    broadcastNewOrder(newOrder);

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: orderId,
      total_price: total_price === null ? 'TBD' : total_price
    });
  } catch (err) {
    console.error('Failed to place order:', err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// Admin: Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  const matches = bcrypt.compareSync(password, adminPasswordHash);
  if (!matches) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Admin: Get Sales Stats & Analytics
app.get('/api/admin/stats', authenticateAdminToken, async (req, res) => {
  try {
    const orders = await db.getOrders();
    const desserts = await db.getDesserts();

    const stats = {
      sales: {
        today: 0,
        month: 0,
        year: 0
      },
      itemSales: {},
      toppingPopularity: {}
    };

    // Initialize item sales counts
    desserts.forEach(d => {
      stats.itemSales[d.id] = { name: d.name, count: 0 };
    });

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const monthStr = now.toISOString().slice(0, 7);  // YYYY-MM
    const yearStr = now.toISOString().slice(0, 4);   // YYYY

    orders.forEach(order => {
      // Parse order date (handles ISO string or SQLite string)
      const orderDateStr = new Date(order.created_at).toISOString();
      const orderDay = orderDateStr.slice(0, 10);
      const orderMonth = orderDateStr.slice(0, 7);
      const orderYear = orderDateStr.slice(0, 4);

      const price = order.total_price || 0; // Exclude TBD orders from direct totals

      // Group totals
      if (orderDay === todayStr) stats.sales.today += price;
      if (orderMonth === monthStr) stats.sales.month += price;
      if (orderYear === yearStr) stats.sales.year += price;

      // Group item sales
      if (stats.itemSales[order.dessert_id]) {
        stats.itemSales[order.dessert_id].count += 1;
      } else {
        stats.itemSales[order.dessert_id] = { name: order.dessert_id, count: 1 };
      }

      // Group toppings (toppings is saved as stringified JSON)
      if (order.toppings) {
        try {
          const toppingList = JSON.parse(order.toppings);
          if (Array.isArray(toppingList)) {
            toppingList.forEach(top => {
              stats.toppingPopularity[top] = (stats.toppingPopularity[top] || 0) + 1;
            });
          }
        } catch (e) {
          // ignore
        }
      }
    });

    res.json(stats);
  } catch (err) {
    console.error('Failed to aggregate stats:', err);
    res.status(500).json({ error: 'Database statistics collation failed' });
  }
});

// Admin: Get all orders
app.get('/api/admin/orders', authenticateAdminToken, async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (err) {
    console.error('Failed to get admin orders:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Admin: Update order status
app.patch('/api/admin/orders/:id', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    await db.updateOrderStatus(id, status);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error('Failed to update status:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// Admin: Delete order
app.delete('/api/admin/orders/:id', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteOrder(id);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Failed to delete order:', err);
    res.status(500).json({ error: 'Database deletion failed' });
  }
});

// Admin: Send test ping to app
app.post('/api/admin/ping', authenticateAdminToken, (req, res) => {
  console.log('Admin triggered manual test ping');
  
  const payload = JSON.stringify({
    type: 'test_ping',
    message: 'Oven is preheated! Connection test successful.'
  });

  let pingsSent = 0;
  clients.adminApp.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
      pingsSent++;
    }
  });

  res.json({ success: true, clientsConnected: clients.adminApp.size, pingsSent });
});

// Catch-all to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start DB then server
db.initDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
