# Perbaikan Sistem Tryout

Dokumentasi ini menjelaskan perbaikan yang telah dilakukan pada sistem tryout untuk memperbaiki masalah durasi dan sinkronisasi rincian soal per bagian, serta menambahkan sistem kategori yang lebih dinamis.

## Perbaikan yang Dilakukan

### 1. Sinkronisasi Durasi Tryout

**Masalah Sebelumnya:**
- Timer di tryout session menggunakan durasi dari package tanpa memperhitungkan durasi per bagian
- Tidak ada sinkronisasi antara durasi total dengan durasi per bagian

**Solusi:**
- Memperbarui `TryoutDetailModal.tsx` untuk menghitung total durasi dari sections
- Memperbarui `TryoutSession.tsx` untuk menggunakan durasi dari sections
- Menggunakan durasi yang konsisten di seluruh sistem

### 2. Sinkronisasi Rincian Soal per Bagian

**Masalah Sebelumnya:**
- Rincian soal per bagian menggunakan data statis/hardcode
- Tidak ada sinkronisasi dengan data sebenarnya dari tabel `tryout_sections`

**Solusi:**
- Memperbarui `TryoutDetailModal.tsx` untuk mengambil data sections dari database
- Menambahkan loading state saat mengambil data sections
- Menampilkan informasi durasi dan jumlah soal per bagian dari database

### 3. Sistem Kategori yang Lebih Dinamis

**Masalah Sebelumnya:**
- Kategori terbatas hanya CPNS dan BUMN
- Tidak ada sistem untuk mengelompokkan bagian-bagian soal berdasarkan kategori

**Solusi:**
- Menambahkan kategori baru: STAN, PLN, dan OTHER
- Memperbarui UI di admin dan user untuk menampilkan kategori baru
- Membuat migration untuk mendukung kategori baru di database

### 4. Form Pembuatan Paket Tryout dengan Bagian Soal

**Masalah Sebelumnya:**
- Admin tidak bisa mengatur bagian soal saat membuat paket tryout
- Tidak ada cara untuk mengatur durasi dan jumlah soal per bagian

**Solusi:**
- Membuat `TryoutFormWithSections.tsx` untuk mengatur bagian soal saat membuat paket
- Admin bisa menambah, mengedit, dan menghapus bagian soal
- Total durasi dan jumlah soal dihitung otomatis dari bagian-bagian

## Fitur Baru

### Form Pembuatan Paket Tryout dengan Bagian Soal

Komponen baru `TryoutFormWithSections.tsx` memungkinkan admin untuk:
- Menambah, mengedit, dan menghapus bagian soal
- Mengatur nama, jumlah soal, durasi, dan deskripsi per bagian
- Melihat total durasi dan jumlah soal yang dihitung otomatis
- Mengupload thumbnail dan mengatur harga

### Kategori Baru

Menambahkan kategori baru ke sistem:
- **CPNS**: TWK, TIU, TKP
- **BUMN_TKD**: Verbal, Numerik, Logis
- **BUMN_AKHLAK**: Situasional, Kepribadian
- **BUMN_TBI**: Structure & Written Expression, Reading Comprehension
- **STAN**: Wawasan Kebangsaan, Intelegensi Umum, Karakteristik Pribadi
- **PLN**: Akademik, Teknis
- **OTHER**: Bagian 1 (customizable)

## Cara Penggunaan

### Untuk Admin

1. **Membuat Paket Tryout Baru:**
   - Klik "Tambah Tryout" di halaman admin
   - Isi informasi dasar paket (judul, deskripsi, kategori)
   - Atur bagian-bagian soal (nama, jumlah soal, durasi, deskripsi)
   - Total durasi dan jumlah soal dihitung otomatis
   - Atur harga dan passing grade
   - Upload thumbnail (opsional)
   - Simpan paket

2. **Menambahkan Soal:**
   - Klik "Kelola Soal" untuk menambahkan soal
   - Pilih subject yang sesuai dengan nama bagian yang dibuat
   - Simpan soal

### Untuk User

1. **Melihat Detail Tryout:**
   - Klik pada paket tryout untuk melihat detail
   - Rincian bagian soal akan ditampilkan dari database
   - Durasi total dihitung dari semua bagian

2. **Mengerjakan Tryout:**
   - Timer akan menggunakan durasi total dari semua bagian
   - Navigasi soal akan dikelompokkan per bagian

## Perubahan Database

### Migration 023_add_new_tryout_categories.sql

Menambahkan kategori baru ke database:
- STAN
- PLN
- OTHER

Menambahkan indeks untuk performa query kategori.

### Migration 024_fix_tryout_sections_rls.sql

Memperbaiki RLS policies untuk tabel tryout_sections:
- Admins dapat mengelola sections
- Users dapat melihat sections dari tryout yang dibeli

## Komponen yang Dimodifikasi

1. `TryoutDetailModal.tsx`
   - Mengambil data sections dari database
   - Menghitung total durasi dari sections
   - Menampilkan informasi sections secara dinamis

2. `TryoutSession.tsx`
   - Menggunakan durasi dari sections
   - Menyimpan data sections untuk perhitungan durasi

3. `types/tryout.ts`
   - Menambahkan kategori baru
   - Memperbarui CATEGORY_INFO dengan kategori baru

4. `TryoutForm.tsx`
   - Menambahkan opsi kategori baru

5. `Tryout.tsx` dan `TryoutList.tsx`
   - Menampilkan kategori baru di filter

6. `TryoutList.tsx`
   - Menggunakan TryoutFormWithSections untuk membuat paket dengan bagian soal

## Testing

Untuk testing perbaikan ini:

1. **Test Form Pembuatan Paket:**
   - Buka halaman admin dan klik "Tambah Tryout"
   - Isi informasi dasar paket
   - Tambahkan beberapa bagian soal dengan nama, jumlah soal, dan durasi
   - Verifikasi total durasi dan jumlah soal dihitung otomatis
   - Simpan paket

2. **Test Detail Tryout:**
   - Buka detail tryout yang baru dibuat
   - Verifikasi bagian soal muncul dengan benar
   - Verifikasi total durasi dihitung dari semua bagian

3. **Test Timer:**
   - Mulai tryout dan verifikasi timer menggunakan durasi total
   - Pastikan timer berfungsi dengan baik

4. **Test Form Konfigurasi Soal:**
   - Buka "Kelola Soal" untuk paket yang baru dibuat
   - Tambahkan soal dengan subject yang sesuai dengan nama bagian
   - Verifikasi soal muncul di bagian yang benar

## Future Improvements

1. **Advanced Timer:**
   - Timer per bagian dengan perpindahan otomatis
   - Warning saat waktu per bagian akan habis

2. **Analytics:**
   - Statistik performa per bagian
   - Perbandingan performa antar bagian

3. **Custom Templates:**
   - Admin bisa membuat template sendiri
   - Template bisa disimpan dan digunakan kembali