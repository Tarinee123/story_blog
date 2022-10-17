
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exhbs = require("express-handlebars");
const passport = require("passport");
const session = require("express-session")
const methodOverride = require("method-override")
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db.js");


const app = express();

//Load Config
dotenv.config({ path: './config/config.env' })

//passport config
require('./config/passport')(passport);

connectDB();


//Login
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}


//Body parsers
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


//method override
app.use(
    methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            let method = req.body._method
            delete req.body._method
            return method
        }
    })
)


//handlebars helpers
const { formatDate, truncate, stripTags, editIcon, select } = require('./helpers/hbs')

//Handlebars
app.engine('.hbs', exhbs({
    helpers: {
        formatDate,
        truncate,
        stripTags,
        editIcon,
        select
    },
    defaultLayout: 'main', extname: '.hbs'
}));
app.set('view engine', '.hbs');


//session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, }),
}))

//passport middlewares
app.use(passport.initialize());
app.use(passport.session());


//set global 
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

//Static Folders
app.use(express.static(path.join(__dirname, 'public')));


//Routes
app.use('/', require('./routes/index.js'))
app.use('/auth', require('./routes/auth.js'))
app.use('/stories', require('./routes/stories.js'))


const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
    console.log(`Server started in ${process.env.NODE_ENV} mode on port ${PORT}`);
})