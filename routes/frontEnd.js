
/*
 * Browser routing, for clients
 */
var fs = require('fs')
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , moment = require('moment');

module.exports = function (app, ensureAuth) {
  app.get('/', function(req, res) {
    res.render('index', { title: config.name,
                          req: req,
                          quote: config.quotes[Math.floor(Math.random() * config.quotes.length)] });
  });
};