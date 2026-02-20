<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PracticeSubmission extends Model
{
    protected $fillable = [
        'materi_id',
        'student_user_id',
        'status',
        'is_late',
        'submitted_at',
        'total_score',
        'feedback',
        'graded_by',
        'graded_at',
    ];

    protected $casts = [
        'is_late' => 'boolean',
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
        'total_score' => 'integer',
    ];

    public function materi(): BelongsTo
    {
        return $this->belongsTo(Materi::class, 'materi_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PracticeSubmissionItem::class, 'submission_id');
    }
}