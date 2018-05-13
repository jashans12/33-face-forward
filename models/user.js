var bCrypt = require('bcrypt-nodejs');

var tempPw = bCrypt.hashSync("1234", bCrypt.genSaltSync(8), null);

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: {
      type: DataTypes.STRING,
      allowNull:false
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull:false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull:false
    },
    image_url: {
      type: DataTypes.TEXT
    },
    email: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: tempPw
    },
    about: {
      type: DataTypes.TEXT
    },
    birthdate: {
      type: DataTypes.DATE
    },
    total_points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()')
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()')
    }
  });

  User.associate = function (models) {
    User.belongsToMany(models.Task, { through: 'UserTasks' });
  }

  return User;
};