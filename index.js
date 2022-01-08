// * import .env
require("dotenv").config();

// * import modules
const express = require("express"),
  http = require("http"),
  morgan = require("morgan"),
  cors = require("cors"),
  cookieParser = require("cookie-parser"),
  db = require("./models/index.js"),
  //{ auth } = require("express-openid-connect"),
  session = require("express-session");

// * import express
require("./models/index.js");
const Router = require("./routes/index.js");
const errorHandler = require("./middlewares/errorHandler.js");

// * start server
const app = express();
const server = http.createServer(app);

// * use modules
//app.use(auth());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());
app.use(cookieParser());
app.use("/", Router);
/*
db.sequelize
  .sync({ force: true })
  .then(() => {
    console.log("Drop and re-sync db.");
  })
  .catch((err) => {
    console.log("somtehing error : ", err);
  });
 */
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

app.use(
  morgan(
    ":date[iso] :method :url :status :response-time ms - :res[content-length]"
  )
);

//if (process.env.PRODUCTION === false)
app.use(errorHandler);

server.listen(process.env.PORT, () => {
  console.log(`Server Running On PORT `, process.env.PORT);
});

module.exports = app;
