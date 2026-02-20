<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar_path'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function guruProfile(): HasOne
    {
        return $this->hasOne(GuruProfile::class, 'user_id');
    }

    public function siswaProfile(): HasOne
    {
        return $this->hasOne(SiswaProfile::class, 'user_id');
    }

    public function createdMateris(): HasMany
    {
        return $this->hasMany(Materi::class, 'created_by');
    }

    public function teachingMateris(): HasMany
    {
        return $this->hasMany(Materi::class, 'teacher_user_id');
    }

    public function testAttempts(): HasMany
    {
        return $this->hasMany(TestAttempt::class, 'user_id');
    }

    public function practiceSubmissions(): HasMany
    {
        return $this->hasMany(PracticeSubmission::class, 'user_id');
    }

    public function isAdmin(): bool {return $this->role === 'admin';}
    public function isGuru(): bool {return $this->role === 'guru';}
    public function isSiswa(): bool {return $this->role === 'siswa';}
}
