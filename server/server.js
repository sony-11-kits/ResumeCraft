import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "8mb" }));

let resumes;

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "ResumeCraft API is running" });
});

app.get("/api/resumes", async (_req, res) => {
  try {
    const items = await resumes.find({}).sort({ updatedAt: -1 }).toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Could not load resumes", error: error.message });
  }
});

app.post("/api/resumes", async (req, res) => {
  try {
    const document = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    delete document._id;
    const result = await resumes.insertOne(document);
    res.status(201).json({ ...document, _id: result.insertedId });
  } catch (error) {
    res.status(400).json({ message: "Could not save resume", error: error.message });
  }
});

app.put("/api/resumes/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid resume ID" });
    }
    const update = { ...req.body, updatedAt: new Date() };
    delete update._id;
    delete update.createdAt;
    const result = await resumes.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: update },
      { returnDocument: "after" }
    );
    if (!result) return res.status(404).json({ message: "Resume not found" });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Could not update resume", error: error.message });
  }
});

app.delete("/api/resumes/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid resume ID" });
    }
    const result = await resumes.deleteOne({ _id: new ObjectId(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ message: "Resume not found" });
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete resume", error: error.message });
  }
});

async function start() {
  try {
    const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const db = client.db("resumecraft");
    resumes = db.collection("resumes");
    await resumes.createIndex({ email: 1 });
    app.listen(PORT, () => {
      console.log(`ResumeCraft API: http://localhost:${PORT}`);
      console.log("MongoDB connected — database: resumecraft");
    });
  } catch (error) {
    console.error("Could not connect to MongoDB.");
    console.error("Check that MongoDB Community Server is installed and running.");
    console.error(error.message);
    process.exit(1);
  }
}

start();
