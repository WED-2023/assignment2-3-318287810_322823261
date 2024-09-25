# RecipeSite Website

## Overview
This project is a recipe website where users can:
- Register and log in to create their own accounts.
- Create their own recipes.
- Search for specific recipes using filters like cuisine, diet, etc.
- View random recipes.
- Learn more about the developers via the About page.

The project is developed using both **front-end** and **back-end** technologies. The front-end enables users to interact with the system, while the back-end handles data processing and storage.

## Features
- **User Authentication**: Register, log in.
- **Recipe Management**: Users can create their own recipes.
- **Search Recipes**: Search for recipes using multiple filters (e.g., cuisine, diet, etc).
- **Random Recipes**: Generate random recipe suggestions using an external API.
- **About Page**: Contains details about the developers.

## Technologies Used
- **Front-End**: 
  - Vue.js for building the user interface.
  - Axios for making HTTP requests from the client-side.
  
- **Back-End**:
  - Node.js and Express.js for server-side logic.
  - MySQL for database management.
  - Spoonacular API for fetching recipe data.

## Project Setup

### Configuration
1. Create a `.env` file in the root directory with the following content:
   ```bash
   spooncular_apiKey=your-api-key
   DB_Username=your-db-username
   DB_Password=your-db-password
   ```

### Running the Project
1. Build the client side:
   ```bash
   vue-cli-service build
   ```
2. Start the server:
   ```bash
   node server_connections.js
   ```
3. Open your browser and navigate to `https://RecipeSite.cs.bgu.ac.il` to use the application.

## Contributors
- **Razan Jbara** - 322823261.
- **Shilat Alon** - 318287810.
