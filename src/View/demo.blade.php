<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<title></title>
	<link rel="stylesheet" href="{{asset('vendor/midia/midia.css')}}">
	<link rel="stylesheet" href="{{asset('vendor/midia/dropzone.css')}}">
</head>
<body>
	<input type="text" id="midia-input">
	<button class="midia-toggle" data-target="midia-input">Pick</button>

	<textarea class="tinymce"></textarea>

	<script src="{{asset('assets/js/app.js')}}"></script>
	<script src="{{asset('assets/scripts/tinymce/js/tinymce/tinymce.min.js')}}"></script>
	<script src="{{asset('vendor/midia/dropzone.js')}}"></script>
	<script src="{{asset('vendor/midia/midia.js')}}"></script>
	<script>
		$(".midia-toggle").midia({
			base_url: '{{url('')}}'
		});

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
</body>
</html>