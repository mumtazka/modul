LAPORAN INSTAL BIND9 dan KONFIGURASI DNS SERVER dan
WEB SERVER

Disusun oleh :
Nama : Imam Nur Ihsanuddin
NIS/No Absen : 21669/19
Kelas : XI TJKT 2

JURUSAN TEKNIK JARINGAN KOMPUTER DAN TELEKOMUNIKSI
SEKOLAH MENENGAH KEJURUAN NEGERI 2 PENGASIH
D.I.YOGYAKARTA
2024/2025

A. Tujuan
1. Membuat dua server, yaitu server DNS dan server web.
2. Mengkonfigurasi DNS Server menggunakan layanan BIND9.
3. Menambahkan konfigurasi zona forward pada DNS.
4. Menambahkan konfigurasi zona reverse pada DNS.
5. Mengarahkan domain ke alamat IP server web.
6. Membuat clone dari salah satu server.
7. Melakukan pengujian layanan DNS, web, dan koneksi host-only.
8. Membuat folder untuk IP dan setting IP.
B. Landasan Teori
1. Domain Name System (DNS) dan Server Web
DNS (Domain Name System) adalah sistem basis data terdistribusi yang
digunakan untuk memetakan nama domain ke alamat IP dan sebaliknya, sehingga
pengguna dapat mengakses layanan internet dengan nama yang mudah diingat, bukan
deretan angka IP. Sistem ini diusulkan oleh Paul Mockapetris pada tahun 1984 dan
diatur dalam RFC 882, 883, serta diperbarui pada RFC 1034 dan 1035. DNS bekerja
secara hierarkis dan terstruktur seperti pohon, memudahkan pengelolaan dan pencarian
nama host di jaringan internet1.
2. Server Web
Server web adalah perangkat lunak yang berfungsi untuk menerima permintaan
(request) dari client melalui protokol HTTP/HTTPS dan mengirimkan kembali data
berupa halaman web. Server web biasanya diakses melalui nama domain yang telah
dipetakan ke alamat IP menggunakan DNS.

3. BIND9
BIND9 (Berkeley Internet Name Domain version 9) adalah salah satu perangkat
lunak DNS server yang paling banyak digunakan di sistem operasi Linux. BIND9
memungkinkan administrator untuk mengelola dan mengonfigurasi zona DNS, baik
untuk pemetaan nama domain ke IP (forward) maupun sebaliknya (reverse). Proses
instalasi dan konfigurasi BIND9 meliputi pembuatan file zona, pengaturan forwarder,
serta

penyesuaian

file

konfigurasi

utama

seperti

named.conf.local

dan

named.conf.options2.
4. Zona Forward pada DNS
Zona forward dalam DNS adalah metode untuk mengarahkan permintaan query
yang tidak dapat dijawab oleh server DNS lokal ke server DNS lain yang telah
ditentukan. Ada beberapa jenis forwarding, seperti single forwarder, multiple
forwarders, dan conditional forwarding. Zona forward biasanya dikonfigurasi pada file
konfigurasi DNS dengan menentukan alamat IP server tujuan forwarding. Fitur ini
bermanfaat untuk mempercepat proses pencarian nama domain dan meningkatkan
keandalan layanan DNS, terutama dalam lingkungan jaringan besar atau perusahaan3.
5. Zona Reverse pada DNS
Zona reverse adalah konfigurasi pada DNS yang memungkinkan pemetaan
alamat IP ke nama domain (kebalikan dari forward zona). Konfigurasi ini penting untuk
keperluan verifikasi dan keamanan, seperti pada layanan email dan akses jaringan
tertentu. Pada BIND9, zona reverse biasanya diatur pada file zona khusus
(misal: db.reverse) dan didaftarkan di file konfigurasi utama2.
6. Cloning Server
Cloning server adalah proses menduplikasi seluruh isi dan konfigurasi dari satu
server ke server lain. Proses ini biasanya dilakukan pada lingkungan virtualisasi atau cloud,
seperti VPS (Virtual Private Server). Kloning sangat bermanfaat untuk backup, pengujian,
atau mempercepat deployment server baru dengan konfigurasi yang sama. Proses kloning
dapat dilakukan dengan mudah melalui control panel cloud atau virtualisasi yang
disediakan oleh provider

C. Alat dan Bahan
1. VMware WorkStation
2. ISO Debian dan ubuntu-22.04.5-live-server-amd64
3. Laptop
4. Network Internet
D. Topologi

E. Langkah-Langkah Membuat DNS Server
1. Buka virtual machine ubuntu kalian

