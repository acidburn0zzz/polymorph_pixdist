var async = require('async');
var AWS = require('aws-sdk');
var util = require('util');
var nconf = require('nconf');
var path = require('path');
var Imagemin = require('imagemin');

nconf
.argv()
.env()
.file({file: path.join(__dirname, 'config', 'default.json')});

// get reference to S3 client 
var s3 = new AWS.S3();

exports.handler = function(event, context) {

  console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));

  var srcBucket = event.Records[0].s3.bucket.name;
  var srcKey    = event.Records[0].s3.object.key;
  var dstBucket = nconf.get('aws:bucket_name');
  var dstKey    = srcKey; // keep the same name

  // Sanity check: validate that source and destination are different buckets.
  if (srcBucket == dstBucket) {
    console.error("Destination bucket must not match source bucket.", srcBucket);
    return;
  }

  // Infer the image type.
  var typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.error('unable to infer image type for key ' + srcKey);
    return;
  }

  var imageType = typeMatch[1];
  if (["jpg","png","gif","svg","svgz"].indexOf(imageType)<0) {
    console.log('skipping non-image ' + srcKey);
    return;
  }

  // Download the image from S3, transform, and upload to a different S3 bucket.
  async.waterfall([
    function download(next) {
      // Download the image from S3 into a buffer.
      s3.getObject({
          Bucket: srcBucket,
          Key: srcKey
        },
        next);
      },
    function tranform(response, next) {

      var contentType = response.ContentType;
      var mime = nconf.get('mime');
      var fnName = mime[contentType];

      if (!fnName) {
        return console.error('mime type not supported');
      }

      var imagemin = new Imagemin()
      .src(response.Body)
      .use(Imagemin[fnName]({progressive: true}))
      .run(function (err, file) {

        if (err) {
          console.error(err);
          return;
        }

        // Limit to a single file for now.
        next(null, contentType, file[0].contents);
      });

    },
    function upload(contentType, data, next) {
      // Stream the transformed image to a different S3 bucket.
      s3.putObject({
          Bucket: dstBucket,
          Key: dstKey,
          Body: data,
          ContentType: contentType
        },
        next);
      }
    ], function (err) {
      if (err) {
        console.error(
          'Unable to resize ' + srcBucket + '/' + srcKey +
          ' and upload to ' + dstBucket + '/' + dstKey +
          ' due to an error: ' + err
        );
      } else {
        console.log(
          'Successfully resized ' + srcBucket + '/' + srcKey +
          ' and uploaded to ' + dstBucket + '/' + dstKey
        );
      }

      context.done();
    }
  );
};
