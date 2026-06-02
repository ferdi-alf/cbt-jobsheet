<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Mapel;

class LookupController extends Controller
{
    public function kelas()
    {
        $items = Kelas::query()
            ->orderBy('name')
            ->get(['id', 'name', 'tingkat', 'jurusan_id'])
            ->map(fn ($k) => [
                'id'      => $k->id,
                'name'    => $k->name,
                'tingkat' => $k->tingkat,
            ]);

        return response()->json(['success' => true, 'data' => $items, 'error' => null]);
    }

    public function mapels()
    {
        $items = Mapel::query()
            ->orderBy('name')
            ->get(['id', 'name', 'fase'])
            ->map(fn ($m) => [
                'id'   => $m->id,
                'name' => $m->name,
                'fase' => $m->fase,
            ]);

        return response()->json(['success' => true, 'data' => $items, 'error' => null]);
    }
}