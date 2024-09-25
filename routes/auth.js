var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");


router.post("/Register", async (req, res, next) => {
  console.log("Received /Register request with body: ", req.body);
  try {
    // parameters exists
    // valid parameters
    // username exists
    let user_details = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email
      // profilePic: req.body.profilePic
    }
    console.log("User details:", user_details);


    try {
      users = await DButils.execQuery("SELECT username FROM users");
      console.log("Usernames in DB: ", users);
    } catch (err) {
      console.error("Error during query execution:", err);  // חשוב לבדוק אם יש בעיות בחיבור ל-MySQL
    }

    if (users.find((x) => x.username === user_details.username)){
      console.log("Username taken: ", req.body.username);
      throw { status: 409, message: "Username taken" };
    }

    // add the new username
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );
    const result = await DButils.execQuery(
      `INSERT INTO users (username, firstname, lastname, country, password, email) VALUES (?, ?, ?, ?, ?, ?)`,
      [user_details.username, user_details.firstname, user_details.lastname, user_details.country, hash_password, user_details.email]
    );    
    console.log("User inserted into DB: ", result);

    console.log("User successfully inserted to DB: ", req.body.username);
    res.status(201).send({ message: "user created", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Login", async (req, res, next) => {
  try {
    console.log("Received login request with body:", req.body);
    // check that username exists
    const users = await DButils.execQuery("SELECT username FROM users");
    console.log("users in /Login:", users);
    if (!users.find((x) => x.username === req.body.username))
      throw { status: 401, message: "Username or Password incorrect" };

    // check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE username = '${req.body.username}'`
      )
    )[0];
    console.log("user in /Login:", user);


    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.username = user.username;
    console.log("Login succeeded for user:", user.username);

    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    console.log("Error during login:", error.message);
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;
