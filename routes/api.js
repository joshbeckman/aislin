
/*
 * API routing
 */

var fs = require('fs')
    , request = require('request')
    , gm = require('gm')
    , imageMagick = gm.subClass({ imageMagick: true })
    // , exifImage = require('exif').ExifImage
    , Canvas = require('canvas')
    , canvas = new Canvas
    , ctx = canvas.getContext('2d')
    , palette = require('palette')
    , config = JSON.parse(fs.readFileSync('./config.json'))
    , moment = require('moment')
    , newTime
    , response
    , img;

module.exports = function (app, ensureAuth) {

  app.get('/id', function(req, res) {
    if (!req.query.i) {
      res.jsonp(config.status['400']);
    }
    newTime = new Date();
    response = {};
    imageMagick(req.query.i)
    .toBuffer(function (errBuff, buffer) {
      if (errBuff) {
        console.log('Error in buffer: ', errBuff);
        res.jsonp(config.status['400']);
      }
      imageMagick(buffer)
      .identify(function (errIdent, data) {
        if (errIdent) {
          console.log('Error in identify: ', errIdent);
          res.jsonp(config.status['400']);
        }
        response.identity = data;
        delete response.identity["Base filename"];
        delete response.identity.path;
        delete response.identity.Artifacts.filename;
        delete response.identity["Elapsed time"];
        delete response.identity["User time"];
        if (req.query.colorCount == 'false' || req.query.colorCount == '0') {
          finish();
        } else {
          // Start in on the colors
          img = new Canvas.Image;
          img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            var colors = palette(canvas, (parseInt((req.query.colorCount || config.colorCount), 10))), 
              length = colors.length, 
              i = 0;
            response.colors = [];
            colors.forEach(function(color){
              response.colors.push({
                r: color[0],
                g: color[1],
                b: color[2],
                hex: '#' + (color[0] << 16 | color[1] << 8 | color[2]).toString(16)
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
            "elapsed time": (new Date() - newTime)
          };
          res.jsonp(response);
        }
      });
    });
  });

  app.get('/cc', function(req, res) {
    if (!req.query.i) {
      res.jsonp(config.status['400']);
    }
    newTime = new Date();
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
        // Start in on the colors
        img = new Canvas.Image;
        img.onload = function(){
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          var colors = palette(canvas, (parseInt((req.query.colorCount || config.colorCount), 10))), 
            length = colors.length, 
            i = 0;
          response.colors = [];
          colors.forEach(function(color){
            response.colors.push({
              r: color[0],
              g: color[1],
              b: color[2],
              hex: '#' + (color[0] << 16 | color[1] << 8 | color[2]).toString(16)
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
          "elapsed time": (new Date() - newTime)
        };
        res.jsonp(response);
      }
    });
  });

};