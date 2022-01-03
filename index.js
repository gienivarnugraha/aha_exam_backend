require("dotenv").config();

// * import modules
const express = require("express"),
  http = require("http"),
  path = require("path"),
  morgan = require("morgan"),
  cors = require("cors"),
  cookieParser = require("cookie-parser"),
  session = require("express-session");

// * import express
require("./config/mongoose.js");
const Router = require("./routes/index.js");
const errorHandler = require("./middlewares/errorHandler.js");

// * start server
const app = express();
const server = http.createServer(app);

// * using modules
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(cookieParser());
app.use("/", Router);

app.use(
  session({
    duration: 50 * 60 * 1000,
    activeDuration: 10 * 60 * 1000,
    secret: "examsecret",
    cookie: { maxAge: 60 * 60 * 1000 },
    cookieName: "session",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(function (req, res, next) {
  res.status(404);

  // respond with html page
  if (req.accepts("html")) {
    //, { url: req.url }
    res.redirect("/");
    return;
  }
});

app.use(
  morgan(
    ":date[iso] :method :url :status :response-time ms - :res[content-length]"
  )
);

// * Setting up EJS Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

//if (process.env.PRODUCTION === false)
app.use(errorHandler);

server.listen(process.env.PORT, () => {
  console.log(`Server Running On PORT `, process.env.PORT);
});

module.exports = app;
