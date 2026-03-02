<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Petugas\MateriStoreRequest;
use App\Http\Requests\Petugas\MateriUpdateRequest;
use App\Models\Materi;
use App\Models\PracticeChecklist;
use App\Models\PracticeRule;
use App\Support\Api\PaginatesApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MateriController extends Controller
{
    use PaginatesApi;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Materi::class);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $user = Auth::user();

        $query = Materi::query()
            ->with([
                'kelas:id,name',
                'mapel:id,name',
                'creator:id,name,email',
            ])
            ->orderByDesc('id');

        if ($user->role === 'guru') {
            $gp = $user->guruProfile;
            if (!$gp || !$gp->kelas_id || !$gp->mapel_id) {
                return $this->paginatedResponse(
                    $this->paginateEloquent($query->whereRaw('1=0'), $page, $limit),
                    collect([])->values()
                );
            }

            $query->where('kelas_id', $gp->kelas_id)
                  ->where('mapel_id', $gp->mapel_id);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%'.$search.'%');
            });
        }

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(function (Materi $m) {
            return [
                'id' => $m->id,
                'title' => $m->title,
                'kelas' => $m->kelas?->name,
                'mapel' => $m->mapel?->name,
                'kelas_id' => $m->kelas_id,
                'mapel_id' => $m->mapel_id,
                'created_by' => $m->creator ? [
                    'id' => $m->creator->id,
                    'name' => $m->creator->name,
                    'email' => $m->creator->email,
                ] : null,
                'praktik_text' => $m->praktik_text,
                'pdf_url' => $m->pdf_path ? Storage::disk('public')->url($m->pdf_path) : null,
                'download_url' => route('api.materis.download', ['materi' => $m->id]), 
                'created_at' => optional($m->created_at)->toDateTimeString(),
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function show(Request $request, Materi $materi)
    {
        $this->authorize('view', $materi);

        $materi->load([
            'kelas:id,name',
            'mapel:id,name',
            'creator:id,name,email',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $materi->id,
                'title' => $materi->title,
                'praktik_text' => $materi->praktik_text,
                'kelas_id' => $materi->kelas_id,
                'mapel_id' => $materi->mapel_id,
                'kelas' => $materi->kelas?->name,
                'mapel' => $materi->mapel?->name,
                'created_by' => $materi->creator ? [
                    'id' => $materi->creator->id,
                    'name' => $materi->creator->name,
                    'email' => $materi->creator->email,
                ] : null,
                'pdf' => [
                    'url' => $materi->pdf_path ? Storage::disk('public')->url($materi->pdf_path) : null,
                    'download_url' => route('api.materis.download', ['materi' => $materi->id]),
                ],
                'created_at' => optional($materi->created_at)->toDateTimeString(),
            ],
            'error' => null,
        ]);
    }

    public function store(MateriStoreRequest $request)
    {
        $this->authorize('create', Materi::class);

        $user = $request->user();
        $data = $request->validated();

        if ($user->role === 'guru') {
            $gp = $user->guruProfile;
            abort_if(!$gp || !$gp->kelas_id || !$gp->mapel_id, 403);

            $data['kelas_id'] = (int) $gp->kelas_id;
            $data['mapel_id'] = (int) $gp->mapel_id;
        }

        $pdfPath = $request->file('pdf')->store('materi_pdfs', 'public');

        $materi = Materi::create([
            'title' => $data['title'],
            'praktik_text' => $data['praktik_text'] ?? null,
            'kelas_id' => (int) $data['kelas_id'],
            'mapel_id' => (int) $data['mapel_id'],
            'created_by' => $user->id,
            'pdf_path' => $pdfPath,
        ]);

        return response()->json(['success' => true, 'data' => ['id' => $materi->id]]);
    }

    public function update(MateriUpdateRequest $request, Materi $materi)
    {
        $this->authorize('update', $materi);

        $user = $request->user();
        $data = $request->validated();

        if ($user->role === 'guru') {
            unset($data['kelas_id'], $data['mapel_id']);
        }

        DB::transaction(function () use ($request, $materi, $data) {
            if (array_key_exists('title', $data)) {
                $materi->title = $data['title'];
            }
            if (array_key_exists('praktik_text', $data)) {
                $materi->praktik_text = $data['praktik_text'];
            }
            if (array_key_exists('kelas_id', $data)) {
                $materi->kelas_id = (int) $data['kelas_id'];
            }
            if (array_key_exists('mapel_id', $data)) {
                $materi->mapel_id = (int) $data['mapel_id'];
            }

            if ($request->hasFile('pdf')) {
                if ($materi->pdf_path) {
                    Storage::disk('public')->delete($materi->pdf_path);
                }
                $materi->pdf_path = $request->file('pdf')->store('materi_pdfs', 'public');
            }

            $materi->save();
        });

        return response()->json(['success' => true, 'data' => true]);
    }

    public function destroy(Request $request, Materi $materi)
    {
        $this->authorize('delete', $materi);

        DB::transaction(function () use ($materi) {
           if ($materi->pdf_path) {
                Storage::disk('public')->delete($materi->pdf_path);
            }
            $materi->delete();
        });

        return response()->json(['success' => true, 'data' => true]);
    }

    public function download(Request $request, Materi $materi)
    {
        $this->authorize('download', $materi);

        abort_if(!$materi->pdf_path || !Storage::disk('public')->exists($materi->pdf_path), 404);

        $materi->loadMissing(['kelas:id,name', 'mapel:id,name']);
        $filename = Str::slug(($materi->title ?: 'materi') . '-' . ($materi->mapel?->name ?: 'mapel') . '-' . ($materi->kelas?->name ?: 'kelas')) . '.pdf';

        return response()->download(
            Storage::disk('public')->path($materi->pdf_path),
            $filename,
            ['Content-Type' => 'application/pdf']
        );
    }

    public function tests(Request $request, Materi $materi)
    {
        $this->authorize('view', $materi);
        $tests = $materi->tests()
            ->select(['id', 'title', 'type', 'created_at'])
            ->orderByDesc('id')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'type' => $t->type,
                'created_at' => optional($t->created_at)->toDateTimeString(),
            ]);

        return response()->json(['success' => true, 'data' => $tests]);
    }

    public function practiceChecklists(Request $request, Materi $materi)
    {
        $this->authorize('view', $materi);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $query = PracticeRule::query()
            ->where('materi_id', $materi->id)
            ->select(['id','materi_id','title','deadline_at','created_by','created_at'])
            ->orderByDesc('id');

        if ($search !== '') {
            $query->where('title', 'like', '%'.$search.'%');
        }

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(function (PracticeRule $r) {
            return [
                'id' => $r->id,
                'title' => $r->title,
                'deadline_at' => optional($r->deadline_at)->toDateTimeString(),
                'created_at' => optional($r->created_at)->toDateTimeString(),
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }

    public function ruleChecklists(Request $request, PracticeRule $rule)
    {
        $rule->load('materi'); 
        $this->authorize('view', $rule->materi);

        ['page' => $page, 'limit' => $limit, 'search' => $search] = $this->tableParams($request);

        $query = PracticeChecklist::query()
            ->where('practice_rule_id', $rule->id)
            ->orderBy('order');

        if ($search !== '') {
            $query->where('title', 'like', '%'.$search.'%');
        }

        $paginator = $this->paginateEloquent($query, $page, $limit);

        $items = collect($paginator->items())->map(function (PracticeChecklist $c) {
            return [
                'id' => $c->id,
                'title' => $c->title,
                'order' => $c->order,
                'created_at' => optional($c->created_at)->toDateTimeString(),
            ];
        })->values();

        return $this->paginatedResponse($paginator, $items);
    }
}