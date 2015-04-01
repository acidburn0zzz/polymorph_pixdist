/**
 *
 * Optimize svg xml
 *
 */

var nconf = require('nconf');

var SVGO = require('svgo');
module.exports = function (event) {
  event = event || {};
  var acceptMime = nconf.get('compress-svg');

  return function compress(fileName, fileType, data, next) {
    if (acceptMime.indexOf(fileType)<0) {
      return next(null, fileName, fileType, data);
    }

    var opts = {};
    var svgo = new SVGO({
      multipass: opts.multipass || false,
      plugins: [
        {removeViewBox: false},
        {removeEmptyAttrs: false}
      ]
    })
    svgo.optimize(data.toString('utf8'), function (res) {
      if (!res.data || !res.data.length) {
        console.log('compress:svg:error');
        return;
      }

      res.data = new Buffer(res.data);

      console.log('compressed svg');
      return next(null, fileName, fileType, res.data);
    });
  };
};
