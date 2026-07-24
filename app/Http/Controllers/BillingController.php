<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    // ─── API endpoints for Packages ───
    public function packages()
    {
        return response()->json([
            'success' => true,
            'data' => Package::orderBy('id', 'desc')->get()
        ]);
    }

    public function storePackage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'speed' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        Package::create($validated);
        return response()->json(['success' => true]);
    }

    public function updatePackage(Request $request, $id)
    {
        $package = Package::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'speed' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $package->update($validated);
        return response()->json(['success' => true]);
    }

    public function destroyPackage($id)
    {
        Package::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    // ─── API endpoints for Customers ───
    public function customers()
    {
        $customers = Customer::with('package')->orderBy('id', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    public function storeCustomer(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'pppoe_username' => 'required|string|unique:customers',
            'pppoe_password' => 'required|string',
            'package_id' => 'required|exists:packages,id',
            'status' => 'required|in:active,inactive,isolated',
        ]);

        Customer::create($validated);
        return response()->json(['success' => true]);
    }

    public function updateCustomer(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'pppoe_username' => 'required|string|unique:customers,pppoe_username,'.$id,
            'pppoe_password' => 'required|string',
            'package_id' => 'required|exists:packages,id',
            'status' => 'required|in:active,inactive,isolated',
        ]);

        $customer->update($validated);
        return response()->json(['success' => true]);
    }

    public function destroyCustomer($id)
    {
        Customer::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    // ─── API endpoints for Invoices ───
    public function invoices()
    {
        $invoices = Invoice::with('customer')->orderBy('id', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $invoices
        ]);
    }

    public function storeInvoice(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'invoice_number' => 'required|string|unique:invoices',
            'amount' => 'required|numeric',
            'status' => 'required|in:unpaid,paid',
            'due_date' => 'required|date',
        ]);

        if ($validated['status'] === 'paid') {
            $validated['paid_at'] = now();
        }

        Invoice::create($validated);
        return response()->json(['success' => true]);
    }

    public function updateInvoice(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'invoice_number' => 'required|string|unique:invoices,invoice_number,'.$id,
            'amount' => 'required|numeric',
            'status' => 'required|in:unpaid,paid',
            'due_date' => 'required|date',
        ]);

        if ($validated['status'] === 'paid' && $invoice->status === 'unpaid') {
            $validated['paid_at'] = now();
        } elseif ($validated['status'] === 'unpaid') {
            $validated['paid_at'] = null;
        }

        $invoice->update($validated);
        return response()->json(['success' => true]);
    }

    public function destroyInvoice($id)
    {
        Invoice::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}
