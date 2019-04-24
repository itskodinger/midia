<?php

namespace Itskodinger\Midia;

use Illuminate\Support\ServiceProvider;

class MidiaServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        require __DIR__ . '/Helpers.php';

        $this->loadRoutesFrom(__DIR__ . '/Route/web.php');
        $this->loadViewsFrom(__DIR__ . '/View', 'midia');

        $this->publishes([
            __DIR__ . '/Config/midia.php' => config_path('midia.php'),
            __DIR__ . '/Public/lang' => public_path('vendor/midia/lang'),
            __DIR__ . '/Public/clipboard.js' => public_path('vendor/midia/clipboard.js'),
            __DIR__ . '/Public/midia.js' => public_path('vendor/midia/midia.js'),
            __DIR__ . '/Public/midia.css' => public_path('vendor/midia/midia.css'),
            __DIR__ . '/Public/dropzone.js' => public_path('vendor/midia/dropzone.js'),
            __DIR__ . '/Public/jquery.js' => public_path('vendor/midia/jquery.js'),
            __DIR__ . '/Public/dropzone.css' => public_path('vendor/midia/dropzone.css'),
            __DIR__ . '/Public/spinner.svg' => public_path('vendor/midia/spinner.svg')
        ], 'midia');
   }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->mergeConfigFrom(__DIR__ . '/Config/midia.php', config_path('midia.php'));
    }
}
