# KROMA Coffee & Eatery ☕

Sistem Web Pemesanan Kedai Kopi Modern & Barista POS Station lengkap dengan integrasi live **Neon PostgreSQL Database**, **Web Audio API Chime Synthesizer**, **Recharts Business Analytics**, serta desain responsif yang dioptimalkan untuk **HP (Customer Mobile Portal)** dan **Tablet (Barista POS)**.

---

## 🌟 Fitur Utama

### 1. Modul Pelanggan (Mobile-First HP Experience)
- **Header Kompak & Navigasi**: Logo kedai, pilihan *Dine-in (Meja 01-20)* atau *Takeaway*, dan *Floating Cart Indicator*.
- **Katalog Menu Interaktif**: Kategori kopi (*Espresso*, *Manual Brew*, *Cold Brew*) dan cemilan (*Pastry*, *Toast*, *Fries*) dengan *tasting notes* dan badge *Best Seller* / *Barista Pick*.
- **Modal Kustomisasi Native Mobile Bottom Sheet**: Pilihan tingkat gula (100%, 50%, 25%, 0%), es (Normal, Less, No ice, Hot), susu (*Dairy*, *Oatmilk*, *Almond*), add-ons ekstra, dan catatan barista.
- **Keranjang & Checkout**: Kalkulasi otomatis Pajak Restoran (PB1 10%), pilihan metode bayar (*Simulasi QRIS*, *Kasir*, *Kartu Debit*), dan selebrasi *confetti*.
- **Live Order Status Tracking**: Pelacakan realtime tahapan pesanan (*Pesanan Diterima* ➔ *Sedang Diracik* ➔ *Siap Diambil* ➔ *Selesai*).

### 2. Modul Admin & Barista Dashboard (Tablet-First POS Station - `/admin`)
- **Autentikasi & Keamanan Sesi**:
  - Mode **PIN Cepat POS** (Default: `8888` / `1234`) dan mode **Email & Kata Sandi** (`admin@kroma.coffee` / `kroma2026`).
  - Proteksi *Brute-force* (penguncian otomatis jika gagal 5x berturut-turut).
  - Tombol *Logout* pergantian shift kasir/barista.
- **Live Orders Kanban (4 Kolom)**:
  - Kolom: *Pesanan Baru*, *Sedang Diracik (Brewing)*, *Siap Diambil*, *Selesai/Batal*.
  - Tombol aksi berukuran besar (*fat finger friendly*) untuk operasional cepat di layar sentuh tablet barista.
- **Audio Notification Alert**:
  - Web Audio API synthesizer dual-oscillator (*G5 ➔ C6 bell chime*). Bebas error network atau CORS.
  - Tombol aktivasi audio sesuai *autoplay policy* dan tombol tes bel.
- **Atur Menu (Menu Management CRUD)**:
  - Tambah menu baru, edit harga/deskripsi/foto, hapus menu.
  - Toggle 1-klik status *Stok Habis / Tersedia* yang langsung tersinkronisasi ke katalog pelanggan.
- **Statistik & Analisis Penjualan (Recharts)**:
  - 4 Kartu KPI (Total Pendapatan, Transaksi, AOV, Menu Terlaris).
  - Area Chart tren pendapatan harian bergradien amber.
  - Bar Chart produk terlaris.
  - Donut Chart persentase penjualan kategori.

### 3. Database & Sinkronisasi
- **Database**: Live **Neon PostgreSQL** via `@neondatabase/serverless` dengan tabel `menu_items` dan `orders`.
- **Realtime**: Multi-tab synchronization menggunakan `BroadcastChannel` API dan `localStorage`.

---

## 🚀 Menjalankan Secara Lokal

1. **Clone repository**:
   ```bash
   git clone https://github.com/shakeelfarsyafat/kedai.git
   cd kedai
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin `.env.example` ke `.env.local`:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_yirjuv6V9Wot@ep-super-math-b3pgaeyv-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   ```

4. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) untuk Portal Pelanggan, atau [http://localhost:3000/admin](http://localhost:3000/admin) untuk Dashboard Barista POS.

---

## 🔐 Kredensial Login Default

| Role | Metode Login | Kredensial |
| :--- | :--- | :--- |
| **Barista Shift A** | PIN Cepat | `8888` |
| **Barista Shift B** | PIN Cepat | `1234` |
| **Head Barista / Manager** | PIN Cepat | `9999` |
| **Store Owner** | Email & Sandi | `admin@kroma.coffee` / `kroma2026` |
