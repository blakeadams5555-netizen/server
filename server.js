// server.js
import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// 📁 File paths
const dataDir = path.join(process.cwd(), "public");
const productsFile = path.join(dataDir, "products.json");
const salesFile = path.join(dataDir, "sales.json");

// 🛠 Ensure both files exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(productsFile)) fs.writeFileSync(productsFile, "[]");
if (!fs.existsSync(salesFile)) fs.writeFileSync(salesFile, "[]");

// ✅ Get all products
app.get("/api/products", (req, res) => {
  try {
    const data = fs.readFileSync(productsFile, "utf8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("❌ Error reading products file:", err);
    res.status(500).json({ error: "Failed to read products file" });
  }
});

// ✅ Overwrite products
app.post("/api/products", (req, res) => {
  try {
    fs.writeFileSync(productsFile, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error writing products file:", err);
    res.status(500).json({ error: "Failed to save products" });
  }
});

// ✅ Get all sales
app.get("/api/sales", (req, res) => {
  try {
    const data = fs.readFileSync(salesFile, "utf8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("❌ Error reading sales file:", err);
    res.status(500).json({ error: "Failed to read sales file" });
  }
});

// ✅ Overwrite sales (save all)
// ✅ Append a single sale instead of overwriting all
app.post("/api/sales", (req, res) => {
  try {
    const newSale = req.body;
    const existingSales = JSON.parse(fs.readFileSync(salesFile, "utf8") || "[]");

    // Add new sale
    existingSales.unshift(newSale);

    // Save updated array
    fs.writeFileSync(salesFile, JSON.stringify(existingSales, null, 2));

    res.json({ success: true, message: "Sale added successfully" });
  } catch (err) {
    console.error("❌ Error writing sales file:", err);
    res.status(500).json({ error: "Failed to save sale" });
  }
});

app.post("/api/sales/reset", (req, res) => {
  try {
    fs.writeFileSync(salesFile, "[]");
    res.json({ success: true, message: "All sales have been reset." });
  } catch (err) {
    console.error("❌ Error resetting sales:", err);
    res.status(500).json({ error: "Failed to reset sales" });
  }
});


app.listen(5000, () =>
  console.log("✅ API running on http://localhost:5000")
);
