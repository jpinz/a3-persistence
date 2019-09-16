const express = require('express'),
    session = require('express-session'),
    favicon = require('serve-favicon'),
    authUtils = require('./authUtils'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    server = express(),
    low = require('lowdb'),
    FileSync = require('lowdb/adapters/FileSync'),
    adapter = new FileSync('db.json'),
    db = low(adapter),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    dir = '/public/',
    port = 3000;
require('dotenv').config();

let links = [
    { 'name': 'Google', 'tags': ['seach engine'], 'url': 'http://google.com', 'icon': 'https://s2.googleusercontent.com/s2/favicons?domain=http://google.com' },
    { 'name': 'Facebook', 'tags': ['social media', 'news'], 'url': 'http://facebook.com', 'icon': 'https://s2.googleusercontent.com/s2/favicons?domain=http://facebook.com' },
    { 'name': 'Feedly', 'tags': ['rss', 'news'], 'url': 'http://feedly.com', 'icon': 'https://s2.googleusercontent.com/s2/favicons?domain=http://feedly.com' },
    { 'name': 'Twitter', 'tags': ['social media', 'news'], 'url': 'http://twitter.com', 'icon': 'https://s2.googleusercontent.com/s2/favicons?domain=http://twitter.com' },
];

db.defaults({ users: [] })
    .write();

server.set('port', process.env.PORT || port);

passport.use(new LocalStrategy(
    function (username, password, done) {
        var user = db.get('users').find({ username: username }).value()

        if (!user) {
            return done(null, false, { message: 'User not found' });
        }

        var passwordsMatch = authUtils.comparePassword(password, user.password);

        if (!passwordsMatch) {
            return done(null, false, { message: 'Invalid username & password.' });
        }

        return done(null, user)
    }
));

function isUserAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.send('You must login!');
    }
}

function isLoggedOut(req, res, next) {
    if (!req.user) {
        next();
    } else {
        res.send('You are logged in!');
    }
}

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    var user = db.get('users').find({ id: id }).value()

    console.log(user);
    if (!user) {
        done({ message: 'Invalid credentials.' }, null);
    } else {
        done(null, user);
    }
});

server.use(express.static(__dirname + '/public'));
server.use(favicon(__dirname + '/public/favicon.ico'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(session({ secret: process.env.SECRET }));
server.use(passport.initialize());
server.use(passport.session());


server.get('/', function (req, res) {
    res.sendFile(__dirname + dir + 'index.html');
});

server.get('/login', isLoggedOut, (req, res) => {
    res.sendFile(__dirname + dir + 'login.html');
});

server.post(
    '/api/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.json({'status': true});
  }
);

server.get('/signup', (req, res) => {
    res.sendFile(__dirname + dir + 'signup.html');
});

server.get('/secret', isUserAuthenticated, (req, res) => {
    res.send('You have reached the secret route');
});

server.post('/api/signup', (req, res) => {
    var usernames = db.get('users').map('username').value();

    var usernameIsTaken = usernames.includes(req.body.username);

    if (usernameIsTaken) {
        return res.send(false);
    } else {
        db.get('users')
            .push({
                username: req.body.username,
                id: uuid(),
                password: authUtils.hashPassword(req.body.password),
                links: links
            })
            .write()
        res.redirect('/');
    }
});

server.get('/links', (request, response) => {
    let links = getLinks(request);
    response.json(links);
});


server.post('/api/addLink', function (req, res) {
    let link = req.body;
    let duplicate = false;
    console.log(link);

    var dbUser = db.get('users').find({ id: req.user.id });

    if (!link.name || !link.url) {
        res.send('empty');
        return;
    }

    let url = link.url;
    let icon = 'https://findicons.com/files/icons/1036/function/48/warning.png';
    if (url) {
        icon = `https://s2.googleusercontent.com/s2/favicons?domain=${url}`;
    }
    link['icon'] = icon;

    if (!/^https?:\/\//i.test(link.url)) {
        link.url = 'http://' + link.url;
    }
    link.name = link.name.charAt(0).toUpperCase() + link.name.slice(1);
    link.tags = link.tags.split(',');
    dbUser.value().links.filter(l => {
        if ((l.name.toLowerCase() === link.name.toLowerCase() || l.url.toLowerCase() === link.url.toLowerCase()) && !link.isEdit) {
            res.send('duplicate');
            duplicate = true;
        }
    });

    if (duplicate) {
        return;
    }

    if (link.isEdit) {
        console.log(`editing ${link.name}`);
        let index = link.isEdit;
        delete link.isEdit;
        dbUser.update('links', dbUser.value().links[index] = link).write();
        res.send(true);
        return;
    }

    if (!duplicate && !link.isEdit) {
        dbUser.update('links', dbUser.value().links.push(link)).write();
        res.send(true);
    }
});

server.post('/api/deleteLink', function (req, res) {
    var dbUser = db.get('users').find({ id: req.user.id });
    let index = parseInt(req.body.index);
    dbUser.update('links', dbUser.value().links.splice(index, 1)).write();
    res.send(true);
});

server.get('/links/:tag', function (req, res) {
    console.log("tag is " + req.params.tag);
    let links = getLinks(req, req.params.tag);
    res.json(links);
});

server.get('/logout', function (req, res) {
    console.log('Logging out');
    req.logout();
    res.redirect('/');
});

server.listen(port, function () {
    console.log(`Bookmarker app listening on port ${port}!`);
});

server.use(function (req, res, next) {
    res.status(404).sendFile(__dirname + dir + '404.html');
});

const getLinks = (request, tag) => {
    // if(!request.user) {
    //     return undefined;
    // }
    var dbUser = db.get('users').find({ id: request.user.id }).value();
    if (tag) {
        let filteredLinks = dbUser.links.filter(data => {
            let hasTag = data.tags.filter(t => {
                return t.trim().toLowerCase() === tag.trim().toLowerCase();
            });
            return (hasTag !== undefined && hasTag.length > 0);
        });
        return filteredLinks;
    } else {
        return dbUser.links;
    }
};
