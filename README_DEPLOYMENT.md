# Panduan Deployment ke EasyPanel

## 🚀 Ringkasan

Saya telah menyiapkan semua file yang dibutuhkan untuk mengupload aplikasi Tryoutkan ke VPS dengan EasyPanel. Aplikasi ini adalah React + Vite yang menggunakan Supabase sebagai backend.

## 📁 File yang Telah Dibuat

### 1. Konfigurasi Docker
- [`Dockerfile`](Dockerfile) - Multi-stage build untuk production
- [`docker-compose.yml`](docker-compose.yml) - Konfigurasi Docker Compose
- [`.dockerignore`](.dockerignore) - File yang diabaikan saat build Docker
- [`nginx.conf`](nginx.conf) - Konfigurasi Nginx dengan optimasi

### 2. Environment Variables
- [`.env.example`](.env.example) - Template environment variables
- [`.env.production`](.env.production) - Environment variables untuk production

### 3. Panduan Deployment
- [`docs/EASYPANEL_DEPLOYMENT_GUIDE.md`](docs/EASYPANEL_DEPLOYMENT_GUIDE.md) - Panduan lengkap deployment
- [`scripts/deploy.sh`](scripts/deploy.sh) - Script otomasi deployment

## 🛠️ Cara Menggunakan

### Langkah 1: Persiapan VPS
1. Install Docker dan EasyPanel di VPS Anda
2. Setup domain (opsional)

### Langkah 2: Konfigurasi
1. Update file [`.env.production`](.env.production) dengan nilai production Anda
2. Update konfigurasi di [`scripts/deploy.sh`](scripts/deploy.sh) (VPS IP, username, domain)

### Langkah 3: Deployment
**Opsi 1: Manual (Ikuti panduan lengkap)**
- Buka [`docs/EASYPANEL_DEPLOYMENT_GUIDE.md`](docs/EASYPANEL_DEPLOYMENT_GUIDE.md)
- Ikuti langkah-langkahnya

**Opsi 2: Otomatis (Gunakan script)**
```bash
# Buat script executable
chmod +x scripts/deploy.sh

# Jalankan deployment
./scripts/deploy.sh
```

## ✅ Testing Lokal

Saya sudah melakukan testing lokal:
- ✅ Build berhasil dengan `npm run build`
- ✅ Preview server berjalan di localhost:4173
- ✅ Aplikasi merespons dengan HTTP 200

## 📋 Checklist Sebelum Deploy

- [ ] Update VPS credentials di [`scripts/deploy.sh`](scripts/deploy.sh)
- [ ] Update environment variables di [`.env.production`](.env.production)
- [ ] Pastikan Docker dan EasyPanel terinstall di VPS
- [ ] Pastikan domain sudah diarahkan ke VPS (jika menggunakan domain)
- [ ] Backup data Supabase jika diperlukan

## 🔧 Fitur yang Telah Dikonfigurasi

### Optimasi Build
- Multi-stage Docker build untuk mengurangi image size
- Code splitting dengan Vite
- Gzip compression di Nginx
- Static file caching
- Security headers

### Production Ready
- Environment variables terpisah
- Error handling
- Health check
- Logging
- SSL ready

## 🚨 Penting

1. **Jangan commit `.env` files ke Git**
2. **Gunakan API keys yang berbeda untuk production**
3. **Selalu setup SSL di production**
4. **Monitor aplikasi setelah deploy**

## 📞 Support

Jika mengalami masalah:
1. Check logs di EasyPanel dashboard
2. Verify environment variables
3. Test build process locally
4. Contact hosting provider jika ada masalah dengan VPS

---

**Selamat mengdeploy! 🎉**