require("dotenv").config();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const express = require("express");
const router = express.Router();
const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const routeGuard = require("../middleware/verifiyToken");

router.get("/api/auth/profile", routeGuard, async (req, res) => {
  res.send("Hello, this is a protected route");
});

  
router.post('/api/auth/register', async (req, res) => {

  console.log("Request body:", req.body); // 

  const { username, email, password } = req.body;

  try {
    const hashedpassword = await bcrypt.hash(password , 10)
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedpassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting recipe:", error);
    if (error.code ==="23505") {
            res.status(409).json("username already exists");

    }
    res.status(500).json({ error: error.message });
  }
});


router.post('/api/auth/login', async (req, res) => {

  console.log("Request body:", req.body); // 

  const { username, email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND email = $2",
      [username, email]
    );
   
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const validPassword = await  bcrypt.compare(password , user.password)
     if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {id: user.id , username: user.username , email:user.email },
      process.env.JWT_SECRET,
      {expiresIn:"2h"}
       
    );

    res.send({token})
  } catch (error) {
    console.error("Error inserting recipe:", error);
    if (error.code ==="23505") {
            res.status(409).json("username already exists");

    }
    res.status(500).json({ error: error.message });
  }
});




module.exports = router;
