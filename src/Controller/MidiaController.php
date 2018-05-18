<?php
namespace Nauvalazhar\Midia\Controller;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use File;

class MidiaController extends Controller {
    protected $directory;
    protected $directory_name;

    public function __construct() {
        if (request()->has('directory')) {
            $directory = request()->get('directory', null);
        }
        if (request()->has('directory_name')) {
            $directoryName = request()->get('directory_name', null);
        }
        $this->directory = !empty($directory)
            ? $directory
            : config('midia.directory', storage_path('media'));
        $this->directory_name = !empty($directoryName)
            ? $directoryName
            : config('midia.directory_name', 'media');
    }

    public function index($limit) {
        $dir = $this->directory;
        $q = request()->key;

        if(!is_dir($dir)) {
            return response(['data' => 'Directory can\'t be found'], 404);
        }

        $exec = scandir($dir);
        $exec = array_splice($exec, 2);

        $files = [];
        foreach($exec as $file) {
            $files[$file] = filemtime($dir . '/' . $file);
        }

        arsort($files);
        $files = array_keys($files);
        $exec = $files;

        $_files = [];
        foreach($exec as $i => $item) {
            if(!is_dir($this->directory . '/' . $item)) {
                $_files[$i]['fullname'] = $item;
                $_files[$i]['name'] = pathinfo($item, PATHINFO_FILENAME);
                $_files[$i]['url'] = url($this->directory_name . '/' . $item);
                $_files[$i]['extension'] = strtolower(pathinfo($item,PATHINFO_EXTENSION));
                $_files[$i]['size'] = $this->toMb(filesize($this->directory . '/' . $item));
                $_files[$i]['filetime'] = filemtime($this->directory . '/' . $item);
            }
        }

        $total_all = count($_files);

        if(isset($q) && trim($q) !== '') {
            $_search = [];
            foreach($_files as $key => $file) {
                if(strpos($file['fullname'], $q) !== false) {
                    $_search[$key] = $file;
                }
            }
            $_files = $_search;
        }

        $page = $limit;
        $perPage = 20;
        $offset = ($page * $perPage) - $perPage;

        $exec = array_slice($_files, $offset, $perPage);
        $dir = json_encode(["files" => $exec, "total" => count($_files), "total_all" => $total_all]);

        return response($dir, 200)
            ->header('Content-Type', 'application/json');
    }

    public function toMb($bytes) {
        for ($i=0;$bytes>=1024&&$i<5;$i++)
            $bytes/=1024;

        return round($bytes,2).[' B',' KB',' MB',' GB',' TB',' PB'][$i];
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
        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $wo_extension = basename($fileName, "." . $file->getClientOriginalExtension());

        $inc = 1;
        while(file_exists($this->directory . '/' . $fileName)) {
            $name = $wo_extension . '-' . $inc;
            $fileName = $name . '.' . $file->getClientOriginalExtension();
            $inc++;
        }
        $file->move($this->directory, $fileName);
        return response()->json(['success'=>$fileName]);
    }

    public function rename(Request $request, $file) {
        $fileName = $request->newName;
        $wo_extension = pathinfo($fileName, PATHINFO_FILENAME);
        $_extension = explode(".", $fileName);
        $extension = end($_extension);

        $inc = 1;
        while(file_exists($this->directory . '/' . $fileName)) {
            $name = $wo_extension . '-' . $inc;
            $fileName = $name . '.' . $extension;
            $inc++;
        }

        rename($this->directory . '/' . $file, $this->directory . '/' . $fileName);

        $new_data = [];
        $new_data['fullname'] = $fileName;
        $new_data['name'] = pathinfo($fileName, PATHINFO_FILENAME);
        $new_data['url'] = url($this->directory_name . '/' . $fileName);

        return response()->json(['success'=>$new_data]);
    }
}