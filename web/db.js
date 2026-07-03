const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const sqlite3 = require('sqlite3');

const isPostgres = !!process.env.DATABASE_URL;
let dbClient = null;

// Initialize connection
async function initDB() {
  if (isPostgres) {
    console.log('Using PostgreSQL database');
    dbClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await dbClient.connect();
  } else {
    console.log('Using SQLite database');
    const dbDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'desserts.db');
    dbClient = new sqlite3.Database(dbPath);
  }

  await createTables();
  await seedData();
}

// Helper to execute SQL queries on both DBs
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      // Convert SQLite parameter placeholders (?) to PostgreSQL ($1, $2...)
      let pgSql = sql;
      let paramCount = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${paramCount++}`);
      }
      // Replace SQL-specific types or functions if needed
      pgSql = pgSql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
      pgSql = pgSql.replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      pgSql = pgSql.replace(/IFNOTEXISTS/gi, 'IF NOT EXISTS');

      dbClient.query(pgSql, params)
        .then(res => resolve(res.rows))
        .catch(err => reject(err));
    } else {
      // For SELECT queries
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        dbClient.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        // For INSERT, UPDATE, DELETE queries
        dbClient.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ insertId: this.lastID, changes: this.changes });
        });
      }
    }
  });
}

async function createTables() {
  // Create desserts table
  await query(`
    CREATE TABLE IF NOT EXISTS desserts (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price_8x5 REAL,
      price_9x9 REAL,
      has_toppings INTEGER DEFAULT 0,
      image_url VARCHAR(255)
    )
  `);

  // Create orders table
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name VARCHAR(100) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      customer_email VARCHAR(100) NOT NULL,
      dessert_id VARCHAR(50) NOT NULL,
      size VARCHAR(10) NOT NULL,
      toppings TEXT,
      notes TEXT,
      total_price REAL,
      status VARCHAR(20) DEFAULT 'pending',
      pickup_delivery VARCHAR(20) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create ingredients table
  await query(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      dessert_id VARCHAR(50) NOT NULL,
      cost REAL NOT NULL,
      is_topping INTEGER DEFAULT 0,
      topping_value VARCHAR(50)
    )
  `);
}

async function seedData() {
  const initialDesserts = [
    {
      id: 'brownies',
      name: 'Fudge Brownies',
      description: 'Rich, fudgy chocolate brownies made with premium cocoa and a perfectly crackled top.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      has_toppings: 1,
      image_url: '/images/brownies.png'
    },
    {
      id: 'blondies',
      name: 'Classic Blondies',
      description: 'Chewy brown sugar blondies infused with rich vanilla and a buttery caramel undertone.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      has_toppings: 1,
      image_url: '/images/blondies.png'
    },
    {
      id: 'lemon_bars',
      name: 'Tangy Lemon Bars',
      description: 'Tangy, sweet freshly squeezed lemon curd on a buttery shortbread crust, dusted with powdered sugar.',
      price_8x5: 12.00, // Fixed
      price_9x9: null, // TBD
      has_toppings: 0,
      image_url: '/images/lemon_bars.png'
    },
    {
      id: 'mango_bars',
      name: 'Tangy Mango Bars',
      description: 'Tangy and sweet tropical mango curd on a buttery shortbread crust, dusted with powdered sugar.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      has_toppings: 0,
      image_url: '/images/mango_bars.png'
    },
    {
      id: 'pineapple_bars',
      name: 'Sweet Pineapple Bars',
      description: 'Tangy, caramelized golden pineapple curd on a buttery shortbread crust, dusted with powdered sugar.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      has_toppings: 0,
      image_url: '/images/pineapple_bars.png'
    },
    {
      id: 'butterscotch_blondies',
      name: 'Golden Butterscotch Blondies',
      description: 'Specialty blondies loaded with premium butterscotch chips, giving a rich brown sugar and butterscotch finish.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      has_toppings: 1,
      image_url: '/images/butterscotch_blondies.png'
    },
    {
      id: 'caramel_butterscotch_crunch_blondies',
      name: 'Caramel Butterscotch Crunch Blondies',
      description: 'Specialty blondies loaded with butterscotch chips, chewy caramel bits, and toasted walnuts for the ultimate crunch.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      has_toppings: 1,
      image_url: '/images/caramel_butterscotch_crunch_blondies.png'
    },
    {
      id: 'marshmallow_swirl_brownies',
      name: 'Marshmallow Swirl Brownies',
      description: 'Rich, fudgy chocolate brownies swirled with sweet, gooey melted marshmallow fluff.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      has_toppings: 1,
      image_url: '/images/marshmallow_swirl_brownies.png'
    },
    {
      id: 'pina_colada_bars',
      name: 'Piña Colada Bars',
      description: 'Tropical coconut and sweet pineapple curd layered on a buttery shortbread crust, topped with toasted coconut flakes.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      has_toppings: 0,
      image_url: '/images/pina_colada_bars.png'
    },
    {
      id: 'coconut_cream_bars',
      name: 'Coconut Cream Bars',
      description: 'Rich, velvety coconut custard on a buttery shortbread crust, generously dusted with shredded coconut.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      has_toppings: 0,
      image_url: '/images/coconut_cream_bars.png'
    },
    {
      id: 'cinnamon_rolls',
      name: 'Artisan Cinnamon Rolls',
      description: 'Soft, fluffy sweet rolls swirled with buttery cinnamon sugar, topped with rich cream cheese icing.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      has_toppings: 0,
      image_url: '/images/cinnamon_rolls.png'
    }
  ];

  for (const dessert of initialDesserts) {
    const exists = await query('SELECT COUNT(*) as count FROM desserts WHERE id = ?', [dessert.id]);
    if (Number(exists[0].count) === 0) {
      console.log(`Seeding new dessert item: ${dessert.name}`);
      await query(
        'INSERT INTO desserts (id, name, description, price_8x5, price_9x9, has_toppings, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [dessert.id, dessert.name, dessert.description, dessert.price_8x5, dessert.price_9x9, dessert.has_toppings, dessert.image_url]
      );
    }
  }
}


