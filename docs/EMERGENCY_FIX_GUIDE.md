# Emergency Fix Guide for Environment Variables

## 🚨 Immediate Fix Applied

Saya sudah menerapkan **emergency fix** di [`lib/supabase.ts`](lib/supabase.ts) dengan menambahkan fallback values.

## 🔧 Apa yang Sudah Diubah

```typescript
// Sebelumnya: Langsung error jika environment variables missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Sekarang: Fallback ke hardcoded values
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Environment variables not found, using fallback values");
  supabaseUrl = "https://vhgwcljzzsudyzzicmcc.supabase.co";
  supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3djbGp6enN1ZHl6emljbWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzg4NjgsImV4cCI6MjA3NDk1NDg2OH0.TVhAlv1Gvb_IwcCzK0KugnNlHenZzEJgAuEkn59cCR0";
}
```

## 🚀 Langkah Selanjutnya

### 1. Rebuild Sekarang
```bash
# Di EasyPanel, klik "Rebuild" atau "Redeploy"
```

### 2. Test Aplikasi
1. Buka website Anda
2. Check browser console - seharusnya ada warning "Environment variables not found, using fallback values"
3. Test fitur login/registrasi

### 3. Fix Proper (Opsional)
Setelah aplikasi berjalan, Anda bisa setup environment variables dengan benar:

#### Opsi A: EasyPanel Environment Variables
1. Buka EasyPanel Dashboard
2. Website → Settings → Environment Variables
3. Tambahkan semua VITE_* variables
4. Rebuild

#### Opsi B: Gunakan Dockerfile Khusus
1. Rename `Dockerfile.env-fixed` menjadi `Dockerfile`
2. Rebuild

## 📋 Checklist Setelah Fix

- [ ] Rebuild aplikasi di EasyPanel
- [ ] Test login/registrasi berhasil
- [ ] Check browser console (hanya warning, tidak error)
- [ ] Test fitur lain yang menggunakan Supabase

## 🔍 Debugging

Jika masih ada masalah:

### 1. Check Browser Console
```javascript
// Buka Developer Tools → Console
// Cari pesan:
// - "Environment variables not found, using fallback values" (OK)
// - Error lainnya (perlu dicek)
```

### 2. Check Network Tab
```javascript
// Buka Developer Tools → Network
// Filter: XHR/Fetch
// Cari request ke Supabase
// Status harus 200 OK
```

### 3. Verify Supabase Connection
```javascript
// Di browser console, test:
fetch('https://vhgwcljzzsudyzzicmcc.supabase.co/rest/v1/')
  .then(r => r.json())
  .then(console.log)
```

## ⚠️ Security Note

Hardcoded values adalah **temporary solution**. Untuk production:
- Gunakan environment variables yang proper
- Rotate keys secara berkala
- Jangan commit sensitive data ke Git

## 🆘 Jika Masih Error

Jika setelah rebuild masih error:

1. **Clear Browser Cache**:
   - Ctrl+Shift+R (hard refresh)
   - Atau buka di incognito window

2. **Check Build Logs** di EasyPanel:
   - Pastikan build berhasil
   - Tidak ada error saat build

3. **Verify File Contents**:
   ```bash
   # Masuk ke container
   docker exec -it <container-name> /bin/sh
   
   # Check file yang di-build
   cat /usr/share/nginx/html/assets/index-*.js | grep -i supabase
   ```

4. **Contact Support**:
   - Screenshot error dari browser console
   - Share build logs dari EasyPanel

---

**Emergency fix sudah diterapkan! Sekarang rebuild aplikasi dan test kembali.** 🎉