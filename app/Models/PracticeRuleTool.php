<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PracticeRuleTool extends Model
{
    protected $fillable = [
        'practice_rule_id',
        'kind',
        'label',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function rule(): BelongsTo
    {
        return $this->belongsTo(PracticeRule::class, 'practice_rule_id');
    }
}
