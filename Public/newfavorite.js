
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

      container.innerHTML = '';
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

            <button class="edit-btn" data-id="${recipe.id}">Edit</button>
            <button class="delete-btn" data-id="${recipe.id}">Delete</button>
        `;

        container.appendChild(div);
      });
      
      attachEditHandlers();
      attachDeleteHandlers();
      

    } catch (error) {
      console.error("Fetch error:", error);
      container.innerHTML = "<p>Error loading recipes.</p>";
    }
  }

     function attachEditHandlers() {
const editButtons = document.querySelectorAll(".edit-btn");

editButtons.forEach(button => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("data-id");
    console.log('Clicked Edit button, data-id:', id);
    if (!id) {
      alert("Missing recipe id! Cannot edit.");
      return;
    }
    window.location.href = `/edit.html?id=${id}`;
  });
});
}

  // Call the function when the page loads
  window.addEventListener("DOMContentLoaded", loadRecipes());

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

    // Create an update function to edit the data inside the database(PostgreSQl)



async function loadRecipeToEdit() {
  try {
      console.log("loadRecipeToEdit called");  // <-- add this

    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get("id");
    console.log('recipeId:', recipeId);


    if (!recipeId) {
      
      return;
    }

    const response = await fetch(`/recipes/api/recipes/${recipeId}`);
    if (!response.ok) throw new Error("Failed to fetch recipe.");

    const recipe = await response.json();
     console.log("Before setting update-id:", document.getElementById("update-id").value);
     document.getElementById("update-id").value = recipe.id;
     console.log("Before setting update-id:", document.getElementById("update-id").value);



    document.getElementById("update-title").value = recipe.title;
    document.getElementById("update-image").value = recipe.image;
    document.getElementById("update-instructions").value = recipe.instructions;
    document.getElementById("update-ingredients").value = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.join(", ")
      : recipe.ingredients;
    document.getElementById("update-readyin").value = recipe.readyin;

  } catch (error) {
    console.error("Error loading recipe:", error);
    alert("Failed to load recipe for editing.");
  }
}

async function handleUpdateForm() {
  const form = document.getElementById("updateForm");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("update-id").value;
    const title = document.getElementById("update-title").value;
    const image = document.getElementById("update-image").value;
    const instructions = document.getElementById("update-instructions").value;
    const ingredientsRaw = document.getElementById("update-ingredients").value;
    const readyin = document.getElementById("update-readyin").value;

    const ingredients = ingredientsRaw.split(",").map(ing => ing.trim());

    try {
      console.log("Update URL:", `/recipes/api/recipes/${id}`);
      const response = await fetch(`/recipes/api/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, image, instructions, ingredients, readyin })
      });

      if (!response.ok) throw new Error("Failed to update recipe.");

      alert("Recipe updated successfully!");
      window.location.href = "/"; // or your list page

    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating recipe.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadRecipeToEdit();
  handleUpdateForm();
});