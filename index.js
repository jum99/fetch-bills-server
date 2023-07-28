const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");

const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.fodu2.mongodb.net:27017,cluster0-shard-00-01.fodu2.mongodb.net:27017,cluster0-shard-00-02.fodu2.mongodb.net:27017/?ssl=true&replicaSet=atlas-77ukfo-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("dashboard_fetch_bills");
    const logsCollection = database.collection("logs");

    console.log("Connected");

    app.post("/addLogs", async (req, res) => {
      const logs = req.body;
      const result = await logsCollection.insertOne(logs);
      res.json(result);
    });

    // load all logs
    app.get("/logs", async (req, res) => {
      const cursor = logsCollection.find({});
      const logs = await cursor.toArray();
      res.json(logs);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Dashboard");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
