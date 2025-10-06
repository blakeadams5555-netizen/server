// server.js
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import serverless from "serverless-http";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// -------------------- Supabase Initialization --------------------
const supabaseUrl = 'https://skdicfiqqqizbbvfbdhd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZGljZmlxcXFpemJidmZiZGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NjkyMzIsImV4cCI6MjA3NTM0NTIzMn0.hztt8aRsUrXr50RH7M-6e-FU_dRNUEib9hwbX2sS21w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// -------------------- HEALTH CHECK --------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running ✅" });
});

// -------------------- PRODUCTS --------------------

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch products:", err.message);
    res.status(500).json({ error: "Failed to fetch products", details: err.message });
  }
});

// Add or update products (bulk upsert)
app.post("/api/products", async (req, res) => {
  const products = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: "Body must be an array of products" });
  }

  try {
    const { error } = await supabase.from("products").upsert(products, { onConflict: ["id"] });
    if (error) throw error;
    res.json({ success: true, message: "Products added/updated successfully" });
  } catch (err) {
    console.error("❌ Failed to upsert products:", err.message);
    res.status(500).json({ error: "Failed to add/update products", details: err.message });
  }
});

// -------------------- SALES --------------------

// Get all sales
app.get("/api/sales", async (req, res) => {
  try {
    const { data, error } = await supabase.from("sales").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch sales:", err.message);
    res.status(500).json({ error: "Failed to fetch sales", details: err.message });
  }
});

// Add a new sale
app.post("/api/sales", async (req, res) => {
  const sale = req.body;
  if (!sale || !sale.id) {
    return res.status(400).json({ error: "Sale object with 'id' is required" });
  }

  try {
    const { error } = await supabase.from("sales").insert([sale]);
    if (error) throw error;
    res.json({ success: true, message: "Sale added successfully" });
  } catch (err) {
    console.error("❌ Failed to add sale:", err.message);
    res.status(500).json({ error: "Failed to add sale", details: err.message });
  }
});

// Reset all sales
app.post("/api/sales/reset", async (req, res) => {
  try {
    const { error } = await supabase.from("sales").delete().neq("id", 0);
    if (error) throw error;
    res.json({ success: true, message: "All sales reset successfully" });
  } catch (err) {
    console.error("❌ Failed to reset sales:", err.message);
    res.status(500).json({ error: "Failed to reset sales", details: err.message });
  }
});

// -------------------- Export for Vercel --------------------
export const handler = serverless(app);
