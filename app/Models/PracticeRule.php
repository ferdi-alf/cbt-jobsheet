<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PracticeRule extends Model
{
    protected $fillable = [
        'materi_id',
        'title',
        'deadline_at',
        'created_by'
    ];

    protected $casts = [
        'deadline_at' => 'datetime'
    ];
    

    public function materi(): BelongsTo
    {
        return $this->belongsTo(Materi::class, 'materi_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(PracticeChecklist::class, 'practice_rule_id')->orderBy('order');
    }

}
