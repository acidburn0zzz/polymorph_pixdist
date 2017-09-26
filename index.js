var async = require('async');
var AWS = require('aws-sdk');
var util = require('util');
var nconf = require('nconf');
var path = require('path');
var gm = require('gm').subClass({ imageMagick: true });
var isAnimated = require('animated-gif-detector')
/**
 *
 * Accept from arguments environment variables and files.
 */
nconf
.argv()
.env()
.file({file: path.join(__dirname, 'config', 'default.json')});

/**
 *
 * Import environment specific config file.
 */
var config_file = 'config/' + nconf.get('AWS_ENVIRONMENT') + '.json';
nconf.add('stage', {type: 'file', file: config_file});


var compress = require('./lib/compress');
var convert = require('./lib/convert');
var resize = require('./lib/resize');
var validate = require('./lib/validate');
var tobuffer = require('./lib/tobuffer');
var compressSVG = require('./lib/compress_svg');
/**
 *
 * Get reference to source and destination s3 buckets.
 *
 */
var s3D = new AWS.S3({endpoint: nconf.get('aws:download_endpoint')});
var s3U = new AWS.S3({endpoint: nconf.get('aws:upload_endpoint')});


exports.handler = function(event, context) {
  // event serialization
  console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
  var isValid = validate(event);
  if (!isValid) {return;}

  var srcKeyTmp = event.Records[0].s3.object.key;
  var srcBucket = event.Records[0].s3.bucket.name;
  var srcKey    = decodeURI(srcKeyTmp).replace(/\+/g, ' ');
  var dstBucket = nconf.get('aws:bucket_name');
  var typeMatch = srcKey.match(/\.([^.]*)$/);
  var imageType = typeMatch[1] || '';
  imageType = imageType.toLowerCase();

  /**
   *
   * Download the image from S3.
   * stream transform as a buffer,
   * and upload to a different S3 bucket.
   *
   * start waterfall
   */
  async.waterfall([
    function download(next) {
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
          // if mime-type is not accepted skip graphicsmagic
          return next(null, srcKey, contentType, res.Body);
        }

        next(null, srcKey, contentType, gm(res.Body));
      });
    },

    function (fileName, contentType, gm, next) {
      if (isAnimated(gm.sourceBuffer)) {
        console.log("Animated gifs arent supported");
        next(true);
      }
      next(null, fileName, contentType, gm, next);
    },

    convert(event),
    resize(event),
    compress(event),
    tobuffer(event),
    compressSVG(event),

    function upload(fileName, fileType, data, next) {
      /**
       *
       * Stream the transformed image to the destination S3 bucket
       * while applying all applicable resize and compress settings.
       *
       */
      s3U.putObject({

        Bucket: dstBucket,
        Key: fileName,
        Body: data,
        ContentType: fileType

      }, next);
    }],

    // end waterfall
    function (err) {
      if (err == true) {
        return;
      } else {
        /**
         * FAIL
         *
         * Lambdas by default will re-try 3 times
         * after receiving a non 0 exit status
         */
        throw err;
      }

      console.log('uploaded asset');
      context.done();
    }
  );
};
