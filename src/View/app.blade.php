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

		<script src="{{asset('vendor/midia/jquery.js')}}"></script>
		<script src="{{asset('vendor/midia/clipboard.js')}}"></script>
		<script src="{{asset('vendor/midia/dropzone.js')}}"></script>
		<script src="{{asset('vendor/midia/midia.js')}}"></script>
		<script>
			// default parameters
			var _options = {
				inline: true,
				base_url: '{{url('')}}',
				editor: '{{$editor}}'
            };

			// parsing querystring to object
            var deparam = function (querystring) {
                querystring = querystring.substring(querystring.indexOf('?')+1).split('&');
                var params = {}, pair, d = decodeURIComponent, i;
                for (i = querystring.length; i > 0;) {
                    pair = querystring[--i].split('=');
                    params[d(pair[0])] = d(pair[1]);
                }
                return params;
            };

			// get query params
            var _qparams = deparam(location.search);

			// initialize inline midia instance
			$("#midia-inline").midia($.extend(true, {}, _options, _qparams));
		</script>
	</body>
</html>