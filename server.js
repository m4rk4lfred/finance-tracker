const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(express.static('public'));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'password', // Replace with your MySQL password
    database: 'DATABASE_PROJECT',
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    const query = 'SELECT * FROM transactions';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching records:', err.message);
            res.sendStatus(500);
        } else {
            console.log(results);
            res.render('index', { transactions: results });
        }
    });
});

app.get('/api/transactions', (req, res) => {
    const query = 'SELECT * FROM transactions';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching records:', err.message);
        res.status(500).json({ error: 'Failed to fetch transactions' });
      } else {
        res.json(results);
      }
    });
  });


// Add a new transaction
app.post('/api/transactions', (req, res) => {
    const { type, name, amount, date } = req.body;
    const query = 'INSERT INTO transactions (type, name, amount, date) VALUES (?, ?, ?, ?)';
    db.query(query, [type, name, amount, date], (err) => {
      if (err) {
        console.error('Error adding transaction:', err.message);
        res.status(500).json({ error: 'Failed to add transaction' });
      } else {
        res.status(201).json({ message: 'Transaction added successfully' });
      }
    });
  });


// Update transaction
app.post('/update/:id', (req, res) => {
    const { id } = req.params;
    const { type, name, amount, date } = req.body;
    const query = 'UPDATE transactions SET type = ?, name = ?, amount = ?, date = ? WHERE id = ?';
    db.query(query, [type, name, amount, date, id], (err) => {
        if (err) {
            console.error('Error updating record:', err.message);
            res.sendStatus(500);
        } else {
            res.redirect('/');
        }
    });
});

// Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM transactions WHERE id = ?';
    db.query(query, [id], (err) => {
      if (err) {
        console.error('Error deleting transaction:', err.message);
        res.status(500).json({ error: 'Failed to delete transaction' });
      } else {
        res.status(200).json({ message: 'Transaction deleted successfully' });
      }
    });
  });


  
  

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});