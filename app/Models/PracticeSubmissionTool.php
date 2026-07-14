<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PracticeSubmissionTool extends Model
{
    protected $fillable = [
        'submission_id',
        'rule_tool_id',
        'kind',
        'label',
        'value',
        'photo_path',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(PracticeSubmission::class, 'submission_id');
    }

    public function ruleTool(): BelongsTo
    {
        return $this->belongsTo(PracticeRuleTool::class, 'rule_tool_id');
    }
}
