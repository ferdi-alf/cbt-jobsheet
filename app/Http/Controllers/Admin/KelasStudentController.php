<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KelasStudentController extends Controller
{
    public function index(Kelas $kelas, Request $request)
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, (int) $request->query('limit', 10));
        $search = trim((string) $request->query('search', ''));

        $query = DB::table('siswa_profiles')
            ->join('users', 'users.id', '=', 'siswa_profiles.user_id')
            ->where('siswa_profiles.kelas_id', $kelas->id)
            ->select([
                'users.id as id',
                'users.email as email',
                'users.name as username',
                'siswa_profiles.full_name as full_name',
                'siswa_profiles.nisn as nisn',
                'siswa_profiles.gender as gender',
                'siswa_profiles.phone as phone',
                'users.created_at as created_at',
            ])
            ->orderBy('siswa_profiles.full_name');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('siswa_profiles.full_name', 'like', "%{$search}%")
                  ->orWhere('users.email', 'like', "%{$search}%")
                  ->orWhere('siswa_profiles.nisn', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate($limit, ['*'], 'page', $page);

        $items = collect($paginator->items())->map(function ($s) {
            return [
                'id' => $s->id,
                'email' => $s->email,
                'username' => $s->username,
                'full_name' => $s->full_name,
                'nisn' => $s->nisn,
                'gender' => $s->gender,
                'phone' => $s->phone,
                'created_at' => optional($s->created_at)->toDateTimeString(),
            ];
        })->values();

        $total = $paginator->total();
        $totalPages = (int) ceil($total / $limit);

        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'total' => $total,
                'page' => $paginator->currentPage(),
                'limit' => $limit,
                'totalPages' => $totalPages,
                'hasNextPage' => $paginator->hasMorePages(),
                'hasPrevPage' => $paginator->currentPage() > 1,
            ],
            'error' => null,
        ]);
    }
}