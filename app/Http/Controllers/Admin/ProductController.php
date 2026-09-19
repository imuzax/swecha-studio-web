<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category', 'images');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === 'true' || $request->is_active === '1');
        }

        $products = $query->latest()->paginate(15)->withQueryString();
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'is_active'])
        ]);
    }

    public function create()
    {
        $categories = Category::where('is_active', true)->get();
        return Inertia::render('Admin/Products/Create', compact('categories'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'short_description' => 'nullable|string',
            'full_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lte:price',
            'stock_quantity' => 'required|integer|min:0',
            'is_made_to_order' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'images' => 'nullable|array|max:10',
            'images.*' => 'file|mimes:jpeg,png,jpg,webp,gif,svg,bmp,avif,heic|max:51200' // Max 50MB
        ]);

        $slug = Str::slug($data['name']);
        $originalSlug = $slug;
        $count = 1;
        while (\App\Models\Product::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }
        $data['slug'] = $slug;
        
        $product = Product::create(\Illuminate\Support\Arr::except($data, ['images']));

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'path' => $path,
                    'is_primary' => $index === 0,
                    'sort_order' => $index
                ]);
            }
        }

        $this->ensureSinglePrimaryImage($product);

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $product->load(['images' => function($q) {
            $q->orderBy('sort_order');
        }, 'variants', 'customizations.options']);
        $categories = Category::where('is_active', true)->get();
        $all_customizations = \App\Models\Customization::with('options')->get();
        return Inertia::render('Admin/Products/Edit', compact('product', 'categories', 'all_customizations'));
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'short_description' => 'nullable|string',
            'full_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lte:price',
            'stock_quantity' => 'required|integer|min:0',
            'is_made_to_order' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'images' => [
                'nullable',
                'array',
                function ($attribute, $value, $fail) use ($product) {
                    $existingCount = $product->images()->count();
                    if ($existingCount + count($value) > 10) {
                        $allowed = max(0, 10 - $existingCount);
                        $fail("A product can have a maximum of 10 images total. You can only upload {$allowed} more.");
                    }
                }
            ],
            'images.*' => 'file|mimes:jpeg,png,jpg,webp,gif,svg,bmp,avif,heic|max:51200' // Max 50MB
        ]);
        
        $slug = Str::slug($data['name']);
        $originalSlug = $slug;
        $count = 1;
        while (\App\Models\Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }
        $data['slug'] = $slug;
        $product->update(\Illuminate\Support\Arr::except($data, ['images']));

        if ($request->hasFile('images')) {
            $existingCount = $product->images()->count();
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'path' => $path,
                    'is_primary' => false, // Will be corrected by ensureSinglePrimaryImage if needed
                    'sort_order' => $existingCount + $index
                ]);
            }
        }

        $this->ensureSinglePrimaryImage($product);

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        // Images are intentionally NOT deleted from storage during soft deletes.
        // They should only be removed if the product is force-deleted.
        
        $product->delete();
        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully.');
    }

    public function destroyImage(Product $product, $imageId)
    {
        $image = $product->images()->findOrFail($imageId);
        
        // Remove from storage
        Storage::disk('public')->delete($image->path);
        
        // Delete record
        $image->delete();

        $this->ensureSinglePrimaryImage($product);

        return redirect()->back()->with('success', 'Image deleted successfully.');
    }

    private function ensureSinglePrimaryImage(Product $product)
    {
        $primaryImages = $product->images()->where('is_primary', true)->orderBy('sort_order')->get();
        if ($primaryImages->count() > 1) {
            $first = $primaryImages->first();
            $product->images()->where('id', '!=', $first->id)->update(['is_primary' => false]);
        } elseif ($primaryImages->count() === 0 && $product->images()->count() > 0) {
            $firstRemaining = $product->images()->orderBy('sort_order')->first();
            if ($firstRemaining) {
                $firstRemaining->update(['is_primary' => true]);
            }
        }
    }
}
