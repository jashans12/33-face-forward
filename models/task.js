module.exports = function (sequelize, DataTypes) {
  var Task = sequelize.define("Task", {
    item_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },

    //  This starts at 0 because the task isn't worth any points until someone else picks it up, at which point it becomes
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },

    //  This is the number of times the task has been rated
    //  The formula only requires the rating (an average) and the multiplier to start with
    //  The ((rating * multiplier) + new rating) / (multiplier + 1) = new rating; new multiplier = multiplier + 1
    rating_multiplier: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    steps: {
      type: DataTypes.TEXT
    },
    criteria: {
      type: DataTypes.TEXT
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
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

  Task.associate = function (models) {
    Task.belongsToMany(models.User, { through: 'UserTasks'} );
  }

  return Task;
}; 