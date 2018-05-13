var express = require("express");
var app = express();
var passport = require("passport");
var session = require("express-session");
var helpers = require("handlebars-helpers")();
var db = require("./models");
var bodyParser = require("body-parser");
var path = require("path");
var env = require("dotenv").load();

// Set Handlebars.
var exphbs = require("express-handlebars");

//  Set the port to whatever is assigned by Heroku, and if that's false, then set it to 3000.
var PORT = process.env.PORT || 3000;

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(path.join(__dirname, './public')));

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// For Passport 
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true })); // session secret 
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//  Set routes and pass in app and passport - these must be placed in the script AFTER assigning app.use(passport.initialize()) 
var authRoutes = require('./routes/authRoutes.js')(app, passport);
var userRoutes = require('./routes/userRoutes.js')(app, passport);
var publicRoutes = require('./routes/publicRoutes.js')(app, passport);

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//load passport strategies
require('./config/passport/passport.js')(passport, db.User);

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(path.join(__dirname, 'public')));

db.sequelize.sync({ force: true }).then(function () {
  app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
  });
});
