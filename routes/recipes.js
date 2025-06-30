const express = require("express");
const axios = require("axios");
const pg = require("pg");
const router = express.Router();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });



router.get("/random", async (req, res) => {
  try {
    const response = await axios.get("https://api.spoonacular.com/recipes/random", {
      params: {
        apiKey: process.env.SPOON_API_KEY,
      },
    });
 
    const recipe = response.data.recipes[0]

    const render ={
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      instructions: recipe.instructions,
      Ingredients: recipe.extendedIngredients.map(ingredient => ingredient.original),
      readyin: recipe.readyInMinutes
    }
 
    res.json(render);
  } catch (error) {
    console.error("Error fetching recipes:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

router.get("/search", async (req, res) => {
  try {
     let ingredients  = req.query.ingredients;
    
    if (!ingredients) {
      return res.status(400).json({ error: "Ingredients parameter is required" });
    }


    const response = await axios.get("https://api.spoonacular.com/recipes/findByIngredients", {
      params: {
        apiKey: process.env.SPOON_API_KEY,
        ingredients,  // Add ingredients parameter
        number: 5,
      },
    });
 
    const recipes = response.data.map((o) => ({
     id: o.id,
     title: o.title,
     image: o.image,
     usedIngredientCount: o.usedIngredients.map(ing => ing.name),
     missedIngredientCount: o.missedIngredients.map(ing => ing.name),

    }));
 
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});


//get all router
router.get('/api/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipes');
    res.json(result.rows);
  } catch (err) {
    console.error('Full database error:', err); // Log the complete error
    res.status(500).json({ 
      error: 'Database error',
      details: err.message // Include the actual error message
    });
  }
});

// Post router
router.post('/add', async (req, res) => {

  console.log("Request body:", req.body); // 

  const { title, image, instructions, ingredients, readyin } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO recipes (title, image, instructions, ingredients, readyin) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, image, instructions, JSON.stringify(ingredients), readyin]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting recipe:", error);
    res.status(500).json({ error: error.message });
  }
});

//Put router
router.put("/api/recipes/:id" , async (req , res) => {

    const { id } = req.params;
    const { title , image , instructions , ingredients , readyin } = req.body;
    
    try {
        
        const result = await pool.query(

        `UPDATE recipes 
        SET title = $1, image = $2, instructions = $3, ingredients = $4, readyin = $5 
        WHERE id = $6 RETURNING *`,

        [title, image, instructions, JSON.stringify(ingredients), readyin, id]

        );

        res.json(result.rows[0]);

    } catch (error) {

        console.log("error while updating the recipe" , error);

        res.status(500).json({ error: 'Failed to update recipe' });
         
    }


});



// DELETE /api/recipes/:id - Delete a recipe by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID (optional but recommended)
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }

    // Delete from PostgreSQL
    const query = 'DELETE FROM recipes WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.status(200).json({ 
      message: 'Recipe deleted successfully',
      deletedRecipe: rows[0] 
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Server error while deleting recipe' });
  }
});



module.exports = router;