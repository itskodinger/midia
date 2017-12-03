# Midia
Simple media manager for your Laravel project

# Requirements
- PHP >= 5.6.4
- jQuery >= 1.12
- Laravel 5

# Tested
- [ ] Laravel 5.5
- [x] Laravel 5.4 
- [ ] Laravel 5.3 
- [ ] Laravel 5.2 
- [ ] Laravel 5.1 
- [ ] Laravel 5.0 

# Installation (Development Mode)
This package is still available for development only, not ready for production mode 'cause as it has to do testing to find some bugs and compatibility.

1. Create a new folder `packages/nauvalazhar`
2. Clone this package inside `packages/nauvalazhar`
3. Add these lines manually in the `autoload` key in your `composer.json` file
```
"psr-4": {
    "Nauvalazhar\\Midia\\": "packages/nauvalazhar/midia/src/"
},
```
4. Run `composer dump-autoload`
5. Done

# Usage
1. Run `php artisan vendor:publish --tag=midia`
2. Add these lines before the `</head>` tag
```
	<link rel="stylesheet" href="{{asset('vendor/midia/midia.css')}}">
	<link rel="stylesheet" href="{{asset('vendor/midia/dropzone.css')}}">
```
3. Add these lines before the `</body>` tag
```
	<script src="{{asset('vendor/midia/dropzone.js')}}"></script>
	<script src="{{asset('vendor/midia/midia.js')}}"></script>
```

# Integration
### TinyMCE 3
Need testing

### TinyMCE 4
```
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
### CKEditor
Need testing

### Standalone Button
```
<input type="text" id="my-file">
<button class="midia-toggle">Select File</button>

<script>
	$(".midia-toggle").midia({
		base_url: '{{url('')}}'
	});
</script>
```