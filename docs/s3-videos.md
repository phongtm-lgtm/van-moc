# Video trên S3 / CloudFront

Bucket: `van-moc` · Region: `ap-southeast-1` · CDN: `https://d2twdjnfr0se0w.cloudfront.net`

| Tên | Key S3 | Link CloudFront | Content-Type |
| --- | --- | --- | --- |
| Tinh hoa nghề sừng Thụy Ứng | `videos/tinh-hoa-nghe-sung-thuy-ung.mp4` | https://d2twdjnfr0se0w.cloudfront.net/videos/tinh-hoa-nghe-sung-thuy-ung.mp4 | `video/mp4` |
| Trailer | `videos/trailer.mov` | https://d2twdjnfr0se0w.cloudfront.net/videos/trailer.mov | `video/quicktime` |

## Dùng cho sản phẩm

- Copy link CloudFront vào media sản phẩm.
- Admin hiện chỉ nhận **MP4 / WebM**. `Trailer.mov` nên convert sang MP4 trước khi upload qua admin; vẫn có thể phát bằng thẻ `<video>` / Safari với link `.mov` ở trên.

## Upload lại (AWS CLI)

```powershell
# Load AWS_* từ van-moc-backend/.env rồi:
aws s3 cp "path\to\file.mp4" s3://van-moc/videos/ten-file.mp4 --content-type "video/mp4" --cache-control "public,max-age=31536000,immutable"
```
