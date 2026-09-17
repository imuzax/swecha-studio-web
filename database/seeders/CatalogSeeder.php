<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class CatalogSeeder extends Seeder
{
    public function run()
    {
        $sourceImageFolder = '/run/media/muzax/Work/Freelancing/Clients/Swecha Studio/Docs/Client/Website pics-20260916T114920Z-1-001/Website pics';
        
        $images = File::exists($sourceImageFolder) ? File::files($sourceImageFolder) : [];
        $validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic']; // Product images usually these

        // Create storage directory if doesn't exist
        $destFolder = storage_path('app/public/products');
        if (!File::exists($destFolder)) {
            File::makeDirectory($destFolder, 0755, true);
        }

        $catalog = [
            'Concrete Jars' => [
                ['name' => 'Long Texture Jar', 'price' => 170],
                ['name' => 'Big Shankh Jar', 'price' => 130],
                ['name' => 'Ocean Theme Jar', 'price' => 90],
                ['name' => 'Roman Jar', 'price' => 120],
                ['name' => 'Long Plain Jar', 'price' => 120],
                ['name' => 'Plain Curve Jar', 'price' => 110],
                ['name' => 'Big Bow Jar', 'price' => 210],
                ['name' => 'Snow Jar', 'price' => 100],
                ['name' => 'Flower Long Jar', 'price' => 100],
                ['name' => 'Rose Bloom Jar', 'price' => 110],
                ['name' => 'Bell Jar', 'price' => 110],
                ['name' => 'Heart Rose Jar', 'price' => 75],
                ['name' => 'Trapezium Jar', 'price' => 110],
                ['name' => 'Donut Jar', 'price' => 110],
                ['name' => 'Ribbed Jar', 'price' => 70],
                ['name' => 'Bow Jar', 'price' => 75],
                ['name' => 'Bubble Jar', 'price' => 90],
                ['name' => 'Ribbed Trinket Jar', 'price' => 75],
            ],
            'Concrete Trays' => [
                ['name' => 'Oval Tray - Big', 'price' => 90],
                ['name' => 'Oval Tray - Small', 'price' => 70],
                ['name' => 'Oval Tray - Marble Effect', 'price' => 110],
                ['name' => 'Cloud Tray', 'price' => 120],
                ['name' => 'Maple Leaf Tray', 'price' => 80],
                ['name' => 'Star Tray', 'price' => 65],
                ['name' => 'Star Tray Gold Border', 'price' => 70],
                ['name' => 'Star Tray Coloured', 'price' => 80],
                ['name' => 'Big Bubble Tray', 'price' => 70],
                ['name' => 'Small Bubble Tray', 'price' => 65],
                ['name' => 'Bubble Heart Tray', 'price' => 70],
                ['name' => 'Cloud Bubble Tray', 'price' => 80],
            ],
            'Concrete Coasters' => [
                ['name' => 'Hexagonal Coaster Set of 4', 'price' => 35],
                ['name' => 'Geometry Coaster Set of 6', 'price' => 45],
                ['name' => 'Mandala Coaster', 'price' => 30],
                ['name' => 'Marble Effect Coaster', 'price' => 60],
            ],
            'Concrete Home Decor Sets' => [
                ['name' => 'Oval Tray + Trinket Jar', 'price' => 170],
                ['name' => 'Thinker Statue', 'price' => 155],
                ['name' => 'Thinker Family Set of 4', 'price' => 80],
                ['name' => 'Thinker Family Set of 3', 'price' => 75],
                ['name' => 'Couple Showpiece', 'price' => 60],
                ['name' => 'Lady Face vase', 'price' => 100],
                ['name' => 'Skull Ashtray', 'price' => 150],
            ],
            'Photo & Incense Holder' => [
                ['name' => 'Rainbow Shape Photo Holder', 'price' => 25],
                ['name' => 'Flower Shape Photo Holder', 'price' => 25],
                ['name' => 'Flat Cloud Photo Holder', 'price' => 25],
                ['name' => 'Puffy Cloud Photo Holder', 'price' => 25],
                ['name' => 'Heart Shape Photo Holder', 'price' => 25],
                ['name' => 'Incense Holder', 'price' => 25],
                ['name' => 'Hamsa Hand Incense Holder', 'price' => 50],
                ['name' => 'Trishakti Incense Holder', 'price' => 50],
            ],
            'Concrete Vases' => [
                ['name' => 'Ribbed Wave Vase', 'price' => 130],
                ['name' => 'Hexagonal Vase', 'price' => 100],
                ['name' => 'Donut Vase', 'price' => 110],
                ['name' => 'Teddy Vase', 'price' => 90],
            ],
            'DIY Painting Kit' => [
                ['name' => 'Donut DIY Kit', 'price' => 150],
                ['name' => 'Vehicle Set of 4', 'price' => 120],
                ['name' => 'Small Bug n Flower Set', 'price' => 60],
                ['name' => 'Castle Keepsake', 'price' => 140],
            ]
        ];

        foreach ($catalog as $catName => $products) {
            $category = Category::firstOrCreate(
                ['name' => $catName],
                ['slug' => Str::slug($catName)]
            );

            foreach ($products as $prodData) {
                $assignedImages = [];
                if (count($images) >= 4) {
                    $randomKeys = array_rand($images, 4);
                    foreach ($randomKeys as $index => $key) {
                        $randomImg = $images[$key];
                        if (in_array(strtolower($randomImg->getExtension()), $validExtensions)) {
                            $filename = Str::random(20) . '.' . $randomImg->getExtension();
                            File::copy($randomImg->getPathname(), $destFolder . '/' . $filename);
                            $assignedImages[] = 'products/' . $filename;
                        }
                    }
                }

                $product = Product::create([
                    'category_id' => $category->id,
                    'name' => $prodData['name'],
                    'slug' => Str::slug($prodData['name']),
                    'short_description' => 'A beautifully handcrafted ' . strtolower($prodData['name']) . '.',
                    'full_description' => 'A beautifully handcrafted ' . strtolower($prodData['name']) . '. The perfect addition to your space. Note: Since these are handmade, small variations may occur.',
                    'price' => $prodData['price'],
                    'stock_quantity' => rand(10, 50),
                    'is_active' => true,
                ]);

                foreach ($assignedImages as $idx => $imgPath) {
                    $product->images()->create([
                        'path' => $imgPath,
                        'is_primary' => $idx === 0
                    ]);
                }
            }
        }
    }
}
