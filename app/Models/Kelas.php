<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = [
        'name'
    ];

    public function siswaProfiles(): HasMany
    {
        return $this->hasMany(SiswaProfile::class, 'kelas_id');
    }

    public function guruProfiles(): HasMany
    {
        return $this->hasMany(GuruProfile::class, 'kelas_id');
    }

    public function materis(): HasMany
    {
        return $this->hasMany(Materi::class, 'kelas_id');
    }

}
