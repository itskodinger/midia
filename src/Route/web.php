<?php
Route::get('midia/open/{editor?}', 'Nauvalazhar\Midia\Controller\MidiaController@open')->name('midia.open');
Route::get('midia/get/{limit?}', 'Nauvalazhar\Midia\Controller\MidiaController@index')->name('midia.get');
Route::delete('midia/{file}/delete', 'Nauvalazhar\Midia\Controller\MidiaController@delete')->name('midia.delete');
Route::post('midia/upload', 'Nauvalazhar\Midia\Controller\MidiaController@upload')->name('midia.upload');
Route::get('midia/demo', 'Nauvalazhar\Midia\Controller\MidiaController@demo')->name('midia.demo');

Route::get(config('midia.directory_name', 'media') . '/{filename}', function ($filename) {
  $path = storage_path() . '/media/' . $filename;
  if(!File::exists($path)) return abort(404);

  $file = File::get($path);
  $type = File::mimeType($path);

  $response = Response::make($file, 200);
  $response->header("Content-Type", $type);

  return $response;
})->where('filename','(.*)');