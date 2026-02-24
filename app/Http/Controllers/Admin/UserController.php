<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserStoreRequest;
use App\Http\Requests\Admin\UserUpdateRequest;
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
        $limit = max(1, (int) $request->query('limit', 10));
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
                    'kelas_id' => $u->guruProfile->kelas_id,
                    'mapel_id' => $u->guruProfile->mapel_id,
                    'kelas' => $u->guruProfile->kelas?->name,
                    'mapel' => $u->guruProfile->mapel?->name,
                ] : null,
                'created_at' => optional($u->created_at)->toDateTimeString(),
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
    public function store(UserStoreRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'email' => $data['email'],
            'name' => $data['username'] ?? null,
            'role' => $data['role'],
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
public function show(User $user, Request $request)
{
    abort_if($user->id === $request->user()->id, 404);

    $user->load('guruProfile.kelas:id,name', 'guruProfile.mapel:id,name');

    return response()->json([
        'success' => true,
        'data' => [
            'id' => $user->id,
            'email' => $user->email,
            'username' => $user->name,
            'role' => $user->role,
            'avatar_path' => $user->avatar_path,
            'guru' => $user->guruProfile ? [
                'full_name' => $user->guruProfile->full_name,
                'nip' => $user->guruProfile->nip,
                'gender' => $user->guruProfile->gender,
                'phone' => $user->guruProfile->phone,
                'kelas_id' => $user->guruProfile->kelas_id,
                'mapel_id' => $user->guruProfile->mapel_id,
                'kelas' => $user->guruProfile->kelas?->name,
                'mapel' => $user->guruProfile->mapel?->name,
            ] : null,
            'created_at' => optional($user->created_at)->toDateTimeString(),
        ],
        'error' => null,
    ]);
}

    /**
     * Update the specified resource in storage.
     */
    public function update(UserUpdateRequest $request, User $user)
    {
        abort_if($user->id === $request->user()->id, 403);

        $data = $request->validated();
        $user->email = $data['email'] ?? $user->email;
        $user->name = $data['username'] ?? $user->name;

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        if ($user->role === 'guru') {
            $user->guruProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $data['full_name'] ?? $user->guruProfile?->full_name,
                    'nip' => $data['nip'] ?? $user->guruProfile?->nip,
                    'gender' => $data['gender'] ?? $user->guruProfile?->gender,
                    'phone' => $data['phone'] ?? $user->guruProfile?->phone,
                    'kelas_id' => $data['kelas_id'] ?? $user->guruProfile?->kelas_id,
                    'mapel_id' => $data['mapel_id'] ?? $user->guruProfile?->mapel_id,
                ]
            );
        }

        return response()->json(['success' => true, 'data' => true]);
    }

    public function destroy(Request $request, User $user)
    {
        abort_if($user->id === $request->user()->id, 403);

        $user->delete();

        return response()->json(['success' => true, 'data' => true]);
    }
}
