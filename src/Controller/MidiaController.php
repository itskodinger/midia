<?php
namespace Nauvalazhar\Midia\Controller;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use File;

class MidiaController extends Controller {
	protected $directory;
	protected $directory_name;

	public function __construct() {
		$this->directory = config('midia.directory', storage_path('media'));
		$this->directory_name = config('midia.directory_name', 'media');		
	}

	public function index($limit) {
		$dir = $this->directory;

		if(!is_dir($dir)) {
			return response(['data' => 'Directory can\'t be found'], 404);
		}

		$exec = scandir($dir);
		$exec = array_splice($exec, 2);
		$_files = [];
		foreach($exec as $i => $item) {
			if(!is_dir($this->directory . '/' . $item)) {			
				$_files[$i]['fullname'] = $item;
				$_files[$i]['name'] = pathinfo($item, PATHINFO_FILENAME);
				$_files[$i]['extension'] = pathinfo($item,PATHINFO_EXTENSION);
				$_files[$i]['size'] = $this->toMb(filesize($this->directory . '/' . $item));
				$_files[$i]['url'] = url($this->directory_name . '/' . urlencode($item));
			}
		}

		$page = $limit;
		$perPage = 20;
		$offset = ($page * $perPage) - $perPage;

		$exec = array_slice($_files, $offset, $perPage);
		$dir = json_encode(["files" => $exec, "total" => count($_files)]);

		return response($dir, 200)
		->header('Content-Type', 'application/json');
	}

	public function toMb($bytes) {
        $units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
	}

	public function open($editor) {
		return view('midia::app', compact('editor'));
	}

	public function delete($file) {
		unlink($this->directory . '/' . $file);
		return response(['data' => 'ok'], 200)
		->header('Content-Type', 'application/json');	
	}

	public function upload(Request $request) {
        $image = $request->file('file');
        $imageName = $image->getClientOriginalName();
        $image->move($this->directory, $imageName);
        return response()->json(['success'=>$imageName]);
	}

	public function demo() {
		return view('midia::demo');
	}
}