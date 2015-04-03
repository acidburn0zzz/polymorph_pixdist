var nconf = require('nconf');
var Imagemin = require('imagemin');

/*
 *
 * TOOD: image min is a massive libraryfor almost no benifit
 * its only used to minify svg's. We should find a way to
 * remove its dependency.
 *
 */
module.exports = function (event) {
  event = event || {};
  var acceptMime = nconf.get('compress-svg');

  return function compress(fileName, fileType, data, next) {
    if (acceptMime.indexOf(fileType)<0) {
      return next(null, fileName, fileType, data);
    }

    var imagemin = new Imagemin()
    .src(data)
    .use(Imagemin.svgo({progressive: true}))
    .run(function (err, files) {

      if (err) {
        console.error('\n\nYou probably need to recompile for your architecture.');
        console.error(' remove your node_modules folder and start over.\n\n');
        console.error(err);
        return;
      }

      console.log('compress:svg');
      next(null, fileName, fileType, files[0].contents);
    });
  };
};
