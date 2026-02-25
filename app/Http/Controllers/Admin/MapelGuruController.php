<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mapel;
use App\Support\Api\PaginatesApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MapelGuruController extends Controller
{
    use PaginatesApi;

    public function index(Mapel $mapel, Request $request)
    {
        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

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

        $this->applySearch($query, $search, [
            'gp.full_name',
            'u.email',
            'gp.nip',
        ]);

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
            'created_at' => (string) $g->created_at,
        ])->values();

        return $this->paginatedResponse($paginator, $items);
    }
}