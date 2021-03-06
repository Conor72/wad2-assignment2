/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import loglevel from 'loglevel';
if (process.env.NODE_ENV === 'test') {
  loglevel.setLevel('warn')
 } else {
  loglevel.setLevel('info')
 }
import dotenv from 'dotenv';
import express from 'express';
import moviesRouter from './api/movies';
import bodyParser from 'body-parser';
import './db';
import usersRouter from './api/users';
import session from 'express-session';
import passport from './authenticate';
import {loadUsers, loadMovies} from './seedData';

dotenv.config();



const errHandler = (err, req, res, next) => {
  /* if the error in development then send stack trace to display whole error,
  if it's in production then just send error message  */
  if(process.env.NODE_ENV === 'production') {
    return res.status(500).send(`Something went wrong!`);
  }
  res.status(500).send(`Hey!! You caught the error 👍👍, ${err.stack} `);
};

if (process.env.SEED_DB) {
  loadUsers();
  loadMovies();
}



const app = express();
const port = process.env.PORT;

app.use(session({
  secret: 'ilikecake',
  resave: true,
  saveUninitialized: true
}));


//configure body-parser
app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static('public'));
app.use('/api/movies', passport.authenticate('jwt', {session: false}), moviesRouter);
app.use('/api/users', usersRouter);
app.use('/api/upcoming', moviesRouter);
app.use('/api/topRated', moviesRouter);
app.use(errHandler);


app.listen(port, () => {
  loglevel.info(`Server running at ${port}`);
});

module.exports = app;