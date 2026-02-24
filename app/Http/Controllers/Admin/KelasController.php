<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\KelasStoreRequest;
use App\Http\Requests\Admin\KelasUpdateRequest;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class KelasController extends Controller
{
    public function index(Request $request)
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, (int) $request->query('limit', 10));
        $search = trim((string) $request->query('search', ''));

        $query = Kelas::query()->orderByDesc('id');

        if ($search !== '') {
            $query->where('name', 'like', "%{$search}%");
        }

        $query->withCount([
            'siswaProfiles as total_students',
        ]);

        $query->addSelect([
            'total_guru' => DB::table('guru_profiles')
                ->selectRaw('COUNT(DISTINCT user_id)')
                ->whereColumn('guru_profiles.kelas_id', 'kelas.id'),
        ]);

        $paginator = $query->paginate($limit, ['*'], 'page', $page);

        $items = collect($paginator->items())->map(function ($k) {
            return [
                'id' => $k->id,
                'name' => $k->name,
                'total_students' => (int) ($k->total_students ?? 0),
                'total_guru' => (int) ($k->total_guru ?? 0),
                'created_at' => optional($k->created_at)->toDateTimeString(),
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

    public function store(KelasStoreRequest $request)
    {
        $data = $request->validated();

        $kelas = Kelas::create([
            'name' => $data['name'],
        ]);

        return response()->json([
            'success' => true,
            'data' => ['id' => $kelas->id],
            'error' => null,
        ]);
    }

    public function show(Kelas $kelas)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $kelas->id,
                'name' => $kelas->name,
                'created_at' => optional($kelas->created_at)->toDateTimeString(),
            ],
            'error' => null,
        ]);
    }

    public function update(KelasUpdateRequest $request, Kelas $kelas)
    {
        $data = $request->validated();
        $kelas->update(['name' => $data['name']]);

        return response()->json(['success' => true, 'data' => true, 'error' => null]);
    }

    public function destroy(Kelas $kelas) {
        $studentsCount = DB::table('siswa_profiles')->where('kelas_id', $kelas->id)->count();
        $guruCount = DB::table('guru_profiles')->where('kelas_id', $kelas->id)->distinct('user_id')->count('user_id');

        if ($studentsCount > 0 || $guruCount > 0) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => "Kelas tidak bisa dihapus karena masih memiliki siswa/guru. (Siswa: {$studentsCount}, Guru: {$guruCount})",
            ], 422);
        }

        $kelas->delete();

        return response()->json(['success' => true, 'data' => true, 'error' => null]);
    }
}
