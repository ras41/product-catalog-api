const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const pool = require("../db/db");

// -------------------------------
// Configuration
// -------------------------------
const TOTAL_PRODUCTS = 200000;
const BATCH_SIZE = 5000;

// -------------------------------
// Categories
// -------------------------------
const categories = [
  "Electronics",
  "Books",
  "Fashion",
  "Sports",
  "Home",
  "Beauty",
  "Toys",
];

// -------------------------------
// Product names based on category
// -------------------------------
const productCatalog = {
  Electronics: [
    "Laptop",
    "Mouse",
    "Keyboard",
    "Monitor",
    "Tablet",
    "Phone",
    "Smart Watch",
    "Speaker",
    "Headphones",
    "Camera",
  ],

  Books: [
    "Novel",
    "Story Book",
    "Cook Book",
    "Dictionary",
    "Notebook",
    "Biography",
    "Comic Book",
    "Journal",
    "Science Book",
    "History Book",
  ],

  Fashion: [
    "T-Shirt",
    "Jeans",
    "Shoes",
    "Jacket",
    "Hoodie",
    "Dress",
    "Cap",
    "Sneakers",
    "Shirt",
    "Sweater",
  ],

  Sports: [
    "Football",
    "Cricket Bat",
    "Basketball",
    "Yoga Mat",
    "Skipping Rope",
    "Tennis Racket",
    "Gloves",
    "Helmet",
    "Sports Bottle",
    "Dumbbells",
  ],

  Home: [
    "Chair",
    "Table",
    "Lamp",
    "Sofa",
    "Curtains",
    "Cupboard",
    "Dining Set",
    "Pillow",
    "Mattress",
    "Clock",
  ],

  Beauty: [
    "Face Wash",
    "Perfume",
    "Lipstick",
    "Moisturizer",
    "Body Lotion",
    "Face Cream",
    "Shampoo",
    "Conditioner",
    "Hair Oil",
    "Sunscreen",
  ],

  Toys: [
    "Toy Car",
    "Puzzle",
    "Lego Set",
    "Doll",
    "Robot Toy",
    "Building Blocks",
    "Action Figure",
    "Teddy Bear",
    "Chess Board",
    "Remote Car",
  ],
};

// -------------------------------
// Adjectives
// -------------------------------
const adjectives = [
  "Premium",
  "Smart",
  "Classic",
  "Wireless",
  "Portable",
  "Modern",
  "Eco",
  "Luxury",
  "Compact",
  "Ultra",
];

// -------------------------------
// Price range
// -------------------------------
const priceRanges = {
  Electronics: [10000, 90000],
  Books: [200, 1500],
  Fashion: [500, 5000],
  Sports: [1000, 12000],
  Home: [800, 20000],
  Beauty: [300, 3000],
  Toys: [500, 5000],
};

// -------------------------------
// Generate one product
// -------------------------------
function generateProduct(i) {
  const category = categories[i % categories.length];

  const adjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];

  const productList = productCatalog[category];

  const productName =
    productList[Math.floor(Math.random() * productList.length)];

  const name = `${adjective} ${productName}`;

  const [minPrice, maxPrice] = priceRanges[category];

  const price =
    Math.floor(Math.random() * (maxPrice - minPrice + 1)) +
    minPrice;

  // Higher IDs => Newer timestamps
  const createdAt = new Date(
    Date.now() - (TOTAL_PRODUCTS - i) * 60000
  );

  const updatedAt = createdAt;

  return {
    name,
    category,
    price,
    createdAt,
    updatedAt,
  };
}

// -------------------------------
// Seed Database
// -------------------------------
async function seedDatabase() {
  try {
    console.log("Removing old data...");

    await pool.query(
      "TRUNCATE TABLE products RESTART IDENTITY"
    );

    console.log("Starting seeding...\n");

    for (
      let start = 1;
      start <= TOTAL_PRODUCTS;
      start += BATCH_SIZE
    ) {
      const values = [];
      const placeholders = [];

      const end = Math.min(
        start + BATCH_SIZE - 1,
        TOTAL_PRODUCTS
      );

      for (let i = start; i <= end; i++) {
        const product = generateProduct(i);

        const offset = values.length;

        placeholders.push(
          `($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4},$${offset + 5})`
        );

        values.push(
          product.name,
          product.category,
          product.price,
          product.createdAt,
          product.updatedAt
        );
      }

      const query = `
        INSERT INTO products
        (
          name,
          category,
          price,
          created_at,
          updated_at
        )
        VALUES
        ${placeholders.join(",")}
      `;

      await pool.query(query, values);

      console.log(
        `Inserted ${end.toLocaleString()} / ${TOTAL_PRODUCTS.toLocaleString()}`
      );
    }

    console.log("\n✅ Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding failed:");
    console.error(err);
  } finally {
    await pool.end();
    console.log("Database connection closed.");
  }
}

seedDatabase();