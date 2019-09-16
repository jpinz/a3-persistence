Assignment 3 - Persistence: Two-tier Web Application with Flat File Database, Express server, and CSS template
===

# Bookmarker

I modified my original [Bookmarker](http://a2-jpinz.glitch.me)  to use passport and lowdb. Now, each user when logging in gets their own unique storage for their links. With complete editing and removal permissions. I do include a set of default links as well to get you started.

http://a3-jpinz.glitch.me

## Middleware

1. `passport` is what I used for authentication. 
2. `express-session` is what I used to manage encryption with my secret and parsing of passwords.
3. `body-parser` is what I used to help parse the json I sent over with the submission of each bookmark.
4. `favicon` is what I used to set the favicon for the website.
5. `express-static` is what I used to serve the static files in my `/pulic` directory.

## Challenges

- Took me a while to figure out how to update the header to have login/signup or logout as an option, got it to work based on if getting the links failed or not.
- When signing up, it doesn't log you in as well. I couldn't figure out why after hours of investigating. But it works when you click login after and enter the same credentials.
- It took a while to figure out why my serialize and deserialize user wasn't working. It had to do with the order I was calling `server.use` on the different middlewares.
- I couldn't get `res.redirect` to work after calling login, so I just send a response back and have the `login.html` handle it.

## Technical Achievements
- **Used bcrypt**: Used `bcrypt` to salt and hash the passwords
- **Used dotenv**: Used `dotenv` to store a secret for `bcrypt` in a `.env` file.
- **Used uuid**: Used `uuid` to generate a unique id for each user.
- **Stored bookmarks per user**: Updated the website so that now each user has their own storage for their links.
- **Added a secret page**: Added a page at `/secret` for testing purposes to make sure it only worked with authenticated users.

### Design/Evaluation Achievements
- **Added favicon**: generated and used a favicon. Using middleware `serve-favicon`
- 
