/*const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})*/

require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const cors = require('cors');


 
const app = express();
const PORT = process.env.PORT || 3000;
 
app.use(cors());
app.use(express.static("public"));
 
const homepage = require("./routes/home");
const recipes = require ("./routes/recipes");

app.use("/",homepage)
app.use("/recipes", recipes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
