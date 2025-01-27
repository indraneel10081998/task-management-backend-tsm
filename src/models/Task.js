const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    submissionTime: {
        type: DataTypes.DATE
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Task;