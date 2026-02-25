<?php

namespace App\Support\Api;

use Illuminate\Http\Request;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;

trait PaginatesApi
{
    protected function tableParams(Request $request, int $defaultLimit = 10, int $maxLimit = 100): array
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = (int) $request->query('limit', $defaultLimit);
        $limit = max(1, min($limit, $maxLimit));
        $search = trim((string) $request->query('search', ''));

        return compact('page', 'limit', 'search');
    }

    /**
     * Apply OR-like search across multiple columns for both Eloquent & Query Builder.
     *
     * @param  EloquentBuilder|QueryBuilder  $query
     * @param  string  $search
     * @param  array<int,string>  $columns
     * @return EloquentBuilder|QueryBuilder
     */
    protected function applySearch(EloquentBuilder|QueryBuilder $query, string $search, array $columns)
    {
        if ($search === '' || empty($columns)) return $query;

        return $query->where(function ($q) use ($search, $columns) {
            foreach ($columns as $col) {
                $q->orWhere($col, 'like', '%'.$search.'%');
            }
        });
    }

    /**
     * Paginate Eloquent Builder (query builder bisa langsung ->paginate()).
     */
    protected function paginateEloquent(EloquentBuilder $query, int $page, int $limit): LengthAwarePaginator
    {
        return $query->paginate($limit, ['*'], 'page', $page);
    }

    protected function paginatedResponse(LengthAwarePaginator $paginator, $items)
    {
        return response()->json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'total' => $paginator->total(),
                'page' => $paginator->currentPage(),
                'limit' => $paginator->perPage(),
                'totalPages' => $paginator->lastPage(),
                'hasNextPage' => $paginator->hasMorePages(),
                'hasPrevPage' => $paginator->currentPage() > 1,
            ],
            'error' => null,
        ]);
    }
}