# Portfolio Project Web Application 

This project is a full-stack web application built for a university coursework module. It is a blog-style platform where users can register, log in, create posts, and search for content. The application is built with the MEEN stack (MySQL, Express.js, EJS, Node.js).

### Live Demo

The fully deployed application can be viewed here: **https://blooming-temple-06019-92b755ba6f8c.herokuapp.com/**

---

## Features

*   **User Authentication:** Secure user registration and login system with password hashing (`bcrypt`).
*   **Session Management:** Persistent login sessions using `express-session`.
*   **Post Creation:** Authenticated users can create, and view posts.
*   **Database Integration:** All user and post data is stored in a MySQL database.
*   **Database Search:** Public search functionality to find posts based on keywords.
*   **API Provision:** Provides a RESTful API endpoint (`/api/posts`) to expose all post data as JSON.
*   **API Consumption:** Consumes a third-party API (Cat Fact Ninja) to display dynamic data on the homepage.
*   **Protected Routes:** Middleware ensures that certain pages (like "Add Post") are only accessible to logged-in users.

---

## Technology Stack

*   **Backend:** Node.js, Express.js
*   **Frontend:** EJS (Embedded JavaScript) for server-side rendering, HTML5, CSS3
*   **Database:** MySQL
*   **Deployment:** Heroku
*   **Key Node.js Libraries:**
    *   `express`
    *   `mysql2`
    *   `bcrypt`
    *   `express-session`
    *   `axios`

---

## Getting Started

To get a copy of this project up and running on your local machine, follow these steps.

### Prerequisites

You must have the following software installed on your system:
*   [Node.js](https://nodejs.org/) (which includes npm)
*   [Git](https://git-scm.com/)
*   A local MySQL Server instance (e.g., [MySQL Community Server](https://dev.mysql.com/downloads/mysql/))
*   A MySQL client (e.g., [MySQL Workbench](https://dev.mysql.com/downloads/workbench/))

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Djafar2000/portfolio-project
    ```

2.  **Navigate into the project directory:**
    ```sh
    cd desktop/Data web project
    ```

3.  **Install NPM packages:**
    ```sh
    npm install
    ```

4.  **Set up the local database:**
    *   Log in to your local MySQL server (e.g., via MySQL Workbench).
    *   Execute the following SQL commands to create the database and the necessary tables:
      ```sql
      -- Create the database
      CREATE DATABASE IF NOT EXISTS webapp_db;

      -- Switch to the new database
      USE webapp_db;

      -- Create the 'users' table
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create the 'posts' table
      CREATE TABLE IF NOT EXISTS posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      ```

5.  **Configure the application:**
    *   Open the `app.js` file in your code editor.
    *   Find the `db` connection block and update it with your local MySQL credentials (you will likely only need to change the password).

      ```javascript
      // Inside app.js
      const db = mysql.createConnection(process.env.JAWSDB_URL || {
          host: 'localhost',
          user: 'root',
          password: 'YOUR_LOCAL_MYSQL_PASSWORD', // <-- CHANGE THIS
          database: 'webapp_db'
      });
      ```

6.  **Run the application:**
    ```sh
    npm start
    ```

7.  **View the application in your browser** at `http://localhost:3000`.

---