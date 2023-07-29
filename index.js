const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const usersCollection = database.collection('users');

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

    app.delete('/deleteItem/:id', (req, res) => {
      const id = new ObjectId(req.params.id);
      console.log('delete this ', id);
      const result = logsCollection.findOneAndDelete({ _id: id });
      res.json(result);
  })

    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      // console.log(result);
      res.json(result);
  })

  app.put('/users', async (req, res) => {
      const user = req.body;
      // console.log(user)
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
  })

  app.put('/users/admin', async (req, res) => {
      const user = req.body;
const result = await usersCollection.findOne({ email: user.email });
if(result?.role === 'admin'){
  const filter = { email: user.email };
  const updateDoc = { $set: { role: 'admin' } };
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.json(result);
}
      // console.log('admin verified', result)
  })

  app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
          isAdmin = true;
      }
      res.json({ admin: isAdmin });
      // console.log({ admin: isAdmin })
  })

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
