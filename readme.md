# Image Management

NOTE: Lambda has a maximum file size of 30 megs. We need to be judicious with size constraints.

Do one thing and do it well. This project listens to S3 `create` events. It then does the following:

* compresses images
* strips EXIF data

It then uploads it to the `aws:bucket_name` in `config/default.json`.

### Installation

```
brew install imagemagick
brew install graphicsmagic
npm install
npm install -g node-lambda
```

### Test Locally

make sure you have your aws key and secret as environment variables.

```
npm start
```

### Deploy

The image manipulation libraries must be compiled within a 64bit ubuntu environment.

```
vagrant up
```

on the vagrant run the following

```
nave use stable
rm -rf node_modules
npm install
```

then on your local machine

```
zip -r lambda.zip .
aws lambda upload-function --function-name=png-optimize --function-zip=lambda.zip --runtime=nodejs --role="arn:aws:iam::273752619615:role/lambda_exec_role" --handler=index.handler --mode=event
```

### Processing Per Image Type

```
Convert To JPEG:
PNG, BMP, TIFF

Converts any file type passed in to JPEG for better compression.
```

```
Resize:
PNG, JPEG, GIF, BMP, TIFF

If the file size is larger than that specified in the config we resize these formats.
```

```
Compress:
SVG, JPEG, PNG, GIF

TIFF and BMP are not compressible formats. So they are ignored.
```

### TODOs

* Create thumbnail version
* Drop frame rate on gif images
