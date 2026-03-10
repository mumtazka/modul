2.1 Pengertian MikroTik RouterOS
MikroTik RouterOS merupakan sistem operasi berbasis Linux yang dikembangkan oleh perusahaan MikroTik dari Latvia. RouterOS dirancang khusus untuk mengubah perangkat keras (seperti PC atau RouterBOARD) menjadi router jaringan yang handal dan multifungsi. RouterOS memiliki berbagai fitur networking tingkat lanjut, termasuk routing, firewall, bandwidth management, wireless access point, hotspot, VPN, serta protokol dinamis seperti OSPF dan BGP.
MikroTik sering digunakan pada jaringan ISP (Internet Service Provider), warnet, kafe, sekolah, hingga hotspot publik karena kemampuannya mengelola akses pengguna secara efisien dan aman.
2.2 Wireless Access Point (AP)
Wireless Access Point (AP) adalah perangkat jaringan yang berfungsi sebagai penghubung antara perangkat nirkabel (seperti laptop, smartphone) dengan jaringan kabel (LAN). Pada MikroTik, interface wireless (misalnya wlan1) dapat dikonfigurasi sebagai AP-bridge untuk menyediakan layanan WiFi. Mode ini memungkinkan perangkat MikroTik bertindak sebagai titik akses yang mendistribusikan sinyal WiFi dengan SSID tertentu, serta mendukung protokol keamanan seperti WPA2-PSK untuk melindungi jaringan dari akses tidak sah.
2.3 Dynamic Host Configuration Protocol (DHCP)
DHCP adalah protokol jaringan yang secara otomatis memberikan konfigurasi IP address, subnet mask, gateway, dan DNS server kepada perangkat client di jaringan. Pada MikroTik, DHCP Server dapat diatur pada interface tertentu (misalnya bridge LAN) untuk memudahkan pengelolaan IP pada banyak perangkat tanpa konfigurasi manual. DHCP Client digunakan pada interface WAN untuk mendapatkan IP secara dinamis dari ISP.
2.4 Network Address Translation (NAT) – Masquerade
NAT adalah teknik untuk menerjemahkan alamat IP private menjadi IP public agar perangkat di jaringan lokal dapat mengakses internet. Pada MikroTik, rule masquerade di chain srcnat firewall NAT digunakan untuk membagikan koneksi internet dari satu IP WAN ke seluruh client di LAN. Ini merupakan komponen utama dalam sharing internet pada setup hotspot.
2.5 Firewall pada MikroTik
Firewall MikroTik berfungsi untuk mengontrol lalu lintas data masuk, keluar, dan forwarding. Terdiri dari filter rules (untuk blokir/allow), NAT (untuk address translation), dan mangle (untuk marking packet). Dalam konteks hotspot, firewall digunakan untuk:

Melindungi jaringan dari ancaman.
Memblokir akses ke situs tertentu (misalnya YouTube via TLS-host atau layer7).
Mengatur chain forward untuk membatasi user hotspot.

2.6 Hotspot pada MikroTik
Hotspot adalah fitur captive portal pada MikroTik yang mengharuskan pengguna melakukan autentikasi (login) sebelum mengakses internet. Hotspot menggabungkan beberapa layanan seperti:

DHCP Server
NAT
DNS
Proxy (opsional)
Walled Garden (akses terbatas sebelum login)
Universal Plug and Play (UPnP) – opsional

