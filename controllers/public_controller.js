var db = require("../models");
var Sequelize = require("sequelize");
var Op = Sequelize.Op;
// var helpers = require("handlebars-helpers")();

var exports = module.exports = {}

exports.taskNew = function (req, res) {
  db.Task.create(req.body).then(function (result) {

    //  Associate the task to the one who created it.
    result.addUser(req.body.UserId);

    //  create new entry in the Ratings table
    createRating(req, res, result);
  });
}

exports.searchFilter = function (req, res) {
  db.User.findOne({
    include: {
      model: db.Task,
      where: { category: req.params.category }
    },
    where: {
      id: req.params.id
    }
  }).then(function (data) {

    if (data === null) {
      db.User.findOne({ where: { id: req.params.id } })
        .then(function (result) {

          var hbsObject = {
            logUser: req.user,
            user: result.dataValues
          }


          res.render('search-dashboard', hbsObject);
        })

    } else {

      var hbsObject = {
        logUser: req.user,
        user: data.dataValues,
        tasks: data.Tasks
      }

      res.render('search-dashboard', hbsObject);
    }

  });
}

exports.getTaskData = function (req, res) {
  console.log(req.body);
  db.Task.findAll({
    limit: 10,
    where: { item_name: { [Op.like]: '%' + req.body.item_name + '%' } }
  }).then(function (data) {
    res.json(data);
  });
}

exports.getTask = function (req, res) {
  console.log(req.user);
  db.Task.findOne({
    where: { item_name: req.params.itemname}
  }).then(function (data) {
    console.log(data);
    var searchObject = {
      logUser: req.user,
      user: req.user,
      tasks: [data.dataValues]
    }

    res.render('search-dashboard', searchObject);
  });
}

//  Search function to find a single user. This will need more...
exports.getUserData = function (req, res) {
  console.log(req.body);
  db.User.findAll({
    limit: 10,
    where: { username: { [Op.like]: '%' + req.body.username + '%' } }
  }).then(function (data) {
    res.json(data);
  });
}

exports.getUser = function (req, res) {
  db.User.findOne({
    include: [db.Task],
    where: { username: req.params.username }
  }).then(function (data) {
    console.log(data);

    var searchObject = {
      logUser: req.user,
      user: data.dataValues,
      tasks: data.Tasks
    }

    res.render('search-dashboard', searchObject);
  })
}

//  lists all tasks on the general page
//  We'll have to find a way to limit results here
exports.taskAll = function (req, res) {
  var tasksArray = [];
  db.Task.findAll({}).then(function (data) {

    var taskObject = getAllTaskResults(data, req);

    res.render('public-dashboard', taskObject);
  });
}

exports.taskFilter = function (req, res) {
  db.Task.findAll({
    where: {
      category: req.params.category
    }
  }).then(function (data) {
    console.log(req.user);

    var taskObject = {
      logUser: req.user,
      tasks: data
    }

    res.render('public-dashboard', taskObject);
  });
}

exports.taskRate = function (req, res, sequelize) {
  db.Rating.findOne({
    where: {
      item_id: req.body.TaskId,
      user_id: req.user.id
    }
  }).then(function (firstData) {
    console.log(firstData);
    if (firstData === null) {

      db.Task.findOne({ where: { id: req.body.TaskId } })
        .then(function (data) {

          var prevTotal = parseFloat(data.dataValues.rating) * parseFloat(data.dataValues.rating_multiplier);
          var newTotal = parseFloat(prevTotal) + parseFloat(req.body.rating);

          //  add new rating to existing rating, then divide it by the new multiplier
          var newMultiplier = parseFloat(data.dataValues.rating_multiplier) + 1;
          var newRating = newTotal / newMultiplier;
          db.Task.update({
            rating: newRating,
            rating_multiplier: newMultiplier
          }, { where: { id: req.body.TaskId } })
            .then(function (result) {
              // if (result.affectedRows === 0) {
              //   return res.status(404).end();
              // } else {
                createRating(req, res);
              // }
            })
            .catch(function (err) {
              res.json(err);
            });

        })

      // query db.Task to add rating and increment rating multiplier
    } else {

      db.Task.findOne({ where: { id: req.body.TaskId } })
        .then(function (data) {
          if (!(data.created_by === req.user.id)) {

            //  it's not null, so the rating exists in firstData...
            var existingRating = parseFloat(firstData.rating);
            var prevTotal = parseFloat(data.dataValues.rating) * parseFloat(data.dataValues.rating_multiplier);
            var newTotal = prevTotal - existingRating + parseFloat(req.body.rating);
            var newRating = newTotal / parseFloat(data.rating_multiplier);

            db.Task.update({ rating: newRating },
              { where: { id: req.body.TaskId } })
              .then(function (result) {
                if (result.affectedRows === 0) {
                  return res.status(404).end();
                } else {
                  res.status(200).end();
                }
              })
              .catch(function (err) {
                res.json(err);
              });

            db.Rating.update({ rating: req.body.rating }, {
              where: {
                item_id: req.body.TaskId,
                user_id: req.user.id
              }
            }).then(function (result) {
              if (result.affectedRows === 0) {
                return res.status(404).end();
              } else {
                res.status(200).end();
              }
            })
              .catch(function (err) {
                res.json(err);
              });

            res.json(data);
          }
          else res.json(data);
        })

    }
  })
}

//  Link a task to yourself
exports.taskLink = function (req, res) {

  //  assign params to variables
  var taskId = req.params.taskId;
  var userId = req.params.userId;

  console.log(userId);

  //  query UserTasks to see if the task is already associated to the user
  db.UserTasks.findOne({
    where: {
      TaskId: taskId,
      UserId: userId
    }
  }).then(function (data) {

    //  If no association is found, find the task and associate it to the user
    if (data === null) {

      //  query the tasks table via the db.Tasks Model
      db.Task.findOne({
        include: [db.User],
        where: { id: taskId }
      }).then(function (data) {

        //  addUser() is a function Sequelize creates when a Model is defined as BelongsToMany,
        //  but it can only be accessed on an individual task, not the Task model directly. So...

        //  then call the function to add a user to the task
        data.addUser([userId]).then(function (result) {

        });

        //return the result
        res.json(data);
      });
    }
    else {
      res.json(data);
    }

  });

}

function getAllTaskResults(data, req) {
  var resObj = {
    logUser: req.user
  }
  var tasksArray = [];
  var length = parseInt(req.params.length) || 10;
  if (data.length > length) {

    for (let i = 0; i < length; i++) {
      const taskIs = data[i].dataValues;
      tasksArray.push(taskIs);
    }

    length += 10;

    resObj.tasks = tasksArray;
    resObj.resultsLength = length;

  } else {
    resObj.tasks = data
  }

  return resObj;
}


function createRating(req, res, result) {
  db.Rating.create({
    item_id: req.body.TaskId || result.dataValues.id,
    user_id: req.body.UserId || req.user.id,
    rating: req.body.rating || 0,
    created_by: req.body.UserId || req.user.id
  }).then(function (data) {
    res.json(data);
  });
}