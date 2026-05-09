Jimpitan Digital Online (PWA)

Aplikasi pengelolaan jimpitan desa berbasis cloud dengan fitur sinkronisasi real-time menggunakan Firebase dan dukungan Progressive Web App (PWA).

Fitur Utama

Multi-User Role: Admin (Manajemen data), Petugas (Input lapangan), dan Warga (Cek saldo personal).

Real-time Sync: Sinkronisasi data otomatis antar perangkat menggunakan Firebase Firestore.

PWA Ready: Dapat diinstal di Android/iOS dan muncul di home screen.

UI Responsif: Dioptimalkan untuk penggunaan mobile di lapangan.

Struktur File

src/App.jsx: Logika utama React (Single File Component).

public/index.html: Entry point dengan meta tags PWA.

public/manifest.json: Konfigurasi manifest aplikasi.

public/service-worker.js: Skrip untuk dukungan caching/offline.

Cara Instalasi

Clone repositori ini.

Jalankan npm install.

Pastikan dependensi berikut terpasang:

firebase

lucide-react

tailwindcss

Sesuaikan firebaseConfig di dalam App.jsx.

Jalankan npm start.

Kontribusi

Silakan buka issue atau kirimkan pull request untuk pengembangan lebih lanjut.
