<?php
Route::group(['prefix' => config('midia.prefix', 'midia'), 'middleware' => 'web'], function() {
	Route::get('open/{editor?}', 'Nauvalazhar\Midia\Controller\MidiaController@open')->name('midia.open');
	Route::get('get/{limit?}', 'Nauvalazhar\Midia\Controller\MidiaController@index')->name('midia.get');
	Route::delete('{file}/delete', 'Nauvalazhar\Midia\Controller\MidiaController@delete')->name('midia.delete');
	Route::put('{file}/rename', 'Nauvalazhar\Midia\Controller\MidiaController@rename')->name('midia.rename');
	Route::post('upload', 'Nauvalazhar\Midia\Controller\MidiaController@upload')->name('midia.upload');
});

Route::group(['prefix' => config('midia.url_prefix', 'media')], function() {
  Route::get('/{filename}', function ($filename) {
    $path = pathinfo($filename);

    if($path['dirname'] !== '.' && ($path['dirname'] !== config('midia.directory_name'))) {
      foreach(config('midia.directories') as $d) {
        if($d['name'] == $path['dirname']) {
          $path = $d['path'] . '/' . $path['basename'];
          break;
        }
      }

      if(is_array($path)) {
        $path = '';
      }
    }else{
      $path = config('midia.directory') . '/' . $filename;
    }

    if(!File::exists($path)) return config('midia.404')();

    $file = File::get($path);
    $type = File::mimeType($path);

    $response = Response::make($file, 200);
    $response->header("Content-Type", $type);

    return $response;
  })->where('filename','(.*)');
});