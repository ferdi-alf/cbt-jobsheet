<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PracticeChecklist extends Model
{
    protected $fillable = [
        'practice_rule_id',
        'title',
        'order',
    ];

    public function rule(): BelongsTo
    {
        return $this->belongsTo(PracticeRule::class, 'practice_rule_id');
    }

    public function submissionItems(): HasMany
    {
        return $this->hasMany(PracticeSubmissionItem::class, 'checklist_id');
    }
}