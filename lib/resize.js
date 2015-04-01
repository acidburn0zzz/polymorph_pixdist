/**
 *
 * Resize file to either max with or max height.
 * whichever is larger without stretching.
 *
 */
var nconf = require('nconf');

module.exports = function (event) {
  event = event || {};
  var acceptMime = nconf.get('resize-mime');
  var srcKeyTmp = event.Records[0].s3.object.key;
  var srcKey    = decodeURI(srcKeyTmp).replace(/\+/g, ' ');
  var imageType = srcKey.match(/\.([^.]*)$/)[0];

  return function resize (fileName, contentType, gm, next) {
    if (acceptMime.indexOf(contentType)<0) {
      return next(null, fileName, contentType, gm);
    }

    gm.size(function(err, size) {
      if (err) {
        return console.error(err);
      }

      var maxWidth = nconf.get('max:width');
      var maxHeight = nconf.get('max:height');

      if (size.width < maxWidth && size.height < maxHeight) {
        return next(null, fileName, contentType, gm);
      }

      // Infer the scaling factor to avoid stretching the image unnaturally.
      var scalingFactor = Math.min(
        nconf.get('max:width') / size.width,
        nconf.get('max:width') / size.height
      );

      var width  = scalingFactor * size.width;
      var height = scalingFactor * size.height;


      // Transform the image buffer in memory.
      console.log('resize');
      next(null, fileName, contentType, gm.resize(width, height));
    });
  };
};
