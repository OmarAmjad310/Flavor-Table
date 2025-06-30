
 // Get data from my database     
   async function loadRecipes() {
    const container = document.getElementById("recipes-container");

    try {
      const response = await fetch("/recipes/api/all");

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const recipes = await response.json();

      if (recipes.length === 0) {
        container.innerHTML = "<p>No recipes found.</p>";
        return;
      }

      recipes.forEach(recipe => {
        const div = document.createElement("div");
        div.classList.add("recipe");

        // Safely parse ingredients from JSON string
       let ingredients = [];

      try {
      if (Array.isArray(recipe.ingredients)) {
       ingredients = recipe.ingredients;
      } else {
        ingredients = JSON.parse(recipe.ingredients);
      }
      } catch (e) {
      console.error("Failed to parse ingredients:", e);
      // Fallback if it's a plain string like "eggs, flour"
      ingredients = recipe.ingredients.split(',').map(ing => ing.trim()); 
      }

        div.innerHTML = `
          <h2>${recipe.title}</h2>
          <img src="${recipe.image}" alt="${recipe.title}">
          <p>${recipe.instructions}</p>
          <ul>
            ${ingredients.map(ing => `<li>${ing}</li>`).join("")}
          </ul>
          <p>${recipe.readyin}</p>
            <button class="delete-btn" data-id="${recipe.id}">Delete</button>
        `;

        container.appendChild(div);
      });

      attachDeleteHandlers();

    } catch (error) {
      console.error("Fetch error:", error);
      container.innerHTML = "<p>Error loading recipes.</p>";
    }
  }

  // Call the function when the page loads
  window.addEventListener("DOMContentLoaded", loadRecipes);

  /// 

  //// Create a delete button to delete the data for specific id :
   
    function attachDeleteHandlers() {
      const buttons = document.querySelectorAll(".delete-btn");

      buttons.forEach(button => {
        button.addEventListener("click", async () => {
          const id = button.getAttribute("data-id");
          console.log(`Button clicked. ID value: ${button.getAttribute("data-id")}`);

          if (!confirm("Are you sure you want to delete this recipe?")) return;
           console.log(`Sending ID to delete: ${id}`);
          try {
            const response = await fetch(`/recipes/${id}`, {
              method: "DELETE",
            });

            const data = await response.json();

            if (response.ok) {
              alert("Recipe deleted!");
              loadRecipes(); // Refresh the list
            } else {
              alert(`Error: ${data.error}`);
            }
          } catch (err) {
            console.error("Delete error:", err);
            alert("Server error during delete.");
          }
        });
      });
    }
  