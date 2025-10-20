# Implementasi Sistem Notifikasi Pembelian Tryout

## Overview
Dokumentasi ini menjelaskan implementasi sistem notifikasi untuk admin ketika ada user yang membeli paket tryout.

## Fitur yang Diimplementasikan

### 1. Tabel Notifikasi
- **File**: `supabase/migrations/025_notifications.sql`
- **Deskripsi**: Membuat tabel `notifications` untuk menyimpan notifikasi pembelian
- **Kolom**:
  - `id`: UUID primary key
  - `type`: Tipe notifikasi (purchase, info, etc.)
  - `title`: Judul notifikasi
  - `message`: Pesan notifikasi
  - `data`: JSON data tambahan (user info, package info, etc.)
  - `is_read`: Status read/unread
  - `created_at`, `updated_at`: Timestamp

### 2. Fungsi Database
- **File**: `supabase/migrations/025_notifications.sql`
- **Fungsi**:
  - `get_unread_notification_count()`: Menghitung notifikasi belum dibaca
  - `mark_notification_as_read()`: Menandai notifikasi sebagai dibaca
  - `mark_all_notifications_as_read()`: Menandai semua notifikasi sebagai dibaca
  - `create_purchase_notification()`: Membuat notifikasi pembelian
  - Trigger `on_purchase_create_notification`: Otomatis membuat notifikasi saat pembelian

### 3. Perbaikan Duplikasi Notifikasi
- **File**: `supabase/migrations/028_fix_duplicate_notifications_and_add_delete.sql`
- **Deskripsi**: Memperbaiki masalah duplikasi notifikasi dan menambahkan fungsi hapus
- **Fitur**:
  - Mencegah duplikasi notifikasi dengan check sebelum insert
  - Membersihkan notifikasi duplikat yang sudah ada
  - Menambahkan fungsi hapus notifikasi

### 4. Update Fungsi Pembelian
- **File**: `supabase/migrations/026_update_purchase_function_with_notifications.sql`
- **Deskripsi**: Memperbarui fungsi `purchase_tryout_package` untuk membuat notifikasi otomatis

### 6. Service Notifikasi
- **File**: `services/notifications.ts`
- **Fungsi**:
  - `getNotifications()`: Mengambil daftar notifikasi
  - `getUnreadNotificationCount()`: Menghitung notifikasi belum dibaca
  - `markNotificationAsRead()`: Menandai notifikasi sebagai dibaca
  - `markAllNotificationsAsRead()`: Menandai semua notifikasi sebagai dibaca
  - `createPurchaseNotification()`: Membuat notifikasi pembelian
  - `subscribeToNotifications()`: Subscribe ke notifikasi real-time

### 7. Update Admin Header
- **File**: `components/admin/AdminHeader.tsx`
- **Fitur**:
  - Menampilkan badge count notifikasi belum dibaca
  - Dropdown notifikasi dengan detail pembelian
  - Tombol untuk menandai semua sebagai dibaca
  - Menampilkan informasi user, paket, harga, dan waktu pembelian

### 8. Halaman Notifikasi
- **File**: `pages/admin/Notifications.tsx`
- **Fitur**:
  - Daftar semua notifikasi
  - Filter notifikasi belum dibaca
  - Detail informasi pembelian
  - Tombol untuk menandai sebagai dibaca

### 9. Routing dan Navigation
- **File**: `App.tsx`, `components/admin/AdminSidebar.tsx`
- **Fitur**:
  - Route `/admin/notifications`
  - Menu "Notifikasi" di sidebar admin

## Cara Menjalankan Migration

### 1. Migration Lokal
```bash
# Jalankan migration secara lokal
supabase migration up

# Atau jalankan migration spesifik
supabase migration apply 025_notifications.sql
supabase migration apply 026_update_purchase_function_with_notifications.sql
supabase migration apply 027_fix_notifications_table.sql
supabase migration apply 028_fix_duplicate_notifications_and_add_delete.sql
```

### 2. Migration ke Production
```bash
# Link ke project Supabase (jika belum)
supabase link --project-ref YOUR_PROJECT_REF

# Push migration ke production
supabase db push
```

### 3. Troubleshooting Migration
Jika mengalami error "relation already exists" saat menjalankan migration:
- Migration telah diperbaiki dengan menambahkan `IF NOT EXISTS` pada index
- Trigger akan di-drop terlebih dahulu sebelum dibuat ulang
- Jalankan ulang migration setelah perbaikan

