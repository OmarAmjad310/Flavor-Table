require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const cors = require('cors');
const pg = require("pg");


 
const app = express();
const PORT = process.env.PORT || 3000;

//const client = new pg.Client(process.env.DATABASE_URL);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
 
//middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

//Routing
const homepage = require("./routes/home");
const recipes = require ("./routes/recipes");

app.use("/",homepage)
app.use("/recipes", recipes);

  /*pool
   .connect()
   .then(() => {
     app.listen(PORT, () => {
     console.log(`Server is running on http://localhost:${PORT}`);
     
     });
   })
   .catch((err) => {
     console.error("Could not connect to database:", err);
   });*/

  pool
  .connect()
  .then((client) => {
    return client
      .query("SELECT current_database(), current_user")
      .then((res) => {
        client.release();

        const dbName = res.rows[0].current_database;
        const dbUser = res.rows[0].current_user;

        console.log(
          `Connected to PostgreSQL as user '${dbUser}' on database '${dbName}'`
        );

        console.log(`App listening on port http://localhost:${PORT}`);
      });
  })
  .then(() => {
    app.listen(PORT);
  })
  .catch((error) => {
    console.error("Could not connect to database:", error);
  });


