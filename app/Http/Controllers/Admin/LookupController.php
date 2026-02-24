<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Mapel;

class LookupController extends Controller
{
    public function kelas() {
        $items = Kelas::query()
            ->select(['id', 'name'])
            ->orderby('name')
            ->get();

        return response()->json(['success' => true, 'data' => $items]);
    }

    public function mapels() {
        $items = Mapel::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        return response()->json(['success' => true, 'data' => $items]);
    }
    
}
