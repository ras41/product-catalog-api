const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");

const productRoutes = require("./routes/products");

const app = express();

app.use(express.json());

// Serve static files from project-root /public
app.use(express.static(path.join(__dirname, "../public")));

// API
app.use("/products", productRoutes);

// No need for app.get("/")

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});