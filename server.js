// server.js (Vercel + Supabase with updates/appends)
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// ⚡ Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// -------------------- PRODUCTS --------------------

// Get all products
app.get("/api/products", async (req, res) => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.get("/api/health", (req, res) => {
  if (!supabase) {
    return res.status(500).json({ status: "error", message: "Supabase not initialized" });
  }
  res.json({ status: "ok", message: "Server is running ✅" });
});

// Add or update products
app.post("/api/products", async (req, res) => {
  const products = req.body; // array of products

  try {
    for (const product of products) {
      // Upsert: insert new or update existing
      const { error } = await supabase
        .from("products")
        .upsert(product, { onConflict: ["id"] }); // 'id' is the unique key
      if (error) throw error;
    }
    res.json({ success: true, message: "Products added/updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- SALES --------------------

// Get all sales
app.get("/api/sales", async (req, res) => {
  const { data, error } = await supabase.from("sales").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add a new sale
app.post("/api/sales", async (req, res) => {
  const sale = req.body; // { id, date, salesperson, items, total, profit }

  try {
    const { error } = await supabase.from("sales").insert([sale]);
    if (error) throw error;

    res.json({ success: true, message: "Sale added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset all sales
app.post("/api/sales/reset", async (req, res) => {
  const { error } = await supabase.from("sales").delete().neq("id", 0);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true, message: "All sales reset successfully" });
});

// -------------------- Export for Vercel --------------------
export default app;
