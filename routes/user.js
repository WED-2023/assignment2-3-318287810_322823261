var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.username) {
    console.log("Session content:", req.session);
    console.log("Session found, username: ", req.session.username);
    DButils.execQuery("SELECT username FROM users").then((users) => {
      if (users.find((x) => x.username === req.session.username)) {
        req.username = req.session.username;
        console.log("User authenticated: ", req.username);
        next();
      } else {
        console.log("User not found in database, sending 401");
        res.sendStatus(401); // המשתמש לא נמצא בבסיס הנתונים
      }
    }).catch(err => {
      console.error("Error querying the database: ", err);
      next(err);
    });
  } else {
    console.log("No session found, sending 401");
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  if (!req.session || !req.session.username) {
    return res.status(401).send("User not authenticated");
  }
  try{
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(username,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
      console.error(error);
      res.status(500).send("Server error");
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const username = req.session.username;
    console.log(`Fetching favorites for user: ${username}`);
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    console.log(`Fetched recipe IDs from user.js:`, recipes_id);

    let recipes_id_array = recipes_id.map((element) => element.recipe_id);
    console.log(`Fetched recipes_id_array from user.js:`, recipes_id_array);
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    console.log(`Recipe previews:`, results);

    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

// הסרת מתכון מהמועדפים
router.delete('/favorites', async (req, res) => {
  if (!req.session || !req.session.username) {
    return res.status(401).send({ message: "User not authenticated" });
  }
  try {
    await user_utils.removeFromFavorites(req.session.username, req.body.recipeId);
    res.status(200).send({ message: "Removed from favorites" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});

router.post('/isFavorite', async (req, res, next) => {
  try {
    const username = req.session.username;
    const recipe_id = req.body.recipeId;
    console.log("recipe_id= ", req.body.recipeId);
    if (!recipe_id) {
      throw new Error("Missing recipe ID");
    }
    
    console.log(`Checking if recipe ${recipe_id} is favorite for user: ${username}`);
    
    const favorite = await user_utils.isFavorite(username, recipe_id);
    console.log(`Checking if recipe ${recipe_id} is favorite for user: ${username}? `, favorite);
    res.status(200).send({ favorite });
  } catch (error) {
    next(error);
  }
});



/**
 * This path returns My recipes that were created by the logged-in user
 */
 router.get('/userRecipes', async (req,res,next) => {
  try{
    const username = req.session.username;
    console.log(`Fetching created recipes for user: ${username}`);

    const recipes = await user_utils.getUserRecipes(username);
    console.log(`Fetched recipes from user.js: (userRecipes)`, recipes);

    // Parse the recipe_data field for each recipe
    const recipes_data = recipes.map(row => {
      let recipe = row.recipe_data;

      // Parse the recipe_data string into an object
      if (typeof recipe === 'string') {
        recipe = JSON.parse(recipe);  // Convert string to object
      }

      console.log("Recipe from recipes: (getUserRecipes)", recipe);

      // Now, recipe is an object, and you can access its properties
      return {
        title: recipe.title,
        image: recipe.image,
        vegan: recipe.vegan,
        servings: recipe.servings,
        glutenFree: recipe.glutenFree,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        readyInMinutes: recipe.readyInMinutes
      };
    });
    
    console.log(`Recipe previews: (userRecipes)`, recipes_data);

    res.status(200).send(recipes_data);
  } catch(error){
    next(error); 
  }
});

// יצירת מתכון חדש
router.post('/createARecipe', async (req, res, next) => {
  console.log("Received /createARecipe request with body: ", req.body);
  try {
    console.log("start POST of create recipe");
    if (!req.session.username) {
      return res.status(401).send({ message: "User not authenticated" });
    }
    const username = req.session.username;
    console.log("user name:", username);
    console.log("username:", req.session.username);
    const { title, image, readyInMinutes, servings, ingredients, instructions, vegan, vegetarian, glutenFree } = req.body;

    // יצירת אובייקט JSON שמכיל את כל פרטי המתכון
    const recipeData = JSON.stringify({
      title, image, readyInMinutes, servings, ingredients, instructions, vegan, vegetarian, glutenFree
    });

    await DButils.execQuery(
      `INSERT INTO UserRecipes (username, title, image_url, ready_in_minutes, servings, ingredients, instructions, vegan, vegetarian, glutenFree, recipe_data) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, title, image, readyInMinutes, servings, ingredients, instructions, vegan, vegetarian, glutenFree, recipeData]
    );
    
    res.status(201).send({ message: "Recipe created successfully" });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
