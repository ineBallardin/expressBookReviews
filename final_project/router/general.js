const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  return users.some(user => user.username === username);
}

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username, password });
      res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      res.status(409).json({ message: "User already exists!" });
    }
  } else {
    res.status(400).json({ message: "Unable to register user." });
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn
  return res.status(200).json(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const bookKeys = Object.keys(books)
  const author = req.params.author

  const filteredBooks = bookKeys.filter((key) => {
    return books[key].author === author;
  }).map((key) => {
    return books[key];
  });

  return res.status(300).json(filteredBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const bookKeys = Object.keys(books)
  const title = req.params.title

  const filteredBooks = bookKeys.filter((key) => {
    return books[key].title === title;
  }).map((key) => {
    return books[key];
  });

  return res.status(300).json(filteredBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn
  return res.status(300).json(books[isbn].reviews);
});

module.exports.general = public_users;
