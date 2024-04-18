const express = require("express"); //importing express module
const app = express(); //storing express module in object so that it's methods can be called using that object.
const path = require("path");

const cors = require("cors");
//const corsOptions = {
//origin: "http://localhost:3001",
//};

app.use(cors());

//app.use(express.static("public")); //This is static middleware from express in order to access static information.
const helmet = require("helmet");

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

// Customizing Helmet: Setting CSP to prevent all framing attempts
/*
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Default setting for all sources
      frameAncestors: ["'none'"], // Disallows all framing
    },
  })
);*/

// Setting X-Frame-Options to DENY

/*
app.use((req, res, next) => {
  console.log('Setting security headers');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  next();
});
*/

const bodyParser = require("body-parser"); //importing bodyparser middleware.
app.use(bodyParser.urlencoded({ extended: true })); //body parser's urlencoded extracts the information from the form storing it in the form of JSON.
app.use(bodyParser.json());
//const dataRoutes = require("./routes");
//const { router, tableCreatorChecker } = require('./routes');
const { router: dataRoutes } = require("./routes");

/*
function protectFromCJ(req, res, next) {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  next();
};
*/

/*
app.post('/test', (req, res) => {
    res.send('Test endpoint reached');
});
*/

app.use(express.static(path.join(__dirname, "webapp/my-app/build")));

app.use(dataRoutes);

// Handles any requests that don't match the ones above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "webapp/my-app/build", "index.html"));
});

app.listen(3000, () => {
  console.log("Listening to 3000");
});

/*
app.get('/', (req, res)=>{
	res.sendFile('C:/Tis_mah_folder/SimpleCrudApp/index.html')
})
*/

//console.log("May the node be with you")

//module.exports = { helmet };
