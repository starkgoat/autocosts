/************************************************
**                                             **
**              AUTOCOSTS.INFO                 **
**      the automobile costs calculator        **
**                                             **
************************************************/

//this should be here on the beginning to set global environments
const commons     = require('../commons');
commons.init();

const fs          = require('fs');
const path        = require("path");
const express     = require('express');
const exphbs      = require('express-handlebars');
const bodyParser  = require('body-parser');
const compression = require('compression');
const sortObj     = require('sort-object'); //to sort JS objects
const colors      = require('colors/safe'); //does not alter string prototype
const debug       = require('debug')('app:main');


//personalised requires
const url         = require(path.join(__dirname, 'server', 'url')); //to deal with the full URL rules and redirect accordingly
const getCC       = require(path.join(__dirname, 'server', 'getCC'));
const hbsHelpers  = require(path.join(__dirname, 'server', 'hbsHelpers'));
const list        = require(path.join(__dirname, 'server', 'list'));
const domains     = require(path.join(__dirname, 'server', 'domains'));
const sitemap     = require(path.join(__dirname, 'server', 'sitemap'));

var directories = commons.getDirectories();
directories.index = __dirname + "/"; //directory where this script index.js is located

const release   = commons.getRelease(); //release shall be 'work' or 'prod', it's 'work' by default
const settings  = commons.getSettings();
const fileNames = commons.getFileNames();

//fixed unchangeable global data which is constant for all HTTP requests independently of the country
const countriesInfo = JSON.parse(fs.readFileSync(fileNames.server.countriesListFile, 'utf8'));
const serverData = {
    "release"            : release,   //Release: "work" or "prod"
    "settings"           : settings,  //Settings set in commons.js
    "directories"        : directories, //{ROOT_DIR, SRC_DIR, BIN_DIR, COUNTRIES_DIR, COUNTRY_LIST_FILE, TABLES_DIR}
    "fileNames"          : fileNames,   //Object with the fileNames, on the server and client
    "availableCountries" : sortObj(countriesInfo.availableCountries), //Array of alphabetically sorted available Countries
    "languagesCountries" : countriesInfo.languagesCountries, //Array of Language Codes
    "domainsCountries"   : countriesInfo.domainsCountries,   //Array of Domains for each Country
    "domains"            : commons.getUniqueArray(countriesInfo.domainsCountries), //Array of Unique Domains
    "CClistOnString"     : commons.getCClistOnStr(countriesInfo.availableCountries) //a string with all the CC
};
debug("serverData", serverData);

//Global switches with the available services
//for more information see commons.js
const SWITCHES = settings.switches;

//creates Object of objects with Words and Standards for each Country
//such that it can be loaded faster as it is already in memory when the server starts
var WORDS = {}; //Object of Objects with all the words for each country
for (var CC in serverData.availableCountries){
    WORDS[CC] = JSON.parse(fs.readFileSync(path.join(directories.index, directories.project.countries, CC + '.json'), 'utf8'));
    WORDS[CC].languageCode = serverData.languagesCountries[CC];
    WORDS[CC].domain = serverData.domainsCountries[CC];    
}

console.log("\n\nServer started at " + __dirname);

var app = express();
app.enable('case sensitive routing');
app.enable('trust proxy');

//rendering engine for dynamically loaded HTML/JS files
var hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: [ path.join(__dirname, 'views', 'partials'), 
                   path.join(__dirname, 'css', 'merged-min'), 
                   path.join(__dirname, 'client'), 
                   path.join(__dirname, 'tables')],
    helpers: hbsHelpers
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

//static content
app.use(express.static(path.join(__dirname, 'public'))); //root public folder
app.use('/tables'    , express.static( path.join(__dirname, 'tables'   )));
app.use('/css'       , express.static( path.join(__dirname, 'css'      )));
app.use('/images'    , express.static( path.join(__dirname, 'images'   )));
app.use('/client'    , express.static( path.join(__dirname, 'client'   )));
app.use('/countries' , express.static( path.join(__dirname, 'countries')));

//app.use(compression()); //Apache already compresses
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//lists all Countries information
app.get('/list', function(req, res) {
    debug("\nRoute: app.get('/list')");
    list(req, res, serverData, WORDS);
});

//lists all available domains
app.get('/domains', function(req, res) {
    debug("\nRoute: app.get('/domains')");
    domains(req, res, serverData, WORDS);
});

//sitemap.xml for Search Engines optimization
app.get('/sitemap.xml', function(req, res) {
    debug("\nRoute: app.get('/sitemap.xml')");
    sitemap(req, res, serverData, WORDS);
});

if (SWITCHES.uber){
    const getUBER = require(__dirname + '/server/getUBER');    
    app.get('/getUBER/:CC', function(req, res) {
        debug("\nRoute: app.get('/getUBER')");
        getUBER(req, res, serverData);
    });
}

if (SWITCHES.googleCaptcha){
    const captchaValidate = require(__dirname + '/server/captchaValidate');    
    app.post('/captchaValidate', function(req, res) {
        if (!url.isThisLocalhost(req)){
            debug("\nRoute: app.post('/captchaValidate')");
            captchaValidate(req, res, serverData);
        }
    });
}

if (SWITCHES.dataBase){
    const submitUserInput = require(__dirname + '/server/submitUserInput');    
    app.post('/submitUserInput', function(req, res) {
        debug("\nRoute: app.post('/submitUserInput')");
        submitUserInput(req, res, serverData);
    });
}

//this middleware shall be the last before error
//this is the entry Main Page
app.get('/:CC', function (req, res, next) {
    debug("\nRoute: app.get('/CC')");

    //returns true if it was redirected to another URL
    let wasRedirected = url.getCC(req, res, serverData);
    if(wasRedirected){
        return;
    }
    //from here CC is acceptable and the page will be rendered

    //get words for chosen CC
    let WORDS_CC = WORDS[req.params.CC];
    getCC(req, res, serverData, WORDS_CC);
});

app.get('/', function (req, res, next) {
    debug("\nRoute: app.get('/')");
    url.redirect(req, res, serverData);
});

//error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
})

var server = app.listen(settings.HTTPport, function () {
    console.log('Listening on port ' + settings.HTTPport);
    console.log('check ' + colors.green.bold('http://localhost:' + settings.HTTPport) + "\n");
});


