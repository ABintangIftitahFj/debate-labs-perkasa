# Product Requirements Document (PRD) - Debate Labs v1.0

## 1. Executive Summary
Debate Labs adalah sebuah aplikasi pelatihan debat akademik berbasis Kecerdasan Buatan (AI) multimodal (suara dan teks). Aplikasi ini dirancang untuk melatih kemampuan berpikir kritis (*critical thinking*), berbicara di depan umum (*public speaking*), dan pemecahan masalah (*problem solving*) bagi siswa dan mahasiswa di Indonesia. Dengan memanfaatkan analisis native multimodal menggunakan Gemini 3.0 Flash dan ekstraksi metrik akustik melalui Wav2Vec2 lokal, platform ini mendemokratisasi akses pelatihan debat berkualitas tanpa batasan geografis.

## 2. Target Pengguna & Aktor Sistem
1. **Murid (Student)**: Siswa SMA atau mahasiswa yang ingin mengasah kemampuan debat, meningkatkan ketajaman nalar, dan mereduksi kecemasan berbicara (*glossophobia*).
2. **Pelatih (Coach)**: Pembina ekstrakurikuler, guru bahasa, alumni, atau senior UKM yang bertindak sebagai administrator kelas, perancang kurikulum kustom, dan pemberi feedback taktis.
3. **Sistem**: Orkestrator backend yang mengelola manajemen data, pengolahan audio, dan koordinasi agen AI.

## 3. Cakupan Fitur & Ruang Lingkup
### 3.1. Coaching Mode (Mode Terbimbing)
* **Room System**: Coach dapat membuat ruang latihan menggunakan kode unik (*Unique Room Code*). Murid dikunci hanya bisa bergabung dalam 1 Room aktif.
* **Syllabus Choice**: Dua opsi jalur kurikulum:
  * **Kurikulum Web**: Modul default bawaan sistem dengan Bank Mosi acak/pilih mandiri.
  * **Kurikulum Coach**: Silabus kustom yang dirancang langsung oleh Coach dengan topik mosi terkunci.
* **Konfigurasi Posisi**: Murid dapat memilih atau dialokasikan acak sebagai Pro/Contra dengan peran taktis pembicara (P1: Prime Minister/Leader of Opposition, P2: Deputy, P3: Whip).
* **Siklus Sesi**: Latihan monolog lisan berdurasi penuh standar kompetisi (7 menit 20 detik).

### 3.2. Individual Mode (Mode Mandiri)
* **Speaking Practice**: Latihan monolog mandiri 7 menit 20 detik dengan konfigurasi mosi bebas tanpa intervensi Coach.
* **Debat Kusir**: Sesi sparring suara/teks dua arah interaktif dengan AI Voice Agent berbasis protokol WebSockets secara real-time.

### 3.3. Fitur Pendukung Lintas-Mode
* **Smart Position**: Instrumen pertanyaan adaptif untuk menganalisis karakteristik kognitif murid dan memberikan rekomendasi peran taktis (P1, P2, atau P3).
* **Bank Mosi**: Repositori ratusan mosi debat terkurasi berdasarkan tingkat kesulitan, tema, dan format kompetisi (British/Asian Parliamentary).

## 4. Spesifikasi Kebutuhan Fungsional (Functional Requirements)
* **RF-01**: Sistem wajib memvalidasi sesi dan membatasi hak akses berdasarkan peran akun (Coach/Student).
* **RF-02**: Sistem harus memastikan akun Murid tidak terdaftar di lebih dari satu Room aktif secara bersamaan.
* **RF-03**: Backend harus mengeksekusi fungsi asinkronus (`FastAPI BackgroundTasks`) untuk memproses rekaman audio berdurasi penuh (7:20) tanpa memicu request timeout pada klien.
* **RF-04**: Sistem wajib membuka saluran WebSockets dua arah yang persisten untuk memfasilitasi sesi interaktif Debat Kusir.
* **RF-05**: Sistem harus mengizinkan Coach mengunci mosi pada Kurikulum Kamar agar langsung tersinkronisasi ke dashboard murid di Room tersebut.
* **RF-06**: Hasil analisis AI wajib masuk secara real-time ke dasbor Coach untuk divalidasi dan ditambahkan feedback kustom teks.

## 5. Parameter Penilaian & Metrik Evaluasi (Rubrik LDBI Puspresnas)
Setiap sesi evaluasi monolog (7:20) menghasilkan visualisasi data berdasarkan standardisasi resmi LDBI:
* **Total Skor**: Skala rentang nilai 60 - 90 (Nilai rata-rata standar: 75).
* **Konten / Matter (40%)**: Rentang skala 24 - 36, mengevaluasi struktur argumen berbasis kerangka AREL (*Assertion, Reasoning, Evidence, Link-back*) serta deteksi kesalahan logika (*logical fallacy*).
* **Penyampaian / Manner (40%)**: Rentang skala 24 - 36, mengukur artikulasi vokal, kecepatan bicara (WPM), intonasi, dan stabilitas emosi.
* **Strategi / Method (20%)**: Rentang skala 12 - 18, menilai manajemen waktu dan struktur pembabakan argumen sesuai posisi taktis pembicara.

---