2. Selanjutnya login menggunakan username dan password kalian

3. Selanjutnya ketikan sudo su lalu masukan pasword agar menjadi root atau super user

4. Masuk ke nano /etc/cloud/cloud.cfg.d/99-installer.cfg lalu tambahkan “ network:
{config: disabled} ” tanpa petik lalu ctrl + x untuk exit

5. Untuk menyimpan lalu tekan Y pada keyboard

6. Lalu tekan enter

7. Selanjutnya atur IP, buat folder IP dengan cek folder yang sudah ada dengan ls
/etc/netplan

8. Lalu buat folder untuk di isi IP dengan perintah touch /etc/netplan/(isi nama folder)cloud-init.yaml

9. Cek apakah folder sudah ada atau belum dengan perintah ls /etc/netplan/

10. Masuk ke nano /etc/netplan/(nama folder kalian) untuk mengkonfigurasi IP lalu
ctrl+x untuk exit

11. Untuk menyimpan lalu tekan Y pada keyboard

12. Lalu klik enter

13. Lakukan perintah agar file hanya bisa di akses oleh user Root dengan perintah chmod
600 /etc/netplan/(nama folder ip kalian)

14. Ketikan netplan apply untuk menjalankan konfigurasi IP yang sudah di konfigurasi
dan jika keterangan seperti dibawah ini maka konfigurasi sudah berhasil dijalankan

15. Ketik ip a untuk melihat IP hasil konfigurasi

16. Lakukan apt update untuk memperbarui informasi paket yang tersedia dari server
repository

17. Lalu ketikan apt install bind9-y untuk melakukan instalasi bind9

18. Setelah proses instalasi selesai masuk ke folder bind dengan cara cd /etc/bind

19. Lalu ketik systemctl status bind9 untuk melihat apakah bind9 sudah aktif atau belum

20. Masuk ke vim named.conf.options untuk mengatur IP forwards

21. Klik I pada keyboard untuk bisa mengedit isi directory

22. Ubah IP forwarders menjadi server DNS yang akan digunakan untuk meneruskan
permintaan DNS yang tidak dapat dijawab oleh server DNS local, semisal ke dns
(8.8.8.8)

23. Tekan esc lalu klik shift+: lalu ketikan wq kemudian enter untuk menyimpan dan
keluar dari directory tersebut

24. Kemudian ketikan ls untuk melihat file yang ada di bind

25. Salin file db.127 menjadi file baru bernama db.10 dengan perintah cp db.127 db.10

26. Salin file db.local menjadi file baru bernama db.kelompok5 dengan perintah cp
db.local db.kelompok5

27. Lakukan konfigurasi pada file named.conf.local

28. Folder ini di isi dengan zona forward (zona nama ke IP) dan zona reverse (zona IP ke

nama) Jika sudah klik ctrl+x untuk exit

29. Lalu tekan Y untuk menyimpan konfigurasi file

30. Kemudian klik enter

31. Buka file db.kelompok5 dengan perintah vim db.kelompok5

32. Klik I untuk masuk ke mode insert agar bisa mengubah isi file

33. Lalu edit nama domain dan IP kalian

34. Tekan esc lalu klik shift+: lalu ketikan wq kemudian enter untuk menyimpan dan
keluar dari directory tersebut

35. Lakukan konfigurasi juga pada file db.10 dengan perintah vim db.10 untuk masuk ke
dalam file

36. Klik I untuk masuk ke menu insert agar bisa mengedit file

37. Lalu edit nama domain dan IP host terakhir dari domain tersebut kalian

38. Tekan esc lalu klik shift+: lalu ketikan wq kemudian enter untuk menyimpan dan
keluar dari directory tersebut

39. Lakukan cek konfigurasi dengan perintah named-checkzone db.kelompok5 db.10,
dan jika Jika hasil test OK maka sudah berhasil maka menandakan bahwa konfigurasi
telah siap digunakan dan sudah benar

40. Lakukan juga pngecekan konfigurasi dengan perintah named-checkzone 10.10.5.inaddr.arpa.10, dan jika OK maka menandakan bahwa konfigurasi telah siap digunakan
dan sudah benar

41. Lalu lakukan perintah systemctl restart bind9 untu merestart layanan bind9 agar
konfigurasi diterapkan

42. Karena pengaturan DNS di file resolv tidak bersifat permanen dan saat komputer
dimatikan akan kembali ke pengaturan awal, maka untuk mengatasi hal ini kita bisa
menggunakan resolvconf. Oleh karena itu, instal paket resolvconf dengan perintah apt
intall resolvconf

