import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Client Setup
const client = new MongoClient(process.env.MONGODB_URI);

async function run() {
  try {
    // 1. Connect to MongoDB
    await client.connect();
    console.log("You successfully connected to MongoDB!");

    // 2. Define Database & Collections globally inside run()
    const db = client.db("neighboraidDB");
    const eventsCollection = db.collection("events");
    const joinedEventsCollection = db.collection("joinedEvents");

    // --- FORCE RESET & SEED 6 CHATTOGRAM EVENTS ---
    // This clears old data so old/duplicate cards disappear immediately
    await eventsCollection.deleteMany({});

    const chattogramEvents = [
      {
        title: "Patenga Beach Plastic Cleanup",
        category: "Cleanup",
        date: "2026-11-18",
        location: "Patenga Beach, Chattogram",
        description:
          "Join us for a massive community shoreline cleanup drive to protect marine life and keep our popular beach clean.",
        organization: "Clean Chattogram Initiative",
        image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5",
      },
      {
        title: "Hill Tracts Eco-Tree Plantation",
        category: "Plantation",
        date: "2026-11-22",
        location: "Bandarban Sadar, Chattogram",
        description:
          "Planting 500 indigenous fruit and forest saplings along hillside slopes to prevent soil erosion and support wildlife.",
        organization: "Hill Green Trust",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
      },
      {
        title: "Cox's Bazar Coastal Rations Distribution",
        category: "Food Drive",
        date: "2026-11-25",
        location: "Kolatoli, Cox's Bazar, Chattogram",
        description:
          "Distributing essential emergency food packets and dry rations to low-income families residing along the coastal belt.",
        organization: "Cox's Bazar Youth Foundation",
        image: "https://images.unsplash.com/photo-1593113598332-cd288d649433",
      },
      {
        title: "Free Community Health & Dental Camp",
        category: "Health Camp",
        date: "2026-12-02",
        location: "GEC Circle, Chattogram",
        description:
          "Providing free medical check-ups, blood sugar testing, basic dental screening, and essential medicines with volunteer doctors.",
        organization: "Port City Medical Aid",
        image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982",
      },
      {
        title: "Rangamati Youth Skill & Education Workshop",
        category: "Education",
        date: "2026-12-10",
        location: "Rangamati Sadar, Chattogram",
        description:
          "Conducting a specialized digital literacy and vocational training workshop accompanied by educational kit distribution.",
        organization: "Kaptai Learning Hub",
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
      },
      {
        title: "Winter Warmth Blanket Distribution",
        category: "Winter Relief",
        date: "2026-12-15",
        location: "Khagrachhari Sadar, Chattogram",
        description:
          "Distributing heavy winter blankets and warm clothing packages to vulnerable families ahead of the colder mountain nights.",
        organization: "Hillside Relief Network",
        image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20",
      },
    ];

    await eventsCollection.insertMany(chattogramEvents);
    console.log("Database reset with exactly 6 organized Chattogram events!");

    // --- API ROUTES ---

    // Root Test Route
    app.get("/", (req, res) => {
      res.send({ message: "Server is running fine" });
    });

    // 1. Get All Upcoming Events Route (GET)
    app.get("/events", async (req, res) => {
      try {
        const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

        const events = await eventsCollection
          .find({ date: { $gte: today } })
          .sort({ date: 1 }) // Sorts by date (earliest first)
          .toArray();

        res.send(events);
      } catch (error) {
        console.error("Error fetching events:", error);
        res
          .status(500)
          .send({ message: "Failed to fetch events", error: error.message });
      }
    });

    // 2. Create a New Event Route (POST)
    app.post("/events", async (req, res) => {
      try {
        const data = req.body;

        if (Array.isArray(data)) {
          const result = await eventsCollection.insertMany(data);
          return res.status(201).send(result);
        }

        const result = await eventsCollection.insertOne(data);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error creating event:", error);
        res
          .status(500)
          .send({ message: "Failed to create event", error: error.message });
      }
    });

    // 3. Get Single Event Details Route (GET)
    app.get("/events/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const event = await eventsCollection.findOne(query);

        if (!event) {
          return res.status(404).send({ message: "Event not found" });
        }

        res.send(event);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch event details" });
      }
    });

    // 4. Join Event Route (POST)
    app.post("/joined-events", async (req, res) => {
      try {
        const joinData = req.body;

        const existing = await joinedEventsCollection.findOne({
          eventId: joinData.eventId,
          userEmail: joinData.userEmail,
        });

        if (existing) {
          return res
            .status(400)
            .send({ message: "You have already joined this event!" });
        }

        const result = await joinedEventsCollection.insertOne(joinData);
        res.send(result);
      } catch (error) {
        console.error("Error joining event:", error);
        res
          .status(500)
          .send({ message: "Failed to join event", error: error.message });
      }
    });

    // Start Express Listener only after DB is successfully connected
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
}

// Execute DB connection and setup routes
run().catch(console.dir);
