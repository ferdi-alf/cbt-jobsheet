<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\JurusanStoreRequest;
use App\Http\Requests\Admin\JurusanUpdateRequest;
use App\Models\Jurusan;
use App\Support\Api\PaginatesApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class JurusanController extends Controller
{
    use PaginatesApi;

    public function index(Request $request)
    {
        ['page' => $page, 'limit' => $limit, 'search' => $search] =
            $this->tableParams($request);

        $query = Jurusan::query()->orderByDesc('id');
        $this->applySearch($query, $search, ['name']);

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())
            ->map(fn (Jurusan $j) => $this->formatJurusan($j))
            ->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function store(JurusanStoreRequest $request)
    {
        $data = $request->validated();

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('jurusan', 'public');
        }

        $jurusan = Jurusan::create([
            'name'      => $data['name'],
            'logo_path' => $logoPath,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $this->formatJurusan($jurusan),
            'error'   => null,
        ], 201);
    }

    public function show(Jurusan $jurusan)
    {
        return response()->json([
            'success' => true,
            'data'    => $this->formatJurusan($jurusan),
            'error'   => null,
        ]);
    }

    public function update(JurusanUpdateRequest $request, Jurusan $jurusan)
    {
        $data = $request->validated();

        $logoPath = $jurusan->logo_path;

        if ($request->hasFile('logo')) {
            if ($jurusan->logo_path) {
                Storage::disk('public')->delete($jurusan->logo_path);
            }
            $logoPath = $request->file('logo')->store('jurusan', 'public');
        }

        $jurusan->update([
            'name'      => $data['name'],
            'logo_path' => $logoPath,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $this->formatJurusan($jurusan->fresh()),
            'error'   => null,
        ]);
    }

    public function destroy(Jurusan $jurusan)
    {
        $kelasCount = $jurusan->kelas()->count();
        if ($kelasCount > 0) {
            return response()->json([
                'success' => false,
                'data'    => null,
                'error'   => "Jurusan tidak bisa dihapus karena masih dipakai oleh {$kelasCount} kelas.",
            ], 422);
        }

        if ($jurusan->logo_path) {
            Storage::disk('public')->delete($jurusan->logo_path);
        }

        $jurusan->delete();

        return response()->json([
            'success' => true,
            'data'    => true,
            'error'   => null,
        ]);
    }

    private function formatJurusan(Jurusan $j): array
    {
        return [
            'id'         => $j->id,
            'name'       => $j->name,
            'logo_path'  => $j->logo_path,
            'logo_url'   => $j->logo_url, 
            'created_at' => optional($j->created_at)->toDateTimeString(),
        ];
    }
}