43. Masuk ke vim /etc/resolvconf/resolv.conf.d/head dan lakukan konfigurasi

44. Edit dengan masuk ke mode insert dengan cara klik I dan ubah menjadi nameserver
10.10.5.1

45. Tekan esc lalu klik shift+: lalu ketikan wq kemudian enter untuk menyimpan dan
keluar dari directory tersebut

46. Lalu update konfigurasi dengan perintah resolvconf -u

47. Lakukan test domain menggunakan perintah nslookup 10.10.5.11 , dan nslookup
10.10.5.1 agar mengetahui apakah zona reverse (zona IP ke nama) sudah berjalan

48. Lakukan juga test domain menggunakan perintah nslookup www.kelompok5.sch.id
dan nslookup kelompok5.sch.id agar mengetahui apakah zona forward (zona nama
ke IP) sudah berjalan

F. Langkah-Langkah Clone Virtual Machine
1. Clone virtual machine dengan klik kanan pada virtual machine lalu masuk manage
dan pilih clone

2. Kemudian Next

3. Setelah itu pilih The current state in the virtual machine lalu klik Next

4. Lalu pada clone type pilih Create a full clone agar semua isi sama dengan virtual yang
di clone lalu ketik Next

5. Lalu beri nama virtual machine baru dan arahkan folder untuk menyimpan virtual
machine clone

6. Jika sudah berhasil maka akan tercentang semua lalu klik Close

G. Langkah-Langkah Membuat WEB
1. Pertama login menggunakan username dan password kalian

2. Selanjutnya ketikan sudo su lalu masukan pasword agar menjadi root atau super user

3. Ubah hostname dengan perintah hostnamectl set-hostname (nama hostname kalian)

4. Cek apakah hostname sudah terganti dengan perintah hostnamectl

5. Ketik su untuk ganti hostname

6. Lakukan apt update untuk memperbarui informasi paket yang tersedia dari server
repository

7. Install apache2 untuk server web dengan perintah sudo apt install apache2 -y, y
digunakan agar selalu yes saat penginstallan

8. Cek apache apakah sudah berjalan atau belum dengan sudo systemctl status apache2

9. Masuk ke nano /etc/cloud/cloud.cfg.d/99-installer.cfg lalu tambahkan “ network:
{config: disabled} ” tanpa petik lalu ctrl + x untuk exit

10. Untuk menyimpan lalu tekan Y pada keyboarrd

11. Lalu tekan enter

12. Selanjutnya atur IP, buat folder IP dengan cek folder yang sudah ada dengan ls
/etc/netplan

13. Lalu buat folder untuk di isi IP dengan perintah touch /etc/netplan/(isi nama folder)cloud-init.yaml

14. Cek apakah folder sudah ada atau belum dengan perintah ls /etc/netplan/

15. Masuk ke nano /etc/netplan/(nama folder kalian) untuk mengkonfigurasi IP lalu
ctrl+x untuk exit

16. Untuk menyimpan lalu tekan Y pada keyboard

17. Lalu klik enter

18. Lakukan perintah agar file hanya bisa di akses oleh user Root dengan perintah chmod
600 /etc/netplan/(nama folder ip kalian)

19. Ketikan netplan apply untuk menjalankan konfigurasi IP yang sudah di konfigurasi
dan jika keterangan seperti dibawah ini maka konfigurasi sudah berhasil dijalankan

20. Ketik ip a untuk melihat IP hasil konfigurasi

H. Langkah-Langkah Konfigurasi IP Client GUI
1. Login ke virtual machine client GUI

2. Setelah itu klik Activities pada pojok kiri atas

3. Lalu search network dan masuk ke network

4. Selanjutnya atur IP Address dengan klik icon setting pada Wired connection 1

5. Atur IP Address sesuai dengan konfigurasi kalian

6. Setelah itu aktifkan Wired connection 1 jika muncul IP Address yang sudah kalian
konfigurasi berarti konfigurasi sudah berhasil

I. Langkah-Langkah Konfigurasi IP Client Host Only
1. Klik windows lalu search Control Panel

2. Lalu pilih Network and Internet

3. Lalu Network and Sharing Center

4. Setelah itu pilih Change adapter settings

5. Pilih VMware Network Adapter VMnet1 sebagai port host only lalu klik kanan dan
pilih Properties

6. Setelah itu pilih Internet Protocol Version 4 (TCP/IPv4) lalu Properties untuk setting
IP Address

7. Setting IP Address sesuai dengan konfigurasi kalian

8. Cek IP Address dengan masuk ke command Prompt, klik Windows lalu search
Command Prompt lalu Open

