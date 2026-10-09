# Deploy backend Vân Mộc bằng Jib trên EC2

Jib tạo Linux container image bằng Java 21, không cần Dockerfile hoặc Docker daemon trên máy build. EC2 vẫn cần Docker Engine và Docker Compose để chạy image. Hướng dẫn này dùng file TAR nên không cần registry hoặc tài khoản Docker Hub.

## 1. Build trên Windows

Mở PowerShell tại `van-moc-backend`, dùng JDK 21:

```powershell
.\mvnw.cmd clean verify jib:buildTar
```

Kết quả là `target/jib-image.tar`, chứa image `van-moc-backend:0.0.1-SNAPSHOT`. Lệnh chạy các test mặc định; integration tests PostgreSQL được chạy riêng bằng profile `integration` và cần Docker.

Image mặc định là `linux/amd64`, phù hợp EC2 Intel/AMD (ví dụ t3). Nếu EC2 là Graviton/ARM (ví dụ t4g), build bằng:

```powershell
.\mvnw.cmd clean verify jib:buildTar "-Djib.platform.architecture=arm64"
```

`application-prod.yaml` nằm ngoài resources và không được thêm vào image. Image yêu cầu mount file này ở `/config/application-prod.yaml` khi chạy. File YAML chứa cấu hình trực tiếp, không cần `.env` cho backend production.

## 2. Chuẩn bị EC2 Ubuntu

Cài Docker nếu chưa có:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo install -d -o ubuntu -g ubuntu /opt/vanmoc
```

PostgreSQL phải đang chạy trên EC2 ở `127.0.0.1:5432`, có database/user/password khớp `spring.datasource` trong YAML. Có thể dùng PostgreSQL container đã tạo theo hướng dẫn trước. `compose.prod.yaml` chỉ quản lý backend, không tạo database. Compose database hiện tại vẫn có cấu hình riêng, không đọc Spring YAML.

Nginx trên EC2 tiếp tục proxy tới `http://127.0.0.1:30000` và xử lý HTTPS cho `api.vanmocvn.com`. Security Group chỉ cần public cổng 80/443, SSH giới hạn IP; không mở 30000/5432.

## 3. Upload lên EC2

Điền đầy đủ cấu hình thật trong `application-prod.yaml`, đặc biệt database và Google OAuth. Từ PowerShell tại thư mục backend, thay key path và IP:

```powershell
scp -i "C:\duong-dan\vanmoc.pem" .\target\jib-image.tar .\compose.prod.yaml .\application-prod.yaml .\.env.prod ubuntu@IP_EC2:/opt/vanmoc/
```

For RDS, replace the localhost `spring.datasource.url` in `application-prod.yaml` with the private RDS endpoint and allow PostgreSQL traffic only from the EC2 security group. Copy `prod.env.example` to the Git-ignored `.env.prod` and put AWS access/secret keys there; Compose passes them to the container. Do not put AWS keys in `application-prod.yaml`.

File YAML được Git ignore nên cần lưu bản riêng và upload riêng mỗi khi sửa cấu hình.

## 4. Chạy backend container

Trên EC2:

```bash
cd /opt/vanmoc
sudo chown 1000:1000 application-prod.yaml
sudo chmod 600 application-prod.yaml
sudo chown 1000:1000 .env.prod
sudo chmod 600 .env.prod
sudo docker load -i jib-image.tar
```

Image chạy bằng UID/GID `1000:1000`; quyền file trên cho phép user trong container đọc cấu hình. Compose mount file read-only và báo lỗi nếu thiếu file.

Nếu trước đó đã chạy backend bằng systemd, dừng service cũ để giải phóng cổng 30000:

```bash
sudo systemctl disable --now vanmoc
```

Khởi động:

```bash
sudo docker compose -p vanmoc-app -f compose.prod.yaml up -d
sudo docker compose -p vanmoc-app -f compose.prod.yaml logs --tail=100 backend
curl -i http://127.0.0.1:30000/api/categories
curl -i https://api.vanmocvn.com/api/categories
```

Mong đợi HTTP 200 và JSON; database mới có thể trả danh sách rỗng. Lần đầu ứng dụng chạy Flyway và khởi tạo tỉnh/phường, nên đợi startup hoàn tất trước khi kiểm tra.

Compose sử dụng host networking trên Linux EC2: `127.0.0.1` trong container truy cập cùng mạng host, giữ nguyên datasource và listener loopback trong YAML. File này dành cho EC2 Linux, không dùng làm Compose phát triển trên Docker Desktop Windows.

## 5. Cập nhật

Build TAR mới trên Windows rồi upload `jib-image.tar` lên EC2. Trước bản cập nhật có migration, sao lưu database. Trên EC2:

```bash
cd /opt/vanmoc
sudo docker load -i jib-image.tar
sudo docker compose -p vanmoc-app -f compose.prod.yaml up -d --force-recreate backend
sudo docker compose -p vanmoc-app -f compose.prod.yaml logs --tail=100 backend
```

Nếu chỉ sửa/upload lại YAML, kiểm tra lại owner/quyền file rồi dùng cùng lệnh `up -d --force-recreate backend` để container nhận file mới.

## Build trực tiếp lên registry (khi cần)

Sau khi cấu hình xác thực registry trên máy build, có thể dùng:

```powershell
.\mvnw.cmd verify jib:build "-Dimage=REGISTRY/van-moc-backend:VERSION"
```

Đổi `image` trong `compose.prod.yaml` khớp tên/tag trên registry, cấu hình xác thực trên EC2, rồi `docker compose -p vanmoc-app -f compose.prod.yaml pull` trước khi `up -d`. Không đặt credential registry trong `pom.xml`.
