/**
 *
 * Convert image to jpeg and change file name
 *
 */

var nconf = require('nconf');
var gm = require('gm').subClass({ imageMagick: true });

var AWS = require('aws-sdk');
var s3 = new AWS.S3({endpoint: nconf.get('aws:upload_endpoint')});

module.exports = function (event) {
  event = event || {};
  var acceptMime = nconf.get('convert-mime');
  var newMime = 'image/jpeg';
  var newType = 'jpeg';

  return function convert (fileName, contentType, gm, next) {
    if (acceptMime.indexOf(contentType)<0) {
      return next(null, fileName, contentType, gm);
    }


    var typeMatch = fileName.match(/\.([^.]*)$/) || [];
    var type = typeMatch[1] || 'JPEG';
    var newName = fileName.replace(/[^.]+$/, newType);

    gm.toBuffer(type, function (err, buffer) {
      s3.putObject({
        Bucket: nconf.get('aws:bucket_name'),
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
        WebsiteRedirectLocation: '/'+newName
      }, function finish () {
        console.log('convert to ' + newType);
        gm.background(nconf.get('background-color')).flatten();
        next(null, newName, newMime, gm);
      });
    });
  };
};
