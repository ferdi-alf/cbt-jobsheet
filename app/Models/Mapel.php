<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mapel extends Model
{
    protected $fillable = [
        'name'
    ];

    public function guruProfiles(): HasMany
    {
        return $this->hasMany(GuruProfile::class, 'mapel_id');
    }

    public function materis(): HasMany
    {
        return $this->hasMany(Materi::class, 'mapel_id');
    }
}
