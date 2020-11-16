'use strict';
const express = require('express');
const app = express();
const superagent = require('superagent');
const PORT = process.env.PORT || 5000;

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', renderHomePage);
app.get('/searches/new', showForm);
app.post('/searches', createSearch);

function renderHomePage(req, res) {
  res.render('pages/index');
}

function showForm(req, res) {
  res.render('pages/searches/new.ejs');
}

function createSearch(req, res) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }
  if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }

  console.log(url);

  superagent.get(url)
    .then(data => {
      return data.body.items.map(book => {
        return new Book(book.volumeInfo);
      });
    })
    .then(results => {
      res.render('pages/searches/show', { searchResults: JSON.stringify(results) });
    })
    .catch(err => console.error(err));
}

function Book(info) {
  this.title = info.title || 'No title Available';
}

app.listen(PORT, () => {
  console.log(`server up::: ${PORT}`);
});
