var nconf = require('nconf');

module.exports = function (event) {
  event = event || {};
  var acceptMime = nconf.get('valid-mime');

  return function toBuffer (fileName, fileType, gm, next) {
    if (acceptMime.indexOf(fileType)<0) {
      return next(null, fileName, fileType, gm);
    }

    var typeMatch = fileName.match(/\.([^.]*)$/) || [];
    var type = typeMatch[1] || 'JPEG';

    gm.toBuffer(type, function (err, buffer) {
      next(null, fileName, fileType, buffer);
    });
  };
};

