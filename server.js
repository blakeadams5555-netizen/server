// server.js (Vercel + Supabase version)
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

// Overwrite all products (bulk insert)
app.post("/api/products", async (req, res) => {
  const products = req.body; // array of products

  // Delete existing products
  const { error: delError } = await supabase.from("products").delete().neq("id", 0);
  if (delError) return res.status(500).json({ error: delError.message });

  // Insert new products
  const { error } = await supabase.from("products").insert(products);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true, message: "Products updated successfully" });
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
  const { error } = await supabase.from("sales").insert([sale]);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true, message: "Sale added successfully" });
});

// Reset all sales
app.post("/api/sales/reset", async (req, res) => {
  const { error } = await supabase.from("sales").delete().neq("id", 0);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true, message: "All sales reset successfully" });
});

// -------------------- Export for Vercel --------------------
export default app;
