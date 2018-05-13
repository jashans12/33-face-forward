$(function () {

  //  button to search for another user
  $("#user-search-btn").on("click", function (e) {
    e.preventDefault();
    var searchTerm = $("#user-search").val().trim();

    if (!(searchTerm === "")) {
      $.post(`/search/user`, { username: searchTerm })
        .then(function (data) {
          console.log(data);

          $(".filter-btn-nav").html("");
          $(".task-display").html("<h3>Search Results</h3>");

          for (let i = 0; i < data.length; i++) {
            const element = data[i];
            var resDiv = $(`<div class='search-results-div'>            
            <h4>Username: <a class='search-results-link' href='/search/user/${element.username}'>${element.username}</a></h4>
            <h4>Name: <a class='search-results-link' href='/search/user/${element.username}'>${element.firstname} ${element.lastname}</a></h4>
            </div>`);
            resDiv.addClass("search-results-div");
            $(".task-display").append(resDiv);
          }

        });

    }
  });

  //  edit profile button
  $("#profile-update-btn").on("click", function (e) {
    e.preventDefault();
    var userName = $("#username-input").val().trim();
    var firstName = $("#firstname-input").val().trim();
    var lastName = $("#lastname-input").val().trim();
    var eMail = $("#email-input").val().trim();
    var passWord = $("#password-input").val().trim();
    var iMage = $("#image_url-input").val().trim();

    var updateObject = {
      username: userName,
      firstname: firstName,
      lastname: lastName,
      email: eMail,
      password: passWord,
      image: iMage
    }
    
    $.post(`/dashboard/edit`, updateObject)
    .then(function (data){
      location.reload();
    })
  });

  //  button to search tasks - after emtpying the html, put an <h3> back in with Search Results in it
  $("#task-search-btn").on("click", function (e) {
    e.preventDefault();
    var searchTerm = $("#task-search").val().trim();

    $.post("/search/task", { item_name: searchTerm })
      .then(function (data) {
        console.log(data);

        $(".filter-btn-nav").html("");
        $(".task-display").html("<h3>Search Results</h3>");

        for (let i = 0; i < data.length; i++) {
          const element = data[i];
          var resDiv = $(`<div class='search-results-div'>
          <h4><a class='search-results-link' href='/search/task/${element.item_name}'>${element.item_name}</a></h4></div>`);
          $(".task-display").append(resDiv);
        }
      });
  });


  //  Button at the bottom of the 'Create New Task' form
  $("#new-task-btn").on("click", function (event) {
    event.preventDefault();
    var taskName = $("#task-name-input").val().trim();
    var dropdown = $("#task-category").val();
    var taskSteps = $("#task-steps-input").val().trim();
    var taskCriteria = $("#task-criteria-input").val().trim();
    var userId = $("#user-name").data("user-id");
    console.log("User ID: " + userId);
    console.log("Category: " + dropdown);

    if (taskName !== "" && dropdown !== "none-selected") {
      var newTask = {
        item_name: taskName,
        category: dropdown,
        steps: taskSteps,
        criteria: taskCriteria,
        UserId: userId,
        created_by: userId
      }

      $.post("/task/new", newTask)
        .then(function () {
          console.log("Created new task");
          location.reload();
        });
    }

  });

  //  Button to link a task to you
  $(".add-task").on("click", function (event) {
    event.preventDefault();
    var task = $(this).data("task-id");
    var user = $("#user-name").data("user-id");

    console.log(task);
    console.log(user);

    $.get(`/public/${task}/${user}`)
      .then(function () {
        location.reload();
      });
  })

  //  Button to mark a task complete and save it to your personal archive
  $(".complete-save-btn").on("click", function () {
    var task = $(this).data("task-id");
    var user = $("#user-name").data("user-id");
    var rating = $(this).data("rating");
    var taskName = $(`#${task}-task-name`).text().trim();
    var taskCat = $(`#${task}-category`).text().trim();
    var taskCriteria = $(`#${task}-criteria`).text().trim();

    // calculate task points (baseline is 10) and add to users points
    var addPoints = rating * 10;

    var completeObj = {
      taskId: task,
      userId: user,
      points: addPoints,
      name: taskName,
      category: taskCat,
      criteria: taskCriteria
    }

    $.ajax(`/dashboard/complete/save`, {
      type: 'PUT',
      data: completeObj
    }).then(function () {
      location.reload();
    });
  });

  //  Button to mark a task as complete and delete the association
  $(".complete-delete-btn").on("click", function () {
    var task = $(this).data("task-id");
    var user = $("#user-name").data("user-id");
    var rating = $(this).data("rating");

    // calculate task points (baseline is 10) and add to users points
    var addPoints = rating * 10;

    var completeObj = {
      taskId: task,
      userId: user,
      points: addPoints
    }

    $.ajax(`/dashboard/complete/delete`, {
      type: 'PUT',
      data: completeObj
    }).then(function () {
      location.reload();
    });

  });

  //  Button to remove task from your queue
  $(".remove-task-btn").on("click", function () {
    var task = $(this).data("task-id");
    var user = $("#user-name").data("user-id");
    $.ajax(`/dashboard/unlink/${task}/${user}`, {
      type: 'DELETE'
    }).then(function () {
      location.reload();
    })
  });

  //  'Rate it!' button to submit task rating
  $(".rating-submit-btn").on("click", function (e) {
    e.preventDefault();
    var taskId = $(this).data("task-id");
    var newRating = $(`input[name='${taskId}-rate-radio']:checked`).val();
    console.log(`Task Id: ${taskId}; Given rating: ${newRating}`);

    console.log(newRating);

    if (!(newRating === undefined)) {
      var ratingObject = {
        TaskId: taskId,
        rating: newRating
      }
      $.ajax("/task/rate", {
        type: "POST",
        data: ratingObject
      }).then(function () {
        location.reload();
      });
    }

  })

});

function switchForms(formName, btnName, type) {
  var switchForm = $(`.${type}-form`);
  var switchBtn = $(`.${type}-btn`);
  for (let i = 0; i < switchForm.length; i++) {
    switchForm[i].style.display = "none";
    switchBtn[i].style.opacity = ".6";
  }
  $(`#${formName}`).css("display", "block");
  $(`#${btnName}`).css("opacity", "1");
}