// Database helper functions
module.exports = {
  initDB,
  query,
  
  // Desserts
  getDesserts: () => query('SELECT * FROM desserts'),
  getDessertById: (id) => query('SELECT * FROM desserts WHERE id = ?', [id]).then(rows => rows[0]),
  addDessert: (id, name, desc, p8x5, p9x9, toppings, img) => 
    query('INSERT INTO desserts (id, name, description, price_8x5, price_9x9, has_toppings, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [id, name, desc, p8x5, p9x9, toppings, img]),
  updateDessertPrices: (id, p8x5, p9x9) => 
    query('UPDATE desserts SET price_8x5 = ?, price_9x9 = ? WHERE id = ?', [p8x5, p9x9, id]),
  
  // Orders
  getOrders: () => query('SELECT * FROM orders ORDER BY created_at DESC'),
  getOrderById: (id) => query('SELECT * FROM orders WHERE id = ?', [id]).then(rows => rows[0]),
  createOrder: (order) => query(
    `INSERT INTO orders 
     (customer_name, customer_phone, customer_email, dessert_id, size, toppings, notes, total_price, status, pickup_delivery) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      order.customer_name,
      order.customer_phone,
      order.customer_email,
      order.dessert_id,
      order.size,
      JSON.stringify(order.toppings || []),
      order.notes || '',
      order.total_price, // Will be null or numerical
      'pending',
      order.pickup_delivery
    ]
  ),
  updateOrderStatus: (id, status) => query('UPDATE orders SET status = ? WHERE id = ?', [status, id]),
  deleteOrder: (id) => query('DELETE FROM orders WHERE id = ?', [id]),

  // Ingredients CRUD
  getIngredients: () => query('SELECT * FROM ingredients ORDER BY dessert_id ASC, name ASC'),
  addIngredient: (name, dessert_id, cost, is_topping, topping_value) => 
    query('INSERT INTO ingredients (name, dessert_id, cost, is_topping, topping_value) VALUES (?, ?, ?, ?, ?)', 
      [name, dessert_id, cost, is_topping || 0, topping_value || null]),
  updateIngredient: (id, name, dessert_id, cost, is_topping, topping_value) => 
    query('UPDATE ingredients SET name = ?, dessert_id = ?, cost = ?, is_topping = ?, topping_value = ? WHERE id = ?', 
      [name, dessert_id, cost, is_topping || 0, topping_value || null, id]),
  deleteIngredient: (id) => query('DELETE FROM ingredients WHERE id = ?', [id]),

  // Cost of making calculations
  calculateOrderCost: async (order) => {
    if (!order || !order.dessert_id) return 0;
    const ingredients = await query('SELECT * FROM ingredients WHERE dessert_id = ?', [order.dessert_id]);
    
    let toppingsArr = [];
    if (Array.isArray(order.toppings)) {
      toppingsArr = order.toppings;
    } else {
      try {
        toppingsArr = JSON.parse(order.toppings || '[]');
      } catch (e) {
        if (typeof order.toppings === 'string') {
          toppingsArr = order.toppings.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
    }
    
    const SIZE_MULTIPLIERS = {
      '8x5': 1.0,
      '9x9': 1.8,
      '1_roll': 1.0,
      '4_pack': 4.0,
      '6_pack': 6.0,
      'full_tray': 12.0
    };
    const multiplier = SIZE_MULTIPLIERS[order.size] || 1.0;
    
    let baseCost = 0;
    let toppingsCost = 0;
    
    for (const ing of ingredients) {
      if (ing.is_topping) {
        const hasTopping = toppingsArr.some(t => {
          return t.toLowerCase().trim() === (ing.topping_value || '').toLowerCase().trim();
        });
        if (hasTopping) {
          toppingsCost += ing.cost;
        }
      } else {
        baseCost += ing.cost;
      }
    }
    
    return Number(((baseCost + toppingsCost) * multiplier).toFixed(2));
  }
};
