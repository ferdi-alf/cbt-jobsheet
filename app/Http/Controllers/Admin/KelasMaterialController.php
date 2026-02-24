<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use Illuminate\Support\Facades\DB;

class KelasMaterialController extends Controller
{
    public function index(Kelas $kelas)
    {
        $rows = DB::table('materis')
            ->join('users', 'users.id', '=', 'materis.created_by')
            ->where('materis.kelas_id', $kelas->id)
            ->orderByDesc('materis.id')
            ->select([
                'materis.id',
                'materis.title',
                'materis.pdf_path',
                'materis.created_at',
                'users.id as user_id',
                'users.name as user_name',
                'users.email as user_email',
            ])
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'title' => $m->title,
                    'pdf_url' => $m->pdf_path ? asset('storage/'.$m->pdf_path) : null,
                    'created_at' => optional($m->created_at)->toDateTimeString(),
                    'created_by' => [
                        'id' => $m->user_id,
                        'name' => $m->user_name,
                        'email' => $m->user_email,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $rows,
            'error' => null,
        ]);
    }
}
