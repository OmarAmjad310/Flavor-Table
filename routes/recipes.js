/*async function fetchRandomRecipe() {
  try {
    const response = await fetch('http://localhost:3000/recipes/random?apiKey=YOUR_KEY');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching recipe:', error);
  }
}*/

const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/random", async (req, res) => {
  try {
    const response = await axios.get("https://api.spoonacular.com/recipes/random", {
      params: {
        apiKey: process.env.SPOON_API_KEY,
      },
    });
 
    const recipe = response.data.recipes[0]

    const render ={
      title: recipe.title,
      image: recipe.image,
      instructions: recipe.instructions,
      Ingredients: recipe.extendedIngredients.map(ingredient => ingredient.original),
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
        number: 4,
      },
    });
 
    const recipes = response.data.map((o) => ({
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

module.exports = router;