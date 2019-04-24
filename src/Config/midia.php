<?php
return [
    // DEFAULT Target directory
    'directory' => storage_path('media'),
    // For URL (e.g: http://base/media/filename.ext)
    'directory_name' => 'media',
    'url_prefix' => 'media',
    'prefix' => 'midia',
    // Multiple target directories
    'directories' => [
    	// Examples:
    	// ---------
    	// 'home' => [
    	// 	'path' => storage_path('media/home'),
    	// 	'name' => 'media/home' // as url prefix
    	// ],
    	'mydocuments' => [
    		'path' => storage_path('mydocuments'),
    		'name' => 'mydocuments' // as url prefix
    	],
    ],

    // Thumbnail size will be generated
	'thumbs' => [100/*, 80, 100*/],
];
