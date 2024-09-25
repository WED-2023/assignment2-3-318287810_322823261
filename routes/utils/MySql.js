const mysql = require('mysql2/promise');
require("dotenv").config();

const config = {
  connectionLimit: 4,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pass_root@123',
  database: process.env.DB_NAME || 'mydb'
};

// יצירת חיבור ברמת ה- pool 
const pool = mysql.createPool(config);

// פונקציה להרצת שאילתות
const query = async (sql, binding) => {
  try {
    const [rows] = await pool.query(sql, binding);
    console.log("Query executed successfully.");
    return results;
  } catch (err) {
    console.error("Query failed:", err);
    throw err;
  }
};

// פונקציה לקבלת חיבור
const connection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL pool connected: threadId " + connection.threadId);
    
    // הפונקציה query והרליסינג 
    const query = async (sql, binding) => {
      const [results] = await connection.query(sql, binding);
      return results;
    };

    const release = () => {
      console.log("MySQL pool released: threadId " + connection.threadId);
      connection.release();
    };

    return { query, release };
  } catch (err) {
    console.error("Error connecting to MySQL:", err);
    throw err;
  }
};

module.exports = { pool, connection, query };
