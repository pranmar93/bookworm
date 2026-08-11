require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query, pool } = require('./db');

const seed = async () => {
  console.log('🌱 Seeding database...');

  // ─── Categories ───────────────────────────────────────────────────
  const categories = [
    { name: 'Romance', desc: 'Love stories and romantic fiction' },
    { name: 'Mystery', desc: 'Whodunits and crime thrillers' },
    { name: 'Science Fiction', desc: 'Futuristic and speculative fiction' },
    { name: 'Fantasy', desc: 'Magic, dragons and epic adventures' },
    { name: 'Thriller', desc: 'Edge-of-your-seat suspense novels' },
    { name: 'Biography', desc: 'Real life stories of remarkable people' },
    { name: 'Self-Help', desc: 'Personal development and motivation' },
    { name: 'Business', desc: 'Entrepreneurship and professional growth' },
    { name: 'History', desc: 'Historical events and civilizations' },
    { name: "Children's Books", desc: 'Stories for young readers' },
    { name: 'Non-fiction', desc: 'Fact-based narratives and essays' },
    { name: 'Horror', desc: 'Scary stories and supernatural fiction' },
  ];

  const catIds = {};
  for (const cat of categories) {
    const r = await query(
      `INSERT INTO categories (category_name, description)
       VALUES ($1, $2)
       ON CONFLICT (category_name) DO UPDATE SET description = $2
       RETURNING category_id, category_name`,
      [cat.name, cat.desc]
    );
    catIds[cat.name] = r.rows[0].category_id;
  }
  console.log('✅ Categories seeded');

  // ─── Authors ───────────────────────────────────────────────────────
  const authors = [
    { name: 'Jane Austen', bio: 'English novelist known for Pride and Prejudice and Sense and Sensibility.' },
    { name: 'Agatha Christie', bio: 'Queen of Crime; author of the Hercule Poirot and Miss Marple series.' },
    { name: 'Isaac Asimov', bio: 'American author and professor of biochemistry, pioneer of science fiction.' },
    { name: 'J.R.R. Tolkien', bio: 'English author and philologist, creator of Middle-earth.' },
    { name: 'Stephen King', bio: 'American author of horror, supernatural fiction and suspense.' },
    { name: 'Yuval Noah Harari', bio: 'Israeli historian and author of Sapiens and Homo Deus.' },
    { name: 'Dale Carnegie', bio: 'American writer and lecturer known for How to Win Friends and Influence People.' },
    { name: 'Walter Isaacson', bio: 'American author of acclaimed biographies including Steve Jobs and Einstein.' },
    { name: 'J.K. Rowling', bio: 'British author, best known for the Harry Potter fantasy series.' },
    { name: 'Colleen Hoover', bio: 'American author of contemporary romance and new adult fiction.' },
    { name: 'George Orwell', bio: 'English novelist and essayist known for 1984 and Animal Farm.' },
    { name: 'Gillian Flynn', bio: 'American author known for psychological thrillers like Gone Girl.' },
    { name: 'Brandon Sanderson', bio: 'American author of epic fantasy, creator of the Cosmere universe.' },
    { name: 'Malcolm Gladwell', bio: 'Canadian journalist and author of Outliers and The Tipping Point.' },
    { name: 'Paulo Coelho', bio: 'Brazilian lyricist and novelist known for The Alchemist.' },
  ];

  const authorIds = {};
  for (const author of authors) {
    const r = await query(
      `INSERT INTO authors (author_name, bio) VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING author_id, author_name`,
      [author.name, author.bio]
    );
    if (r.rows.length > 0) authorIds[author.name] = r.rows[0].author_id;
    else {
      const ex = await query('SELECT author_id FROM authors WHERE author_name = $1', [author.name]);
      authorIds[author.name] = ex.rows[0].author_id;
    }
  }
  console.log('✅ Authors seeded');

  // ─── Books ─────────────────────────────────────────────────────────
  const covers = {
    Romance: 'https://covers.openlibrary.org/b/id/10527843-L.jpg',
    Mystery: 'https://covers.openlibrary.org/b/id/8479576-L.jpg',
    'Science Fiction': 'https://covers.openlibrary.org/b/id/9284966-L.jpg',
    Fantasy: 'https://covers.openlibrary.org/b/id/8406786-L.jpg',
    Thriller: 'https://covers.openlibrary.org/b/id/9254120-L.jpg',
    Biography: 'https://covers.openlibrary.org/b/id/9118664-L.jpg',
    'Self-Help': 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    Business: 'https://covers.openlibrary.org/b/id/9253922-L.jpg',
    History: 'https://covers.openlibrary.org/b/id/10509268-L.jpg',
    Horror: 'https://covers.openlibrary.org/b/id/8228691-L.jpg',
    'Non-fiction': 'https://covers.openlibrary.org/b/id/8231896-L.jpg',
    "Children's Books": 'https://covers.openlibrary.org/b/id/10527843-L.jpg',
  };

  const booksData = [
    // Romance
    { title: 'Pride and Prejudice', author: 'Jane Austen', cat: 'Romance', price: 299, isbn: '978-0141439518', format: 'Paperback', bestseller: true, recommended: true, desc: 'The classic love story of Elizabeth Bennet and Mr. Darcy.', stock: 100 },
    { title: 'Sense and Sensibility', author: 'Jane Austen', cat: 'Romance', price: 249, isbn: '978-0141439662', format: 'Paperback', bestseller: false, recommended: true, desc: 'Two sisters navigate love and heartbreak in Regency England.', stock: 80 },
    { title: 'It Ends with Us', author: 'Colleen Hoover', cat: 'Romance', price: 399, isbn: '978-1501110368', format: 'Paperback', new_launch: true, recommended: true, desc: 'A powerful story about the courage required to start over.', stock: 120 },
    { title: 'Ugly Love', author: 'Colleen Hoover', cat: 'Romance', price: 349, isbn: '978-1476749273', format: 'Paperback', bestseller: true, desc: 'A story of two people navigating a complicated arrangement.', stock: 95 },
    { title: 'Verity', author: 'Colleen Hoover', cat: 'Thriller', price: 379, isbn: '978-1538724736', format: 'Paperback', bestseller: true, recommended: true, desc: 'A psychological thriller that will keep you guessing.', stock: 110 },

    // Mystery
    { title: 'Murder on the Orient Express', author: 'Agatha Christie', cat: 'Mystery', price: 279, isbn: '978-0007119318', format: 'Paperback', bestseller: true, recommended: true, desc: 'Poirot investigates a murder on a luxury train.', stock: 90 },
    { title: 'And Then There Were None', author: 'Agatha Christie', cat: 'Mystery', price: 259, isbn: '978-0007136834', format: 'Paperback', bestseller: true, desc: 'Ten strangers are lured to an island and begin to die one by one.', stock: 85 },
    { title: 'The ABC Murders', author: 'Agatha Christie', cat: 'Mystery', price: 229, isbn: '978-0007527533', format: 'Paperback', desc: 'Poirot receives taunting letters about upcoming murders.', stock: 70 },
    { title: 'Gone Girl', author: 'Gillian Flynn', cat: 'Thriller', price: 349, isbn: '978-0307588364', format: 'Paperback', bestseller: true, recommended: true, desc: 'On a couple\'s fifth wedding anniversary, the wife goes missing.', stock: 100 },
    { title: 'Sharp Objects', author: 'Gillian Flynn', cat: 'Thriller', price: 299, isbn: '978-0307341556', format: 'Paperback', new_launch: true, desc: 'A journalist returns to her hometown to cover a murder.', stock: 60 },

    // Science Fiction
    { title: 'Foundation', author: 'Isaac Asimov', cat: 'Science Fiction', price: 319, isbn: '978-0553293357', format: 'Paperback', bestseller: true, recommended: true, desc: 'A group of scientists work to preserve civilization across the galaxy.', stock: 75 },
    { title: 'I, Robot', author: 'Isaac Asimov', cat: 'Science Fiction', price: 299, isbn: '978-0553294385', format: 'Paperback', recommended: true, desc: 'Classic stories exploring the laws of robotics.', stock: 65 },
    { title: 'The Caves of Steel', author: 'Isaac Asimov', cat: 'Science Fiction', price: 279, isbn: '978-0553293395', format: 'Paperback', desc: 'A detective and robot partner solve a murder in a futuristic city.', stock: 50 },
    { title: '1984', author: 'George Orwell', cat: 'Science Fiction', price: 269, isbn: '978-0451524935', format: 'Paperback', bestseller: true, recommended: true, desc: 'A dystopian vision of a totalitarian future society.', stock: 150 },
    { title: 'Dune', author: 'Isaac Asimov', cat: 'Science Fiction', price: 449, isbn: '978-0441013593', format: 'Hardcover', bestseller: true, new_launch: false, recommended: true, desc: 'An epic tale of politics, religion and survival on a desert planet.', stock: 80 },

    // Fantasy
    { title: 'The Fellowship of the Ring', author: 'J.R.R. Tolkien', cat: 'Fantasy', price: 449, isbn: '978-0547928210', format: 'Paperback', bestseller: true, recommended: true, desc: 'Frodo sets out on a quest to destroy the One Ring.', stock: 120 },
    { title: 'The Two Towers', author: 'J.R.R. Tolkien', cat: 'Fantasy', price: 449, isbn: '978-0547928203', format: 'Paperback', bestseller: true, desc: 'The fellowship is broken as the war of the ring continues.', stock: 100 },
    { title: 'The Return of the King', author: 'J.R.R. Tolkien', cat: 'Fantasy', price: 449, isbn: '978-0547928197', format: 'Paperback', bestseller: true, desc: 'The final battle for Middle-earth begins.', stock: 100 },
    { title: "Harry Potter and the Philosopher's Stone", author: 'J.K. Rowling', cat: 'Fantasy', price: 399, isbn: '978-0439708180', format: 'Paperback', bestseller: true, recommended: true, desc: 'A young boy discovers he is a wizard and attends Hogwarts.', stock: 200 },
    { title: 'Harry Potter and the Chamber of Secrets', author: 'J.K. Rowling', cat: 'Fantasy', price: 399, isbn: '978-0439064873', format: 'Paperback', bestseller: true, desc: 'Harry returns to Hogwarts to face the Chamber of Secrets.', stock: 180 },
    { title: 'The Way of Kings', author: 'Brandon Sanderson', cat: 'Fantasy', price: 499, isbn: '978-0765326355', format: 'Hardcover', new_launch: true, recommended: true, desc: 'Epic fantasy set in a world ravaged by storms.', stock: 60 },
    { title: 'The Alchemist', author: 'Paulo Coelho', cat: 'Fantasy', price: 249, isbn: '978-0062315007', format: 'Paperback', bestseller: true, recommended: true, desc: 'A young shepherd travels in search of treasure and wisdom.', stock: 175 },

    // Horror
    { title: 'The Shining', author: 'Stephen King', cat: 'Horror', price: 379, isbn: '978-0307743657', format: 'Paperback', bestseller: true, recommended: true, desc: 'A family becomes caretakers of an isolated hotel haunted by evil.', stock: 90 },
    { title: 'It', author: 'Stephen King', cat: 'Horror', price: 499, isbn: '978-1501142970', format: 'Hardcover', bestseller: true, desc: 'A group of children face an ancient evil in the form of a clown.', stock: 70 },
    { title: 'Pet Sematary', author: 'Stephen King', cat: 'Horror', price: 329, isbn: '978-1501156700', format: 'Paperback', new_launch: true, desc: 'A family discovers a burial ground with terrifying properties.', stock: 55 },

    // Biography
    { title: 'Steve Jobs', author: 'Walter Isaacson', cat: 'Biography', price: 549, isbn: '978-1451648539', format: 'Hardcover', bestseller: true, recommended: true, desc: 'The exclusive biography of Apple co-founder Steve Jobs.', stock: 85 },
    { title: 'Einstein: His Life and Universe', author: 'Walter Isaacson', cat: 'Biography', price: 499, isbn: '978-0743264747', format: 'Hardcover', recommended: true, desc: 'A compelling biography of the greatest scientist of the 20th century.', stock: 65 },
    { title: 'Leonardo da Vinci', author: 'Walter Isaacson', cat: 'Biography', price: 549, isbn: '978-1501139154', format: 'Hardcover', new_launch: true, desc: 'The story of the genius who defined the Renaissance.', stock: 50 },

    // Self-Help
    { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', cat: 'Self-Help', price: 299, isbn: '978-0671027032', format: 'Paperback', bestseller: true, recommended: true, desc: 'The ultimate guide to building meaningful relationships.', stock: 200 },
    { title: 'Outliers: The Story of Success', author: 'Malcolm Gladwell', cat: 'Self-Help', price: 349, isbn: '978-0316017930', format: 'Paperback', bestseller: true, recommended: true, desc: 'Why some people succeed and others don\'t.', stock: 130 },
    { title: 'The Tipping Point', author: 'Malcolm Gladwell', cat: 'Self-Help', price: 319, isbn: '978-0316346627', format: 'Paperback', recommended: true, desc: 'How little things can make a big difference.', stock: 110 },
    { title: 'Blink', author: 'Malcolm Gladwell', cat: 'Self-Help', price: 299, isbn: '978-0316010665', format: 'Paperback', desc: 'The power of thinking without thinking.', stock: 90 },

    // Business
    { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', cat: 'Business', price: 499, isbn: '978-0062316097', format: 'Hardcover', bestseller: true, recommended: true, desc: 'A thought-provoking journey through the history of our species.', stock: 150 },
    { title: 'Homo Deus: A Brief History of Tomorrow', author: 'Yuval Noah Harari', cat: 'Business', price: 449, isbn: '978-0062464316', format: 'Hardcover', new_launch: true, recommended: true, desc: 'What does our future hold in the age of algorithms?', stock: 100 },
    { title: '21 Lessons for the 21st Century', author: 'Yuval Noah Harari', cat: 'Non-fiction', price: 399, isbn: '978-0525512172', format: 'Paperback', new_launch: true, desc: 'Key challenges facing humanity today.', stock: 80 },

    // History
    { title: 'A Short History of Nearly Everything', author: 'Yuval Noah Harari', cat: 'History', price: 429, isbn: '978-0767908184', format: 'Paperback', recommended: true, desc: 'A journey through science and the history of discovery.', stock: 75 },

    // Children's
    { title: 'Harry Potter and the Prisoner of Azkaban', author: 'J.K. Rowling', cat: "Children's Books", price: 399, isbn: '978-0439136365', format: 'Paperback', bestseller: true, desc: 'Harry discovers the truth about his mysterious past.', stock: 160 },
    { title: 'Harry Potter and the Goblet of Fire', author: 'J.K. Rowling', cat: "Children's Books", price: 449, isbn: '978-0439139601', format: 'Hardcover', bestseller: true, new_launch: false, desc: 'Harry competes in the Triwizard Tournament.', stock: 140 },

    // More New Launches
    { title: 'Words of Radiance', author: 'Brandon Sanderson', cat: 'Fantasy', price: 499, isbn: '978-0765326362', format: 'Hardcover', new_launch: true, desc: 'The second book in The Stormlight Archive.', stock: 55 },
    { title: 'Mistborn: The Final Empire', author: 'Brandon Sanderson', cat: 'Fantasy', price: 399, isbn: '978-0765311788', format: 'Paperback', new_launch: true, recommended: true, desc: 'A thief-crew stages a heist against a dark empire.', stock: 70 },
    { title: 'Rhythm of War', author: 'Brandon Sanderson', cat: 'Fantasy', price: 549, isbn: '978-0765326379', format: 'Hardcover', new_launch: true, desc: 'The fourth book in The Stormlight Archive.', stock: 45 },
    { title: 'November 9', author: 'Colleen Hoover', cat: 'Romance', price: 369, isbn: '978-1501110375', format: 'Paperback', new_launch: true, desc: 'A love story that unfolds over five Novembers.', stock: 85 },
    { title: 'Confess', author: 'Colleen Hoover', cat: 'Romance', price: 349, isbn: '978-1476791272', format: 'Paperback', new_launch: true, desc: 'Art, secrets and unexpected love.', stock: 75 },
    { title: 'Dark Places', author: 'Gillian Flynn', cat: 'Thriller', price: 299, isbn: '978-0307341570', format: 'Paperback', new_launch: true, desc: 'Libby Day survived a massacre at age seven.', stock: 60 },
    { title: 'Crooked House', author: 'Agatha Christie', cat: 'Mystery', price: 239, isbn: '978-0062074034', format: 'Paperback', new_launch: false, recommended: true, desc: 'The murder of a Greek millionaire.', stock: 65 },
    { title: 'The Secret History', author: 'Gillian Flynn', cat: 'Thriller', price: 389, isbn: '978-1400031702', format: 'Paperback', recommended: true, desc: 'A group of students get caught up in murder.', stock: 70 },
    { title: 'Carrie', author: 'Stephen King', cat: 'Horror', price: 279, isbn: '978-0307743664', format: 'Paperback', desc: 'A telekinetic girl seeks revenge on her tormentors.', stock: 80 },
    { title: 'Misery', author: 'Stephen King', cat: 'Horror', price: 299, isbn: '978-1501143106', format: 'Paperback', recommended: true, desc: 'An author is held captive by his biggest fan.', stock: 75 },
    { title: 'Animal Farm', author: 'George Orwell', cat: 'Non-fiction', price: 199, isbn: '978-0451526342', format: 'Paperback', bestseller: true, recommended: true, desc: 'A satirical allegory of totalitarianism.', stock: 160 },
  ];

  const bookIds = {};
  for (const book of booksData) {
    const cover = covers[book.cat] || covers['Non-fiction'];
    const r = await query(
      `INSERT INTO books (title, author_id, category_id, price, format, isbn, description,
         cover_image_url, stock_quantity, is_bestseller, is_new_launch, is_recommended)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (isbn) DO UPDATE SET title = $1
       RETURNING book_id, title`,
      [
        book.title, authorIds[book.author], catIds[book.cat], book.price,
        book.format || 'Paperback', book.isbn, book.desc, cover, book.stock || 50,
        book.bestseller || false, book.new_launch || false, book.recommended || false,
      ]
    );
    bookIds[book.title] = r.rows[0].book_id;
  }
  console.log(`✅ ${booksData.length} books seeded`);

  // ─── Related Products ──────────────────────────────────────────────
  const relatedPairs = [
    ['Pride and Prejudice', 'Sense and Sensibility'],
    ['Pride and Prejudice', 'It Ends with Us'],
    ['Murder on the Orient Express', 'And Then There Were None'],
    ['Murder on the Orient Express', 'The ABC Murders'],
    ['And Then There Were None', 'Gone Girl'],
    ['Foundation', 'I, Robot'],
    ['Foundation', '1984'],
    ['The Fellowship of the Ring', 'The Two Towers'],
    ['The Two Towers', 'The Return of the King'],
    ["Harry Potter and the Philosopher's Stone", 'Harry Potter and the Chamber of Secrets'],
    ['The Shining', 'It'],
    ['Steve Jobs', 'Einstein: His Life and Universe'],
    ['Sapiens: A Brief History of Humankind', 'Homo Deus: A Brief History of Tomorrow'],
    ['How to Win Friends and Influence People', 'Outliers: The Story of Success'],
    ['Ugly Love', 'It Ends with Us'],
    ['Gone Girl', 'Sharp Objects'],
    ['The Way of Kings', 'Words of Radiance'],
    ['1984', 'Animal Farm'],
  ];

  for (const [a, b] of relatedPairs) {
    if (!bookIds[a] || !bookIds[b]) continue;
    await query(
      `INSERT INTO related_products (book_id, related_book_id) VALUES ($1,$2),($2,$1) ON CONFLICT DO NOTHING`,
      [bookIds[a], bookIds[b]]
    );
  }
  console.log('✅ Related products seeded');

  // ─── Users ─────────────────────────────────────────────────────────
  const testUsers = [
    { email: 'alice@example.com', password: 'password123', first: 'Alice', last: 'Johnson', phone: '9876543210' },
    { email: 'bob@example.com', password: 'password123', first: 'Bob', last: 'Smith', phone: '9876543211' },
    { email: 'carol@example.com', password: 'password123', first: 'Carol', last: 'Williams', phone: '9876543212' },
  ];

  const userIds = {};
  for (const u of testUsers) {
    const hash = await bcrypt.hash(u.password, 12);
    const r = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone_number, gift_points)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (email) DO UPDATE SET first_name = $3
       RETURNING user_id`,
      [u.email, hash, u.first, u.last, u.phone, Math.floor(Math.random() * 500)]
    );
    userIds[u.email] = r.rows[0].user_id;
  }
  console.log('✅ Users seeded');

  // ─── Addresses ─────────────────────────────────────────────────────
  const addressIds = {};
  for (const [email, userId] of Object.entries(userIds)) {
    const r = await query(
      `INSERT INTO addresses (user_id, first_name, last_name, address_line, city, state, pin_code, country, phone_number, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
       RETURNING address_id`,
      [userId, 'Sample', 'User', '123 Book Street', 'Mumbai', 'Maharashtra', '400001', 'India', '9876543210']
    );
    addressIds[email] = r.rows[0].address_id;
  }
  console.log('✅ Addresses seeded');

  // ─── Sample Orders ─────────────────────────────────────────────────
  const orderBooksForUser = [
    ['alice@example.com', ['Pride and Prejudice', 'Murder on the Orient Express', 'Foundation']],
    ['bob@example.com', ['The Fellowship of the Ring', "Harry Potter and the Philosopher's Stone", 'Sapiens: A Brief History of Humankind']],
    ['carol@example.com', ['How to Win Friends and Influence People', 'Gone Girl', 'The Shining']],
  ];

  for (const [email, titles] of orderBooksForUser) {
    const userId = userIds[email];
    const addressId = addressIds[email];

    let subtotal = 0;
    const items = titles.map((title) => {
      const book = booksData.find((b) => b.title === title);
      subtotal += book ? book.price : 299;
      return { book_id: bookIds[title], price: book ? book.price : 299, title };
    });

    const tax = parseFloat((subtotal * 0.18).toFixed(2));
    const grand_total = parseFloat((subtotal + tax).toFixed(2));
    const delivery_date = new Date();
    delivery_date.setDate(delivery_date.getDate() - 5);

    const orderR = await query(
      `INSERT INTO orders (user_id, address_id, subtotal, tax_amount, grand_total,
         order_status, payment_status, estimated_delivery_date, can_cancel)
       VALUES ($1,$2,$3,$4,$5,'delivered','completed',$6,false)
       RETURNING order_id`,
      [userId, addressId, subtotal, tax, grand_total, delivery_date.toISOString().split('T')[0]]
    );
    const orderId = orderR.rows[0].order_id;

    for (const item of items) {
      if (!item.book_id) continue;
      await query(
        `INSERT INTO order_items (order_id, book_id, quantity, unit_price, total_price)
         VALUES ($1,$2,1,$3,$3)`,
        [orderId, item.book_id, item.price]
      );
      // Payment record
      await query(
        `INSERT INTO payments (order_id, payment_method, payment_amount, payment_status, transaction_id)
         VALUES ($1,'credit_card',$2,'success',$3)`,
        [orderId, item.price, `TXN_SEED_${uuidv4().replace(/-/g,'').slice(0,12).toUpperCase()}`]
      );
    }
  }
  console.log('✅ Sample orders seeded');

  // ─── Sample Reviews ────────────────────────────────────────────────
  const reviewData = [
    { email: 'alice@example.com', title: 'Pride and Prejudice', rating: 5, text: 'Timeless classic! Elizabeth Bennet is one of literature\'s greatest heroines.' },
    { email: 'alice@example.com', title: 'Murder on the Orient Express', rating: 5, text: 'The twist ending is absolutely brilliant. Agatha Christie at her very best.' },
    { email: 'alice@example.com', title: 'Foundation', rating: 4, text: 'Asimov\'s vision of the future is breathtaking. Required reading for sci-fi fans.' },
    { email: 'bob@example.com', title: 'The Fellowship of the Ring', rating: 5, text: 'The most immersive fantasy world ever created. Tolkien is a genius.' },
    { email: 'bob@example.com', title: "Harry Potter and the Philosopher's Stone", rating: 5, text: 'Magical, imaginative, and endlessly charming. Perfect for all ages.' },
    { email: 'bob@example.com', title: 'Sapiens: A Brief History of Humankind', rating: 5, text: 'Mind-blowing perspective on human history. Changed how I see the world.' },
    { email: 'carol@example.com', title: 'How to Win Friends and Influence People', rating: 4, text: 'Practical advice that still holds up after nearly a century. Essential reading.' },
    { email: 'carol@example.com', title: 'Gone Girl', rating: 5, text: 'Could not put it down! Every chapter had me guessing. Brilliant thriller.' },
    { email: 'carol@example.com', title: 'The Shining', rating: 5, text: 'Genuinely terrifying. King at his absolute best. Read with the lights on.' },
  ];

  for (const r of reviewData) {
    if (!userIds[r.email] || !bookIds[r.title]) continue;
    await query(
      `INSERT INTO reviews (book_id, user_id, rating, review_text)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (book_id, user_id) DO UPDATE SET rating = $3, review_text = $4`,
      [bookIds[r.title], userIds[r.email], r.rating, r.text]
    );
  }
  console.log('✅ Reviews seeded');

  // ─── Wishlist ──────────────────────────────────────────────────────
  const wishlistItems = [
    ['alice@example.com', 'The Alchemist'],
    ['alice@example.com', 'Verity'],
    ['bob@example.com', 'It'],
    ['bob@example.com', '1984'],
    ['carol@example.com', 'Steve Jobs'],
  ];

  for (const [email, title] of wishlistItems) {
    if (!userIds[email] || !bookIds[title]) continue;
    await query(
      `INSERT INTO wishlist (user_id, book_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [userIds[email], bookIds[title]]
    );
  }
  console.log('✅ Wishlist seeded');

  console.log('\n🎉 Database seeding complete!');
  console.log('Test accounts:');
  testUsers.forEach((u) => console.log(`  ${u.email} / ${u.password}`));

  await pool.end();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
