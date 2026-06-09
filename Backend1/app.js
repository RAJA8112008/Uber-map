const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.routes");
const app = express();
const cookieParser=require("cookie-parser");
app.use(cookieParser());


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/users", userRoutes);

module.exports = app;