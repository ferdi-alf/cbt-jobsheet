<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mapel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MapelGuruController extends Controller
{
    public function index(Mapel $mapel, Request $request)
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, (int) $request->query('limit', 10));
        $search = trim((string) $request->query('search', ''));

        $query = DB::table('guru_profiles as gp')
            ->join('users as u', 'u.id', '=', 'gp.user_id')
            ->leftJoin('kelas as k', 'k.id', '=', 'gp.kelas_id')
            ->where('gp.mapel_id', $mapel->id)
            ->select([
                'u.id as id',
                'u.email as email',
                'u.name as username',
                'gp.full_name as full_name',
                'gp.nip as nip',
                'gp.gender as gender',
                'gp.phone as phone',
                'k.name as kelas',
                'u.created_at as created_at',
            ])
            ->orderBy('gp.full_name');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('gp.full_name', 'like', "%{$search}%")
                  ->orWhere('u.email', 'like', "%{$search}%")
                  ->orWhere('gp.nip', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate($limit, ['*'], 'page', $page);

        $items = collect($paginator->items())->map(fn ($g) => [
            'id' => $g->id,
            'email' => $g->email,
            'username' => $g->username,
            'full_name' => $g->full_name,
            'nip' => $g->nip,
            'gender' => $g->gender,
            'phone' => $g->phone,
            'kelas' => $g->kelas,
            'created_at' => optional($g->created_at)->toDateTimeString(),
        ])->values();

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
