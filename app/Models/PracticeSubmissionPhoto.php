<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PracticeSubmissionPhoto extends Model
{
    protected $fillable = [
        'submission_item_id',
        'photo_path',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(PracticeSubmissionItem::class, 'submission_item_id');
    }
}