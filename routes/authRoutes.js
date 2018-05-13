var authController = require('../controllers/auth_controller.js');

module.exports = function (app, passport) {

  app.get("/", authController.splashPage);

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }));
  
  app.get('/dashboard', isLoggedIn, authController.dashboard);

  app.get('/dashboard/more/:length', isLoggedIn, authController.dashboard);  

  app.get('/logout', authController.logout);

  app.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }));

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/');
  }

}