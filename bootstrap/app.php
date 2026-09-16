<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (\Illuminate\Http\Exceptions\PostTooLargeException $e, Request $request) {
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return redirect()->back()->withErrors([
                    'image' => 'The uploaded file/image is too large. Please select a file smaller than 20MB.',
                ])->with('error', 'The uploaded file is too large. Please select a smaller file (max 20MB).');
            }
            return redirect()->back()->with('error', 'The uploaded file is too large. Please select a smaller file.');
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, Request $request) {
            if ($request->header('X-Inertia') || ! $request->expectsJson()) {
                return \Inertia\Inertia::render('Errors/NotFound')->toResponse($request)->setStatusCode(404);
            }
        });
    })->create();
