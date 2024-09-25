const DButils = require("./DButils");
const bcrypt = require('bcrypt');

async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${username}',${recipe_id})`);
}

//Favorite
async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where username='${username}'`);
    console.log("Fetched recipe IDs from user_utils:", recipes_id);
    return recipes_id;
}


async function getUserRecipes(username){
  try{
  const recipes = await DButils.execQuery(`select recipe_data from UserRecipes where username='${username}'`);
  console.log("Fetched recipes from user_utils: (getUserRecipes) DONE");
  return recipes;
  
  } catch (error){
    next(error);
  }
  
}


async function removeFromFavorites(username, recipe_id) {
  try{
    await DButils.execQuery(`DELETE FROM FavoriteRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);

  } catch(error){
    console.error(`Didn't remove the recipe from favorite list`, error.message);
    throw error;
  }
}

async function isFavorite(username, recipe_id) {
  try {
      const result = await DButils.execQuery(`SELECT * FROM FavoriteRecipes WHERE username='${username}' AND recipe_id=${recipe_id}`);
      console.log("user like this recipe?:",  result.length);
      return result.length > 0;
  } catch (error) {
      console.error(`Error checking if recipe ${recipe_id} is favorite by user ${username}:`, error);
      throw error;
  }
}



// פונקציה לרישום משתמש חדש
async function registerUser(userDetails) {
  try {
    // בדיקה אם שם המשתמש כבר קיים
    const existingUsers = await DButils.execQuery("SELECT username FROM users WHERE username = ?", [userDetails.username]);
    if (existingUsers.length > 0) {
      console.log("User details received:", userDetails);
      throw { status: 409, message: "Username taken" };
    }

    // הצפנת הסיסמה
    const hashedPassword = bcrypt.hashSync(userDetails.password, parseInt(process.env.bcrypt_saltRounds));

    // הוספת המשתמש לטבלה
    await DButils.execQuery(
        `INSERT INTO users (username, firstname, lastname, country, password, email) VALUES (?, ?, ?, ?, ?, ?)`,
        [user_details.username, user_details.firstname, user_details.lastname, user_details.country, hash_password, user_details.email]
      );

    return { status: 201, response: { message: "User created", success: true } };
  } catch (error) {
    console.error("Error registering user:", error.message);
    throw new Error("Error registering user: " + error.message);
  }
}


// פונקציה להתחברות משתמש
async function loginUser(credentials) {
    try {
      const users = await DButils.execQuery("SELECT * FROM users WHERE username = ?", [credentials.username]);
      if (users.length === 0) {
        throw { status: 401, message: "Username or Password incorrect" };
      }
  
      const user = users[0];
      const isPasswordValid = bcrypt.compareSync(credentials.password, user.password);
      if (!isPasswordValid) {
        throw { status: 401, message: "Username or Password incorrect" };
      }
  
      return { status: 200, data: { username: user.username, message: "login succeeded", success: true } };
    } catch (error) {
      throw new Error("Error during login: " + error.message);
    }
  }
  
  module.exports = { registerUser, loginUser , getFavoriteRecipes, markAsFavorite, isFavorite, removeFromFavorites, getUserRecipes};

