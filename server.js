const express = require("express"); //importing express module
const app = express(); //storing express module in object so that it's methods can be called using that object.

app.use(express.static("public")); //This is static middleware from express in order to access static information.

const bodyParser = require("body-parser"); //importing bodyparser middleware.
app.use(bodyParser.urlencoded({ extended: true })); //body parser's urlencoded extracts the information from the form storing it in the form of JSON.
app.use(bodyParser.json());
const dataRoutes = require("./routes");

const cors = require("cors");

app.use(cors());

/*
app.post('/test', (req, res) => {
    res.send('Test endpoint reached');
});
*/

app.listen(3000, () => {
  console.log("Listening to 3000");
});

/*
app.get('/', (req, res)=>{
	res.sendFile('C:/Tis_mah_folder/SimpleCrudApp/index.html')
})
*/

app.use(dataRoutes);

//console.log("May the node be with you")
