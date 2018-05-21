<?php 

if (!function_exists('midia_css')) {
    
    /**
     * Midia CSS HTML Tags.
     *
     * @return string
     */
    function midia_css()
    {
        return <<<EOT

<link rel="stylesheet" href="{{asset('vendor/midia/midia.css')}}">
<link rel="stylesheet" href="{{asset('vendor/midia/dropzone.css')}}">

EOT;
    }
}

if (!function_exists('midia_js')) {

    /**
     * Midia JS HTML Tags.
     *
     * @return string
     */
    function midia_js()
    {
        return <<<EOT

<script src="{{asset('vendor/midia/dropzone.js')}}"></script>
<script src="{{asset('vendor/midia/midia.js')}}"></script>

EOT;
    }
}
