# Midia
Simple media manager for your Laravel project. This package lets you open your files as inline modal. All directories in the folder will be ignored. In other words, can only read the file.

# Features
- Fully responsive
- Read, rename, delete file
- Infinite scroll
- Search
- Upload multiple
- Multiple thumbnail sizes
- Multiple directories
- Multiple instance
- More ...

# Preview
![midia](https://preview.ibb.co/hOo7MT/midia_1.png)
![midia](https://preview.ibb.co/bKbGFo/midia_2.png)
![midia](https://preview.ibb.co/cF0Xo8/midia_3.png)
![midia](https://preview.ibb.co/dZRrFo/midia_4.png)

# Todo List
- [ ] Multi user
- [ ] UI improvement
- [x] Thumbnail

# Requirements
- PHP >= 5.6.4
- jQuery >= 1.12 (Recommended: 1.12)
- intervention/image
- Dropzone.js
- Laravel 5

# Tested
- [x] Laravel 5.5
- [x] Laravel 5.4 
- [ ] Laravel 5.3 
- [ ] Laravel 5.2 
- [ ] Laravel 5.1 
- [ ] Laravel 5.0 

# Installation
Now, this package is available for production. You can install this package using these steps.

1. Install through Composer  
```
composer require itskodinger/midia
```

If you're using Laravel 5.6 you can skip this step, since it will be auto discovered by Laravel.

2. Put this line into `config/app.php` in the `providers` key
```php
Nauvalazhar\Midia\MidiaServiceProvider::class,
```
3. Done!

# Usage
1. Publish required assets.

```
php artisan vendor:publish --tag=midia
```

2. Put this code in the `<head>` tag

```html
<meta name="csrf-token" content="{{ csrf_token() }}">
```
3. Add these lines before the `</head>` tag
```html
<link rel="stylesheet" href="{{asset('vendor/midia/midia.css')}}">
<link rel="stylesheet" href="{{asset('vendor/midia/dropzone.css')}}">

// or using helpers

{!! midia_css() !!}

```
4. Make sure you've included jQuery before and put these lines after jQuery
```html
<script src="{{asset('vendor/midia/dropzone.js')}}"></script>
<script src="{{asset('vendor/midia/midia.js')}}"></script>

// or using helpers

{!! midia_js() !!}
```

**Note:** Default, all files that are read and uploaded will be stored in the `storage/media` folder, so create a folder named `media` in the `storage` folder if you have not already created it or you can change the location of the folders you want in `config/midia.php`.

# Integration
Here we have documented how to use it with TinyMCE 4 and as a stand-alone button. But, you can also try it yourself to be integrated with other editors like: CKEditor, Summernote, etc.

If you successfully integrate with other editors, then you can either create `issue` or change the `readme.md` file to document how you do it.

### TinyMCE 4
```html
<textarea class="tinymce"></textarea>
<script>
	  var editor_config = {
	    path_absolute : "{{url('')}}/",
	    selector: "textarea.tinymce",
	    plugins: [
	      "advlist autolink lists link image charmap print preview hr anchor pagebreak",
	      "searchreplace wordcount visualblocks visualchars code fullscreen",
	      "insertdatetime media nonbreaking save table contextmenu directionality",
	      "emoticons template paste textcolor colorpicker textpattern"
	    ],
	    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media",
	    relative_urls: false,
	    file_browser_callback : function(field_name, url, type, win) {
	      var x = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
	      var y = window.innerHeight|| document.documentElement.clientHeight|| document.getElementsByTagName('body')[0].clientHeight;

	      var cmsURL = editor_config.path_absolute + 'midia/open/tinymce4?field_name=' + field_name;

	      tinyMCE.activeEditor.windowManager.open({
	        file : cmsURL,
	        title : 'Filemanager',
	        width : x * 0.8,
	        height : y * 0.8,
	        resizable : "yes",
	        close_previous : "no"
	      });
	    }
	  };

	  tinymce.init(editor_config);
</script>
```
### Summernote
```html
<textarea class="summernote"></textarea>
<script>
    var midia = function(options, cb) {
        var route_prefix = (options && options.prefix) ? options.prefix : '/midia';
        window.open(route_prefix + '?type=' + options.type || 'file', 'Midia', 'width=900,height=600');
        window.SetUrl = cb;
    };
    
    var MButton = function(context) {
        var ui = $.summernote.ui;
        var button = ui.button({
            contents: '<i class="note-icon-picture"></i> ',
            tooltip: 'Insert image with filemanager',
            click: function() {
                midia({type: 'image', prefix: '/midia/open/summernote'}, function(url, path) {
                    context.invoke('insertImage', url);
                });
            }
        });
        return button.render();
    };
    
    $('.summernote').summernote({
        minHeight: 150,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough']],
            ['insert', ['link']],
            ['popovers', ['midia']],
        ],
        buttons: {
            midia: MButton
        }
    })
</script>
```
### Standalone Button
#### Popup
```html
<input type="text" id="my-file">
<button class="midia-toggle" data-input="my-file">Select File</button>

<script>
	$(".midia-toggle").midia({
		base_url: '{{url('')}}'
	});
</script>
```
#### Inline
```html
<div id="media"></div>

<script>
	$("#media").midia({
		inline: true,
		base_url: '{{url('')}}'
	});
</script>
```
#### Multiple Instance With Different Directories
```html
<div id="media1"></div>
<div id="media2"></div>

<script>
	<!-- Default directory -->
	$("#media1").midia({
		inline: true,
		base_url: '{{url('')}}'
	});
	<!-- 'mydocuments' directory -->
	$("#media2").midia({
		inline: true,
		base_url: '{{url('')}}',
		directory_name: 'mydocuments'
	});
</script>
```
You can also use the configuration in `.midia()`. The following is the default configuration:
```javascript
{
	title: 'Midia',
	paragraph: 'Press F2 (or double-click) on the item to rename the file.',
	inline: false, // if you want to open the media manager as an inline element
	base_url: '', // base url of your project
	file_name: '', // set to 'url' if you want to give full URL when choosing file,
	directory_name = '', // set with the existing key in the `config/midia.php` file in the 'directories' key. For example: 'mydocuments'
	data_target: 'input', // selector attribute for target file input
	data_preview: 'preview', // selector attribute for target file preview
	csrf_field: $("meta[name='csrf-token']").attr('content'), // your CSRF field
	dropzone: {}, // you can provide other dropzone options
	onOpen: function() {}, // method when the media manager will be opened
	onOpened: function() {}, // method when the media manager is opened
	onClose: function() {}, // method when the media manager is closed
	onChoose: function() {} // method when the media manager choose File
}
```

# Open The File
To open a file in the browser, you can do it easily like this:
```
http://yourdomain.com/media/filename.extension
```
For example:
```
http://yourdomain.com/media/image.png
```
**Note:** You can change the `media` prefix in the `config/midia.php` file

# Resize Image On The Fly
You can quickly resize an image, set the `width` parameters to the size you want (in pixels) and set the `height` parameters to the size you want. If the `width` parameter is not set, it will be set equal to the `height` parameter and If the `height` parameter is not set, it will be set equal to the `width` parameter.
```
For 100px * 300px image:
http://yourdomain.com/media/image.png?width=100&height=300
For 100px * 100px image:
http://yourdomain.com/media/image.png?width=100
```
**Note:** Resizing an image over its original size may make the image blurry

# Configuration
You can change the default configuration in the `config/midia.php` file.
```php
<?php
return [
    // DEFAULT Target directory
    'directory' => storage_path('media'),
    // For URL (e.g: http://base/media/filename.ext)
    'directory_name' => 'media',
    'url_prefix' => 'media',
    'prefix' => 'midia',

    // 404
    '404' => function() {
    	return abort(404);
    },
    
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
	'thumbs' => [100, /*80, 100*/],
];
```

# License
MIT License
