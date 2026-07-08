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

// Generic WebSocket broadcast helper
function broadcast(payloadObj) {
  const payloadStr = JSON.stringify(payloadObj);
  
  // Send to Android app
  clients.adminApp.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payloadStr);
    }
  });

  // Send to Web Admin portal
  clients.adminWeb.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payloadStr);
    }
  });
}

// Broadcast order notifications to all connected WebSockets
async function broadcastNewOrder(order) {
  const cost = await db.calculateOrderCost(order);
  broadcast({
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
      status: order.status || 'pending',
      pickup_delivery: order.pickup_delivery,
      created_at: new Date().toISOString(),
      cost_of_making: cost
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

  if (!customer_name || !customer_phone || !dessert_id || !size || !pickup_delivery) {
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
    let basePrice = null;
    if (size === '8x8') {
      basePrice = dessert.price_8x8;
    } else if (size === '9x9') {
      basePrice = dessert.price_9x9;
    } else if (size === '8x5') {
      basePrice = dessert.price_8x5;
    } else {
      const priceMap = {
        '1_roll': dessert.price_1_roll,
        '4_pack': dessert.price_4_pack,
        '6_pack': dessert.price_6_pack,
        'full_tray': dessert.price_12_pack
      };
      basePrice = priceMap[size] !== undefined ? priceMap[size] : null;
    }

    if (basePrice !== null) {
      // Extra toppings cost $0.75 each — pre-included ones are free
      const EXTRA_TOPPING_PRICE = 0.75;
      const preIncludedMap = {
        'marshmallow_swirl_brownies': ['marshmallow'],
        'butterscotch_blondies': ['butterscotch chips'],
        'caramel_butterscotch_crunch_blondies': ['butterscotch chips', 'caramels dots', 'walnuts'],
        'carrot_cake_bars': ['pecans']
      };
      const includedToppings = preIncludedMap[dessert_id] || [];
      const toppingList = Array.isArray(toppings) ? toppings : (toppings ? JSON.parse(toppings) : []);
      const extraToppings = toppingList.filter(t => !includedToppings.includes(t));
      total_price = basePrice + (extraToppings.length * EXTRA_TOPPING_PRICE);
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
    await broadcastNewOrder(newOrder);

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
    const ordersWithCost = await Promise.all(orders.map(async (o) => {
      const cost = await db.calculateOrderCost(o);
      let parsedToppings = [];
      if (o.toppings) {
        try {
          parsedToppings = typeof o.toppings === 'string' ? JSON.parse(o.toppings) : o.toppings;
        } catch (e) {
          parsedToppings = [];
        }
      }
      return { ...o, toppings: parsedToppings, cost_of_making: cost };
    }));
    res.json(ordersWithCost);
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
    
    // Broadcast status sync to all clients
    broadcast({ type: 'order_updated', id: parseInt(id), status });
    
    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error('Failed to update status:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// Admin: Update order price (for TBD orders)
app.patch('/api/admin/orders/:id/price', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  const parsed = parseFloat(price);
  if (isNaN(parsed) || parsed < 0) {
    return res.status(400).json({ error: 'Invalid price value' });
  }

  try {
    await db.updateOrderPrice(id, parsed);
    broadcast({ type: 'order_updated', id: parseInt(id), total_price: parsed });
    res.json({ message: 'Order price updated', total_price: parsed });
  } catch (err) {
    console.error('Failed to update order price:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// Admin: Delete order
app.delete('/api/admin/orders/:id', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteOrder(id);
    
    // Broadcast deletion sync to all clients
    broadcast({ type: 'order_deleted', id: parseInt(id) });
    
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Failed to delete order:', err);
    res.status(500).json({ error: 'Database deletion failed' });
  }
});

// Admin: Get all ingredients (Inventory pricing)
app.get('/api/admin/ingredients', authenticateAdminToken, async (req, res) => {
  try {
    const ingredients = await db.getIngredients();
    res.json(ingredients);
  } catch (err) {
    console.error('Failed to get ingredients:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Admin: Add new ingredient to inventory
app.post('/api/admin/ingredients', authenticateAdminToken, async (req, res) => {
  const { name, bulk_cost, bulk_qty, unit } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Ingredient name is required' });
  }

  try {
    const result = await db.addIngredient(name, Number(bulk_cost || 0), Number(bulk_qty || 1), unit || 'g');
    const newId = result.insertId || result[0]?.id;
    res.status(201).json({ id: newId, message: 'Ingredient added to inventory' });
  } catch (err) {
    console.error('Failed to add ingredient:', err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

// Admin: Update ingredient bulk pricing in inventory
app.put('/api/admin/ingredients/:id', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  const { bulk_cost, bulk_qty, unit, tax_rate } = req.body;
  if (bulk_cost === undefined || bulk_cost === null || bulk_qty === undefined || bulk_qty === null || !unit) {
    return res.status(400).json({ error: 'Bulk cost, bulk quantity, and unit are required' });
  }

  try {
    await db.updateIngredient(id, Number(bulk_cost), Number(bulk_qty), unit, Number(tax_rate || 0.0));
    res.json({ message: 'Ingredient bulk pricing updated successfully' });
  } catch (err) {
    console.error('Failed to update ingredient:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// Admin: Delete ingredient from inventory (with validation checking if used in active recipes)
app.delete('/api/admin/ingredients/:id', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Fetch ingredient details to check name
    const ingResult = await db.query('SELECT name FROM ingredients WHERE id = ?', [id]);
    if (ingResult && ingResult.length > 0) {
      const ingName = ingResult[0].name;
      
      // 2. Query recipe ingredients to check if this name is currently used in any recipes
      const usages = await db.query('SELECT dessert_id FROM recipe_ingredients WHERE LOWER(ingredient_name) = LOWER(?)', [ingName.trim()]);
      if (usages && usages.length > 0) {
        // Collect unique dessert names
        const dessertNames = Array.from(new Set(usages.map(u => {
          let name = u.dessert_id.replace('_', ' ');
          return name.charAt(0).toUpperCase() + name.slice(1);
        }))).join(', ');
        
        return res.status(400).json({ 
          error: `Cannot delete '${ingName}' because it is currently used in the recipe for: ${dessertNames}. Remove it from those recipes first.` 
        });
      }
    }

    await db.deleteIngredient(id);
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (err) {
    console.error('Failed to delete ingredient:', err);
    res.status(500).json({ error: 'Database deletion failed' });
  }
});

// Admin: Get all recipe ingredients (Recipe formulation)
app.get('/api/admin/recipes', authenticateAdminToken, async (req, res) => {
  try {
    const recipes = await db.getRecipeIngredients();
    res.json(recipes);
  } catch (err) {
    console.error('Failed to get recipe ingredients:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Admin: Add ingredient to a recipe (Auto-adds to inventory if name is new)
function convertTspTbspToGrams(ingredientName, amount, unit) {
  if (unit !== 'tsp' && unit !== 'tbsp') return amount;
  const name = ingredientName.toLowerCase().trim();
  let tspToGrams = 4.0;
  if (name.includes('flour')) tspToGrams = 2.6;
  else if (name.includes('sugar')) tspToGrams = 4.2;
  else if (name.includes('salt')) tspToGrams = 5.7;
  else if (name.includes('baking powder') || name.includes('baking soda') || name.includes('yeast')) tspToGrams = 4.8;
  else if (name.includes('butter') || name.includes('oil') || name.includes('milk') || name.includes('water') || name.includes('honey') || name.includes('syrup') || name.includes('cream')) tspToGrams = 4.8;
  else if (name.includes('cocoa')) tspToGrams = 2.5;
  else if (name.includes('cinnamon') || name.includes('spice') || name.includes('nutmeg') || name.includes('vanilla')) tspToGrams = 2.6;
  
  const multiplier = unit === 'tbsp' ? 3 : 1;
  return amount * tspToGrams * multiplier;
}

function getAmountInTargetUnit(ingredientName, amount, fromUnit, toUnit) {
  if (fromUnit === toUnit) return amount;
  if (fromUnit === 'tsp' && toUnit === 'tbsp') return amount / 3;
  if (fromUnit === 'tbsp' && toUnit === 'tsp') return amount * 3;
  if (toUnit === 'g' && (fromUnit === 'tsp' || fromUnit === 'tbsp')) {
    return convertTspTbspToGrams(ingredientName, amount, fromUnit);
  }
  if (fromUnit === 'g' && (toUnit === 'tsp' || toUnit === 'tbsp')) {
    const gVal = convertTspTbspToGrams(ingredientName, 1, toUnit);
    return amount / gVal;
  }
  return amount;
}

app.post('/api/admin/recipes', authenticateAdminToken, async (req, res) => {
  const { dessert_id, ingredient_name, amount, unit, is_topping, topping_value, recipe_part } = req.body;
  if (!dessert_id || !ingredient_name || amount === undefined || amount === null || !unit) {
    return res.status(400).json({ error: 'Dessert ID, ingredient name, amount, and unit are required' });
  }

  try {
    const cleanPart = recipe_part || 'Main';
    
    // Check if ingredient already exists in this recipe section
    const existingList = await db.query(
      `SELECT * FROM recipe_ingredients 
       WHERE dessert_id = ? AND LOWER(TRIM(ingredient_name)) = LOWER(TRIM(?)) AND is_topping = ? AND recipe_part = ?`,
      [dessert_id, ingredient_name, is_topping ? 1 : 0, cleanPart]
    );

    if (existingList.length > 0) {
      const existing = existingList[0];
      const amountInExistingUnit = getAmountInTargetUnit(ingredient_name, Number(amount), unit, existing.unit);
      const newAmount = existing.amount + amountInExistingUnit;
      
      await db.query(
        `UPDATE recipe_ingredients SET amount = ? WHERE id = ?`,
        [newAmount, existing.id]
      );
      return res.json({ id: existing.id, message: 'Ingredient amount updated/stacked in recipe successfully' });
    }

    const result = await db.addRecipeIngredient(dessert_id, ingredient_name, Number(amount), unit, is_topping, topping_value, cleanPart);
    const newId = result.insertId || result[0]?.id;
    res.status(201).json({ id: newId, message: 'Ingredient added to recipe successfully' });
  } catch (err) {
    console.error('Failed to add recipe ingredient:', err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

// Admin: Remove ingredient from a recipe
app.delete('/api/admin/recipes/:id', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteRecipeIngredient(id);
    res.json({ message: 'Ingredient removed from recipe successfully' });
  } catch (err) {
    console.error('Failed to remove recipe ingredient:', err);
    res.status(500).json({ error: 'Database deletion failed' });
  }
});


// Admin: Update ingredient amount and unit in a recipe
app.put('/api/admin/recipes/:id', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  const { amount, unit } = req.body;
  if (amount === undefined || amount === null) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  try {
    if (unit) {
      await db.query('UPDATE recipe_ingredients SET amount = ?, unit = ? WHERE id = ?', [Number(amount), unit, id]);
    } else {
      await db.query('UPDATE recipe_ingredients SET amount = ? WHERE id = ?', [Number(amount), id]);
    }
    res.json({ message: 'Recipe ingredient updated successfully' });
  } catch (err) {
    console.error('Failed to update recipe ingredient:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// Admin: Update dessert base mold size
app.put('/api/admin/desserts/:id/base-mold', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  const { base_mold } = req.body;
  if (!base_mold) {
    return res.status(400).json({ error: 'Base mold size is required' });
  }

  try {
    await db.query('UPDATE desserts SET base_mold = ? WHERE id = ?', [base_mold, id]);
    res.json({ message: 'Dessert base mold updated successfully' });
  } catch (err) {
    console.error('Failed to update dessert base mold:', err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

// Admin: Update dessert prices
app.put('/api/admin/desserts/:id/prices', authenticateAdminToken, async (req, res) => {
  const { id } = req.params;
  const { price_8x5, price_9x9, price_8x8, price_1_roll, price_4_pack, price_6_pack, price_12_pack } = req.body;

  const p8x5 = price_8x5 === undefined ? null : price_8x5;
  const p9x9 = price_9x9 === undefined ? null : price_9x9;
  const p8x8 = price_8x8 === undefined ? null : price_8x8;
  const p1roll = price_1_roll === undefined ? null : price_1_roll;
  const p4pack = price_4_pack === undefined ? null : price_4_pack;
  const p6pack = price_6_pack === undefined ? null : price_6_pack;
  const p12pack = price_12_pack === undefined ? null : price_12_pack;

  try {
    await db.updateDessertPrices(id, p8x5, p9x9, p8x8, p1roll, p4pack, p6pack, p12pack);
    res.json({ message: 'Dessert prices updated successfully' });
  } catch (err) {
    console.error('Failed to update dessert prices:', err);
    res.status(500).json({ error: 'Database update failed' });
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
