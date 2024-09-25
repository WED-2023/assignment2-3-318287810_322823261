var express = require("express");
var router = express.Router();
require("dotenv").config();
const recipes_utils = require("./utils/recipes_utils");
const DButils = require("./utils/DButils");
const axios = require('axios');


router.get("/", (req, res) => res.send("im here"));

/**
 * This path is for searching a recipe
 */
router.get("/search", async (req, res, next) => {
  try {
    const recipeName = req.query.recipeName;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerance = req.query.intolerance;
    const number = req.query.number || 5;
    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    console.log("results in /search", results);
    res.send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    console.log(`Received request for recipe ID: ${req.params.recipeId}`);
    console.log("path returns a full details in recipes.js 2-3");
    const recipe = await recipes_utils.getRecipeFullDetails(req.params.recipeId);
    console.log("Fetched recipe details:", recipe);
    res.send(recipe);
  } catch (error) {
    console.error("Error in fetching recipe details:", error);
    next(error);
  }
});

router.get('/preview', async (req, res, next) => {
  try {
    const recipeIds = req.query.ids.split(',');
    console.log("start recipes in /preview", recipeIds);
    const recipes = await recipes_utils.getRecipesPreview(recipeIds);
    console.log("recipes in /preview", recipes);
    res.send(recipes);
  } catch (error) {
    console.error("Error in /preview route:", error);
    next(error);
  }
});


// Route to get random recipes with optional filters
router.get('/recipe/random', async (req, res, next) => {
  try {
    console.log('Random recipes.js ');
    const number = req.query.number || 1;
    const includeTags = req.query['include-tags'] ? req.query['include-tags'].split(',') : [];
    const excludeTags = req.query['exclude-tags'] ? req.query['exclude-tags'].split(',') : [];
    const randomRecipes = await recipes_utils.getRandomRecipes(number, includeTags, excludeTags);
    console.log("randomRecipes in /recipes/random: ", randomRecipes);
    res.send(randomRecipes);
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const recipeName = req.searchQuery.recipeName;
    const cuisine = req.searchQuery.cuisine;
    const diet = req.searchQuery.diet;
    const intolerance = req.searchQuery.intolerance;
    const number = req.searchQuery.number || 5;
    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    res.send(results);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