Ketika client terhubung ke interface hotspot, browser akan di-redirect ke halaman login. Setelah login berhasil, akses internet dibuka sesuai limitasi (waktu, bandwidth, dll.).
2.7 Captive Portal
Captive Portal adalah mekanisme autentikasi berbasis web yang "menjebak" pengguna di halaman login sampai autentikasi berhasil. Pada MikroTik Hotspot, captive portal diimplementasikan melalui redirect HTTP/HTTPS ke halaman internal (biasanya http://192.168.88.1/login). Ini umum digunakan di WiFi publik seperti kafe, hotel, atau sekolah untuk mengontrol akses.
2.8 User Manager dan RADIUS
User Manager adalah fitur built-in (sejak RouterOS v6/v7) pada MikroTik yang berfungsi sebagai RADIUS server (Remote Authentication Dial-In User Service). RADIUS adalah protokol standar untuk AAA (Authentication, Authorization, Accounting):

Authentication → verifikasi identitas user (username/password).
Authorization → menentukan hak akses (limit bandwidth, uptime, profile).
Accounting → mencatat penggunaan (waktu online, data transfer).

User Manager terintegrasi dengan Hotspot melalui RADIUS client. Keunggulan:

Manajemen user terpusat.
Pembuatan voucher otomatis (printable).
Limitasi per user (uptime, download/upload speed, shared users).
Database internal untuk ribuan user tanpa package tambahan.

Dalam setup voucher, admin membuat profile (misal 1 jam), limitation (kecepatan & waktu), lalu generate user/voucher yang bisa dicetak untuk dijual atau dibagikan.
2.9 Sistem Voucher Hotspot
Voucher hotspot adalah kode akses sementara (username + password) dengan batas waktu/kecepatan tertentu. Sistem ini populer di warnet, kafe internet, atau RT/RW-Net karena:

Mudah dikontrol (jual per jam/hari).
Batasi abuse bandwidth.
Tidak perlu daftar akun permanen.

Pada MikroTik + User Manager, voucher dibuat via profile limitation, kemudian di-generate menjadi file printable (HTML/PDF) untuk dicetak.
2.10 Filtering dan Blokir Situs (YouTube dll.)
MikroTik mendukung filtering berbasis:

TLS Host (untuk HTTPS – efektif blokir YouTube modern).
Layer7 Protocol (regexp untuk HTTP).
Address List atau Content matching.

Rule ditempatkan di chain forward dengan in-interface LAN/hotspot agar hanya memengaruhi user tertentu, tanpa mengganggu akses admin/lokal.
Referensi (tambahkan ini di daftar pustaka laporanmu):

MikroTik Documentation: https://help.mikrotik.com
Citraweb: Integrasi Hotspot dengan User Manager
Berbagai jurnal/skripsi tentang implementasi hotspot MikroTik (contoh: repository BSI, UIR, dll.)

LANGKAH 1: Buka Winbox & Login

Jalankan Winbox.exe.
Di kolom Neighbors akan muncul router kamu (atau ketik manual IP 192.168.88.1).
Username: admin
Password: kosong (kalau baru reset).
Klik Connect.
(Screenshot: halaman utama Winbox yang terbuka)


LANGKAH 2: Setting DHCP Client WAN (ether1)

Klik menu IP di kiri → pilih DHCP Client.
Klik tombol + (Add).
Interface: pilih ether1.
Centang Add Default Route (biar otomatis dapat gateway ISP).
Klik OK.
Tunggu status jadi bound (ada IP dari ISP).
(Screenshot: tabel DHCP Client dengan status bound)


LANGKAH 3: Buat Bridge untuk Laptop + WiFi

Klik menu Bridge.
Tab Bridges → klik +.
Name: ketik bridge1 → klik OK.
Pindah ke tab Ports.
Klik +:
Interface: ether2 → Bridge: bridge1 → OK.

Klik + lagi:
Interface: wlan1 → Bridge: bridge1 → OK.
(Screenshot: tabel Ports di bridge1 sudah ada ether2 & wlan1)



LANGKAH 4: Setting WiFi Hotspot

Klik menu Wireless.
Double-click wlan1.
Tab General:
Mode: ap-bridge
SSID: Hotspot-Voucher
Band: 2ghz-b/g/n (atau 5GHz kalau router support)
Disabled: centang NO

Tab Security:
Security Profile: klik tombol ... → Add new
Name: hotspot-sec
Mode: dynamic-keys
Authentication: wpa2-psk
WPA2 Pre-Shared Key: password123 (bebas)
Klik OK → pilih profile ini.

Klik OK lagi.
(Screenshot: wlan1 sudah aktif dengan SSID Hotspot-Voucher)


LANGKAH 5: IP Address + DHCP Server LAN

Klik IP → Addresses.
Klik +:
Address: 192.168.88.1/24
Interface: bridge1
Klik OK.

Klik IP → Pool.
Klik +:
Name: hs-pool
Ranges: 192.168.88.10-192.168.88.254
Klik OK.

Klik IP → DHCP Server.
Klik tombol DHCP Setup (wizard).
Interface: bridge1 → Next.
Address: sudah otomatis 192.168.88.1/24 → Next.
Pool: pilih hs-pool → Next.
Gateway: 192.168.88.1 → Next.
DNS: 8.8.8.8 → Next → Finish.
(Screenshot: DHCP Server sudah aktif)


LANGKAH 6: NAT Masquerade (Sharing Internet)

Klik IP → Firewall → tab NAT.
Klik +.
Tab General:
Chain: srcnat
Out. Interface: ether1

Tab Action:
Action: masquerade

Klik OK.
(Screenshot: NAT rule sudah ada)


LANGKAH 7: Jalankan Hotspot Wizard (Paling Penting!)

Klik IP → Hotspot.
Klik tombol besar Hotspot Setup (wizard).
Hotspot interface: bridge1 → Next.
Local address: 192.168.88.1/24 → Next.
Address pool: hs-pool → Next.
Masquerade network: yes → Next.
Certificate: none → Next.
SMTP: kosong → Next.
DNS servers: 8.8.8.8 → Next.
DNS name: hotspot.local (opsional) → Next.
Local hotspot user: admin → Next → Finish.
(Screenshot: wizard selesai, Hotspot server aktif)


LANGKAH 8: Aktifkan User Manager (untuk Voucher)

Klik menu User Manager di kiri.
Tab Settings.
Centang Enabled → Apply.
(Screenshot: User Manager sudah Enabled)


LANGKAH 9: Integrasi RADIUS User Manager ke Hotspot

Masih di User Manager → tab Routers.
Klik +:
Name: local-router
Address: 127.0.0.1
Shared Secret: rahasia123
Klik OK.

Klik IP → Radius.
Klik +:
Service: centang hotspot
Address: 127.0.0.1
Secret: rahasia123
Klik OK.

Kembali ke IP → Hotspot → tab Profiles.
Double-click hsprof1 (default).
Centang Use RADIUS → OK.
(Screenshot: Use RADIUS sudah aktif)


LANGKAH 10: Buat Profile, Limitation & Voucher

Di User Manager → tab Profiles.
Klik +:
Name: voucher-1jam
Validity: 1h (1 jam)
Price: 0
Klik OK.

Tab Limitations → klik +:
Name: limit-1jam
Download limit: 100M (atau 0 unlimited)
Upload limit: 50M
Uptime limit: 1h
Klik OK.

Tab Profile Limitations → klik +:
Profile: voucher-1jam
Limitation: limit-1jam
Klik OK.

Tab Users → klik +:
Name: voucher001
Password: 123456
Profile: voucher-1jam
Klik OK.

Pilih user tadi → klik tombol Generate Voucher.
Pilih template: printable_vouchers.html → OK.
File voucher otomatis tersimpan di Files → um → PRIVATE → GENERATED.
(Screenshot: voucher PDF/HTML siap cetak)

Mau banyak voucher?
Tab Users → klik Add Batch Users → isi jumlah 10 → OK.

LANGKAH 11: Blokir YouTube (Firewall Filter)

Klik IP → Firewall → tab Filter Rules.
Klik + (buat rule baru).
Tab General:
Chain: forward
In. Interface: bridge1

Tab Advanced:
TLS Host: ketik *.youtube.com

Tab Action:
Action: drop
Klik OK.

Ulangi tambah rule baru untuk:
*.youtu.be
*.googlevideo.com
*.ytimg.com
(atau tambah *.facebook.com kalau mau blok FB juga)


PENTING: Tarik rule-rule block ini ke paling atas (di atas rule accept).
(Screenshot: Filter Rules dengan TLS Host youtube.com)

LANGKAH 12: Testing & Backup

Connect laptop ke ether2 atau WiFi “Hotspot-Voucher”.
Buka browser → otomatis muncul login page.
Masukkan voucher001 / 123456 → login.
Internet jalan, YouTube terblokir.
Backup config:
Klik Files → klik kanan kosong → Export → nama file konfigurasi-hotspot.rsc → Export.