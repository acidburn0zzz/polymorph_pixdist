var nconf = require('nconf');

module.exports = function (event) {
  var isValid = false;
  var srcKeyTmp = event.Records[0].s3.object.key;
  var srcBucket = event.Records[0].s3.bucket.name;
  // handle spaces
  var srcKey    = decodeURI(srcKeyTmp).replace(/\+/g, ' ');
  var dstBucket = nconf.get('aws:bucket_name');
  var dstKey    = srcKey; // keep the same name
  var typeMatch = srcKey.match(/\.([^.]*)$/) || [];
  var validType = nconf.get('valid-type');
  console.log(srcKey, typeMatch);
  var imageType = typeMatch[1] || '';
  imageType = imageType.toLowerCase();

  if (srcBucket == dstBucket) {
    // Sanity check: validate that source and destination are different buckets.
    console.error("Destination bucket must not match source bucket.", srcBucket);

  } else if (!typeMatch) {
    // Infer the image type.
    console.error('unable to infer image type for key ' + srcKey);

  } else if (validType.indexOf(imageType)<0) {
    // is this a valid extension.
    console.log('skipping non-image ' + srcKey);

  } else {
    isValid = true;

  }

  return isValid;
};
