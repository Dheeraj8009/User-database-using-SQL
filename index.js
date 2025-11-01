const { faker } = require('@faker-js/faker');

const mysql = require('mysql2');
const express = require('express');
const app = express();
const methodOverride = require('method-override');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: ''
});

// let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// let data = [];

// for (let i = 0; i < 100; i++) {
//   data.push(getRandomUser());
// }

// let user = ["123", "123_newuser", "abc@gmail.com", "abc" ];


// let users = [
//  ["123b", "123_newuserb", "abc@gmail.comb", "abcb" ],
//  ["123c", "123_newuserc", "abc@gmail.comc", "abcc" ],
// ];

// Insert a new user
// connection.query(q, [data], function (err, results) {
//   if (err) {
//     console.error('Error executing query:', err);
//     return;
//   }
//   console.log('Tables in the database:', results);
// });

// connection.end();

function getRandomUser() {
  return [
    faker.string.uuid(),
    faker.internet.username(), // ✅ fixed here
    faker.internet.email(),
    faker.internet.password()
  ];
  };

// console.log(getRandomUser());


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});// Connect to the database


// Define routes

app.get('/', (req, res) => {
  let q = "SELECT COUNT(*) AS total FROM user";

  connection.query(q, function (err, results) {
    if (err) {
      console.error('Error executing query:', err);
      res.send('Error occurred');
      return;
    }

    // Send just the count value
    let count = results[0].total;
    res.render("home.ejs", {count: count} );
    // res.send(`Total entries in the user table: ${results[0].total}`);
  });
});


// Route to display all users
app.get("/users", (req, res) => {
  let q = "SELECT * FROM user"; 
  connection.query(q, function (err, results) {
    if (err) {
      console.error('Error executing query:', err); 
      res.send('Error occurred');
      return;
    }
    res.render("showusers.ejs", {users: results} );
    // console.log(results);
    // res.send(results);
  });
});

// Edit user route
app.get("/users/:id/edit/", (req, res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  // console.log(id);
  connection.query(q, function (err, results) {
    if (err) {
      console.error('Error executing query:', err); 
      res.send('Error occurred');
      return;
    }
    let user = results[0];
    // console.log(results);
    res.render("edit.ejs" , {user: user} );
    // res.send(results);
  });
});

// Update user route
app.patch("/users/:id", (req, res) => {
  let {id} = req.params;
  let {username, email, password} = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  let {password: formPass, username: newUsername} = req.body;

  connection.query(q, function (err, results) {
    if (err) {
      console.error('Error executing query:', err); 
      res.send('Error occurred');
      return;
    }

    let user = results[0];
    if (formPass != user.password) {
      res.send("Incorrect password. Update failed.");
    } else {
      let q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}' `;
      connection.query(q2, function (err, results) {
        if (err) {
          console.error('Error executing query:', err);
          res.send('Error occurred during update');
          return;
        } 
        res.redirect("/users");
      });
    }
  }); 
});



// Add new user route

app.get("/users/new", (req, res) => {
  res.render("newUser"); // Renders views/newUser.ejs
});

app.post("/users", (req, res) => {
  let {username, email, password} = req.body;
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${faker.string.uuid()}', '${username}', '${email}', '${password}')`;
  connection.query(q, function (err, results) {
    if (err) {  
      console.error('Error executing query:', err); 
      res.send('Error occurred during insertion');
      return;
    } 
    res.redirect("/users");
  });
});



// Delete user route
app.get("/users/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = ?`;  
  connection.query(q, [id], function (err, results) {
    if (err) {
      console.error('Error executing query:', err);
      res.send('Error occurred');
      return;
    } 
    let user = results[0];
    res.render("delete.ejs", { user: user }); 
  });
});


app.delete("/users/:id", (req, res) => {
  let { id } = req.params;
  let { email: formEmail, password: formPass } = req.body;

  let q = `SELECT * FROM user WHERE id = ?`;
  connection.query(q, [id], function (err, results) {
    if (err) return res.status(500).send("Error occurred");

    if (!results.length) return res.status(404).send("User not found");

    let user = results[0];

    // Match both email and password
    if (formEmail !== user.email || formPass !== user.password) {
      return res.status(403).send("Incorrect email or password. Deletion failed.");
    }

    let q2 = `DELETE FROM user WHERE id = ?`;
    connection.query(q2, [id], function (err) {
      if (err) return res.status(500).send("Error occurred during deletion");
      res.redirect("/users");
    });
  });
});















