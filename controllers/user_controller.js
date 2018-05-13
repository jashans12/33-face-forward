var db = require("../models");

var exports = module.exports = {}

exports.dashboardComplete = function (req, res) {
  db.Complete.findAll({
    limit: req.body.limit,
    where: { user_id: req.user.id }
  }).then(function (data) {
    var completeObj = {
      user: req.user,
      tasks: data
    }
    res.render('complete-dashboard', completeObj);
  })
}

exports.dashboardFilter = function (req, res) {
  db.User.findOne({
    include: {
      model: db.Task,
      limit: req.body.limit,
      where: { category: req.params.category }
    },
    where: {
      id: req.user.id
    }
  }).then(function (data) {

    if (data === null) {
      var hbsObject = {
        user: req.user
      }
    } else {
      var hbsObject = {
        user: req.user,
        tasks: data.Tasks
      }
    }

    res.render('user-dashboard', hbsObject);
  });
}

exports.taskUnlink = function (req, res) {

  //  assign params to variables
  var taskId = req.params.taskId;
  var userId = req.params.userId;

  db.UserTasks.destroy({
    where: {
      TaskId: taskId,
      UserId: userId
    }
  }).then(function (result) {
    if (result.affectedRows-- - 0) {
      return res.status(404).end();
    } else {
      res.status(200).end();
    }
  })
    .catch(function (err) {
      res.json(err);
    });

}

exports.userCompleteSave = function (req, res) {
  db.User.findOne({ where: { id: req.user.id } })
    .then(function (data) {

      //  add new points to existing points
      var currentPoints = parseFloat(data.total_points);
      var newPoints = currentPoints + parseFloat(req.body.points);

      //  update user points
      updateUserPoints(req, res, createCompletionRecord);
    })
}

exports.userCompleteDelete = function (req, res) {
  db.User.findOne({ where: { id: req.user.id } })
    .then(function (data) {

      //  add new points to existing points
      var currentPoints = parseFloat(data.total_points);
      var newPoints = currentPoints + parseFloat(req.body.points);

      updateUserPoints(req, res, destroyUserTaskAssociation);
    });
}


function destroyUserTaskAssociation(req, res) {
  db.UserTasks.destroy({
    where: {
      UserId: req.body.userId,
      TaskId: req.body.taskId
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
}

function createCompletionRecord(req, res) {
  db.Complete.create({
    item_name: req.body.name,
    category: req.body.category,
    user_id: req.user.id,
    criteria: req.body.criteria
  }).then(function (result) {

    destroyUserTaskAssociation(req, res);
  })
}

function updateUserPoints(req, res, callback) {
  db.User.update(
    { total_points: req.body.points },
    { where: { id: req.body.userId } }
  ).then(function (result) {
    if (result.affectedRows === 0) {
      return res.status(404).end();
    } else {

      callback(req, res);
    }
  });
}