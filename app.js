// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/url-shortener', { useNewUrlParser: true, useUnifiedTopology: true });

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Define URL model
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String
});

const Url = mongoose.model('Url', urlSchema);

// Set up routes
app.get('/', async (req, res) => {
  const originalUrl = req.body.url;
  let url = await Url.findOne({ originalUrl });
  const shortenedUrl = url === null? "" : url.shortUrl; 
  const urls = await Url.find();
  res.render('index', { shortenedUrl: "", urls });
});

// Add more routes here
app.get('/:shortUrl', async (req, res) => {
  const shortUrl = req.params.shortUrl;
  const url = await Url.findOne({ shortUrl });

  if (url) {
    res.redirect(url.originalUrl);
  } else {
    res.status(404).send('URL not found');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/', async (req, res) => {
  const originalUrl = req.body.url;
  let url = await Url.findOne({ originalUrl });

 if (!url) {
   const shortUrl = generateShortUrl();
   
   // Check the number of entries in the database
   const count = await Url.countDocuments();
   
   if (count >= 3) {
     // If there are 10 or more entries, delete the oldest entry
     await Url.findOneAndDelete({}, { sort: { createdAt: 1 } });
   }

   url = new Url({ originalUrl, shortUrl });
   await url.save();
 }


  const urls = await Url.find();
  res.render('index', { shortenedUrl: url.shortUrl, urls }); // Ensure 'shortenedUrl' is passed to the template
});


function generateShortUrl() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const shortUrlLength = 6;
  let shortUrl = '';

  for (let i = 0; i < shortUrlLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    shortUrl += characters[randomIndex];
  }

  return shortUrl;
}