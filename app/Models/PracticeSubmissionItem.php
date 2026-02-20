<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PracticeSubmissionItem extends Model
{
    protected $fillable = [
        'submission_id',
        'checklist_id',
        'note',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(PracticeSubmission::class, 'submission_id');
    }

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(PracticeChecklist::class, 'checklist_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(PracticeSubmissionPhoto::class, 'submission_item_id');
    }
}