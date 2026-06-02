<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mapel;
use App\Support\Api\PaginatesApi;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MapelController extends Controller
{
    use PaginatesApi;

    public function index(Request $request)
    {
        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $query = Mapel::query()
            ->withCount(['guruProfiles as total_guru', 'materis as total_materi'])
            ->orderByDesc('id');

        $this->applySearch($query, $search, ['name', 'fase']);

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())
            ->map(fn (Mapel $m) => $this->formatMapel($m))
            ->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:mapels,name'],
            'fase' => ['required', Rule::in(['E', 'F', 'E,F'])],
        ]);

        $mapel = Mapel::create($data);

        return response()->json(['success' => true, 'data' => ['id' => $mapel->id], 'error' => null]);
    }

    public function show(Mapel $mapel)
    {
        return response()->json(['success' => true, 'data' => $this->formatMapel($mapel), 'error' => null]);
    }

    public function update(Request $request, Mapel $mapel)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:mapels,name,' . $mapel->id],
            'fase' => ['required', Rule::in(['E', 'F', 'E,F'])],
        ]);

        $mapel->update($data);

        return response()->json(['success' => true, 'data' => true, 'error' => null]);
    }

    public function destroy(Mapel $mapel)
    {
        $guruCount   = $mapel->guruProfiles()->count();
        $materiCount = $mapel->materis()->count();

        if ($guruCount > 0 || $materiCount > 0) {
            return response()->json([
                'success' => false,
                'data'    => null,
                'error'   => "Mapel tidak bisa dihapus. (Guru: {$guruCount}, Materi: {$materiCount})",
            ], 422);
        }

        $mapel->delete();

        return response()->json(['success' => true, 'data' => true, 'error' => null]);
    }

    private function formatMapel(Mapel $m): array
    {
        return [
            'id'           => $m->id,
            'name'         => $m->name,
            'fase'         => $m->fase,
            'total_guru'   => (int) ($m->total_guru ?? 0),
            'total_materi' => (int) ($m->total_materi ?? 0),
            'created_at'   => optional($m->created_at)->toDateTimeString(),
        ];
    }
}