const express = require('express');

const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");

const public_users = express.Router();

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Unable to register user." });
  }

  if (!isValid(username, password)) {
    return res
      .status(400)
      .json({ message: "Provided credentials are not valid." });
  }

  if (doesExist(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res
    .status(200)
    .json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const filteredBooks = Object.values(books).filter(
    (book) => book.author === author
  );

  return res.status(200).json(filteredBooks);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const filteredBooks = Object.values(books).filter(
    (book) => book.title === title
  );

  return res.status(200).json(filteredBooks);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Reviews not found for the book." });
  }
});

module.exports.general = public_users;
