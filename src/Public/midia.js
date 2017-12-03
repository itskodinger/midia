(function($, window, i) {
	$.fn.midia = function(options) {
		var options = $.extend({
			title: 'Midia',
			inline: false,
			editor: false,
			base_url: '',
			file_name: '',
			onOpen: function() {},
			onOpened: function() {},
			onClose: function() {},
			onChoose: function() {}
		}, options);

		this.each(function() {
			let me = $(this);

			$(document).on("click", ".midia-close", function() {
				midia.close();
			});

			$(document).on("click", function(e) {
				if(!$(e.target).closest('.midia-item').hasClass("midia-item")) {
					$(".midia-delete").remove();
					$(".midia-item").removeClass("midia-selected");
				}
			});

			$(document).on("click", ".midia-delete", function() {
				let _this = $(this),
					ask = confirm('File will be deleted and this action can\'t be undone, do you want to continue?');

				if(ask) {
					$.ajax({
						url: options.base_url + '/midia/'+_this.data('file')+'/delete',
						type: 'delete',
						dataType: 'json',
						beforeSend: function() {

						},
						error: function(xhr) {
							alert('ERROR: ' + xhr.status + ' - ' + xhr.responseText);
						},
						complete: function() {

						},
						success: function(data) {
							$(".midia-delete").remove();
							$(".midia-item.midia-selected").remove();
						}
					})
				}
			});

			$(document).on("keydown", function(e) {
				if(e.key == 'Delete') {
					$(".midia-delete").click();
				}
			});

			var limit = 0,
				showing = 0;
			var midia = {
				open: function() {
					options.onOpen.call(this);

					if($(".midia-wrapper").length) {
						$(".midia-wrapper").show();
						return;
					}

					var element = '<div class="midia-wrapper'+(options.inline ? ' midia-inline' :'')+'">';
						element += '<div class="midia-modal">';
						element += '<div class="midia-content">';
						element += '	<div class="midia-header">';
						if(!options.inline) {
							element += '		<h4>'+options.title+'</h4>';
						}
						element += '		<div id="midia-total">...</div>';
						element += '		<div class="midia-nav">';
						element += '			<a href="#" id="midia-upload">Upload</a>';
						element += '		</div>';
						if(!options.inline) {
							element += '		<div class="midia-close">&times;</div>';
						}
						element += '	</div>';
						element += '	<div class="midia-body">';
						element += '		<div class="midia-upload">';
						element += '			<form class="dropzone" method="post" id="midia-dropzone" enctype="multipart/form-data">';
						element += '			</form>';
						element += '		</div>';
						element += '		<div class="midia-loader">';
						element += '			<div id="midia-files-loader" class="midia-files">';
						element += '			</div>';
						element += '			<div class="midia-outer-loadmore"><div class="midia-btn midia-btn-primary" id="midia-loadmore">Load More</div></div>';
						element += '		</div>';
						element += '	</div>';
						element += '</div>';
						element += "</div>";
						element += "</div>";
						element += "</div>";


					if(options.inline) {
						me.append(element);
					}else{
						$("body").append(element);
					}
					options.onOpened(this);

					Dropzone.autoDiscover = false;
					var mydropzone = new Dropzone("#midia-dropzone", {
						url: options.base_url + '/midia/upload'
					});

					$(document).on("click", "#midia-upload", function() {
						let _this = $(this);

						if(!$(".midia-upload").hasClass("midia-active")) {
							$(".midia-upload").addClass("midia-active");
							$(".midia-loader").hide();
							$(".midia-upload").show();
							_this.html('Back');						
						}else{
							_this.html('Uplaod');						
							$(".midia-upload").removeClass("midia-active");
							$(".midia-upload").hide();
							$(".midia-loader").show();
							$(".midia-loader #midia-files-loader").html("");
							limit = 0;
							load_files();
						}
					});

					var load_files = function(success) {
						limit += 1;
						var loader = $("#midia-files-loader");
						$.ajax({
							url: options.base_url + '/midia/get/' + limit,
							dataType: 'json',
							beforeSend: function() {
								$(".midia-files").append('<div class="midia-loading"><img src="'+options.base_url+'/vendor/midia/spinner.svg"><div>Please wait</div></div>');
								$("#midia-loadmore").hide();
							},
							error: function(xhr) {
								alert('ERROR: ' + xhr.status + ' - ' + xhr.responseJSON.data);
							},
							complete: function() {
								$(".midia-loading").remove();
							},
							success: function(data) {
								if(data.files.length == 0 && limit == 0) {
									$(".midia-files-loader").append("<div class='midia-p'>Directory is Empry</div>")
								}

								if(!data.files.length) {
									$("#midia-loadmore").hide();
									return;
								}

								showing += data.files.length;
								$("#midia-total").html(showing + " of " + data.total);
								var file = "";
								$.each(data.files, function(i, item) {
									file += "<div class='midia-item' data-id='"+item.fullname+"' data-file='"+JSON.stringify(item)+"' title='"+item.fullname+"'>";
									file += "<div class='midia-item-inner'>";
									if(item.extension == 'jpg' || item.extension == 'png' || item.extension == 'bmp' || item.extension == 'gif' || item.extension == 'jpeg') {
										file += "<div class='midia-image'><img src='"+item.url+"' alt='"+item.fullname+"'></div>";
									}else{
										file += "<div class='midia-image midia-notimage'>"+item.extension+"</div>";
									}
									file += "<div class='midia-name'>"+item.fullname+"</div>";
									file += "<div class='midia-desc'>";
									file += item.size;
									file += "</div>";
									file += "<div class='midia-choose' data-file='"+JSON.stringify(item)+"'>";
									file += 'Choose';
									file += "</div>";
									file += "</div>";
									file += "</div>";
								});
								$("#midia-loadmore").show();
								loader.append(file);
								if(success) {
									success.call(this);
								}
							}
						});
					}
					load_files();

					$(document).on("click", ".midia-files .midia-item", function() {
						var _this = $(this);

						$(".midia-files .midia-item").removeClass("midia-selected");
						$(".midia-delete").remove();

						if(_this.hasClass("midia-selected")) {
							_this.removeClass("midia-selected");
						}else{
							_this.addClass("midia-selected");
							$(".midia-nav").append("<a class='midia-btn-delete midia-delete' data-file='"+_this.data('file').fullname+"'>Delete (DEL)</a>")
						}
					});

					var getUrlParam = function(paramName) {
						var reParam = new RegExp('(?:[\?&]|&)' + paramName + '=([^&]+)', 'i');
						var match = window.location.search.match(reParam);
						return ( match && match.length > 1 ) ? match[1] : null;
					}

					var choose = {
						tinymce4: function(url, field_name) {
						    parent.document.getElementById(field_name).value = url;

						    if(typeof parent.tinyMCE !== "undefined") {
						     	parent.tinyMCE.activeEditor.windowManager.close();
						    }
						    if(typeof parent.$.fn.colorbox !== "undefined") {
						     	parent.$.fn.colorbox.close();
						    }
						},
						tinymce3: function(url) {
							var win = tinyMCEPopup.getWindowArg("window");
							win.document.getElementById(tinyMCEPopup.getWindowArg("input")).value = url;
							if (typeof(win.ImageDialog) != "undefined") {
								if (win.ImageDialog.getImageData) {
									win.ImageDialog.getImageData();
								}

								if (win.ImageDialog.showPreviewImage) {
									win.ImageDialog.showPreviewImage(url);
								}
							}
							tinyMCEPopup.close();
						},
						ckeditor3: function(url) {
							if (window.opener) {
								window.opener.CKEDITOR.tools.callFunction(getUrlParam('CKEditorFuncNum'), url);
							} else {
								parent.CKEDITOR.tools.callFunction(getUrlParam('CKEditorFuncNum'), url);
								parent.CKEDITOR.tools.callFunction(getUrlParam('CKEditorCleanUpFuncNum'));
							}
						},
						ckeditor2: function(url) {
							var p = url;
							var w = data['Properties']['Width'];
							var h = data['Properties']['Height'];
							window.opener.SetUrl(p,w,h);
						}

					}

					$(document).on("click", ".midia-files .midia-item .midia-choose", function() {
						let _this = $(this),
							file = _this.data('file'),
							file_name = file.fullname;

						if(options.file_name == 'url') {
							file_name = file.url;
						}

						var url = file.url;
						var field_name = getUrlParam('field_name');
						var is_ckeditor = getUrlParam('CKEditor');
						var is_fcke = typeof data != 'undefined' && data['Properties']['Width'] != '';

						if (window.tinyMCEPopup) {
							choose.tinymce3(url);
						} else if (field_name) {
							choose.tinymce4(url, field_name);
						} else if(is_ckeditor) {
							choose.ckeditor3(url);
						} else if (is_fcke) {
							choose.ckeditor2(url);
						} else {
							$("#" + me.data('target')).val(file_name);
							options.onChoose.call(this, file);
							midia.close();						
						}

					});

					$(document).on("click", "#midia-loadmore", function() {
						let _this = $(this);

						_this.html('Working');
						_this.addClass('midia-disabled');
						load_files(function() {
							_this.removeClass('midia-disabled');
							_this.html('Load More');
						});
					});

					$(document).on("click", ".midia-disabled", function() {
						return false;
					});
				},
				close: function() {
					$(".midia-wrapper").hide();
					options.onClose.call(this);
				}
			}

			if(options.inline == true) {
				midia.open();
			}else{
				me.on("click", function() {
					midia.open();
				});
			}
		});
	}

})(jQuery, this, 0);