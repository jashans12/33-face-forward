var db = require("../models");

var exports = module.exports = {}

exports.splashPage = function (req, res) {
  res.render('index');
}

//  Individual profile home page - contains profile info and tasks associated to the individual.
exports.dashboard = function (req, res) {
  db.User.findOne({
    include: {
      model: db.Task
    },
    where: {
      id: req.user.id
    }
  }).then(function (data) {

    var userObj = getMyTaskResults(data, req);

    //  Pass the userObj info to the dashboard, where all the rest of the functionality takes off
    res.render('user-dashboard', userObj);
  });
}

// the /logout path destroys the session, removing the login credentials, and redirects to the "/" route, which runs the splashPage function.
exports.logout = function (req, res) {
  req.session.destroy(function (err) {
    res.redirect('/');
  });
}


//  if there are more than ten results, only shows ten at a time, increments length by 10, and adds new length to render object, which puts that number into the link to show more
function getMyTaskResults(data, req) {

  //  create results object and task array scoped to the whole function
  var resObj = { user: data };
  var tasksArray = [];

  //  set results length - 10 to start, but will be more if there is a req.param
  var length = parseInt(req.params.length) || 10;

  if (data.Tasks.length > length) {

    //  push results to the array
    for (let i = 0; i < length; i++) {
      const element = data.Tasks[i];
      tasksArray.push(element);
    }

    //  increment length AFTER pushing to array
    length += 10;

    //  add more properties to the results object
    resObj.tasks = tasksArray;
    resObj.resultsLength = length;

    // if results are greater than the params.length, no need to limit the displayed results. This means we've reached the end of the "add more" search.
  } else {

    //  add all task results to the results object - no need to add a length property because all results are being displayed
    resObj.tasks = data.Tasks

  }

  return resObj;
}