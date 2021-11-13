const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());
//Database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sgy5g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//db system
async function run() {
  try {
    await client.connect();
    const database = client.db("shoesBd");
    const productsCollection = database.collection("products");
    const usersCollection = database.collection("users");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");

    //Users post api
    app.post("/users", async (req, res) => {
      const newUsers = req.body;
      const result = await usersCollection.insertOne(newUsers);
      console.log("get data: ", req.body);
      console.log("Added user: ", result);
      res.json(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role == "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //GET products API
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });
    //GET SINGLE product
    app.get("/products/:id", async (req, res) => {
      const product_id = req.params.id;
      const query = { _id: ObjectId(product_id) };
      const product = await productsCollection.findOne(query);
      console.log("getting single user");
      res.json(product);
    });
    //POST product API
    app.post("/products", async (req, res) => {
      const newPackage = req.body;
      const result = await productsCollection.insertOne(newPackage);
      console.log("get data: ", req.body);
      console.log("Added user: ", result);
      res.json(result);
    });
    //Delete product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      console.log("deleting product:", id);
      res.json(result);
    });
    //POST REVIEW API
    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      console.log("get data: ", req.body);
      console.log("Added user: ", result);
      res.json(result);
    });
    //GET REVIEW API
    app.get("/reviews", async (req, res) => {
      const reviews = reviewCollection.find({});
      const result = await reviews.toArray();
      console.log("getting Reviews");
      res.json(result);
    });
    //GET ORDERS API
    app.get("/orders", async (req, res) => {
      let cursor;
      const email = req.query.email;
      const query = { userEmail: email };
      if (email) {
        cursor = orderCollection.find(query);
      } else {
        cursor = orderCollection.find({});
      }
      const orders = await cursor.toArray();
      console.log(orders);
      res.send(orders);
    });

    //POST my Order
    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      console.log("get data: ", req.body);
      console.log("Added user: ", result);
      res.json(result);
    });
    //UPDATE status order
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updatedOrder = req.body;
      console.log(updatedOrder);
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          packageId: updatedOrder.packageId,
          userName: updatedOrder.userName,
          userEmail: updatedOrder.userEmail,
          title: updatedOrder.title,
          price: updatedOrder.price,
          status: updatedOrder.status,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updated");
      res.json(result);
    });
    //DELETE My order API
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log("deleting user id:", id);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//other functionality
app.get("/", (req, res) => {
  res.send("Running my CRUD server");
});

app.listen(port, () => {
  console.log("Running server on port: ", port);
});
