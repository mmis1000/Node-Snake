// *******************************************************
// expressjs template
//
// assumes: npm install express
// defaults to jade engine, install others as needed
//
// assumes these subfolders:
//   public/
//   public/js/
//   public/css/
//   public/componenets/
//   views/
//
var express = require('express');
var bodyParser = require('body-parser')
var errorhandler = require('errorhandler')

// some routes
var gameConnection = require("./routes/game-connection")

var app = module.exports = express();
var server = require("http").createServer(app);
var io = require('socket.io')(server);
var config = require("./config")

var viewEngine = 'ejs';

// Configuration
app.set('views', __dirname + '/views');
app.set('view engine', viewEngine);
app.use(bodyParser.json());

// load utils
config.getId = function getId(length) {
    if (arguments.length === 0) length = 8;
    var charSet = "0123456789abcdef".split("");
    var res = "";
    while (res.length < length) {
        res += charSet[Math.floor(charSet.length * Math.random())];
    }
    return res;
}
// load routes
app.get('/test', function (req, res, next) {
  res.render('test', {'test': 'test'})
})
gameConnection(app, io, config);


// static and error
app.use(express.static(__dirname + '/public'));
app.use(errorhandler({ dumpExceptions: true, showStack: true }));
app.use(errorhandler());

// *******************************************************
// fire the server
server.listen(process.env.PORT || 8080)