import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import OpenAI from "openai";
import { db } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ======================
   CREATE APP
====================== */
app.post("/api/apps", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  const id = uuid();
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

  db.run(
    "INSERT INTO apps VALUES (?, ?, ?, ?)",
    [id, name, slug, new Date().toISOString()],
    err => {
      if (err) return res.status(500).json(err);
      res.json({
        id,
        name,
        slug,
        url: `https://${slug}.indraaz.site`
      });
    }
  );
});

/* ======================
   LIST APPS
====================== */
app.get("/api/apps", (req, res) => {
  db.all("SELECT * FROM apps", (err, rows) => {
    res.json(rows);
  });
});

/* ======================
   CHAT WITH AI (PER APP)
====================== */
app.post("/api/apps/:appId/chat", async (req, res) => {
  const { message } = req.body;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an app-building AI agent." },
      { role: "user", content: message }
    ]
  });

  res.json({
    reply: completion.choices[0].message.content
  });
});

/* ======================
   SUBDOMAIN RUNTIME
====================== */
app.get("/", (req, res) => {
  const host = req.headers.host; // example: demo.indraaz.site
  if (!host) return res.send("No host");

  const subdomain = host.split(".")[0];

  db.get(
    "SELECT * FROM apps WHERE slug = ?",
    [subdomain],
    (err, appRow) => {
      if (!appRow) return res.send("App not found");
      res.send(`🚀 Running app: ${appRow.name}`);
    }
  );
});

app.listen(3000, () => {
  console.log("🚀 Indraaz backend running on port 3000");
});
