var express = require("express");

var router = express.Router();

var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

var index = require("./../models/index.js");

// Initialize Express
var app = express();


var db = require("../models");


app.get("/", function(req, res) {
  res.render("index", {
    title: "Mongo Scraper"
  });
});


app.get("/scrape", function(req, res) {

  request("https://www.nytimes.com/section/arts", function(error, response, html) {
   
    var $ = cheerio.load(html);

    var newScrape = [];

    $("#latest-panel .story-body a").each(function(i, element) {

      var title = $(this)
        .find(".story-meta h2.headline")
        .text();
      var link = $(this)
        .attr("href");
      var summary = $(this)
        .find(".story-meta p.summary")
        .text();

      var news = {
        title: title,
        link: link,
        summary: summary
      };

      if (title) {
        newScrape.push(news);
      }
    });
    res.json(newScrape);
  });
});

app.get("/articles", function(req, res) {

  db.Article
    .find({})
    .then(function(dbArticle) {

      res.json(dbArticle);
    })
    .catch(function(err) {
   
      res.json(err);
    });
});


app.post("/save", function(req, res) {

  db.Article.find({ title: req.body.title }, function(err, docs) {
    if (!docs.length) {
      db.Article
        .create(req.body)
        .then(function(dbArticle) {
      
          return res.send("Add Complete");
        })
        .catch(function(err) {
      
          return res.json(err);
        });

    } else {
      console.log("Article exists.");
    }
  });
});


app.get("/articles/:id", function(req, res) {

  db.Article
    .findOne({ _id: req.params.id })

    .populate("note")
    .then(function(dbArticle) {

      res.json(dbArticle);
    })
    .catch(function(err) {

      res.json(err);
    });
});


app.post("/articles/:id", function(req, res) {

  db.Note
    .create(req.body)
    .then(function(dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {

      res.json(dbArticle);
    })
    .catch(function(err) {

      res.json(err);
    });
});


app.post("/delete/:id", function(req, res) {

  db.Article
    .findOne({ _id: req.params.id })
    .then(function(dbArticle) {
      noteId = dbArticle.note;
      if (noteId) {
        db.Note.findByIdAndRemove(noteId, function(error, done) {
          if (error) {
            console.log(error);
          }
        });
      }
    });

  db.Article.findByIdAndRemove(req.params.id, function(error, done) {
    if (error) {
      console.log(error);
    } else {
      res.send({ reload: true });
    }
  });
});

app.post("/deletenote/:noteId", function(req, res) {

  db.Note.findByIdAndRemove(req.params.noteId, function(error, done) {
    if (error) {
      console.log(error);
    } else {
      res.send({ reload: true });
    }
  });
});

module.exports = app;