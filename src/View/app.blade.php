<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="csrf-token" content="{{ csrf_token() }}">
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<title></title>
		<link rel="stylesheet" href="{{asset('vendor/midia/midia.css')}}">
		<link rel="stylesheet" href="{{asset('vendor/midia/dropzone.css')}}">
	</head>
	<body>
		<div id="midia-inline"></div>

		<script src="{{asset('assets/js/app.js')}}"></script>
		<script src="{{asset('vendor/midia/dropzone.js')}}"></script>
		<script src="{{asset('vendor/midia/midia.js')}}"></script>
		<script>
			$("#midia-inline").midia({
				inline: true,
				base_url: '{{url('')}}',
				editor: '{{$editor}}'
			});
		</script>
	</body>
</html>