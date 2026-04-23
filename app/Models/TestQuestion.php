<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TestQuestion extends Model
{
    protected $fillable = [
        'test_id',
        'image_path',
        'question',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'option_e',
        'correct_option',
        'order',
    ];

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class, 'test_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(TestAnswer::class, 'question_id');
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path
            ? asset('storage/' . $this->image_path)
            : null;
    }
}
