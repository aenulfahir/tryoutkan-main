# Panduan Deployment ke EasyPanel

## Overview
Panduan ini akan membantu Anda mengdeploy aplikasi Tryoutkan ke VPS dengan EasyPanel menggunakan Docker.

## Prasyarat
- VPS dengan Docker dan EasyPanel terinstall
- Akses SSH ke VPS
- Domain yang sudah diarahkan ke VPS (opsional)
- Git terinstall di VPS

## Langkah 1: Persiapan di VPS

### 1.1 Install Docker dan Docker Compose (jika belum)
```bash
# Update package index
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 1.2 Install EasyPanel
```bash
# Install EasyPanel
curl -sSL https://get.easypanel.io | sh

# Follow the installation instructions
# EasyPanel akan terinstall dan dapat diakses melalui browser
```

## Langkah 2: Konfigurasi EasyPanel

### 2.1 Akses EasyPanel
- Buka browser dan akses `http://your-vps-ip:3000`
- Login dengan credentials yang dibuat saat instalasi

### 2.2 Buat Website Baru
1. Klik "Websites" di sidebar
2. Klik "Create Website"
3. Pilih "Docker" sebagai tipe website
4. Isi detail website:
   - **Domain**: `your-domain.com` (atau IP VPS)
   - **Name**: `tryoutkan-app`
   - **Description**: `Tryoutkan Application`

### 2.3 Konfigurasi Docker
1. Pilih "Custom Dockerfile" option
2. Set **Build Context**: `/var/www/tryoutkan`
3. Set **Dockerfile Path**: `Dockerfile`
4. Set **Port**: `80`

## Langkah 3: Upload Code ke VPS

### 3.1 Clone Repository
```bash
# Buat directory untuk aplikasi
sudo mkdir -p /var/www/tryoutkan
sudo chown $USER:$USER /var/www/tryoutkan

# Clone repository (ganti dengan repository Anda)
cd /var/www/tryoutkan
git clone https://github.com/your-username/tryoutkan-main.git .
```

### 3.2 Konfigurasi Environment Variables
```bash
# Copy file environment example
cp .env.example .env.production

# Edit file environment
nano .env.production
```

Update nilai-nilai berikut:
```bash
VITE_CLIENT_TARGET=https://your-domain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
# Update URL N8N dan API keys lainnya
```

## Langkah 4: Build dan Deploy

### 4.1 Build Docker Image
```bash
cd /var/www/tryoutkan
docker build -t tryoutkan-app .
```

### 4.2 Test Container Lokally
```bash
# Jalankan container untuk testing
docker run -d -p 8080:80 --name tryoutkan-test tryoutkan-app

# Test akses aplikasi
curl http://localhost:8080

# Stop test container
docker stop tryoutkan-test
docker rm tryoutkan-test
```

### 4.3 Deploy dengan EasyPanel
1. Kembali ke EasyPanel dashboard
2. Pilih website yang sudah dibuat
3. Klik "Deploy" atau "Rebuild"
4. EasyPanel akan otomatis build dan run container

## Langkah 5: Konfigurasi SSL (Opsional)

### 5.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx
```

### 5.2 Generate SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

### 5.3 Auto-renewal
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add cron job untuk auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## Langkah 6: Monitoring dan Maintenance

### 6.1 View Logs
```bash
# View container logs
docker logs tryoutkan-app

# View nginx logs
docker exec tryoutkan-app tail -f /var/log/nginx/access.log
docker exec tryoutkan-app tail -f /var/log/nginx/error.log
```

### 6.2 Update Application
```bash
cd /var/www/tryoutkan

# Pull latest changes
git pull origin main

# Rebuild container
docker-compose down
docker-compose up --build -d
```

### 6.3 Backup
```bash
# Backup environment variables
cp .env.production .env.production.backup

# Backup database (jika menggunakan database lokal)
# Sesuaikan dengan setup database Anda
```

## Troubleshooting

### Common Issues

1. **Container tidak bisa start**
   ```bash
   # Check container status
   docker ps -a
   
   # Check logs
   docker logs container-name
   ```

2. **Environment variables tidak terbaca**
   ```bash
   # Verify file exists and permissions
   ls -la .env.production
   
   # Check content
   cat .env.production
   ```

3. **Port conflict**
   ```bash
   # Check used ports
   netstat -tulpn
   
   # Kill process using port
   sudo kill -9 PID
   ```

4. **Build failed**
   ```bash
   # Clean build cache
   docker system prune -a
   
   # Rebuild
   docker-compose build --no-cache
   ```

## Performance Optimization

### 1. Nginx Optimization
File [`nginx.conf`](nginx.conf) sudah dikonfigurasi dengan:
- Gzip compression
- Static file caching
- Security headers

### 2. Docker Optimization
- Multi-stage build untuk mengurangi image size
- Alpine Linux base image
- Production dependencies only

### 3. Application Optimization
- Code splitting sudah dikonfigurasi di [`vite.config.ts`](vite.config.ts)
- Tree shaking dan minification
- Static asset optimization

## Security Considerations

1. **Environment Variables**: Jangan pernah commit `.env` files ke Git
2. **API Keys**: Gunakan production keys yang berbeda dari development
3. **HTTPS**: Selalu gunakan SSL di production
4. **Firewall**: Konfigurasi firewall untuk membatasi akses
5. **Regular Updates**: Update dependencies secara berkala

## Contact Support

Jika mengalami masalah:
1. Check logs di EasyPanel dashboard
2. Verify environment variables
3. Test build process locally
4. Contact hosting provider jika ada masalah dengan VPS

---

**Catatan**: Panduan ini asumsi Anda menggunakan VPS dengan Ubuntu/Debian. Sesuaikan command jika menggunakan OS lain.