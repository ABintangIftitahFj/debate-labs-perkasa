# Software Architecture Document (SAD) - Debate Labs v1.0

## 1. Architectural Representation & Style
Debate Labs mengimplementasikan pola **Decoupled Architecture** yang memisahkan secara kaku Lapisan Pengguna (*Client Layer*) dari Lapisan Pemrosesan (*Processing & AI Orchestration Layer*). Hal ini mengisolasi seluruh beban komputasi AI yang berat di sisi server sehingga peramban klien tetap ringan dan responsif.

## 2. Komponen Lapisan Sistem (Layered Decomposition)
### 2.1. Client Layer (Frontend)
* **Teknologi**: React + Vite, Tailwind CSS, shadcn/ui.
* **Audio Ingestion**: Menggunakan HTML5 MediaRecorder API untuk menangkap sinyal vokal secara tersegmentasi (*chunking* per 1.000 ms) guna menghindari kebocoran memori RAM peramban dalam durasi pidato penuh (7 menit 20 detik). Mengemas data biner menjadi objek *Audio Blob Payload* (format default peramban seperti webm/ogg opus 128 kbps).
* **Data Visualization**: Merender objek respons JSON dari backend menjadi Triangle Skill Radar Chart (SVG) dua lapisan komparatif, Official Ballot Summary Card, serta Log Catatan Kesalahan Logika (*Logic Fallacy Log*) interaktif yang dilengkapi fitur *click-to-seek* penanda waktu audio.

### 2.2. Processing & AI Orchestration Layer (Backend)
* **Teknologi**: FastAPI (Python), LangChain, LangGraph.
* **Media Preprocessing**: Memanfaatkan utilitas FFmpeg di latar server untuk mengompresi dan menstandardisasi berkas audio mentah dari klien menjadi format WAV Mono PCM 16-bit 16kHz.
* **Acoustic Model**: Model Wav2Vec2 yang di-*host* secara lokal (on-premise) untuk melakukan ekstraksi parameter akustik non-verbal (Speech Rate, Pitch & Intensity, Filler Words/Pause Detection).
* **AI Core Reasoning**: Menggunakan Gemini 3.0 Flash dengan kemampuan *Native Multimodal* untuk menganalisis semantik audio secara langsung tanpa membutuhkan gerbang Speech-to-Text terpisah.
* **Multi-Agent Orchestrator**: Menggunakan struktur graf terarah (Directed Acyclic Graph) dari LangGraph untuk mengorkestrasi state komunikasi dan memori antar tiga agen AI spesialis (Debater, Judge, Kesimpulan).

### 2.3. Database Layer (Storage)
* **Teknologi**: Single-Engine PostgreSQL v16 + ekstensi `pgvector`.
* **Data Relasional**: Menyimpan data transaksional terstruktur seperti tabel `users`, `auth_sessions`, `classrooms`, `classroom_member`, `debates`, `debate_messages`.
* **Data Analitik Padat**: Kolom `detailed_critique` pada tabel `speech_training` dikonfigurasi menggunakan tipe data `JSONB` untuk mendukung operasi pengindeksan ekspresi telemetri kualitatif/kuantitatif tanpa migrasi skema yang kompleks.
* **Data Vektor (RAG)**: Menyimpan representasi spasial numerik berdimensi 1536 dari aturan pedoman resmi juri debat pada tabel `knowledge_base` menggunakan tipe data `vector(1536)` untuk pencarian kedekatan semantik (*similarity search*).

## 3. Alur Komunikasi & Pipeline Pemrosesan Data
### 3.1. Jalur Evaluasi Asinkronus (Speech Practice)
1. Klien mengirim Audio Payload + Metadata ke endpoint `/v1/debate/analyze`.
2. FastAPI memvalidasi data, mencatat status `PENDING` di DB, mengembalikan `Task ID` ke frontend, dan memicu fungsi asinkron via `FastAPI BackgroundTasks`.
3. Server melakukan pra-pemrosesan via FFmpeg dan ekstraksi akustik via Wav2Vec2.
4. Agen RAG menarik pedoman juri dari pgvector.
5. Audio WAV + Konteks RAG + Sinyal Akustik dianalisis langsung oleh Gemini 3.0 Flash.
6. Hasil evaluasi disimpan secara permanen dan disinkronisasikan ke dashboard Coach dan Murid.

### 3.2. Jalur WebSocket Real-Time Sinkronus (Debat Kusir)
1. Frontend membuka koneksi dupleks penuh persisten ke endpoint `/v1/debate/kusir`.
2. Potongan bita suara dikirim kontinu via WebSocket.
3. Gemini 3.0 Flash mencerna sinyal suara secara *on-the-fly* via streaming input multimodal.
4. **Mekanisme Cost-Efficiency**: Respons AI dikembalikan dalam bentuk teks instan saja (*Text-Only Rebuttal*) untuk menghemat token API hingga 90% dan meminimalkan latensi (<1.5 detik).
5. Di akhir sesi, transkrip diakumulasikan untuk evaluasi makro menyeluruh, disimpan ke DB, dan cache ruang obrolan dibersihkan.

## 4. Telemetry & Observability
* **Langfuse**: Digunakan untuk melacak visualisasi rantai orkestrasi LangGraph, latensi pemanggilan model Gemini 3.0 Flash, kesalahan eksekusi (*error logging*), serta kalkulasi konsumsi token API secara real-time.
* **Exponential Backoff**: Logika percobaan ulang pemanggilan API otomatis (hingga 5 kali: 1s, 2s, 4s, 8s, 16s) secara asinkronus untuk menangani batasan laju panggilan (*Rate Limits*).

---
