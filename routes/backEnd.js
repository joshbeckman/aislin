
/*
 * Browser routing, for admins
 */
var fs = require('fs')
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , moment = require('moment');

module.exports = function (app, ensureAuth) {
  app.get('/admin', function(req, res) {
    res.render('index', { title: config.name,
                          req: req,
                          config: config });
  });
};