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
      price_8x8 REAL,
      price_1_roll REAL,
      price_4_pack REAL,
      price_6_pack REAL,
      price_12_pack REAL,
      has_toppings INTEGER DEFAULT 0,
      image_url VARCHAR(255),
      base_mold VARCHAR(50) DEFAULT '9x9'
    )
  `);

  // Migrate desserts table to include base_mold column if missing in existing database
  try {
    let hasBaseMold = false;
    if (isPostgres) {
      const res = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'desserts' AND column_name = 'base_mold'
      `);
      hasBaseMold = res.length > 0;
    } else {
      const info = await query("SELECT name FROM sqlite_master WHERE type='table' AND name='desserts' AND sql LIKE '%base_mold%'");
      hasBaseMold = info.length > 0;
    }

    if (!hasBaseMold) {
      console.log('Adding column base_mold to desserts table...');
      await query("ALTER TABLE desserts ADD COLUMN base_mold VARCHAR(50) DEFAULT '9x9'");
      
      // Update initial values (brownies/blondies recipes are formulated for 11x7 pan)
      await query("UPDATE desserts SET base_mold = '11x7' WHERE id IN ('brownies', 'blondies', 'marshmallow_swirl_brownies', 'butterscotch_blondies', 'caramel_butterscotch_crunch_blondies')");
      await query("UPDATE desserts SET base_mold = '1 Batch' WHERE id = 'cinnamon_rolls'");
    } else {
      // Make sure existing database updates cinnamon_rolls to 1 Batch
      await query("UPDATE desserts SET base_mold = '1 Batch' WHERE id = 'cinnamon_rolls' AND base_mold = '9x9'");
    }
  } catch (e) {
    console.error('Error during desserts schema migration for base_mold, skipping:', e);
  }

  // Migrate desserts table to include price_8x8 column if missing in existing database
  try {
    let hasPrice8x8 = false;
    if (isPostgres) {
      const res = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'desserts' AND column_name = 'price_8x8'
      `);
      hasPrice8x8 = res.length > 0;
    } else {
      const info = await query("SELECT name FROM sqlite_master WHERE type='table' AND name='desserts' AND sql LIKE '%price_8x8%'");
      hasPrice8x8 = info.length > 0;
    }

    if (!hasPrice8x8) {
      console.log('Adding column price_8x8 to desserts table...');
      await query("ALTER TABLE desserts ADD COLUMN price_8x8 REAL");
    }
  } catch (e) {
    console.error('Error during desserts schema migration for price_8x8, skipping:', e);
  }

  // Migrate desserts table to include roll pack price columns if missing in existing database
  try {
    let hasPrice1Roll = false;
    if (isPostgres) {
      const res = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'desserts' AND column_name = 'price_1_roll'
      `);
      hasPrice1Roll = res.length > 0;
    } else {
      const info = await query("SELECT name FROM sqlite_master WHERE type='table' AND name='desserts' AND sql LIKE '%price_1_roll%'");
      hasPrice1Roll = info.length > 0;
    }

    if (!hasPrice1Roll) {
      console.log('Adding columns price_1_roll, price_4_pack, price_6_pack, price_12_pack to desserts table...');
      await query("ALTER TABLE desserts ADD COLUMN price_1_roll REAL");
      await query("ALTER TABLE desserts ADD COLUMN price_4_pack REAL");
      await query("ALTER TABLE desserts ADD COLUMN price_6_pack REAL");
      await query("ALTER TABLE desserts ADD COLUMN price_12_pack REAL");
    }
  } catch (e) {
    console.error('Error during desserts schema migration for roll pack price columns, skipping:', e);
  }

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

  // Migrate ingredients table ONLY if it exists and is missing the bulk_cost column
  try {
    let hasTable = false;
    let hasBulkCost = false;
    
    if (isPostgres) {
      const res = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'ingredients' AND column_name = 'bulk_cost'
      `);
      const tableCheck = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'ingredients'
      `);
      hasTable = tableCheck.length > 0;
      hasBulkCost = res.length > 0;
    } else {
      const tableCheck = await query("SELECT name FROM sqlite_master WHERE type='table' AND name='ingredients'");
      const columnCheck = await query("SELECT name FROM sqlite_master WHERE type='table' AND name='ingredients' AND sql LIKE '%bulk_cost%'");
      hasTable = tableCheck.length > 0;
      hasBulkCost = columnCheck.length > 0;
    }

    if (hasTable && !hasBulkCost) {
      console.log('Migrating ingredients table to include bulk cost columns...');
      await query('DROP TABLE IF EXISTS ingredients');
    }
  } catch (e) {
    console.error('Error during schema check, skipping migration drop:', e);
  }

  // Create ingredients table (Inventory pricing)
  await query(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) UNIQUE NOT NULL,
      bulk_cost REAL NOT NULL DEFAULT 0.0,
      bulk_qty REAL NOT NULL DEFAULT 1.0,
      unit VARCHAR(10) NOT NULL DEFAULT 'g',
      tax_rate REAL NOT NULL DEFAULT 0.0
    )
  `);

  // Migrate ingredients table to include tax_rate column if missing in existing database
  try {
    let hasTaxRate = false;
    if (isPostgres) {
      const res = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'ingredients' AND column_name = 'tax_rate'
      `);
      hasTaxRate = res.length > 0;
    } else {
      const info = await query("SELECT name FROM sqlite_master WHERE type='table' AND name='ingredients' AND sql LIKE '%tax_rate%'");
      hasTaxRate = info.length > 0;
    }

    if (!hasTaxRate) {
      console.log('Adding column tax_rate to ingredients table...');
      await query("ALTER TABLE ingredients ADD COLUMN tax_rate REAL DEFAULT 0.0");
    }
  } catch (e) {
    console.error('Error during ingredients schema migration for tax_rate, skipping:', e);
  }

  // Create recipe_ingredients table (Recipe formulation)
  await query(`
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dessert_id VARCHAR(50) NOT NULL,
      ingredient_name VARCHAR(100) NOT NULL,
      amount REAL NOT NULL,
      unit VARCHAR(10) NOT NULL,
      is_topping INTEGER DEFAULT 0,
      topping_value VARCHAR(50),
      recipe_part VARCHAR(100) DEFAULT 'Main'
    )
  `);

  // Migrate recipe_ingredients table to include recipe_part column if missing in existing database
  try {
    let hasRecipePart = false;
    if (isPostgres) {
      const res = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'recipe_ingredients' AND column_name = 'recipe_part'
      `);
      hasRecipePart = res.length > 0;
    } else {
      const info = await query("SELECT name FROM sqlite_master WHERE type='table' AND name='recipe_ingredients' AND sql LIKE '%recipe_part%'");
      hasRecipePart = info.length > 0;
    }

    if (!hasRecipePart) {
      console.log('Adding column recipe_part to recipe_ingredients table...');
      await query("ALTER TABLE recipe_ingredients ADD COLUMN recipe_part VARCHAR(100) DEFAULT 'Main'");
    }
  } catch (e) {
    console.error('Error during recipe_ingredients schema migration, skipping:', e);
  }

  // Create cinnamon_rolls_prices table
  await query(`
    CREATE TABLE IF NOT EXISTS cinnamon_rolls_prices (
      size VARCHAR(10) NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL,
      PRIMARY KEY (size, quantity)
    )
  `);

  // Create frosting_prices table
  await query(`
    CREATE TABLE IF NOT EXISTS frosting_prices (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price REAL DEFAULT 0.0
    )
  `);
}

async function seedData() {
  const initialDesserts = [
    {
      id: 'brownies',
      name: 'Create your own brownie',
      description: 'Rich, fudgy chocolate brownies made with premium cocoa and a perfectly crackled top.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      has_toppings: 1,
      image_url: '/images/brownies.png'
    },
    {
      id: 'blondies',
      name: 'Create your own blondie',
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
      price_8x8: null, // TBD
      has_toppings: 1,
      image_url: '/images/marshmallow_swirl_brownies.png'
    },
    {
      id: 'pina_colada_bars',
      name: 'Piña Colada Bars',
      description: 'Tropical coconut and sweet pineapple curd layered on a buttery shortbread crust, topped with toasted coconut flakes.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      price_8x8: null, // TBD
      has_toppings: 0,
      image_url: '/images/pina_colada_bars.png'
    },
    {
      id: 'coconut_cream_bars',
      name: 'Coconut Cream Bars',
      description: 'Rich, velvety coconut custard on a buttery shortbread crust, generously dusted with shredded coconut.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      price_8x8: null, // TBD
      has_toppings: 0,
      image_url: '/images/coconut_cream_bars.png'
    },
    {
      id: 'cinnamon_rolls',
      name: 'Artisan Cinnamon Rolls',
      description: 'Soft, fluffy sweet rolls swirled with buttery cinnamon sugar, topped with rich cream cheese icing.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      price_8x8: null, // TBD
      has_toppings: 0,
      image_url: '/images/cinnamon_rolls.png',
      base_mold: 'Batch'
    },
    {
      id: 'carrot_cake_bars',
      name: 'Carrot Cake Bars',
      description: 'Artisan carrot cake bars topped with smooth icing and toasted pecans, cut into perfect squares.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      price_8x8: null, // TBD
      has_toppings: 1,
      image_url: '/images/carrot_cake_bars.png',
      base_mold: '9x9'
    },
    {
      id: 'banana_bread_bars',
      name: 'Banana Bread Bars',
      description: 'Dense, moist banana bread bars with a golden-brown caramelized crust and a soft, tender crumb — finished with a delicate vanilla glaze drizzle.',
      price_8x5: null, // TBD
      price_9x9: null, // TBD
      price_8x8: null, // TBD
      has_toppings: 0,
      image_url: '/images/banana_bread_bars.png',
      base_mold: '9x9'
    }
  ];

  for (const dessert of initialDesserts) {
    const exists = await query('SELECT COUNT(*) as count FROM desserts WHERE id = ?', [dessert.id]);
    if (Number(exists[0].count) === 0) {
      console.log(`Seeding new dessert item: ${dessert.name}`);
      await query(
        'INSERT INTO desserts (id, name, description, price_8x5, price_9x9, price_8x8, price_1_roll, price_4_pack, price_6_pack, price_12_pack, has_toppings, image_url, base_mold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [dessert.id, dessert.name, dessert.description, dessert.price_8x5, dessert.price_9x9, dessert.price_8x8 || null, null, null, null, null, dessert.has_toppings, dessert.image_url, dessert.base_mold || '9x9']
      );
    }
  }

  // Clean up any previously seeded fictional frosting ingredients and placeholder prices
  try {
    await query(`DELETE FROM recipe_ingredients WHERE dessert_id IN ('frosting_classic', 'frosting_oreo', 'frosting_chocolate', 'frosting_lemon')`);
    // Clear only our specific placeholder price seeds to avoid wiping user custom entries
    await query(`UPDATE cinnamon_rolls_prices SET price = NULL WHERE price IN (3.50, 9.50, 18.00, 25.00, 1.75, 4.75, 9.00, 13.00, 16.00, 19.00, 22.00, 28.00)`);
    await query(`UPDATE frosting_prices SET price = NULL WHERE id IN ('oreo', 'chocolate', 'lemon') AND price = 0.50`);
    // Force set cinnamon_rolls base_mold to Batch
    await query(`UPDATE desserts SET base_mold = 'Batch' WHERE id = 'cinnamon_rolls'`);
    // Force update Fudge Brownies and Classic Blondies names
    await query(`UPDATE desserts SET name = 'Create your own brownie' WHERE id = 'brownies'`);
    await query(`UPDATE desserts SET name = 'Create your own blondie' WHERE id = 'blondies'`);
    
    // Migrate previously established ingredients to their parent fruits
    const existingRecipeIngs = await query('SELECT DISTINCT ingredient_name FROM recipe_ingredients');
    for (const row of existingRecipeIngs) {
      const parentFruit = getParentFruitName(row.ingredient_name);
      if (parentFruit) {
        const fruitExists = await query('SELECT COUNT(*) as count FROM ingredients WHERE LOWER(name) = LOWER(?)', [parentFruit]);
        if (Number(fruitExists[0].count) === 0) {
          await query('INSERT INTO ingredients (name, bulk_cost, bulk_qty, unit) VALUES (?, 0.0, 1.0, \'unit\')', [parentFruit]);
        }
      }
    }
  } catch (err) {
    console.error('Error in seedData cleanups and migration:', err);
  }

  // Seed cinnamon_rolls_prices
  const initialRollPrices = [
    { size: 'regular', quantity: 1, price: null },
    { size: 'regular', quantity: 3, price: null },
    { size: 'regular', quantity: 6, price: null },
    { size: 'regular', quantity: 9, price: null },
    
    { size: 'mini', quantity: 1, price: null },
    { size: 'mini', quantity: 3, price: null },
    { size: 'mini', quantity: 6, price: null },
    { size: 'mini', quantity: 9, price: null },
    { size: 'mini', quantity: 12, price: null },
    { size: 'mini', quantity: 15, price: null },
    { size: 'mini', quantity: 18, price: null },
    { size: 'mini', quantity: 21, price: null },
    { size: 'mini', quantity: 24, price: null }
  ];

  for (const item of initialRollPrices) {
    const exists = await query('SELECT COUNT(*) as count FROM cinnamon_rolls_prices WHERE size = ? AND quantity = ?', [item.size, item.quantity]);
    if (Number(exists[0].count) === 0) {
      await query('INSERT INTO cinnamon_rolls_prices (size, quantity, price) VALUES (?, ?, ?)', [item.size, item.quantity, item.price]);
    }
  }

  // Seed frosting_prices
  const initialFrostings = [
    { id: 'classic', name: 'Classic', price: 0.0 },
    { id: 'oreo', name: 'Oreo', price: null },
    { id: 'chocolate', name: 'Chocolate', price: null },
    { id: 'lemon', name: 'Lemon', price: null }
  ];

  for (const frosting of initialFrostings) {
    const exists = await query('SELECT COUNT(*) as count FROM frosting_prices WHERE id = ?', [frosting.id]);
    if (Number(exists[0].count) === 0) {
      await query('INSERT INTO frosting_prices (id, name, price) VALUES (?, ?, ?)', [frosting.id, frosting.name, frosting.price]);
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
  addDessert: (id, name, desc, p8x5, p9x9, p8x8, toppings, img, p1roll, p4pack, p6pack, p12pack) => 
    query('INSERT INTO desserts (id, name, description, price_8x5, price_9x9, price_8x8, price_1_roll, price_4_pack, price_6_pack, price_12_pack, has_toppings, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [id, name, desc, p8x5, p9x9, p8x8, p1roll, p4pack, p6pack, p12pack, toppings, img]),
  updateDessertPrices: (id, p8x5, p9x9, p8x8, p1roll, p4pack, p6pack, p12pack) => 
    query('UPDATE desserts SET price_8x5 = ?, price_9x9 = ?, price_8x8 = ?, price_1_roll = ?, price_4_pack = ?, price_6_pack = ?, price_12_pack = ? WHERE id = ?', [p8x5, p9x9, p8x8, p1roll, p4pack, p6pack, p12pack, id]),
  
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
  updateOrderPrice: (id, price) => query('UPDATE orders SET total_price = ? WHERE id = ?', [price, id]),
  deleteOrder: (id) => query('DELETE FROM orders WHERE id = ?', [id]),

  // Ingredients CRUD (Inventory pricing)
  getIngredients: () => query('SELECT * FROM ingredients ORDER BY name ASC'),
  addIngredient: async (name, bulk_cost, bulk_qty, unit) => {
    const exists = await query('SELECT COUNT(*) as count FROM ingredients WHERE LOWER(name) = LOWER(?)', [name.trim()]);
    if (Number(exists[0].count) === 0) {
      return query('INSERT INTO ingredients (name, bulk_cost, bulk_qty, unit) VALUES (?, ?, ?, ?)', 
        [name.trim(), bulk_cost || 0.0, bulk_qty || 1.0, unit || 'g']);
    }
    return { changes: 0 };
  },
  updateIngredient: (id, bulk_cost, bulk_qty, unit, tax_rate) => 
    query('UPDATE ingredients SET bulk_cost = ?, bulk_qty = ?, unit = ?, tax_rate = ? WHERE id = ?', 
      [bulk_cost, bulk_qty, unit, tax_rate || 0.0, id]),
  deleteIngredient: (id) => query('DELETE FROM ingredients WHERE id = ?', [id]),

  // Recipe Ingredients CRUD (Recipe formulation)
  getRecipeIngredients: () => query('SELECT * FROM recipe_ingredients ORDER BY dessert_id ASC, ingredient_name ASC'),
  getRecipeIngredientsByDessert: (dessert_id) => 
    query('SELECT * FROM recipe_ingredients WHERE dessert_id = ? ORDER BY ingredient_name ASC', [dessert_id]),
  addRecipeIngredient: async (dessert_id, ingredient_name, amount, unit, is_topping, topping_value, recipe_part) => {
    const nameTrim = ingredient_name.trim();
    const parentFruit = getParentFruitName(nameTrim);
    
    if (parentFruit) {
      // 1. Ensure the parent fruit exists in inventory (in units)
      const fruitExists = await query('SELECT COUNT(*) as count FROM ingredients WHERE LOWER(name) = LOWER(?)', [parentFruit]);
      if (Number(fruitExists[0].count) === 0) {
        await query('INSERT INTO ingredients (name, bulk_cost, bulk_qty, unit) VALUES (?, 0.0, 1.0, \'unit\')', [parentFruit]);
      }
    } else {
      // 1. Ensure this exact ingredient exists in inventory
      const exists = await query('SELECT COUNT(*) as count FROM ingredients WHERE LOWER(name) = LOWER(?)', [nameTrim]);
      if (Number(exists[0].count) === 0) {
        await query('INSERT INTO ingredients (name, bulk_cost, bulk_qty, unit) VALUES (?, 0.0, 1.0, ?)', [nameTrim, unit || 'g']);
      }
    }
    
    // 2. Insert recipe ingredient usage
    return query(
      `INSERT INTO recipe_ingredients (dessert_id, ingredient_name, amount, unit, is_topping, topping_value, recipe_part) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [dessert_id, nameTrim, amount, unit, is_topping || 0, topping_value || null, recipe_part ? recipe_part.trim() : 'Main']
    );
  },
  deleteRecipeIngredient: (id) => query('DELETE FROM recipe_ingredients WHERE id = ?', [id]),

  calculateOrderCost: async (order) => {
    if (!order || !order.dessert_id) return 0;
    
    // Fetch recipe ingredients used in this recipe
    const recipeIngredients = await query('SELECT * FROM recipe_ingredients WHERE dessert_id = ?', [order.dessert_id]);
    
    // Fetch bulk inventory prices (including tax_rate and unit)
    const inventory = await query('SELECT name, bulk_cost, bulk_qty, tax_rate, unit FROM ingredients');
    const costMap = {};
    const unitMap = {};
    inventory.forEach(item => {
      const qty = item.bulk_qty || 1.0;
      const costWithTax = (item.bulk_cost || 0.0) * (1 + (item.tax_rate || 0.0));
      costMap[item.name.toLowerCase().trim()] = costWithTax / qty;
      unitMap[item.name.toLowerCase().trim()] = item.unit || 'g';
    });

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
    
    let multiplier = 1.0;
    if (order.dessert_id === 'cinnamon_rolls') {
      const match = order.size.match(/^(reg|mini)_(\d+)$/);
      if (match) {
        const type = match[1];
        const qty = parseInt(match[2]);
        if (type === 'reg') {
          multiplier = qty / 9;
        } else {
          multiplier = qty / 24;
        }
      } else {
        const legacyMultipliers = {
          '1_roll': 1 / 9,
          '4_pack': 4 / 9,
          '6_pack': 6 / 9,
          'full_tray': 1.0
        };
        multiplier = legacyMultipliers[order.size] || 1.0;
      }
    } else {
      const SIZE_MULTIPLIERS = {
        '8x5': 1.0,
        '9x9': 1.8,
        '8x8': 1.6
      };
      multiplier = SIZE_MULTIPLIERS[order.size] || 1.0;
    }
    
    let baseCost = 0;
    let toppingsCost = 0;
    
    recipeIngredients.forEach(ing => {
      const resolvedName = resolveInventoryIngredientName(ing.ingredient_name, inventory);
      const nameKey = resolvedName.toLowerCase().trim();
      const unitCost = costMap[nameKey] || 0.0;
      const inventoryUnit = unitMap[nameKey] || 'g';
      
      const convertedAmount = convertRecipeAmountToInventoryUnit(ing.ingredient_name, ing.amount, ing.unit, inventoryUnit);
      const ingredientCost = convertedAmount * unitCost;

      if (ing.is_topping) {
        const hasTopping = toppingsArr.some(t => {
          return t.toLowerCase().trim() === (ing.topping_value || '').toLowerCase().trim();
        });
        if (hasTopping) {
          toppingsCost += ingredientCost;
        }
      } else {
        baseCost += ingredientCost;
      }
    });
    
    return Number(((baseCost + toppingsCost) * multiplier).toFixed(2));
  },

  // Cinnamon rolls specific pricing
  getCinnamonRollsPrices: () => query('SELECT * FROM cinnamon_rolls_prices ORDER BY size ASC, quantity ASC'),
  getCinnamonRollPrice: (size, qty) => query('SELECT * FROM cinnamon_rolls_prices WHERE size = ? AND quantity = ?', [size, qty]).then(rows => rows[0]),
  updateCinnamonRollsPrice: async (size, qty, price) => {
    await query('DELETE FROM cinnamon_rolls_prices WHERE size = ? AND quantity = ?', [size, qty]);
    return query('INSERT INTO cinnamon_rolls_prices (size, quantity, price) VALUES (?, ?, ?)', [size, qty, price]);
  },
  
  // Frosting upcharges
  getFrostingPrices: () => query('SELECT * FROM frosting_prices ORDER BY id ASC'),
  getFrosting: (id) => query('SELECT * FROM frosting_prices WHERE id = ?', [id]).then(rows => rows[0]),
  updateFrostingPrice: (id, price) => query('UPDATE frosting_prices SET price = ? WHERE id = ?', [price, id])
};

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

