var sns = new AWS.SNS({apiVersion: '2010-03-31'});

var stats = {
  compress_start: undefined,
  compress_end: undefined,
  fetch_start: undefined,
  fetch_end: undefined,
  push_start: undefined,
  push_end: undefined,
  total_start: undefined,
  total_end: undefined
}

function computeStats () {
  var cs = stats.compress_start.getTime();
  var ce = stats.compress_end.getTime();
  stats.compress_total = ce-cs;

  var fs = stats.fetch_start.getTime();
  var fe = stats.fetch_end.getTime();
  stats.fetch_total = fe-fs;

  var ps = stats.push_start.getTime();
  var pe = stats.push_end.getTime();
  stats.push_total = pe-ps;

  var ts = stats.total_start.getTime();
  var te = stats.total_end.getTime();
  stats.total_time =  te-ts;

  return stats;
}

function snsPublish (type, msg) {

  var message = {
     event_message: msg,
     event_stats: computeStats(),
     event: event
  }

  var params = {
    Message: JSON.stringify(message) ,
    MessageAttributes: {
      someKey: {
        DataType: type,
      },
    },
    Subject: type,
    TopicArn: 'arn:aws:sqs:us-west-2:273752619615:deleteme-image-created'
  };

  sns.publish(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

        console.log(
          'Successfully resized ' + srcBucket + '/' + srcKey +
          ' and uploaded to ' + dstBucket + '/' + dstKey
        );


        console.error(
          'Unable to compress ' + srcBucket + '/' + srcKey +
          ' and upload to ' + dstBucket + '/' + dstKey +
          ' due to an error: ' + err
        );

