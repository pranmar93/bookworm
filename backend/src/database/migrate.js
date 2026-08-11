require('dotenv').config();
const { query } = require('./db');

const createTables = async () => {
  console.log('Running migrations...');

  // Enable UUID extension
  await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // Create ENUMs
  await query(`
    DO $$ BEGIN
      CREATE TYPE book_format AS ENUM ('Paperback', 'Hardcover', 'eBook');
    EXCEPTION WHEN duplicate_object THEN null; END $$
  `);
  await query(`
    DO $$ BEGIN
      CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
    EXCEPTION WHEN duplicate_object THEN null; END $$
  `);
  await query(`
    DO $$ BEGIN
      CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
    EXCEPTION WHEN duplicate_object THEN null; END $$
  `);
  await query(`
    DO $$ BEGIN
      CREATE TYPE payment_method_enum AS ENUM ('credit_card', 'debit_card', 'upi', 'wallet');
    EXCEPTION WHEN duplicate_object THEN null; END $$
  `);
  await query(`
    DO $$ BEGIN
      CREATE TYPE payment_status_pay AS ENUM ('pending', 'success', 'failed');
    EXCEPTION WHEN duplicate_object THEN null; END $$
  `);

  // Users
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      phone_number VARCHAR(20),
      is_guest BOOLEAN DEFAULT false,
      gift_points INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Categories
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      category_name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Authors
  await query(`
    CREATE TABLE IF NOT EXISTS authors (
      author_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      author_name VARCHAR(255) NOT NULL,
      bio TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Books
  await query(`
    CREATE TABLE IF NOT EXISTS books (
      book_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR(500) NOT NULL,
      author_id UUID REFERENCES authors(author_id) ON DELETE SET NULL,
      category_id UUID REFERENCES categories(category_id) ON DELETE SET NULL,
      price DECIMAL(10,2) NOT NULL,
      format book_format NOT NULL DEFAULT 'Paperback',
      isbn VARCHAR(20) UNIQUE,
      description TEXT,
      cover_image_url VARCHAR(500),
      stock_quantity INTEGER DEFAULT 0,
      is_bestseller BOOLEAN DEFAULT false,
      is_new_launch BOOLEAN DEFAULT false,
      is_recommended BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Addresses
  await query(`
    CREATE TABLE IF NOT EXISTS addresses (
      address_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      address_line VARCHAR(500) NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pin_code VARCHAR(20) NOT NULL,
      country VARCHAR(100) NOT NULL,
      phone_number VARCHAR(20),
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Orders
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
      address_id UUID REFERENCES addresses(address_id) ON DELETE SET NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      tax_amount DECIMAL(10,2) NOT NULL,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      delivery_charges DECIMAL(10,2) DEFAULT 0,
      grand_total DECIMAL(10,2) NOT NULL,
      order_status order_status_enum DEFAULT 'pending',
      payment_status payment_status_enum DEFAULT 'pending',
      estimated_delivery_date DATE,
      can_cancel BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Order Items
  await query(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
      book_id UUID REFERENCES books(book_id) ON DELETE SET NULL,
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL
    )
  `);

  // Cart
  await query(`
    CREATE TABLE IF NOT EXISTS cart (
      cart_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Cart Items
  await query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      cart_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      cart_id UUID REFERENCES cart(cart_id) ON DELETE CASCADE,
      book_id UUID REFERENCES books(book_id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      added_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(cart_id, book_id)
    )
  `);

  // Payments
  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
      payment_method payment_method_enum,
      payment_amount DECIMAL(10,2) NOT NULL,
      payment_status payment_status_pay DEFAULT 'pending',
      transaction_id VARCHAR(255) UNIQUE,
      card_last_four VARCHAR(4),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Reviews
  await query(`
    CREATE TABLE IF NOT EXISTS reviews (
      review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      book_id UUID REFERENCES books(book_id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      review_text TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(book_id, user_id)
    )
  `);

  // Wishlist
  await query(`
    CREATE TABLE IF NOT EXISTS wishlist (
      wishlist_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
      book_id UUID REFERENCES books(book_id) ON DELETE CASCADE,
      added_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, book_id)
    )
  `);

  // Related Products
  await query(`
    CREATE TABLE IF NOT EXISTS related_products (
      relation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      book_id UUID REFERENCES books(book_id) ON DELETE CASCADE,
      related_book_id UUID REFERENCES books(book_id) ON DELETE CASCADE,
      UNIQUE(book_id, related_book_id)
    )
  `);

  // Indexes for performance
  await query(`CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_books_bestseller ON books(is_bestseller)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_books_new_launch ON books(is_new_launch)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_books_recommended ON books(is_recommended)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_reviews_book ON reviews(book_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

  console.log('Migrations completed successfully!');
  process.exit(0);
};

createTables().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
