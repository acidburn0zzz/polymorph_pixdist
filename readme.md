
This project listens to S3 `create` events. It then fetches compresses images with a mime type listed in `mimetype` it then uploads it to the `aws:bucket_name` in `config/default.json`.

# Installation

```
npm install
npm install -g node-lambda
```

# Test Locally

make sure you have your aws key and secret as environment variables.

```
npm start
```

# Deploy

```
node-lambda deploy
```

or

```
zip -r lambda.zip .
aws lambda upload-function --function-name=png-optimize --function-zip=lambda.zip --runtime=nodejs --role="arn:aws:iam::273752619615:role/lambda_invoke_role" --handler=handler --mode=event
```
