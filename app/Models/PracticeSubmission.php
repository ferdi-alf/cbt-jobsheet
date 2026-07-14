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
        'score_alat_bahan',
        'score_sop_k3l',
        'score_praktik',
        'feedback',
        'graded_by',
        'graded_at',
    ];

    protected $casts = [
        'is_late' => 'boolean',
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
        'total_score' => 'integer',
        'score_alat_bahan' => 'integer',
        'score_sop_k3l' => 'integer',
        'score_praktik' => 'integer',
    ];

    public function apdPhotos(): HasMany
    {
        return $this->hasMany(PracticeSubmissionApdPhoto::class, 'submission_id');
    }

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

    public function tools(): HasMany
    {
        return $this->hasMany(PracticeSubmissionTool::class, 'submission_id')->orderBy('order');
    }

    public function toolPhotos(): HasMany
    {
        return $this->hasMany(PracticeSubmissionToolPhoto::class, 'submission_id');
    }
}