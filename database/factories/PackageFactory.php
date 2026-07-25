<?php

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

class PackageFactory extends Factory
{
    protected $model = Package::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word().' Package',
            'price' => fake()->numberBetween(50000, 500000),
            'speed' => '10M/10M',
            'billing_period' => 'monthly',
        ];
    }
}
