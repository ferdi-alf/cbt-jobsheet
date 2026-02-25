<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mapel;
use Illuminate\Http\Request;

class MapelController extends Controller
{
    public function index(Request $request)
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, (int) $request->query('limit', 10));
        $search = trim((string) $request->query('search', ''));

        $query = Mapel::query()
            ->withCount([
                'guruProfiles as total_guru',
                'materis as total_materi',
            ])
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where('name', 'like', "%{$search}%");
        }

        $paginator = $query->paginate($limit, ['*'], 'page', $page);

        $items = collect($paginator->items())->map(fn (Mapel $m) => [
            'id' => $m->id,
            'name' => $m->name,
            'total_guru' => (int) $m->total_guru,
            'total_materi' => (int) $m->total_materi,
            'created_at' => optional($m->created_at)->toDateTimeString(),
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

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:mapels,name'],
        ]);

        $mapel = Mapel::create(['name' => $data['name']]);

        return response()->json(['success' => true, 'data' => ['id' => $mapel->id], 'error' => null]);
    }

    public function show(Mapel $mapel)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $mapel->id,
                'name' => $mapel->name,
                'created_at' => optional($mapel->created_at)->toDateTimeString(),
            ],
            'error' => null,
        ]);
    }

    public function update(Request $request, Mapel $mapel)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:mapels,name,' . $mapel->id],
        ]);

        $mapel->update(['name' => $data['name']]);

        return response()->json(['success' => true, 'data' => true, 'error' => null]);
    }

    public function destroy(Mapel $mapel)
    {
        $guruCount = $mapel->guruProfiles()->count();
        $materiCount = $mapel->materis()->count();

        if ($guruCount > 0 || $materiCount > 0) {
            return response()->json([
                'success' => false,
                'data' => null,
                'error' => "Mapel tidak bisa dihapus karena masih dipakai. (Guru: {$guruCount}, Materi: {$materiCount})",
            ], 422);
        }

        $mapel->delete();

        return response()->json(['success' => true, 'data' => true, 'error' => null]);
    }
}
