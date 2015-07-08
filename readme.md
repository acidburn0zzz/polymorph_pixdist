# Image Management

This project is a microservice backed by aws lambda and imagemagic/graficsmagik.
It will optimize images provided by S3 `create` events. It then upload the image
to `aws:dest` defined in `config/default.json`.

Lambda's require that you maintain a raw/origin bucket and a processed/dest bucket.
You must maintain a level of separation or there will be circular events.

`aws:orig` => `lambda` => `aws:dest`

### Supported Actions By Image Type

Format | Convert To JPEG | Resize | Compress
-------|-----------------|--------|---------
PNG    |       x         |   x    |    x
GIF    |       x         |   x    |    x
JPEG   |       x         |   x    |    x
TIFF   |       x         |   x    |    NA
BMP    |       x         |   x    |    NA
SVG    |       NA        |   NA   |    NA


Caveats:
* TIFF/BMP: These are non compressed formats meant for high quality storage.
If you want to compress them they must be converted to another image format like JPEG.
* GIF: We only support non animated gifs at the moment.
* SVG: This format has much better image compression than any of the others however.
There is some optimization that can happen here (TODO)

### Work Flow

`AWS EC2 Create Event`: This is triggered whenever an image has completed its
upload into the defined `aws:orig` bucket.

`From Origin`: The event data is used to determine the origin bucket and path.
It downloads the asset and identifies the mime type by header.

`Convert`: If the provided mimetype matches the `convert-mime` setting.
Graphicsmagik will attempt to convert it to JPEG while uploading the original image to the destination S3 bucket and applying a `WebsiteRedirectLocation` to the new asset.

`Resize`: If the provided mimetype matches the `resize-mime` setting. 
Graphicsmagik will attempt to scale the image to within the
`max:width` or `max:heigh` setting.

`Compress`: If the provided mimetype matches the `compress-mime` settings.
Graphicsmagik will attempt to compress the original or converted 
image depending on the Convert step.

`Compress SVG`: If the provided mimetype matches the `compress-svg` settings.
SVGO will attempt to optimize the file.

`To Destination`: The file is now uploaded to the destination bucket
and the file is saved to `aws:dest` bucket.


### Installation

```
brew install imagemagick
brew install graphicsmagick
npm install
npm install -g node-lambda
```

### Test Locally

make sure you have your aws key and secret as environment variables.

```
npm start
```

### Deploy

AWS Lamda's are deployed as zip files. Zip the folder and then deploy it
using the AWS command line tools.

```
zip -r lambda.zip . -x *.git* -x *.vagrant*
aws lambda update-function-code \
    --function-name=img-optimize-prod \
    --zip-file=fileb://lambda.zip \
    --region=us-west-2
```

### TODOs

* Use the svg/svgo project to optimize SVG vector graphics files.
