const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
require("dotenv").config();


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    const response = await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: true,
            apiKey: process.env.spooncular_apiKey
        }
    });
    console.log("response in getRecipeInfomation: DONE");
    return response;
}


async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    console.log("recipe_info in getRecipeDetails: DONE");
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}

/**
 * Extract the relevant recipe data for preview
 * @param {*} recipe_id 
 */
async function getRecipeFullDetails(recipe_id) {
    try {
        console.log(`Fetching recipe details from API for ID: ${recipe_id}`);
        let response = await getRecipeInformation(recipe_id);
        console.log("response in getRecipeFullDetails: DONE");
        let recipe_info = response.data;
        console.log("Recipe information API response: DONE");

        if (!recipe_info || Object.keys(recipe_info).length === 0) {
            throw new Error('Recipe details are empty or invalid');
        }
        console.log("Recipe information from API: DONE");


        let {
            id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree,
            summary, analyzedInstructions, instructions, extendedIngredients, servings
        } = recipe_info;


        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            aggregateLikes: aggregateLikes,
            vegetarian: vegetarian,
            vegan: vegan,
            glutenFree: glutenFree,
            summary: summary,
            analyzedInstructions: analyzedInstructions,
            instructions: instructions,
            extendedIngredients: extendedIngredients,
            servings: servings
        };
    } catch (error) {
        console.error(`Error getting recipe details for ID ${recipe_id}:`, error.message, error.stack);
        throw error;
    }
}


/**
 * Fetch random recipes from Spoonacular with optional filters
 * @param {*} number - Number of random recipes to fetch
 * @param {*} includeTags - Tags that the recipes must include (e.g., vegetarian, dessert)
 * @param {*} excludeTags - Tags that the recipes must exclude (e.g., dairy, gluten)
 */
 async function getRandomRecipes(number, includeTags = "", excludeTags = "") {
    try {
        console.log(`Fetching ${number} random recipes from Spoonacular with includeTags: ${includeTags}, excludeTags: ${excludeTags}`);
        const response = await axios.get(`${api_domain}/random`, {
            params: {
                number: number,
                tags: includeTags.join(','),
                excludeTags: excludeTags.join(','),
                apiKey: process.env.spooncular_apiKey,
            }
      });
      console.log('Random recipes fetched: DONE');
  
      if (response.data && response.data.recipes) {
        console.log(`Fetched ${response.data.recipes.length} recipes successfully.`);
        return { recipes: response.data.recipes }; // Returns an array of random recipes
      } else {
        throw new Error("No recipes found.");
      }
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      throw error;
    }
  }
  

  /**
 * Get recipe preview for multiple recipes by their IDs
 * @param {Array} recipe_ids 
 */
 async function getRecipesPreview(recipe_ids) {
    try {
        console.log(`test the recipes_ids`,recipe_ids);
        const promises = recipe_ids.map(id => getRecipeDetails(id)); // Call getRecipeDetails for each recipe
        const recipes = await Promise.all(promises); // Wait for all requests to resolve
        console.log(`recipes from getRecipesPreview: `,recipes);
        return recipes; // Return the list of recipes
    } catch (error) {
        console.error('Error fetching recipes preview:', error);
        throw error;
    }
}


async function searchRecipe(recipeName, cuisine, diet, intolerance, number) {
    try {
        const response = await axios.get(`${api_domain}/complexSearch`, {
            params: {
                query: recipeName,
                cuisine: cuisine,
                diet: diet,
                intolerances: intolerance,
                number: number,
                apiKey: process.env.spooncular_apiKey
            }
        });

        if (response && response.data && response.data.results) {
            const recipesDetails = await Promise.all(response.data.results.map(recipe => 
                getRecipeDetails(recipe.id)));
            return recipesDetails;
        } else {
            throw new Error('No results in response');
        }
    } catch (error) {
        console.error('Error searching recipes:', error);
        throw error;
    }
}

module.exports = {getRecipeInformation, getRecipeDetails, searchRecipe, getRecipesPreview, getRandomRecipes, getRecipeFullDetails};
