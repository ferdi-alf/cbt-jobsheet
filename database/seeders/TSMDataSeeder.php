<?php

namespace Database\Seeders;

use App\Models\Materi;
use App\Models\SiswaProfile;
use App\Models\Test;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestQuestion;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TSMDataSeeder extends Seeder
{
    /**
     * Jawaban benar per nomor soal (1-based index)
     * Q1=d, Q2=b, Q3=a, Q4=c, Q5=d, Q6=c, Q7=b,
     * Q8=b, Q9=d, Q10=a, Q11=c, Q12=c, Q13=a, Q14=b, Q15=a
     */
    private array $correctAnswers = [
        1  => 'd',
        2  => 'b',
        3  => 'a',
        4  => 'c',
        5  => 'd',
        6  => 'c',
        7  => 'b',
        8  => 'b',
        9  => 'd',
        10 => 'a',
        11 => 'c',
        12 => 'c',
        13 => 'a',
        14 => 'b',
        15 => 'a',
    ];

    public function run(): void
    {
        // Ambil creator dari materi id=1 yang sudah ada
        $materi    = Materi::find(1);
        $creatorId = $materi?->created_by
            ?? User::where('role', 'guru')->first()?->id
            ?? User::where('role', 'admin')->first()?->id;

        if (!$creatorId) {
            $this->command->error('Tidak ada user guru/admin ditemukan. Tambahkan dulu sebelum run seeder ini.');
            return;
        }

        $this->command->info('Membuat Pretest & Posttest TSM...');

        // -------------------------------------------------------
        // 1. Buat Test: Pretest
        // -------------------------------------------------------
        $pretest = Test::create([
            'materi_id'        => 1,
            'type'             => 'pretest',
            'title'            => 'Pretest TSM',
            'duration_minutes' => 60,
            'start_at'         => Carbon::parse('2025-01-13 07:00:00'),
            'end_at'           => Carbon::parse('2025-01-13 09:00:00'),
            'is_score_visible' => true,
            'created_by'       => $creatorId,
        ]);

        // -------------------------------------------------------
        // 2. Buat Test: Posttest
        // -------------------------------------------------------
        $posttest = Test::create([
            'materi_id'        => 1,
            'type'             => 'posttest',
            'title'            => 'Posttest TSM',
            'duration_minutes' => 60,
            'start_at'         => Carbon::parse('2025-06-02 07:00:00'),
            'end_at'           => Carbon::parse('2025-06-02 09:00:00'),
            'is_score_visible' => true,
            'created_by'       => $creatorId,
        ]);

        $this->command->info("Pretest ID: {$pretest->id} | Posttest ID: {$posttest->id}");

        // -------------------------------------------------------
        // 3. Buat Soal (sama untuk pretest & posttest)
        // -------------------------------------------------------
        $questionsData = $this->getQuestionsData();

        $pretestQuestions  = [];
        $posttestQuestions = [];

        foreach ($questionsData as $index => $q) {
            $no            = $index + 1;
            $correctOption = $this->correctAnswers[$no];

            $pretestQuestions[] = TestQuestion::create([
                'test_id'        => $pretest->id,
                'question'       => $q['question'],
                'option_a'       => $q['option_a'],
                'option_b'       => $q['option_b'],
                'option_c'       => $q['option_c'],
                'option_d'       => $q['option_d'],
                'option_e'       => $q['option_e'],
                'correct_option' => $correctOption,
                'order'          => $no,
            ]);

            $posttestQuestions[] = TestQuestion::create([
                'test_id'        => $posttest->id,
                'question'       => $q['question'],
                'option_a'       => $q['option_a'],
                'option_b'       => $q['option_b'],
                'option_c'       => $q['option_c'],
                'option_d'       => $q['option_d'],
                'option_e'       => $q['option_e'],
                'correct_option' => $correctOption,
                'order'          => $no,
            ]);
        }

        $this->command->info('15 soal berhasil dibuat untuk masing-masing test.');

        // -------------------------------------------------------
        // 4. Buat 32 Siswa + Attempt + Answers
        // -------------------------------------------------------
        $studentsData = $this->getStudentsData();
        $this->command->info('Membuat 32 siswa beserta attempt & jawaban...');

        foreach ($studentsData as $i => $studentData) {
            $no = $i + 1;

            // Buat User siswa
            $email = 'siswa_' . $studentData['nisn'] . '@smk.sch.id';
            $user  = User::create([
                'name'     => $studentData['name'],
                'email'    => $email,
                'password' => Hash::make('password'),
                'role'     => 'siswa',
            ]);

            // Buat Siswa Profile
            SiswaProfile::create([
                'user_id'   => $user->id,
                'full_name' => $studentData['name'],
                'nisn'      => $studentData['nisn'],
                'gender'    => 'laki-laki',
                'phone'     => '08' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT),
                'kelas_id'  => 1,
            ]);

            // --- PRETEST ATTEMPT ---
            $pretestCorrectCount = $this->targetScoreToCorrectCount($studentData['pretest_score']);
            $pretestActualScore  = $this->correctCountToScore($pretestCorrectCount);
            $pretestStarted      = Carbon::parse('2025-01-13 07:00:00')->addMinutes(rand(0, 10));
            $pretestDuration     = rand(1800, 3200); // 30-53 menit

            $pretestAttempt = TestAttempt::create([
                'test_id'          => $pretest->id,
                'student_user_id'  => $user->id,
                'started_at'       => $pretestStarted,
                'finished_at'      => $pretestStarted->copy()->addSeconds($pretestDuration),
                'score'            => $pretestActualScore,
                'status'           => 'submitted',
                'duration_seconds' => $pretestDuration,
            ]);

            $this->createAnswers($pretestAttempt, $pretestQuestions, $pretestCorrectCount);

            // --- POSTTEST ATTEMPT ---
            $posttestCorrectCount = $this->targetScoreToCorrectCount($studentData['posttest_score']);
            $posttestActualScore  = $this->correctCountToScore($posttestCorrectCount);
            $posttestStarted      = Carbon::parse('2025-06-02 07:00:00')->addMinutes(rand(0, 10));
            $posttestDuration     = rand(1800, 3200);

            $posttestAttempt = TestAttempt::create([
                'test_id'          => $posttest->id,
                'student_user_id'  => $user->id,
                'started_at'       => $posttestStarted,
                'finished_at'      => $posttestStarted->copy()->addSeconds($posttestDuration),
                'score'            => $posttestActualScore,
                'status'           => 'submitted',
                'duration_seconds' => $posttestDuration,
            ]);

            $this->createAnswers($posttestAttempt, $posttestQuestions, $posttestCorrectCount);

            $this->command->line(
                "  [{$no}/32] {$studentData['name']} | "
                . "Pretest: {$pretestActualScore} (target {$studentData['pretest_score']}) | "
                . "Posttest: {$posttestActualScore} (target {$studentData['posttest_score']})"
            );
        }

        $this->command->info('✅ TSMDataSeeder selesai!');
    }

    /**
     * Hitung jumlah jawaban benar dari target score (0-100) dengan 15 soal.
     */
    private function targetScoreToCorrectCount(int $targetScore): int
    {
        return (int) round($targetScore * 15 / 100);
    }

    /**
     * Hitung score (0-100) dari jumlah jawaban benar dengan 15 soal.
     */
    private function correctCountToScore(int $correctCount): int
    {
        return (int) round($correctCount * 100 / 15);
    }

    /**
     * Buat TestAnswer untuk satu attempt.
     * $correctCount soal dijawab benar, sisanya salah (opsi salah dipilih secara acak).
     */
    private function createAnswers(TestAttempt $attempt, array $questions, int $correctCount): void
    {
        $total = count($questions);

        // Tentukan indeks mana yang dijawab BENAR (acak)
        $allIndices    = range(0, $total - 1);
        shuffle($allIndices);
        $correctIndices = array_flip(array_slice($allIndices, 0, $correctCount)); // indeks yang benar

        foreach ($questions as $i => $question) {
            $questionNo     = $question->order; // pakai order, bukan indeks array
            $correctOption  = $this->correctAnswers[$questionNo];
            $isCorrect      = isset($correctIndices[$i]);

            if ($isCorrect) {
                $selectedOption = $correctOption;
            } else {
                $allOptions   = ['a', 'b', 'c', 'd', 'e'];
                $wrongOptions = array_values(array_filter($allOptions, fn($o) => $o !== $correctOption));
                $selectedOption = $wrongOptions[array_rand($wrongOptions)];
            }

            TestAnswer::create([
                'attempt_id'      => $attempt->id,
                'question_id'     => $question->id,
                'selected_option' => $selectedOption,
                'is_correct'      => $isCorrect,
            ]);
        }
    }

    // -------------------------------------------------------
    // DATA SOAL
    // -------------------------------------------------------
    private function getQuestionsData(): array
    {
        return [
            // Soal 1
            [
                'question' => 'Pada dibawah ini yang merupakan komponen Rem Tromol ialah....',
                'option_a' => 'Piringan cakram',
                'option_b' => 'Selang Fluida',
                'option_c' => 'Control Intake manifold',
                'option_d' => 'Panel Rem',
                'option_e' => 'Brake caliper',
            ],
            // Soal 2
            [
                'question' => "Perhatikan keterangan berikut:\n"
                    . "1. Sebagai mengurangi kecepatan laju kendaraan.\n"
                    . "2. Sebagai tempat keposisian.\n"
                    . "3. Untuk menstabilkan kemudi.\n"
                    . "4. Untuk memutar kendaraan.\n\n"
                    . "Pada keterangan diatas nomor berapakah fungsi dari Sistem Rem....",
                'option_a' => '0',
                'option_b' => '1',
                'option_c' => '2',
                'option_d' => '3',
                'option_e' => '4',
            ],
            // Soal 3
            [
                'question' => 'Suatu komponen berbentuk cairan berfungsi sebagai penyuplai tekanan yg dimampatkan piston caliper bekerja dengan sempurna....',
                'option_a' => 'Minyak Rem/Fluida',
                'option_b' => 'Brake Pad',
                'option_c' => 'Air condition',
                'option_d' => 'Brake shoe',
                'option_e' => 'Brake caliper',
            ],
            // Soal 4 (ada gambar — siswa isi sendiri)
            [
                'question' => 'Pada Gambar dibawah merupakan pembongkaran komponen ialah....',
                'option_a' => 'Pembersihan rem',
                'option_b' => 'Pengecekan rem',
                'option_c' => 'Pembongkaran kampas rem',
                'option_d' => 'Pencucian rem',
                'option_e' => 'Penglihatan rem',
            ],
            // Soal 5
            [
                'question' => 'Apa kegunaan oli shock absorber....',
                'option_a' => 'Melumasi komponen Transmisi',
                'option_b' => 'Melumasi shock absorber teleskopik',
                'option_c' => 'Media pengisi system rem hydrolik',
                'option_d' => 'Meredam kejutan pada shock absorber',
                'option_e' => 'Mendinginkan mesin kendaraan',
            ],
            // Soal 6
            [
                'question' => "Perhatikan bagian sistem berikut:\n"
                    . "1. Sistem Mekanisme katup\n"
                    . "2. Sistem Rem\n"
                    . "3. Sistem Suspensi\n"
                    . "4. Sistem Pelumasan\n\n"
                    . "Pada bagian sistem diatas yang mana merupakan dari Engine/Mesin....",
                'option_a' => '1 & 3',
                'option_b' => '2 & 4',
                'option_c' => '1 & 4',
                'option_d' => '3 & 4',
                'option_e' => '2 & 3',
            ],
            // Soal 7 (ada gambar)
            [
                'question' => 'Pengukuran komponen dibawah ini merupakan…..',
                'option_a' => 'Pengukuran Kelep/Valve',
                'option_b' => 'Pengukuran Kampas kopling',
                'option_c' => 'Pengukuran kampas rem',
                'option_d' => 'Pengukuran spring coil',
                'option_e' => 'Pengukuran celah busi',
            ],
            // Soal 8 (ada gambar)
            [
                'question' => 'Pada Gambar dibawah ini merupakan nama komponen…..',
                'option_a' => 'Baterai',
                'option_b' => 'CDI/ECU',
                'option_c' => 'Coil',
                'option_d' => 'Spull/coil lighting',
                'option_e' => 'Regulator/kiprok',
            ],
            // Soal 9 (ada gambar)
            [
                'question' => 'Pada Gambar dibawah ini merupakan nama komponen….. (Regulator)',
                'option_a' => 'Baterai',
                'option_b' => 'CDI',
                'option_c' => 'Coil',
                'option_d' => 'Regulator/kiprok',
                'option_e' => 'Spull/coil lighting',
            ],
            // Soal 10 (ada gambar)
            [
                'question' => 'Pada Gambar dibawah ini merupakan nama komponen….. (Baterai)',
                'option_a' => 'Baterai',
                'option_b' => 'CDI',
                'option_c' => 'Coil',
                'option_d' => 'Spull/coil lighting',
                'option_e' => 'Regulator/kiprok',
            ],
            // Soal 11
            [
                'question' => 'Yang mana alat pengukuran pada baterai/accu basah…..',
                'option_a' => 'Jangka sorong',
                'option_b' => 'Micrometer',
                'option_c' => 'Hidrometer',
                'option_d' => 'Compression tester',
                'option_e' => 'Multimeter',
            ],
            // Soal 12
            [
                'question' => 'Suara komponen apa untuk memperingatkan atau memberi sinyal kepada orang atau kendaraan di sekitar Anda....',
                'option_a' => 'Lampu sein',
                'option_b' => 'Lampu senja',
                'option_c' => 'Klakson',
                'option_d' => 'Lampu rem',
                'option_e' => 'Lampu hazard',
            ],
            // Soal 13
            [
                'question' => 'Fungsi Lampu Sein merupakan ....',
                'option_a' => 'Untuk memberi tanda kendaraan berbelok, berhenti dan mendahului objek lain',
                'option_b' => 'Untuk memberi sinyal belok',
                'option_c' => 'Untuk memberi tanda potong',
                'option_d' => 'Untuk menindak lanjut kendaraan',
                'option_e' => 'Untuk memberi tanda bahaya darurat',
            ],
            // Soal 14 (ada gambar fuse biru)
            [
                'question' => 'Perhatikan pada sekring/FUSE pada warna biru tersebut, merupakan sekring berapa ampere....',
                'option_a' => '10A',
                'option_b' => '15A',
                'option_c' => '20A',
                'option_d' => '25A',
                'option_e' => '30A',
            ],
            // Soal 15
            [
                'question' => 'Pada Sistem Injeksi ada 3 (Tiga) Bagian Utama, yang mana paling benar…..',
                'option_a' => 'Actuator, Control, dan Sensor',
                'option_b' => 'Actuator, excekutor dan sensor',
                'option_c' => 'Excekutor, sensor, dan actuator',
                'option_d' => 'Sensor, control, dan excekutor',
                'option_e' => 'Control, excekutor, dan sensor',
            ],
        ];
    }

    // -------------------------------------------------------
    // DATA 32 SISWA (dari gambar sumatif akhir semester)
    // pretest_score  = NILAI_NON_TES
    // posttest_score = NILAI_TES
    // -------------------------------------------------------
    private function getStudentsData(): array
    {
        return [
            ['name' => 'ADE SEPTA PARAS',          'nisn' => '0054963692', 'pretest_score' => 79, 'posttest_score' => 89],
            ['name' => 'ARZAQ HIBATULLAH',          'nisn' => '0083454423', 'pretest_score' => 79, 'posttest_score' => 86],
            ['name' => 'DENIS RIZALDI',             'nisn' => '0087890453', 'pretest_score' => 71, 'posttest_score' => 83],
            ['name' => 'DERI ANUGRAH',              'nisn' => '0082247855', 'pretest_score' => 78, 'posttest_score' => 94],
            ['name' => 'DERI APRIANSYAH',           'nisn' => '0056416969', 'pretest_score' => 89, 'posttest_score' => 85],
            ['name' => 'DIMAS PRAYOGA',             'nisn' => '0089991019', 'pretest_score' => 72, 'posttest_score' => 92],
            ['name' => 'ERI SEPTIAWAN',             'nisn' => '0078224506', 'pretest_score' => 90, 'posttest_score' => 92],
            ['name' => 'EZZY SATRIA WIJAYA',        'nisn' => '0085770220', 'pretest_score' => 81, 'posttest_score' => 94],
            ['name' => 'FAKHRI PUTRA GALUH',        'nisn' => '0087212654', 'pretest_score' => 81, 'posttest_score' => 91],
            ['name' => 'FERY PAMUNGKAS',            'nisn' => '3082482694', 'pretest_score' => 78, 'posttest_score' => 97],
            ['name' => 'FIRMAN TRI UTOMO',          'nisn' => '0084768741', 'pretest_score' => 86, 'posttest_score' => 85],
            ['name' => 'KEYSAH ALVARO',             'nisn' => '0085207846', 'pretest_score' => 81, 'posttest_score' => 87],
            ['name' => 'M. ABDILLAH LUBIS',         'nisn' => '0085893247', 'pretest_score' => 78, 'posttest_score' => 85],
            ['name' => 'M. ARIF RAMANDA',           'nisn' => '0075046227', 'pretest_score' => 81, 'posttest_score' => 90],
            ['name' => 'M. FAJRI KAREL AL-IZZY',   'nisn' => '0093955166', 'pretest_score' => 81, 'posttest_score' => 86],
            ['name' => 'M. RAFFI PUTRA PRATAMA',   'nisn' => '0087098334', 'pretest_score' => 65, 'posttest_score' => 95],
            ['name' => 'M. RAFLI AL-FATHIR',       'nisn' => '0074332893', 'pretest_score' => 66, 'posttest_score' => 93],
            ['name' => 'MUHAMAD HAFIZ',             'nisn' => '0089745821', 'pretest_score' => 83, 'posttest_score' => 94],
            ['name' => 'MUHAMMAD AL FAHRI',         'nisn' => '0097374998', 'pretest_score' => 94, 'posttest_score' => 92],
            ['name' => 'MUHAMMAD RAAFI',            'nisn' => '0085696223', 'pretest_score' => 89, 'posttest_score' => 88],
            ['name' => 'MUHAMMAD RAIHAN',           'nisn' => '0078864442', 'pretest_score' => 92, 'posttest_score' => 97],
            ['name' => 'MUHAMMAD RAKHA HAFISYAH',  'nisn' => '0072323429', 'pretest_score' => 65, 'posttest_score' => 96],
            ['name' => 'MUHAMMAD RIZKI PUTRA',     'nisn' => '0092221556', 'pretest_score' => 88, 'posttest_score' => 83],
            ['name' => 'MUHAMMAD ZACKY DARMAWAN', 'nisn' => '0092477279', 'pretest_score' => 69, 'posttest_score' => 95],
            ['name' => 'NAZIO IJLAL PRANATA',      'nisn' => '0096661244', 'pretest_score' => 89, 'posttest_score' => 88],
            ['name' => 'NOPRI FAHMI ZAIDI',         'nisn' => '0073536027', 'pretest_score' => 84, 'posttest_score' => 94],
            ['name' => 'RAFIF M. DZAKI',            'nisn' => '0083237796', 'pretest_score' => 83, 'posttest_score' => 90],
            ['name' => 'REY ELYANO',                'nisn' => '0092156611', 'pretest_score' => 71, 'posttest_score' => 92],
            ['name' => 'REYVAN PRATAMA',            'nisn' => '0084199761', 'pretest_score' => 77, 'posttest_score' => 85],
            ['name' => 'RONA ROHMATUL IKHSAN',     'nisn' => '0081816886', 'pretest_score' => 68, 'posttest_score' => 87],
            ['name' => 'TEGAR DEWA PRAKARSA',      'nisn' => '0074085687', 'pretest_score' => 85, 'posttest_score' => 83],
            ['name' => 'YUSUF AL IMAM SUBANDI',    'nisn' => '0083689002', 'pretest_score' => 89, 'posttest_score' => 93],
        ];
    }
}