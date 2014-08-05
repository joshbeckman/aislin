
/*
 * API routing
 */

var fs = require('fs')
    , request = require('request')
    , gm = require('gm')
    , ntc = require('../lib/ntc')
    , imageMagick = gm.subClass({ imageMagick: true })
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , newTime
    , response
    , Canvas = require('canvas')
    , palette = require('palette');

var rtg   = require("url").parse(process.env.REDISTOGO_URL);
var redis = require("redis").createClient(rtg.port, rtg.hostname);
redis.auth(rtg.auth.split(":")[1]);

module.exports = function (app, ensureAuth) {

  app.get('/id', function(req, res) {
    if (!req.query.i) {
      res.jsonp(config.status['400']);
    }
    newTime = new Date();
    redis.get('id_' + req.query.i, function (err, result) {
      if (err || !result){
        if(err)
          console.log(err);
        runnable();
      }
      else{
        response = JSON.parse(result);
        response.query["elapsed time"] = (new Date() - newTime);
        res.jsonp(response);
      }
    });
    function runnable(){
      response = {};
      imageMagick(req.query.i)
      .identify(function (errIdent, data) {
        if (errIdent) {
          console.log('Error in identify: ', errIdent);
          res.jsonp(config.status['400']);
        } else {
          response.identity = data;
          delete response.identity["Base filename"];
          delete response.identity.path;
          delete response.identity["Elapsed time"];
          delete response.identity["User time"];
          finish();
          function finish() {
            response.colors = response.colors || [];
            response.query = {
              "url": req.query.i,
              "elapsed time": (new Date() - newTime),
              "_links": {
                "_self": ("/id?i=" + req.query.i),
                "color count": ("/cc?i=" + req.query.i)
              }
            };
            redis.setex('id_' + req.query.i, 21600, JSON.stringify(response));
            res.jsonp(response);
            request('http://www.google-analytics.com/collect?v=1&tid=UA-37125372-12&cid=' + req.ip + '&uip=' + req.ip + '&t=pageview&dp=' + encodeURIComponent(req.path) + '&dh=www.aislin.co&dt=ID&dl=' + encodeURIComponent(req.host + req.originalUrl), function (err, resp, body){
              if (err){
                console.log(err);
              }
            });
          }
        }
      });
    }
  });

  app.get('/cc', function(req, res) {
    if (!req.query.i) {
      res.jsonp(config.status['400']);
    }
    newTime = new Date();
    redis.get('cc_' + req.query.i, function (err, result) {
      if (err || !result){
        if(err)
          console.log(err);
        runnable();
      }
      else{
        response = JSON.parse(result);
        response.query["elapsed time"] = (new Date() - newTime);
        res.jsonp(response);
      }
    });
    function runnable(){
      response = {};
      imageMagick(req.query.i)
      .toBuffer(function (errBuff, buffer) {
        if (errBuff) {
          console.log('Error in buffer: ', errBuff);
          res.jsonp(config.status['400']);
        }
        if (req.query.colorCount == 'false' || req.query.colorCount == '0') {
          finish();
        } else {
          var img
            , canvas = new Canvas
            , ctx = canvas.getContext('2d');
          // Start in on the colors
          img = new Canvas.Image;
          img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            var colors = palette(canvas, (parseInt((req.query.colorCount || config.colorCount), 10))), 
              length = colors.length, 
              i = 0, theHex = '', theName = '';
            response.colors = [];
            colors.forEach(function(color){
              theHex = '#' + (color[0] << 16 | color[1] << 8 | color[2]).toString(16);
              theName = ntc.name(theHex);
              response.colors.push({
                r: color[0],
                g: color[1],
                b: color[2],
                hex: theHex,
                name: theName[1]
              });
              i++;
              if (i == length) {
                finish();
              }
            });
          };
          img.src = buffer;
        }
        function finish() {
          response.colors = response.colors || [];
          response.query = {
            "url": req.query.i,
            "color count": req.query.colorCount || config.colorCount,
            "elapsed time": (new Date() - newTime),
            "_links": {
              "_self": ("/cc?i=" + req.query.i + '&colorCount=' + (req.query.colorCount || config.colorCount)),
              "identity": ("/id?i=" + req.query.i)
            }
          };
          redis.setex('cc_' + req.query.i, 21600, JSON.stringify(response));
          res.jsonp(response);
          request('http://www.google-analytics.com/collect?v=1&tid=UA-37125372-12&cid=' + req.ip + '&uip=' + req.ip + '&t=pageview&dp=' + encodeURIComponent(req.path) + '&dh=www.aislin.co&dt=CC&dl=' + encodeURIComponent(req.host + req.originalUrl), function (err, resp, body){
            if (err){
              console.log(err);
            }
          });
        }
      });
    }
  });

};