const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const fileUpload = require("express-fileupload");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs-extra");
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

const UPLOADS_FOLDER = "./upload/";
var upload = multer({
  dest: UPLOADS_FOLDER,
});

const uri =
  "mongodb+srv://mobile:GdAaLrexJG9OulH1@cluster0.kjnut.mongodb.net/mobileService?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect((err) => {
  const serviceCollection = client.db("mobileService").collection("services");
  const admincollection = client.db("mobileService").collection("admins");
  const reviewCollection = client.db("mobileService").collection("reviews");

  app.post("/addService", (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const file = req.files.file;
    const filePath = `${__dirname}/upload/${file.name}`;

    file.mv(filePath, (err) => {
      if (err) {
        console.log(err);
        res.send(500).send({ msg: "failed to upload image on server" });
      }
      let newImg = fs.readFileSync(filePath);
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

  console.log("database connected");
});

//adding Admin

app.listen(5000, () => {
  console.log("App is runnig on port 5000");
});
