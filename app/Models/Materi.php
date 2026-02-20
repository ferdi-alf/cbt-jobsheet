<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Materi extends Model
{
    protected $fillable = [
        'title',
        'pdf_path',
        'steps',
        'praktik_text',
        'kelas_id',
        'mapel_id',
        'teacher_user_id',
        'created_by',
    ];

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function mapel(): BelongsTo
    {
        return $this->belongsTo(Mapel::class, 'mapel_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_user_id');
    }

     public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tests(): HasMany
    {
        return $this->hasMany(Test::class, 'materi_id');
    }

    public function practiceRule(): HasOne
    {
        return $this->hasOne(PracticeRule::class, 'materi_id');
    }

    public function practiceSubmissions(): HasMany
    {
        return $this->hasMany(PracticeSubmission::class, 'materi_id');
    }
    
}
