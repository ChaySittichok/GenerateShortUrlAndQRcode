const express = require("express");
const bodyParser = require("body-parser");
const shortid = require("shortid");
const mongoose = require("mongoose");
const app = express();
const qr = require("qrcode");
const cors = require("cors");

app.use(cors())

const PORT = 3333;
app.use(bodyParser.json());
app.listen(PORT, ()=>{
    console.log(`Server is running at PORT ${PORT}`);
})


const ShortURL = mongoose.model("ShortURL",{
    origUrl: {
        type: String,
        required: true
      },
    shortUrl: {
        type: String,
        required: true,
      },
    clicks: {
        type: Number,
        default: 0,
      },
});


mongoose.connect('mongodb+srv://sittichok3345:Chay-3345@shorturl.j9robxc.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connect MongoDB success');
})
.catch((err) => {
  console.error('Connect MongoDB error ', err);
});


app.post("/api/shorturl", async (req, res) => {
    const { origUrl } = req.body;
    const shortUrl = shortid.generate();
  
    const newShortURL = new ShortURL({ origUrl, shortUrl });
    await newShortURL.save();
  
    res.json({ shortUrl });
  });

app.get('/api/shorturl', (req, res) => {
    ShortURL.find({}).then((shortURL) => res.json(shortURL))
  });


app.get('/:shortURL', async (req, res) => {
    try {
      const shortURL = await ShortURL.findOne({ shortUrl: req.params.shortURL });
      if (shortURL === null) return res.sendStatus(404);
      await ShortURL.updateOne({ shortUrl: req.params.shortURL }, { $inc: { clicks: 1 } });
      res.redirect(shortURL.origUrl);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

app.get('/api/qrcode/:shortURL', async (req, res) => {
  try {
    const shortURL = await ShortURL.findOne({ shortUrl: req.params.shortURL });
    qr.toDataURL(shortURL.origUrl, (err, data_url) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      res.type("png");
      res.send(data_url); 
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500); 
  }
});


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", ""); 
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

