<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PracticeSubmissionApdPhoto extends Model
{
    protected $fillable = [
        'submission_id',
        'photo_path',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(PracticeSubmission::class, 'submission_id');
    }
}