### 4. Error "column data does not exist"
Jika mengalami error "column 'data' of relation 'notifications' does not exist" saat mencoba membeli paket:
- Jalankan migration 027_fix_notifications_table.sql untuk memperbaiki struktur tabel
- Migration ini akan menghapus tabel lama dan membuat ulang dengan struktur yang benar
- Setelah migration dijalankan, pembelian seharusnya berfungsi normal

### 5. Error "function min(uuid) does not exist"
Jika mengalami error "function min(uuid) does not exist" saat menjalankan migration 028:
- Migration 028 telah diperbaiki dengan menggunakan ROW_NUMBER() instead of MIN()
- Pastikan Anda menggunakan versi terbaru dari migration 028
- Jalankan ulang migration jika error masih terjadi

## Cara Menggunakan

### 1. Notifikasi Otomatis
Notifikasi akan otomatis dibuat ketika:
- User berhasil membeli paket tryout (baik berbayar atau gratis)
- Pembelian berhasil diproses oleh fungsi `purchase_tryout_package`

### 2. Melihat Notifikasi
- **Di Header**: Klik ikon lonceng di pojok kanan atas admin dashboard
- **Di Halaman**: Klik menu "Notifikasi" di sidebar admin

### 3. Mengelola Notifikasi
- **Tandai sebagai dibaca**: Klik notifikasi atau tombol checklist
- **Tandai semua sebagai dibaca**: Klik tombol "Tandai semua dibaca"
- **Hapus notifikasi**: Klik tombol trash di setiap notifikasi
- **Hapus bulk**: Gunakan dropdown "Hapus" untuk menghapus yang sudah dibaca atau semua notifikasi

## Struktur Data Notifikasi

```json
{
  "id": "uuid",
  "type": "purchase",
  "title": "Pembelian Paket Tryout Baru",
  "message": "John Doe telah membeli paket \"CPNS 2024\"",
  "data": {
    "user_id": "uuid",
    "user_name": "John Doe",
    "package_id": "uuid",
    "package_title": "CPNS 2024",
    "purchase_price": 50000,
    "purchased_at": "2024-01-01T10:00:00Z"
  },
  "is_read": false,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

## Troubleshooting

### 1. Notifikasi Tidak Muncul
- Pastikan migration sudah dijalankan
- Periksa console untuk error
- Verifikasi bahwa user memiliki role admin

### 2. Count Notifikasi Tidak Update
- Refresh halaman
- Periksa fungsi `getUnreadNotificationCount`
- Verifikasi RLS policies

### 3. Error "column data does not exist"
- Pastikan migration 027_fix_notifications_table.sql sudah dijalankan
- Verifikasi struktur tabel notifications dengan `\d notifications` di SQL editor
- Jika masih error, jalankan ulang migration

### 4. Error "function min(uuid) does not exist"
- Pastikan Anda menggunakan versi terbaru dari migration 028
- Migration telah diperbaiki dengan menggunakan ROW_NUMBER() instead of MIN()
- Jalankan ulang migration jika error masih terjadi

### 5. Duplikasi Notifikasi
- Pastikan migration 028_fix_duplicate_notifications_and_add_delete.sql sudah dijalankan
- Migration ini akan membersihkan notifikasi duplikat yang ada
- Mencegah duplikasi notifikasi di masa depan

### 6. Permission Error
- Pastikan user memiliki role admin
- Periksa RLS policies di tabel notifications
- Verifikasi grant permissions pada fungsi database

## Fitur Hapus Notifikasi

### 1. Hapus Individual
- Tombol hapus (ikon trash) di setiap notifikasi
- Konfirmasi sebelum menghapus
- Update otomatis count notifikasi

### 2. Hapus Bulk
- Dropdown "Hapus" di header halaman
- Opsi "Hapus yang sudah dibaca"
- Opsi "Hapus semua notifikasi"
- Konfirmasi sebelum menghapus bulk

### 3. Pembersihan Otomatis
- Trigger untuk mencegah duplikasi notifikasi
- Fungsi untuk membersihkan notifikasi lama (bisa ditambahkan di masa depan)

## Future Enhancements

1. **Real-time Notifications**: Menggunakan Supabase Realtime untuk update langsung
2. **Email Notifications**: Mengirim email ke admin untuk notifikasi penting
3. **Notification Types**: Menambahkan tipe notifikasi lain (misal: pendaftaran user baru)
4. **Notification Settings**: Mengatur preferensi notifikasi per admin
5. **Auto-Cleanup**: Fungsi untuk otomatis menghapus notifikasi lama (misal: 30 hari)