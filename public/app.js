$(document).ready(function() {


  // Scrapes new articles
  $("#scrapeArticles").on("click", function() {

    $("#articles").empty();
    $("#notes").empty();
    $.get("/scrape").done(function(result) {

      $.each(result, function(index, value) {
        var title = value.title;
        var link = value.link;
        var summary = value.summary;
        $("#articles").append("<div class='article'><p><h4>" + title + "</h4>\n<a href=" + link + " target='_blank'>" + link + "</a><br/>" + summary + "\n<button id = 'saved' data-title='" + title + "' data-link='" + link + "' data-summary='" + summary + "' type='submit' class='saveBtn btn btn-default pull-right' type='submit'>Save</button>\n</p></div>");
        return index < 20;
      }); //End each result
    }); //End get Route
  });

  // Saves articles 
  $(document).on("click", "#saved", function() {

    var savedArticle = {
      title: $(this).attr("data-title"),
      link: $(this).attr("data-link"),
      summary: $(this).attr("data-summary")
    };
    $.post("/save", savedArticle).done(function(result) {});

    $(this).addClass("blue");
    $(this).text("Saved");

  });

  // Show saved articles  
  $("#saveArticles").on("click", function() {
    $("#articles").empty();
    $("#notes").empty();
    $.getJSON("/articles", function(data) {
      // For each one
      for (var i = 0; i < data.length; i++) {
        // Display information on the page
        $("#articles").append("<div class='article'><p data-id='" + data[i]._id + "'><h4>" + data[i].title + "</h4>\n<a href=" + data[i].link + " target='_blank'>" + data[i].link + "</a><br/>" + data[i].summary + "<br /><button type='submit' data-id='" + data[i]._id + "' class='notesBtn btn btn-success' type='submit'>Notes</button><button type='submit' data-id='" + data[i]._id + "' class='deleteArt btn btn-danger' type='submit'>Delete from Saved</button></p></div>");
      }
    });
  });

  // Show notes

  $(document).on("click", ".notesBtn", function() {

    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
    window.scrollTo(0, 0);
    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
      })
      // With that done, add the note information to the page
      .done(function(data) {

        // The title of the article
        $("#notes").append("<h4>" + data.title + "</h4>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' value='title' >");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'>Enter text here ... </textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote' class='btn-success btn'>Save Note</button>");

        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
          $("#savenote").remove();
          $("#notes").append("<button data-id='" + data.note._id + "' id='deletenote' class='btn-danger btn'>Delete Note</button>");
        }
      });
  });

  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          // Value taken from title input
          title: $("#titleinput").val(),
          // Value taken from note textarea
          body: $("#bodyinput").val()
        }
      })
      // With that done
      .done(function(data) {

        // Empty the notes section
        $("#notes").empty();
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });

  // Deletes articles
  $(document).on("click", ".deleteArt", function() {

    var id = $(this).attr("data-id");
    $.post("/delete/" + id).done(function(result) {
      if (result) {
        location.reload();
      }
    });

  });

  // Deletes notes
  $(document).on("click", "#deletenote", function() {

    var noteId = $(this).attr("data-id");
    $.post("/deletenote/" + noteId).done(function(result) {
      if (result) {
        location.reload();
      }
    });
  });

});