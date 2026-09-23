ASSERT — ONLINE PACKAGE V8

Isi:
- ASSERT.html = versi game ASSERT terbaru (Mission 01–07)
- netlify/functions/assert-data.mjs = API penyimpanan + pembacaan data siswa terpusat
- netlify.toml = konfigurasi Netlify + fungsi server
- package.json = dependency Netlify Blobs

DEPLOY KE NETLIFY
1. Buat site baru di Netlify.
2. Deploy SELURUH folder `assert_online_v15` sebagai project (jangan hanya upload `ASSERT.html`). Untuk versi dengan Functions + Blobs, gunakan Git atau Netlify CLI; setelah terhubung, pastikan folder `netlify/functions` ikut ter-deploy.
3. Setelah deploy selesai, buka URL HTTPS site. Jangan menjalankan ASSERT.html dengan file:// jika ingin monitoring Guru BK.
4. Di Project configuration → Environment variables, buat:
   ASSERT_BK_CODE = [kode rahasia Guru BK yang kamu tentukan]
   Scope minimal: Functions
5. Redeploy setelah environment variable disimpan karena perubahan environment variable berlaku pada deploy baru.
6. Buka URL utama site. Netlify akan menampilkan ASSERT.html melalui redirect dari `/`.

MODE SISWA
- Pilih MASUK SEBAGAI SISWA.
- Siswa wajib menggunakan nama asli agar Guru BK dapat mengenali progresnya.
- Data progres dikirim ke fungsi `/.netlify/functions/assert-data` dan disimpan di Netlify Blobs.

MODE GURU BK
- Pilih RUANG GURU BK.
- Masukkan kode akses yang sama dengan `ASSERT_BK_CODE`.
- Control Room menampilkan target 36 siswa, jumlah siswa yang masuk, progres Mission 01–07, detail progres per siswa, refleksi yang tersimpan, dan export CSV.
- Tidak ada leaderboard/peringkat.
- Data game (badge, progres, pilihan) bukan skor tingkat asertivitas atau diagnosis psikologis.

DATA
- Store Netlify Blobs: `assert-student-data-v15-clean`
- Key data: `students.json`
- Package dimulai dari store kosong untuk menghindari data uji lama.

CATATAN KEAMANAN
- Jangan membagikan kode `ASSERT_BK_CODE` kepada siswa.
- Kode akses Guru BK tidak lagi ditanam sebagai kode tetap di HTML; login Guru BK divalidasi oleh Netlify Function menggunakan ASSERT_BK_CODE.
- Data yang dikirim ke server berisi nama siswa dan jawaban aktivitas. Gunakan sesuai kebijakan sekolah dan kebutuhan layanan BK.
