<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DumySeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('test_answers')->truncate();
        DB::table('test_attempts')->truncate();
        DB::table('test_questions')->truncate();
        DB::table('tests')->truncate();
        DB::table('practice_submission_photos')->truncate();
        DB::table('practice_submission_items')->truncate();
        DB::table('practice_submissions')->truncate();
        DB::table('practice_checklists')->truncate();
        DB::table('practice_rules')->truncate();
        DB::table('materis')->truncate();
        DB::table('guru_profiles')->truncate();
        DB::table('siswa_profiles')->truncate();
        DB::table('users')->truncate();
        DB::table('mapels')->truncate();
        DB::table('kelas')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ----------------------------------------------------------------
        // 1. KELAS (10 kelas)
        // ----------------------------------------------------------------
        $kelasNames = [
            'X RPL 1', 'X RPL 2',
            'XI RPL 1', 'XI RPL 2',
            'XII RPL 1', 'XII RPL 2',
            'X TKJ 1', 'XI TKJ 1',
            'XII TKJ 1', 'X MM 1',
        ];

        $kelasIds = [];
        foreach ($kelasNames as $name) {
            $kelasIds[] = DB::table('kelas')->insertGetId([
                'name'       => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ----------------------------------------------------------------
        // 2. MAPEL (10 mapel)
        // ----------------------------------------------------------------
        $mapelNames = [
            'Pemrograman Web Lanjutan',
            'Basis Data',
            'Jaringan Komputer Lanjutan',
            'Pemrograman Berorientasi Objek',
            'Sistem Operasi',
            'Desain Grafis',
            'Keamanan Jaringan',
            'Pemrograman Mobile',
            'Cloud Computing',
            'Kecerdasan Buatan',
        ];

        $mapelIds = [];
        foreach ($mapelNames as $name) {
            $mapelIds[] = DB::table('mapels')->insertGetId([
                'name'       => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ----------------------------------------------------------------
        // 3. ADMIN (1 admin)
        // ----------------------------------------------------------------
        $adminId = DB::table('users')->insertGetId([
            'name'       => 'Administrator',
            'email'      => 'admin@sekolah.sch.id',
            'password'   => Hash::make('password'),
            'role'       => 'admin',
            'avatar_path'=> null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ----------------------------------------------------------------
        // 4. GURU (20 guru)
        //    Kemungkinan kelas sama tapi beda mapel
        // ----------------------------------------------------------------
        $guruData = [
            ['name' => 'Budi Santoso',      'nip' => '19800101200101001', 'gender' => 'laki-laki', 'kelas_idx' => 0, 'mapel_idx' => 0],
            ['name' => 'Siti Rahayu',       'nip' => '19810202200202002', 'gender' => 'perempuan', 'kelas_idx' => 0, 'mapel_idx' => 1],
            ['name' => 'Ahmad Fauzi',       'nip' => '19820303200303003', 'gender' => 'laki-laki', 'kelas_idx' => 1, 'mapel_idx' => 2],
            ['name' => 'Dewi Lestari',      'nip' => '19830404200404004', 'gender' => 'perempuan', 'kelas_idx' => 1, 'mapel_idx' => 3],
            ['name' => 'Rizky Pratama',     'nip' => '19840505200505005', 'gender' => 'laki-laki', 'kelas_idx' => 2, 'mapel_idx' => 4],
            ['name' => 'Nur Hidayah',       'nip' => '19850606200606006', 'gender' => 'perempuan', 'kelas_idx' => 2, 'mapel_idx' => 5],
            ['name' => 'Eko Prasetyo',      'nip' => '19860707200707007', 'gender' => 'laki-laki', 'kelas_idx' => 3, 'mapel_idx' => 6],
            ['name' => 'Fitri Handayani',   'nip' => '19870808200808008', 'gender' => 'perempuan', 'kelas_idx' => 3, 'mapel_idx' => 7],
            ['name' => 'Hendra Gunawan',    'nip' => '19880909200909009', 'gender' => 'laki-laki', 'kelas_idx' => 4, 'mapel_idx' => 8],
            ['name' => 'Indah Permata',     'nip' => '19891010201010010', 'gender' => 'perempuan', 'kelas_idx' => 4, 'mapel_idx' => 9],
            ['name' => 'Joko Widodo',       'nip' => '19901111201111011', 'gender' => 'laki-laki', 'kelas_idx' => 5, 'mapel_idx' => 0],
            ['name' => 'Kartini Susanti',   'nip' => '19911212201212012', 'gender' => 'perempuan', 'kelas_idx' => 5, 'mapel_idx' => 1],
            ['name' => 'Lukman Hakim',      'nip' => '19920113201301013', 'gender' => 'laki-laki', 'kelas_idx' => 6, 'mapel_idx' => 2],
            ['name' => 'Maya Sari',         'nip' => '19930214201402014', 'gender' => 'perempuan', 'kelas_idx' => 6, 'mapel_idx' => 3],
            ['name' => 'Nanang Kosim',      'nip' => '19940315201503015', 'gender' => 'laki-laki', 'kelas_idx' => 7, 'mapel_idx' => 4],
            ['name' => 'Ovi Kurniawan',     'nip' => '19950416201604016', 'gender' => 'perempuan', 'kelas_idx' => 7, 'mapel_idx' => 5],
            ['name' => 'Putra Mahardika',   'nip' => '19960517201705017', 'gender' => 'laki-laki', 'kelas_idx' => 8, 'mapel_idx' => 6],
            ['name' => 'Qori Ainun',        'nip' => '19970618201806018', 'gender' => 'perempuan', 'kelas_idx' => 8, 'mapel_idx' => 7],
            ['name' => 'Rendi Setiawan',    'nip' => '19980719201907019', 'gender' => 'laki-laki', 'kelas_idx' => 9, 'mapel_idx' => 8],
            ['name' => 'Sri Wahyuni',       'nip' => '19990820202008020', 'gender' => 'perempuan', 'kelas_idx' => 9, 'mapel_idx' => 9],
        ];

        $guruUserIds = [];
        foreach ($guruData as $i => $guru) {
            $userId = DB::table('users')->insertGetId([
                'name'       => $guru['name'],
                'email'      => 'guru' . ($i + 1) . '@sekolah.sch.id',
                'password'   => Hash::make('password'),
                'role'       => 'guru',
                'avatar_path'=> null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('guru_profiles')->insert([
                'user_id'    => $userId,
                'full_name'  => $guru['name'],
                'nip'        => $guru['nip'],
                'gender'     => $guru['gender'],
                'phone'      => '08' . str_pad($i + 1111111111, 10, '0', STR_PAD_LEFT),
                'kelas_id'   => $kelasIds[$guru['kelas_idx']],
                'mapel_id'   => $mapelIds[$guru['mapel_idx']],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $guruUserIds[] = $userId;
        }

        // ----------------------------------------------------------------
        // 5. SISWA — 20 siswa per kelas (10 kelas × 20 = 200 siswa)
        // ----------------------------------------------------------------
        $siswaUserIdsByKelas = []; // [kelas_index => [user_id, ...]]
        $namaDepanL = ['Aldi','Bagas','Cahyo','Daffa','Endra','Fajar','Gilang','Hafiz','Irfan','Jaka','Kevin','Lukman','Mahendra','Nanda','Oky','Pandu','Qusyairi','Raka','Sandi','Taufik'];
        $namaDepanP = ['Alya','Bella','Citra','Dita','Elsa','Fira','Ghina','Hana','Irma','Juwita','Karin','Layla','Mita','Nisa','Ovie','Putri','Qila','Reva','Sinta','Tia'];
        $namaBelakang = ['Pratama','Saputra','Wijaya','Santoso','Kusuma','Nugroho','Hartono','Setiawan','Permana','Hidayat','Lestari','Rahayu','Sari','Dewi','Utami','Anggraini','Fitriani','Maharani','Wulandari','Puspita'];

        $siswaCounter = 1;
        foreach ($kelasIds as $kelasIdx => $kelasId) {
            $siswaUserIdsByKelas[$kelasIdx] = [];
            for ($s = 0; $s < 20; $s++) {
                $gender = ($s % 2 === 0) ? 'laki-laki' : 'perempuan';
                $namaDepan = $gender === 'laki-laki' ? $namaDepanL[$s] : $namaDepanP[$s];
                $namaBelakangPick = $namaBelakang[($kelasIdx + $s) % count($namaBelakang)];
                $fullName = $namaDepan . ' ' . $namaBelakangPick;

                $nisn = str_pad($siswaCounter, 10, '0', STR_PAD_LEFT);
                $userId = DB::table('users')->insertGetId([
                    'name'       => $fullName,
                    'email'      => 'siswa' . $siswaCounter . '@sekolah.sch.id',
                    'password'   => Hash::make('password'),
                    'role'       => 'siswa',
                    'avatar_path'=> null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('siswa_profiles')->insert([
                    'user_id'    => $userId,
                    'full_name'  => $fullName,
                    'nisn'       => $nisn,
                    'gender'     => $gender,
                    'phone'      => '0812' . str_pad($siswaCounter, 8, '0', STR_PAD_LEFT),
                    'kelas_id'   => $kelasId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $siswaUserIdsByKelas[$kelasIdx][] = $userId;
                $siswaCounter++;
            }
        }

        // ----------------------------------------------------------------
        // 6. MATERI (10 materi, 1 per kelas, mapel bergilir)
        //    PDF path: materi_pdfs/example_1.pdf s/d example_10.pdf
        //    → Letakkan file di: storage/app/public/materi_pdfs/
        // ----------------------------------------------------------------
        $materiTopics = [
            ['title' => 'Pengenalan HTML & CSS Dasar',              'praktik' => 'Buat halaman web sederhana menggunakan HTML dan CSS.'],
            ['title' => 'Entity Relationship Diagram (ERD)',        'praktik' => 'Rancang ERD untuk sistem perpustakaan sekolah.'],
            ['title' => 'Konfigurasi IP Address & Subnetting',      'praktik' => 'Konfigurasikan jaringan lokal dengan subnetting /26.'],
            ['title' => 'Konsep OOP: Class dan Object',             'praktik' => 'Implementasikan class Kendaraan beserta turunannya.'],
            ['title' => 'Instalasi dan Konfigurasi Linux',          'praktik' => 'Lakukan instalasi Ubuntu Server dan konfigurasi dasar.'],
            ['title' => 'Prinsip Desain dan Tipografi',             'praktik' => 'Buat poster promosi sekolah menggunakan Canva.'],
            ['title' => 'Firewall dan Packet Filtering',            'praktik' => 'Konfigurasi iptables untuk membatasi akses jaringan.'],
            ['title' => 'Membuat Aplikasi Android Sederhana',       'praktik' => 'Buat aplikasi kalkulator sederhana di Android Studio.'],
            ['title' => 'Pengenalan Layanan AWS & GCP',             'praktik' => 'Deploy aplikasi web statis ke layanan cloud gratis.'],
            ['title' => 'Algoritma Machine Learning Dasar',         'praktik' => 'Implementasikan algoritma K-Nearest Neighbor sederhana.'],
        ];

        $materiIds = [];
        // Guru wali kelas (index guru 0,2,4,6,8,10,12,14,16,18 → kelas 0-9)
        // Kita assign creator ke guru pertama yang mengajar di kelas tersebut
        $guruCreatorByKelas = [0,2,4,6,8,10,12,14,16,18]; // index di $guruUserIds

        foreach ($materiTopics as $i => $topik) {
            $materiId = DB::table('materis')->insertGetId([
                'title'        => $topik['title'],
                'pdf_path'     => 'materi_pdfs/example_' . ($i + 1) . '.pdf',
                'praktik_text' => $topik['praktik'],
                'kelas_id'     => $kelasIds[$i],
                'mapel_id'     => $mapelIds[$i],
                'created_by'   => $guruUserIds[$guruCreatorByKelas[$i]],
                'created_at'   => now()->subDays(30 - $i),
                'updated_at'   => now()->subDays(30 - $i),
            ]);
            $materiIds[] = $materiId;
        }

        // ----------------------------------------------------------------
        // 7. TEST — Per materi: 1 pretest + 2 posttest
        // ----------------------------------------------------------------
        $options = ['a', 'b', 'c', 'd', 'e'];

        // Bank soal per topik (10 soal per test, 3 test per materi = 30 soal per materi)
        // Untuk efisiensi seeder, soal di-generate programatik dengan variasi
        $testIds     = [];  // [materi_index][test_index] => test_id
        $questionMap = [];  // [test_id] => [[question_data], ...]

        foreach ($materiIds as $mi => $materiId) {
            $testIds[$mi] = [];
            $creatorId    = $guruUserIds[$guruCreatorByKelas[$mi]];
            $baseDate     = now()->subDays(20 - $mi * 2);

            $testConfigs = [
                ['type' => 'pretest',  'title' => 'Pretest - ' . $materiTopics[$mi]['title'],    'start_offset' => -14, 'end_offset' => -7],
                ['type' => 'posttest', 'title' => 'Posttest 1 - ' . $materiTopics[$mi]['title'], 'start_offset' => -6,  'end_offset' => -3],
                ['type' => 'posttest', 'title' => 'Posttest 2 - ' . $materiTopics[$mi]['title'], 'start_offset' => -2,  'end_offset' =>  0],
            ];

            foreach ($testConfigs as $ti => $testCfg) {
                $startAt = $baseDate->copy()->addDays($testCfg['start_offset']);
                $endAt   = $baseDate->copy()->addDays($testCfg['end_offset']);

                $testId = DB::table('tests')->insertGetId([
                    'materi_id'        => $materiId,
                    'type'             => $testCfg['type'],
                    'title'            => $testCfg['title'],
                    'duration_minutes' => 45,
                    'start_at'         => $startAt,
                    'end_at'           => $endAt,
                    'is_score_visible' => true,
                    'created_by'       => $creatorId,
                    'created_at'       => $startAt->copy()->subDays(2),
                    'updated_at'       => $startAt->copy()->subDays(2),
                ]);

                $testIds[$mi][$ti] = $testId;

                // Generate 10 soal
                $questionMap[$testId] = [];
                for ($q = 1; $q <= 10; $q++) {
                    $correct = $options[($q + $mi + $ti) % 5]; // pseudo-random correct answer
                    $qId = DB::table('test_questions')->insertGetId([
                        'test_id'        => $testId,
                        'question'       => "Soal no {$q} tentang \"{$materiTopics[$mi]['title']}\" (Test: {$testCfg['title']}). Pilih jawaban yang paling tepat.",
                        'option_a'       => "Jawaban A untuk soal {$q}",
                        'option_b'       => "Jawaban B untuk soal {$q}",
                        'option_c'       => "Jawaban C untuk soal {$q}",
                        'option_d'       => "Jawaban D untuk soal {$q}",
                        'option_e'       => "Jawaban E untuk soal {$q}",
                        'correct_option' => $correct,
                        'order'          => $q,
                        'created_at'     => now(),
                        'updated_at'     => now(),
                    ]);
                    $questionMap[$testId][] = ['id' => $qId, 'correct' => $correct];
                }
            }
        }

        // ----------------------------------------------------------------
        // 8. TEST ATTEMPTS & ANSWERS
        //    Setiap siswa di suatu kelas mengerjakan semua test di materi kelasnya
        //    Ada yang benar ada yang salah — simulasi realistis
        // ----------------------------------------------------------------
        // Seed deterministic random per siswa agar hasil konsisten
        foreach ($kelasIds as $kelasIdx => $kelasId) {
            $siswaIds = $siswaUserIdsByKelas[$kelasIdx];

            // Materi yang ada di kelas ini
            $materiIdx = $kelasIdx; // 1-to-1 mapping kelas ke materi
            $testsForKelas = $testIds[$materiIdx]; // 3 tests

            foreach ($siswaIds as $sIdx => $siswaUserId) {
                foreach ($testsForKelas as $ti => $testId) {
                    // Tidak semua siswa selesai — ~90% selesai, 10% tidak selesai
                    $isFinished = (($sIdx * 3 + $ti + $kelasIdx) % 10) !== 0;
                    $status     = $isFinished ? 'submitted' : 'in_progress';

                    $startedAt  = now()->subDays(15 - $kelasIdx)->addMinutes($sIdx * 5 + $ti * 2);
                    $finishedAt = $isFinished
                        ? $startedAt->copy()->addMinutes(rand(20, 44))
                        : null;

                    $durationSeconds = $isFinished
                        ? (int) abs($finishedAt->diffInSeconds($startedAt))
                        : null;

                    // Score dihitung setelah insert jawaban
                    $attemptId = DB::table('test_attempts')->insertGetId([
                        'test_id'         => $testId,
                        'student_user_id' => $siswaUserId,
                        'started_at'      => $startedAt,
                        'finished_at'     => $finishedAt,
                        'score'           => 0, // akan di-update
                        'status'          => $status,
                        'duration_seconds'=> $durationSeconds,
                        'created_at'      => $startedAt,
                        'updated_at'      => $finishedAt ?? $startedAt,
                    ]);

                    // Insert jawaban
                    $correctCount = 0;
                    $questions    = $questionMap[$testId];

                    foreach ($questions as $qIdx => $qData) {
                        // Simulasi: siswa ke-i punya "kemampuan" tertentu
                        // Siswa dengan index genap lebih pintar (~80% benar)
                        // Siswa index ganjil ~60% benar
                        $abilityThreshold = ($sIdx % 2 === 0) ? 8 : 6; // dari 10
                        $isCorrect        = ($qIdx < $abilityThreshold);

                        // Sedikit variasi berdasarkan test type (posttest lebih baik dari pretest)
                        if ($ti > 0 && $qIdx === $abilityThreshold) {
                            $isCorrect = true; // bonus 1 soal benar untuk posttest
                        }

                        $selectedOption = $isCorrect
                            ? $qData['correct']
                            : $options[($qData['correct'] === 'a') ? 1 : 0]; // pilih jawaban salah

                        DB::table('test_answers')->insert([
                            'attempt_id'      => $attemptId,
                            'question_id'     => $qData['id'],
                            'selected_option' => $selectedOption,
                            'is_correct'      => $isCorrect,
                            'created_at'      => $startedAt->copy()->addSeconds($qIdx * 30 + rand(10, 60)),
                            'updated_at'      => $startedAt->copy()->addSeconds($qIdx * 30 + rand(10, 60)),
                        ]);

                        if ($isCorrect) $correctCount++;
                    }

                    // Update score (skala 0-100)
                    $score = $isFinished ? (int) round(($correctCount / count($questions)) * 100) : 0;
                    DB::table('test_attempts')->where('id', $attemptId)->update([
                        'score'      => $score,
                        'updated_at' => $finishedAt ?? $startedAt,
                    ]);
                }
            }
        }

        $this->command->info('✅ Seeder selesai!');
        $this->command->info('');
        $this->command->info('📁 PENTING: Letakkan 10 file PDF materi di:');
        $this->command->info('   storage/app/public/materi_pdfs/');
        $this->command->info('');
        $this->command->info('   Nama file yang dibutuhkan:');
        for ($i = 1; $i <= 10; $i++) {
            $this->command->info("   - example_{$i}.pdf");
        }
        $this->command->info('');
        $this->command->info('   Pastikan sudah menjalankan: php artisan storage:link');
        $this->command->info('');
        $this->command->info('📊 Summary data yang dibuat:');
        $this->command->info('   - 1 Admin');
        $this->command->info('   - 10 Kelas');
        $this->command->info('   - 10 Mapel');
        $this->command->info('   - 20 Guru');
        $this->command->info('   - 200 Siswa (20 per kelas)');
        $this->command->info('   - 10 Materi');
        $this->command->info('   - 30 Test (3 per materi: 1 pretest, 2 posttest)');
        $this->command->info('   - 300 Soal (10 per test)');
        $this->command->info('   - ~600 Test Attempts (3 test × 200 siswa, ~10% tidak selesai)');
        $this->command->info('   - ~6000 Test Answers');
    }
}