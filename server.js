var express = require("express");
var bodyParser = require("body-parser");

var mongoose = require("mongoose");


var request = require("request");
var cheerio = require("cheerio");

var exphbs = require("express-handlebars");

var PORT = process.env.PORT || 3000;


var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));


var routes = require("./controllers/controllers.js");
app.use("/", routes);

mongoose.Promise = Promise;

var MONGOLAB_URI = "mongodb://heroku_v3c3frrw:rhi62l1qaevohl3qdrdiihadt5@ds115396.mlab.com:15396/heroku_v3c3frrw";


mongoose.connect("mongodb://localhost/mongoScraper", {
  useMongoClient: true
});


var db = mongoose.connection;
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});