'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');


const PORT = process.env.PORT || 5000;
const client = new pg.Client(process.env.DATABASE_URL);

let bookInfo = [];


app.use(methodOverride('_method'));
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', renderHome); // homepage-works
app.get('/searches/new', showForm); // form page- works
app.get('/hello', showHello); //null
app.get('/error', showError); // all encompassing error
app.get('/books/:books_id', getBookDetails); // book details from shelf-works
app.post('/searches', createSearch); // book results to choose from-works
app.post('/add', addBooks); // add to bookshelf-works
// app.put()

// add books to bookshelf
function addBooks(req, res) {
  let { author, title, image, description, isbn } = req.body;
  console.log('im over here', req.body);
  // image = req.body.image;
  console.log('are you working now beach', image);
  let SQL = `INSERT INTO books(author, title, image_url, description, isbn) VALUES ($1,$2,$3,$4,$5);`;
  let values = [author, title, image, description, isbn];
  console.log('SQL IS WORKING: ', values);

  return client.query(SQL, values)
    .then(res.redirect('/'))
    .catch(err => console.error(err));
}

// book details to bookshelf
function getBookDetails(req, res) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [req.params.books_id];
  console.log('this is my id', values);

  return client.query(SQL, values)
    .then(result => res.render('pages/books/detail', { book: result.rows[0] }))
    .catch(err => console.error('unable to get book details', err));
}



function showError(req, res) {
  res.send('Sorry, something went wrong: ');
}
function showHello(req, res) {
  res.send('sup creature?');
}

function renderHome(req, res) {
  let SQL = 'SELECT * FROM books;';

  return client.query(SQL)
    .then(results => res.render('index', { results: results.rows }))
    .catch(err => console.error(err));
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
        // console.log(book);
        return new Book(book.volumeInfo);
      });
    })
    .then(bookInfo => {
      res.render('pages/searches/show', { bookInfo });
    })
    .catch(err => console.error(err));
}

function Book(info) {
  this.title = info.title || 'no title available';
  this.author = info.authors || 'no author available';
  this.image = info.imageLinks.thumbnail || 'Not Available';
  this.description = info.description || 'no description available';
  this.isbn = info.industryIdentifiers ? info.industryIdentifiers[0].identifier : 'ISBN not available';
  bookInfo.push(this);
  // console.log('this is my book information: ', bookInfo);
  const encryptThis = (url) => {
    let http = 'http';
    return url.replace(http, 'https')
  }
  this.image = encryptThis(this.image);
}

app.use('*', (req, res) => {
  res.status(404).send('Sorry, Try again.');
})

client.on('error', err => console.err(err));

client.connect()
  .then(() => {
    console.log('connected to DB yay!')
    app.listen(PORT, () => {
      console.log(`server is running:::: ${PORT}`);
    });
  })
  .catch(err => console.log('Unable to connect:', err));
