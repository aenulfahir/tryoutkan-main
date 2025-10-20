-- =====================================================
-- CPNS 2025 - Paket 1: Soal-soal Realistis
-- Total: 30 soal (10 TWK + 10 TIU + 10 TKP)
-- =====================================================

DO $$
DECLARE
  v_package_id UUID;
  v_twk_section_id UUID;
  v_tiu_section_id UUID;
  v_tkp_section_id UUID;
  v_question_id UUID;
BEGIN
  -- Get package and section IDs
  SELECT id INTO v_package_id FROM tryout_packages WHERE title = 'CPNS 2025 - Paket 1' LIMIT 1;
  SELECT id INTO v_twk_section_id FROM tryout_sections WHERE tryout_package_id = v_package_id AND section_name LIKE 'TWK%' LIMIT 1;
  SELECT id INTO v_tiu_section_id FROM tryout_sections WHERE tryout_package_id = v_package_id AND section_name LIKE 'TIU%' LIMIT 1;
  SELECT id INTO v_tkp_section_id FROM tryout_sections WHERE tryout_package_id = v_package_id AND section_name LIKE 'TKP%' LIMIT 1;

  -- =====================================================
  -- TWK (Tes Wawasan Kebangsaan) - 10 Soal
  -- =====================================================

  -- TWK 1
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_twk_section_id, 1, 
    'Pancasila sebagai dasar negara Indonesia ditetapkan pada tanggal?',
    'multiple_choice', 'easy', 'B',
    'Pancasila sebagai dasar negara Indonesia ditetapkan pada tanggal 18 Agustus 1945, sehari setelah proklamasi kemerdekaan Indonesia oleh PPKI (Panitia Persiapan Kemerdekaan Indonesia).')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', '17 Agustus 1945'),
  (v_question_id, 'B', '18 Agustus 1945'),
  (v_question_id, 'C', '1 Juni 1945'),
  (v_question_id, 'D', '22 Juni 1945'),
  (v_question_id, 'E', '29 Mei 1945');

  -- TWK 2
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_twk_section_id, 2,
    'Makna sila ketiga Pancasila "Persatuan Indonesia" adalah...',
    'multiple_choice', 'medium', 'C',
    'Sila ketiga Pancasila menekankan pentingnya persatuan dan kesatuan bangsa Indonesia di atas kepentingan pribadi dan golongan, dengan tetap menghargai keberagaman yang ada.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Mengutamakan kepentingan pribadi di atas kepentingan bangsa'),
  (v_question_id, 'B', 'Memaksakan kehendak kepada orang lain'),
  (v_question_id, 'C', 'Mengutamakan kepentingan bangsa dan negara di atas kepentingan pribadi dan golongan'),
  (v_question_id, 'D', 'Menghilangkan keberagaman budaya daerah'),
  (v_question_id, 'E', 'Memisahkan diri dari negara kesatuan');

  -- TWK 3
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_twk_section_id, 3,
    'UUD 1945 mengalami amandemen sebanyak berapa kali?',
    'multiple_choice', 'easy', 'D',
    'UUD 1945 telah mengalami amandemen sebanyak 4 kali, yaitu: Amandemen I (1999), Amandemen II (2000), Amandemen III (2001), dan Amandemen IV (2002).')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', '1 kali'),
  (v_question_id, 'B', '2 kali'),
  (v_question_id, 'C', '3 kali'),
  (v_question_id, 'D', '4 kali'),
  (v_question_id, 'E', '5 kali');

  -- TWK 4
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_twk_section_id, 4,
    'Lambang negara Indonesia adalah Garuda Pancasila dengan semboyan...',
    'multiple_choice', 'easy', 'A',
    'Semboyan Bhinneka Tunggal Ika berasal dari bahasa Jawa Kuno yang berarti "Berbeda-beda tetapi tetap satu". Semboyan ini mencerminkan keberagaman Indonesia yang tetap bersatu.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Bhinneka Tunggal Ika'),
  (v_question_id, 'B', 'Bersatu Kita Teguh'),
  (v_question_id, 'C', 'Merdeka atau Mati'),
  (v_question_id, 'D', 'Indonesia Raya'),
  (v_question_id, 'E', 'Pancasila');

  -- TWK 5
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_twk_section_id, 5,
    'Siapa yang menjadi presiden pertama Republik Indonesia?',
    'multiple_choice', 'easy', 'A',
    'Ir. Soekarno adalah presiden pertama Republik Indonesia yang menjabat dari tahun 1945 hingga 1967. Beliau juga merupakan salah satu proklamator kemerdekaan Indonesia.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Ir. Soekarno'),
  (v_question_id, 'B', 'Mohammad Hatta'),
  (v_question_id, 'C', 'Soeharto'),
  (v_question_id, 'D', 'B.J. Habibie'),
  (v_question_id, 'E', 'Megawati Soekarnoputri');

  -- TWK 6
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_twk_section_id, 6,
    'Pasal 27 ayat (1) UUD 1945 menyatakan bahwa...',
    'multiple_choice', 'medium', 'B',
    'Pasal 27 ayat (1) UUD 1945 menegaskan prinsip persamaan kedudukan di dalam hukum dan pemerintahan, yang merupakan salah satu hak asasi manusia yang fundamental.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Setiap warga negara berhak atas pekerjaan'),
  (v_question_id, 'B', 'Segala warga negara bersamaan kedudukannya di dalam hukum dan pemerintahan'),
  (v_question_id, 'C', 'Setiap warga negara berhak mendapat pendidikan'),
  (v_question_id, 'D', 'Negara menjamin kemerdekaan tiap-tiap penduduk'),
  (v_question_id, 'E', 'Fakir miskin dan anak terlantar dipelihara oleh negara');

  -- TWK 7
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_twk_section_id, 7,
    'Hari Kesaktian Pancasila diperingati setiap tanggal...',
    'multiple_choice', 'easy', 'C',
    'Hari Kesaktian Pancasila diperingati setiap tanggal 1 Oktober untuk mengenang peristiwa G30S/PKI tahun 1965 dan mengingatkan pentingnya menjaga ideologi Pancasila.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', '17 Agustus'),
  (v_question_id, 'B', '1 Juni'),
  (v_question_id, 'C', '1 Oktober'),
  (v_question_id, 'D', '10 November'),
  (v_question_id, 'E', '28 Oktober');

  -- TWK 8
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_twk_section_id, 8,
    'Sistem pemerintahan Indonesia menurut UUD 1945 adalah...',
    'multiple_choice', 'medium', 'B',
    'Indonesia menganut sistem pemerintahan presidensial di mana presiden adalah kepala negara sekaligus kepala pemerintahan, dengan sistem checks and balances antara eksekutif, legislatif, dan yudikatif.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Parlementer'),
  (v_question_id, 'B', 'Presidensial'),
  (v_question_id, 'C', 'Monarki'),
  (v_question_id, 'D', 'Liberal'),
  (v_question_id, 'E', 'Komunis');

  -- TWK 9
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_twk_section_id, 9,
    'Lembaga negara yang berwenang mengubah dan menetapkan UUD adalah...',
    'multiple_choice', 'medium', 'A',
    'MPR (Majelis Permusyawaratan Rakyat) adalah lembaga negara yang memiliki kewenangan untuk mengubah dan menetapkan Undang-Undang Dasar sesuai dengan Pasal 3 ayat (1) UUD 1945.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'MPR'),
  (v_question_id, 'B', 'DPR'),
  (v_question_id, 'C', 'Presiden'),
  (v_question_id, 'D', 'Mahkamah Konstitusi'),
  (v_question_id, 'E', 'DPD');

  -- TWK 10
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_twk_section_id, 10,
    'Nilai-nilai Pancasila yang tercermin dalam sikap gotong royong adalah...',
    'multiple_choice', 'medium', 'D',
    'Gotong royong mencerminkan nilai sila kelima Pancasila yaitu "Keadilan Sosial bagi Seluruh Rakyat Indonesia" yang menekankan kerja sama dan kepedulian sosial untuk kesejahteraan bersama.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Sila pertama'),
  (v_question_id, 'B', 'Sila kedua'),
  (v_question_id, 'C', 'Sila ketiga'),
  (v_question_id, 'D', 'Sila kelima'),
  (v_question_id, 'E', 'Sila keempat');

  -- =====================================================
  -- TIU (Tes Intelegensi Umum) - 10 Soal
  -- =====================================================

  -- TIU 1
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tiu_section_id, 11,
    'Jika $2x + 5 = 15$, maka nilai $x$ adalah...',
    'multiple_choice', 'easy', 'C',
    'Penyelesaian: $2x + 5 = 15$ → $2x = 15 - 5$ → $2x = 10$ → $x = 5$')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', '3'),
  (v_question_id, 'B', '4'),
  (v_question_id, 'C', '5'),
  (v_question_id, 'D', '6'),
  (v_question_id, 'E', '7');

  -- TIU 2
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tiu_section_id, 12,
    'Deret angka: 2, 4, 8, 16, 32, ... Angka selanjutnya adalah...',
    'multiple_choice', 'easy', 'D',
    'Pola deret: setiap angka dikalikan 2. Jadi 32 × 2 = 64')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', '48'),
  (v_question_id, 'B', '54'),
  (v_question_id, 'C', '60'),
  (v_question_id, 'D', '64'),
  (v_question_id, 'E', '72');

  -- TIU 3
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tiu_section_id, 13,
    'Hasil dari $\frac{3}{4} + \frac{2}{3}$ adalah...',
    'multiple_choice', 'medium', 'B',
    'Penyelesaian: $\frac{3}{4} + \frac{2}{3} = \frac{9}{12} + \frac{8}{12} = \frac{17}{12} = 1\frac{5}{12}$')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', '$1\frac{1}{4}$'),
  (v_question_id, 'B', '$1\frac{5}{12}$'),
  (v_question_id, 'C', '$1\frac{1}{2}$'),
  (v_question_id, 'D', '$1\frac{2}{3}$'),
  (v_question_id, 'E', '$1\frac{3}{4}$');

  -- TIU 4
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tiu_section_id, 14,
    'BUKU : PERPUSTAKAAN = OBAT : ...',
    'multiple_choice', 'medium', 'C',
    'Analogi: Buku disimpan di perpustakaan, obat disimpan di apotek.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Rumah Sakit'),
  (v_question_id, 'B', 'Dokter'),
  (v_question_id, 'C', 'Apotek'),
  (v_question_id, 'D', 'Pasien'),
  (v_question_id, 'E', 'Penyakit');

  -- TIU 5
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tiu_section_id, 15,
    'Jika semua A adalah B, dan semua B adalah C, maka...',
    'multiple_choice', 'medium', 'A',
    'Silogisme: Jika A ⊂ B dan B ⊂ C, maka A ⊂ C (semua A adalah C).')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Semua A adalah C'),
  (v_question_id, 'B', 'Semua C adalah A'),
  (v_question_id, 'C', 'Tidak ada A yang C'),
  (v_question_id, 'D', 'Sebagian A adalah C'),
  (v_question_id, 'E', 'Tidak dapat disimpulkan');

  -- TIU 6
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tiu_section_id, 16,
    'Deret angka: 5, 10, 20, 35, 55, ... Angka selanjutnya adalah...',
    'multiple_choice', 'hard', 'D',
    'Pola: selisih bertambah 5, 10, 15, 20, 25. Jadi 55 + 25 = 80')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', '70'),
  (v_question_id, 'B', '75'),
  (v_question_id, 'C', '78'),
  (v_question_id, 'D', '80'),
  (v_question_id, 'E', '85');

  -- TIU 7
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tiu_section_id, 17,
    'Jika harga 3 buku adalah Rp 45.000, maka harga 7 buku adalah...',
    'multiple_choice', 'easy', 'C',
    'Harga 1 buku = Rp 45.000 ÷ 3 = Rp 15.000. Harga 7 buku = 7 × Rp 15.000 = Rp 105.000')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Rp 95.000'),
  (v_question_id, 'B', 'Rp 100.000'),
  (v_question_id, 'C', 'Rp 105.000'),
  (v_question_id, 'D', 'Rp 110.000'),
  (v_question_id, 'E', 'Rp 115.000');

  -- TIU 8
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tiu_section_id, 18,
    'Lawan kata dari OPTIMIS adalah...',
    'multiple_choice', 'easy', 'B',
    'Optimis berarti berpikiran positif, lawannya adalah pesimis (berpikiran negatif).')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Realistis'),
  (v_question_id, 'B', 'Pesimis'),
  (v_question_id, 'C', 'Idealis'),
  (v_question_id, 'D', 'Materialis'),
  (v_question_id, 'E', 'Rasionalis');

  -- TIU 9
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tiu_section_id, 19,
    'Hasil dari $25\% \times 80$ adalah...',
    'multiple_choice', 'easy', 'D',
    'Penyelesaian: $25\% \times 80 = \frac{25}{100} \times 80 = \frac{1}{4} \times 80 = 20$')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', '10'),
  (v_question_id, 'B', '15'),
  (v_question_id, 'C', '18'),
  (v_question_id, 'D', '20'),
  (v_question_id, 'E', '25');

  -- TIU 10
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tiu_section_id, 20,
    'Jika hari ini adalah hari Senin, maka 100 hari lagi adalah hari...',
    'multiple_choice', 'medium', 'C',
    '100 hari = 14 minggu + 2 hari. Jadi Senin + 2 hari = Rabu')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Senin'),
  (v_question_id, 'B', 'Selasa'),
  (v_question_id, 'C', 'Rabu'),
  (v_question_id, 'D', 'Kamis'),
  (v_question_id, 'E', 'Jumat');

  -- =====================================================
  -- TKP (Tes Karakteristik Pribadi) - 10 Soal
  -- Format: Situasional dengan skor 1-5
  -- =====================================================

  -- TKP 1
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tkp_section_id, 21,
    'Ketika rekan kerja Anda melakukan kesalahan yang merugikan tim, sikap Anda adalah...',
    'multiple_choice', 'medium', 'A',
    'Pilihan A menunjukkan sikap proaktif dan konstruktif dengan memberikan solusi sambil tetap menghargai rekan kerja.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Membicarakan dengan rekan tersebut secara pribadi dan mencari solusi bersama (Skor 5)'),
  (v_question_id, 'B', 'Melaporkan langsung kepada atasan (Skor 4)'),
  (v_question_id, 'C', 'Menegur di depan tim agar tidak terulang (Skor 3)'),
  (v_question_id, 'D', 'Membiarkan saja karena bukan urusan saya (Skor 2)'),
  (v_question_id, 'E', 'Mendiamkan rekan tersebut (Skor 1)');

  -- TKP 2
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tkp_section_id, 22,
    'Anda ditugaskan menyelesaikan pekerjaan dengan deadline yang sangat ketat. Yang Anda lakukan adalah...',
    'multiple_choice', 'medium', 'A',
    'Pilihan A menunjukkan kemampuan manajemen waktu yang baik dengan membuat prioritas dan fokus pada tugas.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Membuat prioritas tugas dan fokus menyelesaikannya satu per satu (Skor 5)'),
  (v_question_id, 'B', 'Meminta bantuan rekan kerja untuk membagi tugas (Skor 4)'),
  (v_question_id, 'C', 'Bekerja lembur sampai selesai (Skor 3)'),
  (v_question_id, 'D', 'Meminta perpanjangan deadline kepada atasan (Skor 2)'),
  (v_question_id, 'E', 'Mengerjakan seadanya asal selesai tepat waktu (Skor 1)');

  -- TKP 3
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tkp_section_id, 23,
    'Atasan Anda memberikan kritik terhadap hasil kerja Anda. Respons Anda adalah...',
    'multiple_choice', 'medium', 'A',
    'Pilihan A menunjukkan sikap terbuka terhadap kritik dan kemauan untuk berkembang.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Menerima dengan lapang dada dan meminta saran perbaikan (Skor 5)'),
  (v_question_id, 'B', 'Mendengarkan dan akan memperbaiki (Skor 4)'),
  (v_question_id, 'C', 'Menjelaskan alasan di balik hasil kerja tersebut (Skor 3)'),
  (v_question_id, 'D', 'Merasa kecewa tapi tetap menerima (Skor 2)'),
  (v_question_id, 'E', 'Merasa tersinggung dan membela diri (Skor 1)');

  -- TKP 4
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tkp_section_id, 24,
    'Anda melihat rekan kerja melakukan tindakan yang melanggar aturan perusahaan. Tindakan Anda adalah...',
    'multiple_choice', 'medium', 'A',
    'Pilihan A menunjukkan integritas tinggi dengan mengingatkan rekan dan melaporkan jika perlu.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Mengingatkan rekan tersebut dan melaporkan kepada atasan jika terus berlanjut (Skor 5)'),
  (v_question_id, 'B', 'Langsung melaporkan kepada atasan (Skor 4)'),
  (v_question_id, 'C', 'Mengingatkan rekan tersebut saja (Skor 3)'),
  (v_question_id, 'D', 'Membiarkan karena bukan tanggung jawab saya (Skor 2)'),
  (v_question_id, 'E', 'Ikut melakukan hal yang sama (Skor 1)');

  -- TKP 5
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tkp_section_id, 25,
    'Dalam rapat tim, pendapat Anda ditolak oleh mayoritas anggota. Sikap Anda adalah...',
    'multiple_choice', 'medium', 'A',
    'Pilihan A menunjukkan sikap demokratis dan kemampuan bekerja dalam tim.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Menerima keputusan mayoritas dan mendukung pelaksanaannya (Skor 5)'),
  (v_question_id, 'B', 'Menerima tapi tetap menyampaikan keberatan (Skor 4)'),
  (v_question_id, 'C', 'Diam saja dan mengikuti keputusan (Skor 3)'),
  (v_question_id, 'D', 'Merasa kecewa dan kurang bersemangat (Skor 2)'),
  (v_question_id, 'E', 'Tetap memaksakan pendapat sendiri (Skor 1)');

  -- TKP 6
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tkp_section_id, 26,
    'Anda diminta membantu rekan kerja padahal pekerjaan Anda sendiri masih banyak. Yang Anda lakukan adalah...',
    'multiple_choice', 'medium', 'B',
    'Pilihan B menunjukkan keseimbangan antara membantu rekan dan tanggung jawab pribadi.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Menolak dengan sopan karena pekerjaan sendiri belum selesai (Skor 3)'),
  (v_question_id, 'B', 'Membantu setelah menyelesaikan pekerjaan prioritas (Skor 5)'),
  (v_question_id, 'C', 'Langsung membantu meskipun pekerjaan sendiri tertunda (Skor 4)'),
  (v_question_id, 'D', 'Membantu sebentar saja (Skor 2)'),
  (v_question_id, 'E', 'Menolak tanpa alasan (Skor 1)');

  -- TKP 7
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tkp_section_id, 27,
    'Anda mendapat tawaran pekerjaan dengan gaji lebih tinggi di perusahaan lain. Keputusan Anda adalah...',
    'multiple_choice', 'medium', 'B',
    'Pilihan B menunjukkan loyalitas dan pertimbangan matang sebelum mengambil keputusan.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Tetap bertahan karena loyal kepada perusahaan saat ini (Skor 4)'),
  (v_question_id, 'B', 'Mempertimbangkan dengan matang semua aspek sebelum memutuskan (Skor 5)'),
  (v_question_id, 'C', 'Langsung menerima tawaran karena gaji lebih tinggi (Skor 3)'),
  (v_question_id, 'D', 'Meminta kenaikan gaji di perusahaan saat ini (Skor 2)'),
  (v_question_id, 'E', 'Bingung dan tidak bisa memutuskan (Skor 1)');

  -- TKP 8
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tkp_section_id, 28,
    'Tim Anda gagal mencapai target. Sebagai anggota tim, Anda akan...',
    'multiple_choice', 'medium', 'A',
    'Pilihan A menunjukkan tanggung jawab dan sikap proaktif dalam menyelesaikan masalah.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Mengajak tim untuk evaluasi dan membuat strategi perbaikan (Skor 5)'),
  (v_question_id, 'B', 'Bekerja lebih keras untuk periode berikutnya (Skor 4)'),
  (v_question_id, 'C', 'Menerima kegagalan dan melanjutkan pekerjaan (Skor 3)'),
  (v_question_id, 'D', 'Menyalahkan anggota tim yang kurang berkontribusi (Skor 2)'),
  (v_question_id, 'E', 'Merasa kecewa dan kehilangan motivasi (Skor 1)');

  -- TKP 9
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tkp_section_id, 29,
    'Anda menemukan cara kerja yang lebih efisien dari prosedur standar. Tindakan Anda adalah...',
    'multiple_choice', 'medium', 'A',
    'Pilihan A menunjukkan inisiatif dan sikap profesional dengan mengusulkan perbaikan melalui jalur yang tepat.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Mengusulkan kepada atasan dengan data pendukung (Skor 5)'),
  (v_question_id, 'B', 'Langsung menerapkan cara baru tersebut (Skor 3)'),
  (v_question_id, 'C', 'Mendiskusikan dengan rekan kerja terlebih dahulu (Skor 4)'),
  (v_question_id, 'D', 'Tetap mengikuti prosedur standar (Skor 2)'),
  (v_question_id, 'E', 'Diam saja karena takut salah (Skor 1)');

  -- TKP 10
  INSERT INTO questions (tryout_package_id, section_id, question_number, question_text, question_type, difficulty, correct_answer, explanation)
  VALUES (v_package_id, v_tkp_section_id, 30,
    'Anda ditunjuk sebagai ketua tim untuk proyek penting. Langkah pertama Anda adalah...',
    'multiple_choice', 'medium', 'A',
    'Pilihan A menunjukkan kemampuan kepemimpinan yang baik dengan melibatkan tim sejak awal.')
  RETURNING id INTO v_question_id;

  INSERT INTO question_options (question_id, option_key, option_text) VALUES
  (v_question_id, 'A', 'Mengadakan rapat tim untuk menyusun rencana kerja bersama (Skor 5)'),
  (v_question_id, 'B', 'Membuat rencana kerja sendiri lalu menugaskan anggota tim (Skor 3)'),
  (v_question_id, 'C', 'Meminta saran dari atasan terlebih dahulu (Skor 4)'),
  (v_question_id, 'D', 'Menunggu instruksi lebih lanjut (Skor 2)'),
  (v_question_id, 'E', 'Merasa tidak percaya diri dan ingin mengundurkan diri (Skor 1)');

  RAISE NOTICE '✅ Successfully inserted 30 CPNS questions (10 TWK + 10 TIU + 10 TKP)';

END $$;

