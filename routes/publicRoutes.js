var publicController = require('../controllers/public_controller.js');

module.exports = function (app, passport) {

  app.post("/task/rate", isLoggedIn, publicController.taskRate);

  app.post("/task/new", isLoggedIn, publicController.taskNew);

  app.post("/search/task", isLoggedIn, publicController.getTaskData);

  app.get("/search/task/:itemname", isLoggedIn, publicController.getTask);

  app.post("/search/user", isLoggedIn, publicController.getUserData);

  app.get("/search/user/:username", isLoggedIn, publicController.getUser);

  app.get("/search/filter/:id/:category", isLoggedIn, publicController.searchFilter);

  app.get("/public", isLoggedIn, publicController.taskAll);

  app.get("/public/more/:length", isLoggedIn, publicController.taskAll);

  app.get("/public/:category", isLoggedIn, publicController.taskFilter);

  app.get("/public/:taskId/:userId", isLoggedIn, publicController.taskLink);



  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/');
  }

}