<?php

namespace App\Services;

use App\Models\Materi;
use App\Models\PracticeSubmission;
use App\Models\Test;
use App\Models\TestAttempt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use ZipArchive;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class MateriResultsExportService
{
    public function download(Materi $materi, $user)
    {
        $materi->loadMissing(['kelas:id,name', 'mapel:id,name']);

        $disk = Storage::disk('local');
        $baseDir = 'exports/materi-' . $materi->id . '-' . now()->format('YmdHis');
        $zipPath = storage_path('app/' . $baseDir . '.zip');
        $tempDir = storage_path('app/' . $baseDir);

        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0777, true);
        }

        $praktikDir = $tempDir . '/Praktik';
        $pretestDir = $tempDir . '/Pretest';
        $posttestDir = $tempDir . '/Posttest';

        foreach ([$praktikDir, $pretestDir, $posttestDir] as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }
        }

        $this->exportPraktik($materi, $praktikDir . '/praktik.xlsx');
        $this->exportTests($materi, 'pretest', $pretestDir);
        $this->exportTests($materi, 'posttest', $posttestDir);

        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $this->addFolderToZip($zip, $tempDir, '');
        $zip->close();

        $filename = Str::slug($materi->title ?: 'materi') . '.zip';

        return response()->download($zipPath, $filename)->deleteFileAfterSend(true);
    }

    private function exportPraktik(Materi $materi, string $filePath): void
    {
        $rows = PracticeSubmission::query()
            ->with([
                'student:id,name,email',
                'student.siswaProfile:user_id,full_name',
                'grader:id,name,role',
                'grader.guruProfile:user_id,full_name',
            ])
            ->where('materi_id', $materi->id)
            ->whereIn('status', ['submitted', 'graded'])
            ->orderByDesc('submitted_at')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Hasil Praktik');

        $sheet->fromArray([
            ['Nama Lengkap', 'Nilai', 'Submitted At', 'Dinilai Oleh', 'Graded At'],
        ]);

        $rowIndex = 2;
        foreach ($rows as $row) {
            $graderName = null;
            if ($row->grader) {
                $graderName = $row->grader->role === 'admin'
                    ? 'Admin'
                    : ($row->grader->guruProfile?->full_name ?: $row->grader->name);
            }

            $sheet->fromArray([[
                $row->student?->siswaProfile?->full_name ?: ($row->student?->name ?: '-'),
                $row->total_score ?? 0,
                optional($row->submitted_at)->toDateTimeString() ?: '-',
                $graderName ?: '-',
                optional($row->graded_at)->toDateTimeString() ?: '-',
            ]], null, 'A' . $rowIndex);

            $rowIndex++;
        }

        if ($rowIndex > 2) {
            $sheet->getStyle("B2:B" . ($rowIndex - 1))
                ->getNumberFormat()
                ->setFormatCode('0.00');
        }

        $this->styleWorksheet($sheet, max(2, $rowIndex - 1), 'E');

        (new Xlsx($spreadsheet))->save($filePath);
    }

    private function exportTests(Materi $materi, string $type, string $dir): void
    {
        $tests = Test::query()
            ->where('materi_id', $materi->id)
            ->where('type', $type)
            ->get(['id', 'title']);

        foreach ($tests as $test) {
            $rows = TestAttempt::query()
                ->with([
                    'student:id,name,email',
                    'student.siswaProfile:user_id,full_name',
                    'answers:id,attempt_id,is_correct',
                ])
                ->where('test_id', $test->id)
                ->where('status', 'submitted')
                ->orderByDesc('finished_at')
                ->get();

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle(Str::limit($test->title ?: $type, 28, ''));

            $sheet->fromArray([
                ['Nama Lengkap', 'Nilai', 'Benar', 'Salah', 'Submitted At'],
            ]);

            $rowIndex = 2;
            foreach ($rows as $row) {
                $correct = $row->answers->where('is_correct', true)->count();
                $wrong = $row->answers->where('is_correct', false)->count();

                $sheet->fromArray([[
                    $row->student?->siswaProfile?->full_name ?: ($row->student?->name ?: '-'),
                    $row->score ?? 0,
                    $correct,
                    $wrong,
                    optional($row->finished_at)->toDateTimeString() ?: '-',
                ]], null, 'A' . $rowIndex);

                $rowIndex++;
            }

            if ($rowIndex > 2) {
                $sheet->getStyle("B2:B" . ($rowIndex - 1))
                    ->getNumberFormat()
                    ->setFormatCode('0.00');
            }

            $this->styleWorksheet($sheet, max(2, $rowIndex - 1), 'E');

            $path = $dir . '/' . Str::slug($test->title ?: $type) . '.xlsx';
            (new Xlsx($spreadsheet))->save($path);
        }
    }

    private function addFolderToZip(ZipArchive $zip, string $folder, string $zipPrefix): void
    {
        $files = scandir($folder);
        foreach ($files as $file) {
            if (in_array($file, ['.', '..'], true)) continue;
            $full = $folder . DIRECTORY_SEPARATOR . $file;
            $local = ltrim($zipPrefix . '/' . $file, '/');

            if (is_dir($full)) {
                $zip->addEmptyDir($local);
                $this->addFolderToZip($zip, $full, $local);
            } else {
                $zip->addFile($full, $local);
            }
        }
    }

    private function styleWorksheet(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet, int $lastRow, string $lastColumn): void
{
    $headerRange = "A1:{$lastColumn}1";
    $bodyRange = "A2:{$lastColumn}{$lastRow}";
    $fullRange = "A1:{$lastColumn}{$lastRow}";

    $sheet->freezePane('A2');
    $sheet->setAutoFilter($headerRange);

    $sheet->getStyle($headerRange)->applyFromArray([
        'font' => [
            'bold' => true,
            'color' => ['rgb' => 'FFFFFF'],
            'size' => 11,
        ],
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => ['rgb' => '1F4E78'],
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical' => Alignment::VERTICAL_CENTER,
        ],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => 'D9E2F3'],
            ],
        ],
    ]);

    if ($lastRow >= 2) {
        $sheet->getStyle($bodyRange)->applyFromArray([
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'E5E7EB'],
                ],
            ],
        ]);

        for ($row = 2; $row <= $lastRow; $row++) {
            if ($row % 2 === 0) {
                $sheet->getStyle("A{$row}:{$lastColumn}{$row}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F8FAFC'],
                    ],
                ]);
            }
        }
    }

    foreach (range('A', $lastColumn) as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    $sheet->getRowDimension(1)->setRowHeight(24);
}
}