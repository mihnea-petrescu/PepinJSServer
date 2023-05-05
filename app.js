const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // enables parsing of form data
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(methodOverride('_method'));

// Home page route
app.get('/', (req, res) => {
    res.render('index');
});

// About page route
app.get('/about', (req, res) => {
    res.render('about');
});

// Blog page route
app.get('/blog', (req, res) => {
    const userAgent = req.get("user-agent");

    fs.readFile('./data/articles.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server Error');
        } else {
            const articles = JSON.parse(data).articles;
            // For Postman, return JSON, for browser, render page
            if (userAgent.includes("PostmanRuntime")) {
                res.status(200).send(articles);
            } else {
                res.render('blog', { articles: articles });
            }
        }
    });
});

// Get new article
app.get('/new-article', (req, res) => {
    res.render('new-article');
});

// Add new article
app.post('/new-article', (req, res) => {
    const userAgent = req.get("user-agent");

    fs.readFile('./data/articles.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server Error');
        } else {
            const articles = JSON.parse(data).articles;
            const newArticle = {
                id: crypto.randomUUID(),
                title: req.body.title,
                content: req.body.content
            };

            console.log(req.body);
            console.log(newArticle);
            articles.push(newArticle);
            const newData = JSON.stringify({ articles: articles });
            fs.writeFile('./data/articles.json', newData, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Server Error');
                    // For Postman, return JSON, for browser, render page
                } else if (userAgent.includes("PostmanRuntime")) {
                    res.status(200).send(newArticle);
                } else {
                    res.redirect('blog');
                }
            });
        }
    });
});

// Change article (PUT)
app.get('/article/:id', (req, res) => {
    fs.readFile('./data/articles.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server Error');
        } else {
            const id = req.params.id;
            const articles = JSON.parse(data).articles;
            const selectedArticle = articles.filter(article => article.id === id);

            console.log(id, selectedArticle, selectedArticle === []);
            // For Postman, return JSON, for browser, render page
            if (selectedArticle.length === 0) {
                res.status(404);
                res.render('404');
            } else {
                console.log(selectedArticle);
                res.render('edit-article', { article: selectedArticle[0] });
            }
        }
    });
});

app.put('/article/:id', (req, res) => {
    const userAgent = req.get("user-agent");

    console.log(userAgent);
    fs.readFile('./data/articles.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server Error');
        } else {
            const articles = JSON.parse(data).articles;
            const id = req.params.id;
            const modifiedArticle = {
                id: id,
                title: req.body.title,
                content: req.body.content
            };

            const index = articles.findIndex(article => article.id === id);

            if (index !== -1) {
                articles[index] = modifiedArticle;
                const newData = JSON.stringify({ articles: articles });
                fs.writeFile('./data/articles.json', newData, (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Server Error');
                        // For Postman, return JSON, for browser, render page
                    } else if (userAgent.includes("PostmanRuntime")) {
                        res.status(200).send(modifiedArticle);
                    } else {
                        res.redirect('/blog');
                    }
                });
            }

        }
    });
});

// Delete article by ID (DELETE)
app.delete('/article/:id', (req, res) => {
    const userAgent = req.get("user-agent");

    console.log(userAgent);
    fs.readFile('./data/articles.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server Error');
        } else {
            const articles = JSON.parse(data).articles;
            const id = req.params.id;

            const index = articles.findIndex(article => article.id === id);

            if (index !== -1) {
                articles.splice(index, 1);
                const newData = JSON.stringify({ articles: articles });
                fs.writeFile('./data/articles.json', newData, (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Server Error');
                        // For Postman, return JSON, for browser, render page
                    } else if (userAgent.includes("PostmanRuntime")) {
                        res.status(204).send();
                    } else {
                        res.redirect('/blog');
                    }
                });
            }

        }
    });
});


// Start the server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});