9. Ketik perintah ipconfig lalu enter

10. Lalu pada Ethernet adapter VMware Network Adapter VMnet1 akan muncul IP
Address yang sudah kalian konfigurasi

J. Langkah-Langkah Menambahkan IP Address di Client Host Only
1. Kita tambahkan IP Address server web agar client host-only bisa mengenali IP Address
server web kita, jika kita tidak menambahkan IP Address server web kita maka saat
pengujian akan muncul IP Address random, pertama kita buka Notepad menggunakan
Run as administrator

2. Setelah itu kita masuk ke File lalu Open

3. Lalu kita acari file yang berada di C:\Windows\System32\drivers\etc dan gunakan
All files

4. Kita buka file utama yang digunakan oleh sistem operasi Windows untuk memetakan
nama domain ke alamat IP Address, yaitu hosts

5. Tambahkan IP Address dan domain server web kalian

K. Langkah-Langkah Konfigurasi Port
1. Kita konfigurasi port agar client dan server bisa saling terhubung, Pertama kita masuk
ke Edit lalu Virtual Network Editor

2. Lalu Change Settings agar kita bisa mengubah setting pada Virtual Network Editor

3. Untuk VMnet0 kita pilih Bridged dan menggunakan Bridged to : Automatic agar
briged bisa otomatis akan menggunakan port mana untuk bridged. Bridged ini di
gunakan untuk agar bisa mendapatkan IP Address dari Internet Service Provider

4. Untuk yang VMnet1 kita gunakan Host-Only agar antara server dan client bisa saling
terhubung. Isi Subnet IP dengan IP Network dan isi juga Subnet Mask nya. Setelah
itu kita Apply lalu OK

5. Kita masuk ke settings pada virtual machine server Client GUI

6. Pada Network Adapter kita arahkan di Custom : Specific virtual network lalu kita
pilih VMnet1 (Host-Only) agar saling terhubung antar server dan client

7. Lalu kita juga masuk ke settings virtual machine DNS Server

8. Pada Network Adapter yang pertama kita pilih Bridged : Connected directly to the
physical network ceklis juga Replicate physical network connection state

9. Untuk Network Adapter 2 kita arahkan di Custom : Specific virtual network lalu kita
pilih VMnet1 (Host-Only) agar saling terhubung antar server dan client

10. Masuk juga ke Settings pada WEB Server

11. Lalu Untuk Network Adapter pertama kita arahkan di Custom : Specific virtual
network lalu kita pilih VMnet1 (Host-Only) agar saling terhubung antar server dan
client

L. Pengujian Client GUI
1. Lakukan pengujian pada client GUI dengan cara masuk ke Activities pada kiri atas

2. Lalu search Terminal untuk melakukan pengujian

3. Mulailah pengujian dengan perintah ping (IP Address yang akan di uji), Berikut
merupakan pengujian terhadap DNS Server

4. Pengujian terhadap WEB Server

5. Pengujian terhadap Client Host-Only

6. Pengujian terhadap Client GUI (diri sendiri)

7. Setelah itu kembali, dan masuk ke Activities lalu buka Firefox

8. Ketik domain kalian jika berhasil maka akan muncul web kalian

M. Pengujian DNS Server
1. Lakukan pengujian pada virtual machine DNS Server dengan perintah ping (IP
Address yang akan di uji), Berikut merupakan pengujian terhadap IP Address google
tanda bahwa virtual machine bisa akses internet

2. Pengujian terhadap DNS Server (diri sendiri)

3. Pengujian terhadap WEB Server

4. Pengujian terhadap Client GUI

5. Pengujian terhadap Client Host-Only

6. Lakukan test domain menggunakan perintah nslookup 10.10.5.11 , dan nslookup
10.10.5.1 agar mengetahui apakah zona reverse (zona IP ke nama) sudah berjalan

7. Lakukan juga test domain menggunakan perintah nslookup www.kelompok5.sch.id
dan nslookup kelompok5.sch.id agar mengetahui apakah zona forward (zona nama
ke IP) sudah berjalan

N. Pengujian WEB Server
1. Lakukan pengujian pada virtual machine WEB Server dengan perintah ping (IP
Address yang akan di uji), Berikut merupakan pengujian terhadap IP Address DNS
Server

2. Pengujian terhadap WEB Server (diri sendiri)

3. Pengujian terhadap Client GUI

4. Pengujian terhadap Client Host-Only

5. Lakukan test domain menggunakan perintah nslookup 10.10.5.11 , dan nslookup
10.10.5.1 agar mengetahui apakah zona reverse (zona IP ke nama) sudah berjalan

