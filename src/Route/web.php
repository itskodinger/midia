<?php
Route::group(['prefix' => config('midia.prefix', 'midia'), 'middleware' => 'web'], function() {
	Route::get('open/{editor?}', 'Itskodinger\Midia\Controller\MidiaController@open')->name('midia.open');
	Route::get('get/{limit?}', 'Itskodinger\Midia\Controller\MidiaController@index')->name('midia.get');
	Route::delete('{file}/delete', 'Itskodinger\Midia\Controller\MidiaController@delete')->name('midia.delete');
	Route::put('{file}/rename', 'Itskodinger\Midia\Controller\MidiaController@rename')->name('midia.rename');
	Route::post('upload', 'Itskodinger\Midia\Controller\MidiaController@upload')->name('midia.upload');
});

Route::group(['prefix' => config('midia.url_prefix', 'media')], function() {
  Route::get('/{filename}', function ($filename) {
    $path = pathinfo($filename);

    preg_match_all('/thumbs-(.*)/i', $path['dirname'], $thumbs);

    if($path['dirname'] !== '.' && ($path['dirname'] !== config('midia.directory_name'))) {
      foreach(config('midia.directories') as $d) {
        if($d['name'] == rtrim(preg_replace('/thumbs-(.*)/i', '', $path['dirname']), "/")) {
          if(strpos($path['dirname'], "thumbs-") == false) {
            $path = $d['path'] . '/' . $path['basename'];
          }else{
            $path = $d['path'] . '/' . ltrim($thumbs[0][0], "/") . '/' . $path['basename'];
          }
          break;
        }
      }

      if(is_array($path)) {
        if(strpos($path['dirname'], "thumbs-") == false) {
          $path = config('midia.directory') . '/' . $filename;
        }else{
          $path = '';
        }
      }
    }else{
      $path = config('midia.directory') . '/' . $filename;
    }


    if(!File::exists($path)) return abort(404);

    $file = File::get($path);
    $type = File::mimeType($path);

    // resize on the fly
    $width = request()->width;
    $height = request()->height;

    if($width || $height) {
      if(!$width) $width = $height;
      if(!$height) $height = $width;

      $image = Image::make($path);
      $image->fit($width, $height);
      return $image->response();
    }


    $response = Response::make($file, 200);
    $response->header("Content-Type", $type);

    return $response;
  })->where('filename','(.*)');
});