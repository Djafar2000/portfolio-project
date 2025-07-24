// Import required modules
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); 
const session = require('express-session'); 
const FileStore = require('session-file-store')(session);

// Initialize the Express app
const app = express();
const port = 3000;

// Create a connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ayoub2006', 
    database: 'webapp_db'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to the MySQL database.');
});

// Configure session middleware
app.use(session({
    store: new FileStore(), // Use file-based session storage
    secret: 'a-very-strong-secret-key-that-is-hard-to-guess', // IMPORTANT: Change this to a random, secret string
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        secure: false, // Set to true if you are using HTTPS
        httpOnly: true, // Prevents client-side JS from reading the cookie
        maxAge: 1000 * 60 * 60 * 24 // Cookie expiry time: 1 day
    }
}));


// Set up view engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});
// Middleware to protect routes
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        // User is not logged in, redirect them to the login page
        return res.redirect('/login');
    }
    // User is logged in, proceed to the next function in the chain
    next();
};

// --- Routes ---

// Home page route
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

// About page route
app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

// Route to show the registration page
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});


// Route to handle the registration form submission
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const saltRounds = 10;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // SQL query to insert the new user
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const values = [username, email, hashedPassword];

        // Execute the query
        db.query(sql, values, (err, result) => {
            if (err) {
                // Check for duplicate entry error
                if (err.code === 'ER_DUP_ENTRY') {
                    console.error('Registration failed: Username or email already exists.');
                    res.status(409).send('Username or email already exists.');
                } else {
                    console.error('Database error:', err);
                    res.status(500).send('Error registering user.');
                }
                return;
            }
            console.log('User registered successfully:', result);
            // Redirect to a login page after successful registration
            res.redirect('/login');
        });
    } catch (error) {
        console.error('Error during registration process:', error);
        res.status(500).send('An unexpected error occurred.');
    }
});

// Add this with your other GET routes
app.get('/search', (req, res) => {
    const query = req.query.query;

    // Use the LIKE operator to search for the query in post titles and content
    // The '%' is a wildcard character
    const sql = 'SELECT * FROM posts WHERE title LIKE ? OR content LIKE ?';
    const searchTerm = `%${query}%`;

    db.query(sql, [searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        res.render('search-results', {
            title: `Search Results for "${query}"`,
            results: results,
            query: query
        });
    });
});

// Route to show the login page (for redirection)
app.get('/login', (req, res) => {
    // Pass an empty message by default
    res.render('login', { title: 'Login', message: '' });
});

app.get('/add-post', requireLogin, (req, res) => {
    res.render('add-post', { title: 'Add a New Post' });
});

app.post('/add-post', requireLogin, (req, res) => {
    const { title, content } = req.body;
    const userId = req.session.userId;

    if (!title || !content) {
        // In a real app, you'd render the form again with an error
        return res.status(400).send('Title and content are required.');
    }

    const sql = 'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)';
    db.query(sql, [title, content, userId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        // Redirect to the homepage to see the new post (we'll display posts there later)
        res.redirect('/');
    });
});

// Route to handle the login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { title: 'Login', message: 'Please provide a username and password.' });
    }

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }

        // Check if user was found
        if (results.length === 0) {
            return res.render('login', { title: 'Login', message: 'Invalid username or password.' });
        }

        const user = results[0];

        // Compare the submitted password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('login', { title: 'Login', message: 'Invalid username or password.' });
        }

        // Login successful: Create a session
        req.session.userId = user.id;
        req.session.username = user.username;
        console.log(`User '${user.username}' logged in successfully.`);

        // Redirect to the home page
        res.redirect('/');
    });
});

//  Route for logging out
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        // Clear the cookie and redirect
        res.clearCookie('connect.sid'); // The default session cookie name
        res.redirect('/login');
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});