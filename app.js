const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const sequelize = require("./src/config/database");
const authRoutes = require("./src/routes/authRoutes");
const taskRoutes = require("./src/routes/taskRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: "https://task-management-frontend-tsm.onrender.com/",
}));


app.use(express.json());
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

app.get("/", (req, res) => {
  res
    .status(200)
    .json({
      message: "404 Error: Route not found. Just kidding, here it is!",
    });
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database Synchronized");

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error Synchronizing Database:", error);
  });
