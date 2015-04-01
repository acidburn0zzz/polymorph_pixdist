# Adsnative Pixel Distiller

PixDist image optimization lambda is a microservice backed by aws lambda and graficsmagik. It will optimize images provided by S3 create events. It then upload the image to aws destination bucket defined in the config.

Read more in the [git wiki](https://github.com/picatcha/adsnative_imagemagic/wiki)

### Supported Actions By Image Type

Format | Convert To JPEG | Resize | Compress
-------|-----------------|--------|---------
PNG    |       x         |   x    |    x
GIF    |       x         |   x    |    x
JPEG   |       x         |   x    |    x
TIFF(*)|       x         |   x    |    NA
BMP(*) |       x         |   x    |    NA
SVG    |       NA        |   NA   |    NA(*)


Caveats:
* TIFF/BMP: These are non compressed formats meant for high quality storage.
If you want to compress them they must be converted to another image format like JPEG.
* GIF: We only support non animated gifs at the moment.
* SVG: This format has much better image compression than any of the others however.
There is some optimization that can happen here (TODO)

Note: You can use multiple buckets from the same region pointed at the same lambda if you want to. But there can only be one destination bucket.
