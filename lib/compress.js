var nconf = require('nconf');

module.exports = function (event) {
  event = event || {};
  var acceptMime = nconf.get('compress-mime');

  return function compress(fileName, contentType, gm, next) {
    if (acceptMime.indexOf(contentType)<0) {
      return next(null, fileName, contentType, gm);
    }

    var quality = nconf.get('compression:quality');
    var typeMatch = fileName.match(/\.([^.]*)$/);
    var mime = contentType.toLowerCase();
    var type = nconf.get('compression:'+mime);

    console.log('compress:'+type+':'+quality);
    next(null, fileName, contentType, gm.compress(type).quality(quality));
  };
};
