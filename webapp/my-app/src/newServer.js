const express = require("express"); //importing express module
const app = express();

app.use((req, res, next) => {
    console.log('Setting security headers');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    next();
  });

  

  app.listen(3001, () => {
    console.log("Listening to 3001");
  });
  