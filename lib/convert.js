var nconf = require('nconf');
var gm = require('gm').subClass({ imageMagick: true });

module.exports = function (event) {
  event = event || {};
  var acceptMime = nconf.get('convert-mime');
  var newMime = 'image/jpeg';
  var newType = 'jpeg';

  return function convert (fileName, contentType, gm, next) {
    if (acceptMime.indexOf(contentType)<0) {
      return next(null, fileName, contentType, gm);
    }

    var newName = fileName.replace(/[^.]+$/, newType);
    console.log('convert to ' + newType);
    next(null, newName, newMime, gm);
  };
};
