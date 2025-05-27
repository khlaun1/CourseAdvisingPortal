const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { router: dataRoutes } = require("./routes");
const db = require("./Database/db");

// Middleware setup
app.use(cors());
app.use(helmet());
app.use(
  helmet.frameguard({
    action: "deny",
  })
);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://www.google.com/recaptcha/",
        "https://www.gstatic.com/recaptcha/",
      ],
      styleSrc: ["'self'", "https://fonts.googleapis.com/"],
      frameSrc: ["https://www.google.com/"],
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "webapp/my-app/build")));
app.use(dataRoutes);

// Catch-all route to serve React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "webapp/my-app/build", "index.html"));
});

// Initialize database and start server
db.initializeDatabase()
  .then(() => {
    app.listen(process.env.APP_PORT || 3000, () => {
      console.log(`Listening to ${process.env.APP_PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });