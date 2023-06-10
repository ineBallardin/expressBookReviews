const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
if (username === "") {
  return false;
} else {
    return true;
  }
};
const authenticatedUser = (username,password)=>{ //returns boolean
  const validUsername = isValid(username);

  if (!validUsername) {
    return false;
  }

  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      res.status(404).json({message: "Error logging in"});
      return;
  }

  if (authenticatedUser(username,password)) {
    const accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 });

    req.session.authorization = { accessToken, username };
    res.status(200).send(`User ${username} successfully logged in`);
  } else {
    res.status(208).json({message: "Invalid Login. Check username and password"});
  }

  console.log(`Username ao logar: ${username}`)
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let username = req.session.authorization.username; // Assuming username is stored in session
  let review = req.body.review; // Accepting review text as request query
  console.log(`Username armazenado na variável username: ${username}`)

  if (!books[isbn]) {
    books[isbn] = {
      reviews: {}
    };
  }
  
  if (!review) {
    res.status(400).json({message: "No review was provided"});
    return;
  }
  
  let book = books[isbn];
  let existingReview = books[isbn].reviews[username];
  
  if (existingReview) {
    // Modify existing review for the same user
    existingReview.review = review;
  } else {
    // Add new review from a different user
    book.reviews[username] = {
      username: username,
      reviews: review
    };
  }

  console.log(books[isbn].reviews[username])
  res.status(200).json({message: "Review successfully updated"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { authorization } = req.session;
  if (!authorization) {
      res.status(403).json({ message: "Not authorized" });
      return;
  }

  const { username } = authorization;

  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
  }

  if (!book.reviews) {
      res.status(404).json({ message: "No reviews found for this book" });
      return;
  }

  const reviews = Object.values(book.reviews);
  const userReviewIndex = reviews.findIndex(review => review.username === username);

  if (userReviewIndex === -1) {
      res.status(404).json({ message: "No review found for the user in this book" });
      return;
  }

  const reviewKey = Object.keys(book.reviews)[userReviewIndex];
  delete book.reviews[reviewKey];
  books[isbn] = book;

  res.status(200).json({ message: "Review successfully deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
