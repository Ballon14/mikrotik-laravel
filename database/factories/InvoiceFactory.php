<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'invoice_number' => 'INV-'.fake()->unique()->numerify('########'),
            'amount' => fake()->numberBetween(50000, 500000),
            'status' => 'unpaid',
            'due_date' => now()->addDays(7),
        ];
    }
}
