var async = require('async');
var AWS = require('aws-sdk');
var util = require('util');
var nconf = require('nconf');
var path = require('path');
var gm = require('gm').subClass({ imageMagick: true });


nconf
.argv()
.env()
.file({file: path.join(__dirname, 'config', 'default.json')});

var compress = require('./lib/compress');
var convert = require('./lib/convert');
var resize = require('./lib/resize');
var validate = require('./lib/validate');
var tobuffer = require('./lib/tobuffer');
var compressSVG = require('./lib/compress_svg');

// get reference to S3 client
var s3D = new AWS.S3({endpoint: nconf.get('aws:download_endpoint')});
var s3U = new AWS.S3({endpoint: nconf.get('aws:upload_endpoint')});


exports.handler = function(event, context) {

  console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
  var isValid = validate(event);
  if (!isValid) {return;}

  var srcKeyTmp = event.Records[0].s3.object.key;
  var srcBucket = event.Records[0].s3.bucket.name;
  var srcKey    = decodeURI(srcKeyTmp).replace(/\+/g, ' ');
  var dstBucket = nconf.get('aws:bucket_name');
  var typeMatch = srcKey.match(/\.([^.]*)$/);
  var imageType = typeMatch[1]||'';
  imageType = imageType.toLowerCase();

  // Download the image from S3, transform, and upload to a different S3 bucket.
  async.waterfall([
    function download(next) {
      // Download the image from S3 into a buffer.
      s3D.getObject({
        Bucket: srcBucket,
        Key: srcKey
      },
      function (err, res) {
        if (err) {
          throw err;
        }

        console.log('fetched');
        var contentType = res.ContentType;
        var acceptMime = nconf.get('valid-mime');
        if (acceptMime.indexOf(contentType)<0) {
          return next(null, srcKey, contentType, res.Body);
        }

        next(null, srcKey, contentType, gm(res.Body));
      });
    },

    convert(event),
    resize(event),
    compress(event),
    tobuffer(event),
    compressSVG(event),

    function upload(fileName, fileType, data, next) {
      // Stream the transformed image to a different S3 bucket.
      s3U.putObject({

        Bucket: dstBucket,
        Key: fileName,
        Body: data,
        ContentType: fileType

      }, next);
    }],

    // end waterfall
    function (err) {

      if (err) {
        //notify('ERROR', event);
        throw err;
      } else {
        //notify('SUCCESS', event)
        console.log('upload');
      }

      context.done();
    }
  );
};