6. Lakukan juga test domain menggunakan perintah nslookup kelompok5.sch.id agar
mengetahui apakah zona forward (zona nama ke IP) sudah berjalan

O. Pengujian Client Host Only
1. Lakukan pengujian melalui Client GUI dengan cara masuk ke windows lalu search
Command Prompt lalu Open

2. Lakukan pengujian pada Client Host-Only dengan perintah ping (IP Address yang
akan di uji), Berikut merupakan pengujian terhadap IP Address DNS Server

3. Pengujian terhadap Client GUI

4. Pengujian terhadap WEB Server

5. Pengujian terhadap Client Host-Only (diri sendiri)

6. Lakukan test domain menggunakan perintah nslookup 10.10.5.11 , dan nslookup
10.10.5.1 agar mengetahui apakah zona reverse (zona IP ke nama) sudah berjalan

7. Lakukan juga test domain menggunakan perintah nslookup www.kelompok5.sch.id
dan nslookup kelompok5.sch.id agar mengetahui apakah zona forward (zona nama
ke IP) sudah berjalan

8. Setelah itu pengujian domain dengan cara klik Windows lalu search Google Chrome
lalu Open

9. Lalu ketik http:// (nama domain kalian)

10. Jika zona forward (zona nama ke IP) sudah berjalan maka akan muncul web kalian

P. Permasalahan
•

IP Address tidak tersimpan
1. Jika saat shutdown virtual machine dan menghidupkan kembali virtual machine
maka IP Address yang telah kita konfigurasi akan hilang oleh karena itu kita perlu
konfigurasi IP Address sebagai berikut Masuk ke nano /etc/cloud/cloud.cfg.d/99installer.cfg lalu tambahkan “ network: {config: disabled} ” tanpa petik lalu ctrl
+ x untuk exit

2. Untuk menyimpan lalu tekan Y pada keyboarrd

3. Lalu tekan enter

4. Selanjutnya atur IP, buat folder IP dengan cek folder yang sudah ada dengan ls
/etc/netplan

5. Lalu buat folder untuk di isi IP dengan perintah touch /etc/netplan/(isi nama
folder)-cloud-init.yaml

6. Cek apakah folder sudah ada atau belum dengan perintah ls /etc/netplan/

7. Masuk ke nano /etc/netplan/(nama folder kalian) untuk mengkonfigurasi IP lalu
ctrl+x untuk exit

8. Untuk menyimpan lalu tekan Y pada keyboard

9. Lalu klik enter

10. Lakukan perintah agar file hanya bisa di akses oleh user Root dengan perintah
chmod 600 /etc/netplan/(nama folder ip kalian)

11. Ketikan netplan apply untuk menjalankan konfigurasi IP yang sudah di
konfigurasi dan jika keterangan seperti dibawah ini maka konfigurasi sudah
berhasil dijalankan

•

Tambah IP Address pada Client Host-Only

•

Kita tambahkan IP Address server web agar client host-only bisa mengenali IP Address
server web kita, jika kita tidak menambahkan IP Address server web kita maka saat
pengujian akan muncul IP Address random, pertama kita buka Notepad menggunakan
Run as administrator

•

Setelah itu kita masuk ke File lalu Open

•

Lalu kita cari file yang berada di C:\Windows\System32\drivers\etc dan gunakan
All files

• Kita buka file utama yang digunakan oleh sistem operasi Windows untuk memetakan
nama domain ke alamat IP yaitu hosts

•

Tambahkan IP Address dan domain server web kalian

Q. Kesimpulan
Dalam praktikum ini, kami berhasil membangun dua jenis server, yaitu DNS Server
dan Web Server. Konfigurasi DNS dilakukan menggunakan BIND9 dengan sangat teliti,
termasuk penambahan zona forward untuk menerjemahkan nama domain ke alamat IP dan
zona reverse untuk sebaliknya. Kami juga mengarahkan domain ke server web
menggunakan konfigurasi A record. Selain itu, kami menduplikat virtual machine
menggunakan fitur clone untuk efisiensi, serta melakukan pengujian terhadap layanan
DNS, layanan web, dan koneksi host-only. Untuk menjaga konfigurasi IP Address tetap
tersimpan saat virtual machine di-reboot, kami membuat folder khusus berisi konfigurasi
tersebut. Praktikum ini memberikan pemahaman nyata tentang pentingnya ketelitian dalam
konfigurasi jaringan dan efisiensi dalam pengelolaan sistem virtual.

