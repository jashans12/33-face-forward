var userController = require('../controllers/user_controller.js');

module.exports = function (app, passport) {

  app.get("/dashboard/complete", isLoggedIn, userController.dashboardComplete);

  app.get("/dashboard/filter/:category", isLoggedIn, userController.dashboardFilter);

  app.put("/dashboard/complete/save", isLoggedIn, userController.userCompleteSave);

  app.put("/dashboard/complete/delete", isLoggedIn, userController.userCompleteDelete);

  app.delete("/dashboard/unlink/:taskId/:userId", isLoggedIn, userController.taskUnlink);
  

  
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/');
  }

}