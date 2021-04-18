const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const fileUpload = require("express-fileupload");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs-extra");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

const UPLOADS_FOLDER = "./upload/";
var upload = multer({
  dest: UPLOADS_FOLDER,
});

console.log();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kjnut.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect((err) => {
  //
  const serviceCollection = client.db("mobileService").collection("services");
  const admincollection = client.db("mobileService").collection("admins");
  const reviewCollection = client.db("mobileService").collection("reviews");
  const PaymnetInfoCollection = client.db("mobileService").collection("payments");

  app.post("/addService", (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const file = req.files.file;
    let newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    serviceCollection.insertOne({ title, description, price, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addAdmin", (req, res) => {
    const email = req.body.email;
    console.log(email);
    admincollection.insertOne({ email }).then((result) => {
      res.send(result.insertOne > 0);
    });
  });

  app.post("/addReview", (req, res) => {
    const name = req.body.name;
    const issue = req.body.issue;
    const description = req.body.description;
    reviewCollection.insertOne({ name, issue, description }).then((result) => {
      res.send(result.insertOne > 0);
    });
  });

  app.get("/getReviews", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //savePaymnet
  app.post("/addPayment", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const title = req.body.title;
    const price = req.body.price;
    const card = req.body.card;

    PaymnetInfoCollection.insertOne({ name, email, title, price, card }).then((result) => {
      res.send(result.insertOne > 0);
    });
  });

  //Find Paymnet or Booking List for specefic email
  app.get("/bookingList", (req, res) => {
    const email = req.query.email;
    PaymnetInfoCollection.find({ email: email }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //Admin Payment
  app.get("/AdminOrderList", (req, res) => {
    const email = req.query.email;
    admincollection.find({ email: email }).toArray((err, admins) => {
      if (err) throw err;
      if (admins.length > 0) {
        PaymnetInfoCollection.find({}).toArray((err, documents) => {
          if (err) throw err;
          res.send(documents);
        });
      }
    });
  });
  //Admin
  app.get("/isAdmin", (req, res) => {
    const email = req.query.email;
    admincollection.find({ email: email }).toArray((err, admins) => {
      if (err) throw err;
      if (admins.length > 0) {
        res.send(true);
      }
    });
  });

  console.log("database connected");
});

//adding Admin

app.listen(process.env.PORT || 5000, () => {
  console.log("App is runnig on port 5000");
});
