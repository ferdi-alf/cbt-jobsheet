<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Support\Api\PaginatesApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KelasStudentController extends Controller
{
    use PaginatesApi;

    public function index(Kelas $kelas, Request $request)
    {
        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

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

        $this->applySearch($query, $search, [
            'siswa_profiles.full_name',
            'users.email',
            'siswa_profiles.nisn',
        ]);

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
                'created_at' => (string) $s->created_at,
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }
}