function convertRecipeAmountToInventoryUnit(ingredientName, amount, recipeUnit, inventoryUnit) {
  const name = ingredientName.toLowerCase().trim();
  
  let amountInGrams = amount;
  if (recipeUnit === 'tsp' || recipeUnit === 'tbsp') {
    amountInGrams = convertTspTbspToGrams(ingredientName, amount, recipeUnit);
  }
  
  let gramsPerUnit = 50.0;
  if (name.includes('orange') && name.includes('zest')) {
    gramsPerUnit = 6.0;
  } else if (name.includes('orange')) {
    gramsPerUnit = 150.0;
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
  
  if (inventoryUnit === 'g' || inventoryUnit === 'ml') {
    if (recipeUnit === 'unit') {
      return amount * gramsPerUnit;
    }
    return amountInGrams;
  } else if (inventoryUnit === 'unit') {
    // Custom fruit juice/zest conversions to whole fruits
    if (name.includes('lemon juice') || name.includes('jugo de limón') || name.includes('jugo de limon')) {
      if (recipeUnit === 'g' || recipeUnit === 'ml') {
        return amount / 30.0;
      } else if (recipeUnit === 'tbsp') {
        return (amount * 15.0) / 30.0;
      } else if (recipeUnit === 'tsp') {
        return (amount * 5.0) / 30.0;
      } else if (recipeUnit === 'unit') {
        return amount;
      }
    }
    if (name.includes('lemon zest') || name.includes('ralladura de limón') || name.includes('ralladura de limon')) {
      if (recipeUnit === 'tbsp') {
        return amount;
      } else if (recipeUnit === 'tsp') {
        return amount / 3.0;
      } else if (recipeUnit === 'g') {
        return amount / 6.0;
      } else if (recipeUnit === 'unit') {
        return amount;
      }
    }
    if (name.includes('lime juice') || name.includes('jugo de lima')) {
      if (recipeUnit === 'g' || recipeUnit === 'ml') {
        return amount / 20.0;
      } else if (recipeUnit === 'tbsp') {
        return (amount * 15.0) / 20.0;
      } else if (recipeUnit === 'tsp') {
        return (amount * 5.0) / 20.0;
      } else if (recipeUnit === 'unit') {
        return amount;
      }
    }
    if (name.includes('lime zest') || name.includes('ralladura de lima')) {
      if (recipeUnit === 'tsp') {
        return amount;
      } else if (recipeUnit === 'tbsp') {
        return amount * 3.0;
      } else if (recipeUnit === 'g') {
        return amount / 2.0;
      } else if (recipeUnit === 'unit') {
        return amount;
      }
    }
    if (name.includes('orange juice') || name.includes('jugo de naranja')) {
      if (recipeUnit === 'g' || recipeUnit === 'ml') {
        return amount / 80.0;
      } else if (recipeUnit === 'tbsp') {
        return (amount * 15.0) / 80.0;
      } else if (recipeUnit === 'tsp') {
        return (amount * 5.0) / 80.0;
      } else if (recipeUnit === 'unit') {
        return amount;
      }
    }
    if (name.includes('orange zest') || name.includes('ralladura de naranja')) {
      if (recipeUnit === 'tbsp') {
        return amount / 1.5;
      } else if (recipeUnit === 'tsp') {
        return amount / 4.5;
      } else if (recipeUnit === 'g') {
        return amount / 9.0;
      } else if (recipeUnit === 'unit') {
        return amount;
      }
    }
    if (name.includes('pineapple juice') || name.includes('jugo de piña') || name.includes('jugo de pina')) {
      if (recipeUnit === 'g' || recipeUnit === 'ml') {
        return amount / 600.0; // 600g juice = 1 pineapple
      } else if (recipeUnit === 'unit') {
        return amount;
      }
    }
    if (name.includes('pineapple chunks') || name.includes('pineapple crush') || name.includes('piña en trozos') || name.includes('piña triturada')) {
      if (recipeUnit === 'g' || recipeUnit === 'ml') {
        return amount / 900.0; // 900g chunks = 1 pineapple
      } else if (recipeUnit === 'unit') {
        return amount;
      }
    }
    if (name.includes('apple juice') || name.includes('jugo de manzana')) {
      if (recipeUnit === 'g' || recipeUnit === 'ml') {
        return amount / 120.0; // 120g juice = 1 apple
      } else if (recipeUnit === 'unit') {
        return amount;
      }
    }
    if (name.includes('apple slices') || name.includes('apple chunks') || name.includes('sliced apple') || name.includes('manzana en rodajas')) {
      if (recipeUnit === 'g' || recipeUnit === 'ml') {
        return amount / 150.0; // 150g slices = 1 apple
      } else if (recipeUnit === 'unit') {
        return amount;
      }
    }

    if (recipeUnit !== 'unit') {
      return amountInGrams / gramsPerUnit;
    }
    return amount;
  }
  
  return amount;
}

function resolveInventoryIngredientName(recipeIngName, inventoryItems) {
  const name = recipeIngName.toLowerCase().trim();
  const invNames = inventoryItems.map(item => item.name.toLowerCase().trim());
  
  if (name.includes('lemon') || name.includes('limón') || name.includes('limon') || name.includes('limones')) {
    const match = invNames.find(n => n === 'lemons' || n === 'lemon' || n === 'limón' || n === 'limon' || n === 'limones');
    if (match) return match;
  }
  
  if (name.includes('lime') || name.includes('lima') || name.includes('limas')) {
    const match = invNames.find(n => n === 'limes' || n === 'lime' || n === 'lima' || n === 'limas');
    if (match) return match;
  }
  
  if (name.includes('orange') || name.includes('naranja') || name.includes('naranjas')) {
    const match = invNames.find(n => n === 'oranges' || n === 'orange' || n === 'naranja' || n === 'naranjas');
    if (match) return match;
  }

  if (name.includes('pineapple') || name.includes('piña') || name.includes('pina')) {
    const match = invNames.find(n => n === 'pineapples' || n === 'pineapple' || n === 'piña' || n === 'pina');
    if (match) return match;
  }

  if (name.includes('apple') || name.includes('manzana') || name.includes('manzanas')) {
    const match = invNames.find(n => n === 'apples' || n === 'apple' || n === 'manzanas' || n === 'manzana');
    if (match) return match;
  }

  if (name.includes('banana') || name.includes('guineo') || name.includes('guineos') || name.includes('bananas')) {
    const match = invNames.find(n => n === 'bananas' || n === 'banana' || n === 'guineos' || n === 'guineo');
    if (match) return match;
  }

  if (name.includes('strawberry') || name.includes('fresa') || name.includes('fresas') || name.includes('strawberries')) {
    const match = invNames.find(n => n === 'strawberries' || n === 'strawberry' || n === 'fresas' || n === 'fresa');
    if (match) return match;
  }

  if (name.includes('blueberry') || name.includes('arándano') || name.includes('arandano') || name.includes('blueberries')) {
    const match = invNames.find(n => n === 'blueberries' || n === 'blueberry' || n === 'arándanos' || n === 'arandanos');
    if (match) return match;
  }

  if (name.includes('passionfruit') || name.includes('maracuyá') || name.includes('maracuya')) {
    const match = invNames.find(n => n === 'passionfruit' || n === 'maracuyá' || n === 'maracuya');
    if (match) return match;
  }

  if (name.includes('mango') || name.includes('mangos')) {
    const match = invNames.find(n => n === 'mangos' || n === 'mango');
    if (match) return match;
  }

  if (name.includes('coconut') || name.includes('coco') || name.includes('coconuts')) {
    const match = invNames.find(n => n === 'coconuts' || n === 'coconut' || n === 'coco' || n === 'cocos');
    if (match) return match;
  }
  
  return recipeIngName;
}

function getParentFruitName(recipeIngName) {
  const name = recipeIngName.toLowerCase().trim();
  
  if (name.includes('lemon') || name.includes('limón') || name.includes('limon')) return 'Lemons';
  if (name.includes('lime') || name.includes('lima')) return 'Limes';
  if (name.includes('orange') || name.includes('naranja')) return 'Oranges';
  if (name.includes('pineapple') || name.includes('piña') || name.includes('pina')) return 'Pineapples';
  if (name.includes('apple') || name.includes('manzana')) return 'Apples';
  if (name.includes('banana') || name.includes('guineo')) return 'Bananas';
  if (name.includes('strawberry') || name.includes('fresa')) return 'Strawberries';
  if (name.includes('blueberry') || name.includes('arándano') || name.includes('arandano')) return 'Blueberries';
  if (name.includes('passionfruit') || name.includes('maracuyá') || name.includes('maracuya')) return 'Passionfruit';
  if (name.includes('mango')) return 'Mangos';
  if (name.includes('coconut') || name.includes('coco')) return 'Coconuts';
  
  const stripWords = [
    'juice', 'zest', 'peel', 'extract', 
    'jugo de', 'jugo', 'ralladura de', 'ralladura', 'ralladura de cáscara de',
    'de limón', 'de limon', 'de naranja', 'de lima'
  ];
  
  const isDerivative = stripWords.some(word => name.includes(word));
  if (isDerivative) {
    let clean = name;
    stripWords.forEach(word => {
      clean = clean.replace(new RegExp('\\b' + word + '\\b', 'gi'), '');
    });
    clean = clean.replace(/\s+/g, ' ').trim();
    if (clean.length > 0) {
      let cap = clean.charAt(0).toUpperCase() + clean.slice(1);
      if (!cap.endsWith('s')) {
        if (cap.endsWith('y')) {
          cap = cap.slice(0, -1) + 'ies';
        } else if (cap.endsWith('o') || cap.endsWith('ch') || cap.endsWith('sh')) {
          cap = cap + 'es';
        } else {
          cap = cap + 's';
        }
      }
      return cap;
    }
  }
  
  return null;
}
