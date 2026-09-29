<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <!-- Primary Meta Tags -->
        <meta name="description" content="Swecha Studio - Premium Handmade Concrete Home Decor. Discover our unique collection of concrete jars, trays, coasters, and custom artistic pieces.">
        <meta name="keywords" content="Swecha Studio, Concrete Home Decor, Handmade Decor, Concrete Jars, Concrete Trays, Artistic Home Accessories, Buy Home Decor Online">
        <meta name="robots" content="index, follow">
        <meta name="language" content="English">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url('/') }}">
        <meta property="og:title" content="Swecha Studio | Premium Handmade Decor">
        <meta property="og:description" content="Swecha Studio - Premium Handmade Concrete Home Decor. Discover our unique collection of concrete jars, trays, coasters, and custom artistic pieces.">
        <meta property="og:image" content="{{ asset('images/main_logo.png') }}">
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url('/') }}">
        <meta property="twitter:title" content="Swecha Studio | Premium Handmade Decor">
        <meta property="twitter:description" content="Swecha Studio - Premium Handmade Concrete Home Decor. Discover our unique collection of concrete jars, trays, coasters, and custom artistic pieces.">
        <meta property="twitter:image" content="{{ asset('images/main_logo.png') }}">

        <title inertia>{{ config('app.name', 'Swecha Studio') }}</title>
        <link rel="icon" type="image/png" href="{{ asset('images/main_logo.png') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

        <!-- Developer Footprint (Invisible to users, visible to Search Engines) -->
        <meta name="author" content="Muzaffar Hussain (iInfynite)">
        <script type="application/ld+json">
        {
            "@@context": "https://schema.org",
            "@@type": "WebSite",
            "name": "{{ config('app.name', 'Swecha Studio') }}",
            "url": "{{ url('/') }}",
            "author": {
                "@@type": "Person",
                "name": "Muzaffar Hussain",
                "jobTitle": "Software Engineer",
                "worksFor": {
                    "@@type": "Organization",
                    "name": "iInfynite"
                }
            },
            "creator": {
                "@@type": "Organization",
                "name": "iInfynite",
                "founder": "Muzaffar Hussain"
            }
        }
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="bg-brand-50 text-brand-800 font-sans antialiased selection:bg-brand-500 selection:text-white flex flex-col min-h-screen">
        @inertia
    </body>
</html>
