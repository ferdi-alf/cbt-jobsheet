<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\KelasStoreRequest;
use App\Http\Requests\Admin\KelasUpdateRequest;
use App\Models\Kelas;
use App\Support\Api\PaginatesApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KelasController extends Controller
{
    use PaginatesApi;

    public function index(Request $request)
    {
        ['page' => $page, 'limit' => $limit, 'search' => $search] =
            $this->tableParams($request);

        $query = Kelas::query()
            ->with('jurusan')        
            ->orderByDesc('kelas.id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('kelas.name', 'like', "%{$search}%")
                  ->orWhereHas('jurusan', fn ($j) => $j->where('name', 'like', "%{$search}%"));
            });
        }

        $query->withCount(['siswaProfiles as total_students'])
              ->addSelect([
                  'total_guru' => DB::table('guru_profiles')
                      ->selectRaw('COUNT(DISTINCT user_id)')
                      ->whereColumn('guru_profiles.kelas_id', 'kelas.id'),
              ]);

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())
            ->map(fn ($k) => $this->formatKelas($k))
            ->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function store(KelasStoreRequest $request)
    {
        $data = $request->validated();

        $kelas = Kelas::create([
            'name'         => $data['name'],
            'jurusan_id'   => (int) $data['jurusan_id'], 
            'tingkat'      => $data['tingkat'],
            'tahun_ajaran' => $data['tahun_ajaran'],
        ]);

        $kelas->load('jurusan');

        return response()->json([
            'success' => true,
            'data'    => ['id' => $kelas->id],
            'error'   => null,
        ], 201);
    }

    public function show(Kelas $kelas)
    {
        $kelas->load('jurusan');

        return response()->json([
            'success' => true,
            'data'    => $this->formatKelas($kelas),
            'error'   => null,
        ]);
    }

    public function update(KelasUpdateRequest $request, Kelas $kelas)
    {
        $data = $request->validated();

        $kelas->update([
            'name'         => $data['name'],
            'jurusan_id'   => (int) $data['jurusan_id'],
            'tingkat'      => $data['tingkat'],
            'tahun_ajaran' => $data['tahun_ajaran'],
        ]);

    
        return response()->json([
            'success' => true,
            'data'    => true,
            'error'   => null,
        ]);
    }

    public function destroy(Kelas $kelas)
    {
        $studentsCount = DB::table('siswa_profiles')->where('kelas_id', $kelas->id)->count();
        $guruCount     = DB::table('guru_profiles')
            ->where('kelas_id', $kelas->id)
            ->distinct('user_id')
            ->count('user_id');

        if ($studentsCount > 0 || $guruCount > 0) {
            return response()->json([
                'success' => false,
                'data'    => null,
                'error'   => "Kelas tidak bisa dihapus karena masih memiliki siswa/guru. (Siswa: {$studentsCount}, Guru: {$guruCount})",
            ], 422);
        }

        $kelas->delete();

        return response()->json(['success' => true, 'data' => true, 'error' => null]);
    }

    private function formatKelas(Kelas $k): array
    {
        $jurusan = $k->relationLoaded('jurusan') ? $k->jurusan : null;

        return [
            'id'            => $k->id,
            'name'          => $k->name,
            'tingkat'       => $k->tingkat,
            'tahun_ajaran'  => $k->tahun_ajaran,
            'jurusan'       => $jurusan ? [
                'id'       => $jurusan->id,
                'name'     => $jurusan->name,
                'logo_url' => $jurusan->logo_url,
            ] : null,
            'total_students' => (int) ($k->total_students ?? 0),
            'total_guru'     => (int) ($k->total_guru ?? 0),
            'created_at'     => optional($k->created_at)->toDateTimeString(),
        ];
    }
}