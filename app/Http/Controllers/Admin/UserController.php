<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, (int) $request->query('limit', 1));
        $search = trim((string) $request->query('search', ''));

        $query = User::query()
            ->where('id', '!=', $request->user()->id)
            ->whereIn('role', ['admin', 'guru'])
            ->with([
                'guruProfile.kelas:id,name',
                'guruProfile.mapel:id,name',
            ])
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('role', 'like', "%{$search}%"); 
            });
        }

        $paginator = $query->paginate($limit, ['*'], 'page', $page);
        
        $items = collect($paginator->items())->map(function (User $u) {
            return [
                'id' => $u->id,
                'email' => $u->email,
                'username' => $u->name,
                'role' => $u->role,
                'avatar_path' => $u->avatar_path,
                'guru' => $u->guruProfile ? [
                    'full_name' => $u->guruProfile->full_name,
                    'nip' => $u->guruProfile->nip,
                    'gender' => $u->guruProfile->gender,
                    'phone' => $u->guruProfile->phone,
                    'kelas' => $u->guruProfile->kelas?->name,
                    'mapel' => $u->guruProfile->mapel?->name,
                ] : null,
                'created_at' => optional($u->creeated_at)->toDateTimeString(),
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
            'error' => null
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate();

        $user = User::create([
            'email' => $data['email'],
            'name' => $data['username'] ?? null,
            'password' => Hash::make($data['password']),
            'avatar_path' => null,
        ]);

        if ($data['role'] === 'guru') {
            $user->guruProfile()->create([
                'full_name' => $data['full_name'],
                'nip' => $data['nip'],
                'gender' => $data['gender'],
                'phone' => $data['phone'],
                'kelas_id' => $data['kelas_id'],
                'mapel_id' => $data['mapel_id'],
            ]);
        }

        return response()->json(['success' => true, 'data' => ['id' => $user->id]]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
