(function($, window, i) {
    $.fn.midia = function(options) {
        var options = $.extend({
            title: 'Midia',
            paragraph: 'Press F2 (or double-click) on the item to rename the file.',
            inline: false,
            editor: false,
            base_url: '',
            file_name: '',
            data_target: 'input',
            data_preview: 'preview',
            csrf_field: $("meta[name='csrf-token']").attr('content'),
            directory: '',
            directory_name: '',
            dropzone: {},
            onOpen: function() {},
            onOpened: function() {},
            onClose: function() {},
            onChoose: function() {}
        }, options);

        this.each(function() {
            let me = $(this),
                csrf_field = options.csrf_field;

            $(document).on("click", ".midia-close", function() {
                midia.close();
            });

            $(document).on("click", function(e) {
                if(!$(e.target).closest('.midia-item').hasClass("midia-item")) {
                    $(".midia-item").removeClass("midia-selected");
                    $(".midia-item").removeClass("midia-unselected");
                }
            });

            $(document).on("click", ".midia-delete", function() {
                var create_delete_url = function (filename){
                    var url = options.base_url + '/midia/' + filename + '/delete';
                    var isDirNameEmpty = options.directory_name === '';
                    if (!isDirNameEmpty) {
                        url += '?directory_name=' + options.directory_name;
                    }
                    if (options.directory !== '') {
                        if (isDirNameEmpty) {
                            url += '?';
                        } else {
                            url += '&';
                        }
                        url += 'directory=' + options.directory;
                    }

                    return url;
                };

                let _this = $(this),
                    ask = confirm('File will be deleted and this action can\'t be undone, do you want to continue?');

                if(ask) {
                    $.ajax({
                        url: create_delete_url(_this.closest('.midia-item').data('file').fullname),
                        // url: options.base_url + '/midia/'+_this.closest('.midia-item').data('file').fullname+'/delete',
                        type: 'delete',
                        headers: {
                            'X-CSRF-TOKEN': csrf_field
                        },
                        dataType: 'json',
                        beforeSend: function() {
                            $(".midia-delete").addClass('midia-disabled');
                            $(".midia-delete").html('Deleting');
                        },
                        error: function(xhr) {
                            alert('ERROR: ' + xhr.status + ' - ' + xhr.responseText);
                        },
                        complete: function() {
                            $(".midia-delete").removeClass('midia-disabled');
                            $(".midia-delete").html('Delete');
                        },
                        success: function(data) {
                            $(".midia-item.midia-selected").remove();
                            $(".midia-item").removeClass('midia-unselected');
                        }
                    })
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
                    element += '		<div class="midia-title">';
                    element += '			<h4>'+options.title+'</h4>';
                    element += '			<p>'+options.paragraph+'</p>';
                    element += '		</div>';
                    element += '		<div class="midia-nav">';
                    element += '			<a id="midia-total">...</a>';
                    element += '			<a href="#" id="midia-upload">Upload</a>';
                    element += '			<a href="#" id="midia-reload">Reload</a>';
                    if(!options.inline) {
                        element += '			<a href="#" class="midia-close">Close</a>';
                    }
                    element += '		</div>';
                    element += ' 		<div class="midia-input-outer">';
                    element += '			<input type="text" id="midia-search" class="midia-input" placeholder="Search and hit Enter (Escape to clear)">';
                    element += '		</div>';
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
                    $("body").css({
                        overflow: 'hidden'
                    });
                    options.onOpened(this);

                    var default_dropzone_options = options.dropzone;
                    if(typeof default_dropzone_options.url !== 'undefined') {
                        delete default_dropzone_options.url;
                    }

                    if(typeof default_dropzone_options.headers !== 'undefined') {
                        delete default_dropzone_options.headers;
                    }

                    var create_upload_url = function () {
                        var url = options.base_url + '/midia/upload';
                        var isDirNameEmpty = options.directory_name === '';
                        if (!isDirNameEmpty) {
                            url += '?directory_name=' + options.directory_name;
                        }
                        if (options.directory !== '') {
                            if (isDirNameEmpty) {
                                url += '?';
                            } else {
                                url += '&';
                            }
                            url += 'directory=' + options.directory;
                        }

                        return url;
                    };

                    var dropzone_options = default_dropzone_options;
                    dropzone_options = $.extend({
                        url: create_upload_url(),
                        // url: options.base_url + '/midia/upload',
                        headers: {
                            'X-CSRF-TOKEN': csrf_field
                        },
                        maxFilesize: 2
                    }, default_dropzone_options);

                    Dropzone.autoDiscover = false;
                    var mydropzone = new Dropzone("#midia-dropzone", dropzone_options);

                    $(document).on("click", "#midia-upload", function() {
                        let _this = $(this);

                        if(!$(".midia-upload").hasClass("midia-active")) {
                            $(".midia-upload").addClass("midia-active");
                            $(".midia-loader").hide();
                            $("#midia-search").hide();
                            $("#midia-reload").hide();
                            $(".midia-upload").show();
                            _this.html('Back');
                        }else{
                            _this.html('Uplaod');
                            $(".midia-upload").removeClass("midia-active");
                            $(".midia-upload").hide();
                            $(".midia-loader").show();
                            $("#midia-search").show();
                            $("#midia-reload").show();
                            $(".midia-loader #midia-files-loader").html("");
                            limit = 0;
                            showing = 0;
                            load_files();
                        }

                        return false;
                    });

                    var create_load_url = function (limit, key) {
                        var url = options.base_url + '/midia/get/' + limit + '?key=' + key;
                        if (options.directory_name !== '') {
                            url += '&directory_name=' + options.directory_name;
                        }
                        if (options.directory !== '') {
                            url += '&directory=' + options.directory;
                        }

                        return url;
                    };

                    var load_files = function(success) {
                        limit += 1;
                        var loader = $("#midia-files-loader"),
                            key = $("#midia-search").val();

                        $.ajax({
                            url: create_load_url(limit, key),
                            dataType: 'json',
                            headers: {
                                'X-CSRF-TOKEN': csrf_field
                            },
                            beforeSend: function() {
                                $(".midia-files").append('<div class="midia-loading"><img src="'+options.base_url+'/vendor/midia/spinner.svg"><div>Please wait</div></div>');
                                $("#midia-loadmore").hide();
                                if(key) {
                                    $("#midia-search").attr('disabled', true);
                                }
                            },
                            error: function(xhr) {
                                $("#midia-total").html('Error');
                                loader.html('<div class=\'midia-notfound\'>ERROR: ' + xhr.status + ' - ' + xhr.responseJSON.data + '</div>');
                            },
                            complete: function() {
                                $(".midia-loading").remove();
                                if(key) {
                                    $("#midia-search").attr('disabled', false);
                                }
                            },
                            success: function(data) {
                                $("#midia-loadmore").show();
                                showing += data.files.length;
                                $("#midia-total").html(showing + " of " + data.total);

                                if(data.total_all == 0) {
                                    loader.html("<div class='midia-notfound'>Your directory is empty</div>");
                                }

                                if(data.total_all > 0 && data.files.length == 0) {
                                    loader.html("<div class='midia-notfound'>Whoops, file with name <i>'"+key+"'</i> couldn't be found</div>");
                                }

                                if(success) {
                                    success.call(this);
                                }
                                if(data.files.length == 0 && limit == 0) {
                                    $(".midia-files-loader").append("<div class='midia-p'>Directory is Empry</div>")
                                }

                                if(!data.files.length) {
                                    $("#midia-loadmore").hide();
                                    return;
                                }

                                if(data.files.length == data.total || showing == data.total) {
                                    $("#midia-loadmore").hide();
                                }

                                var file = "";
                                $.each(data.files, function(i, item) {
                                    file += "<div class='midia-item' data-id='"+item.fullname+"' data-file='"+JSON.stringify(item)+"'>";
                                    file += "<div class='midia-item-inner'>";
                                    if(item.extension == 'jpg' || item.extension == 'png' || item.extension == 'bmp' || item.extension == 'gif' || item.extension == 'jpeg') {
                                        file += "<div class='midia-image'><img src='"+item.url+"' alt='"+item.fullname+"'></div>";
                                    }else{
                                        file += "<div class='midia-image midia-notimage'>"+item.extension+"</div>";
                                    }
                                    file += "<div class='midia-name' title='"+item.fullname+"'>"+item.fullname+"</div>";
                                    file += "<div class='midia-desc'>";
                                    file += item.size;
                                    file += "</div>";
                                    file += "<div class='midia-actions'>";
                                    if(options.inline != true || (options.inline == true && options.editor != false)) {
                                        file += "<div class='midia-action-item midia-choose'>";
                                        file += 'Choose';
                                        file += "</div>";
                                    }
                                    file += "<div class='midia-action-item midia-delete'>";
                                    file += 'Delete';
                                    file += "</div>";
                                    file += "</div>";
                                    file += "</div>";
                                    file += "</div>";
                                });
                                loader.append(file);
                            }
                        });
                    }
                    load_files();

                    $(document).on("keydown", "#midia-search", function(e) {
                        if(e.key == 'Enter') {
                            $(".midia-loader #midia-files-loader").html("");
                            limit = 0;
                            showing = 0;
                            load_files(false);
                        }

                        if(e.key == 'Escape') {
                            $(this).val("");
                            $(".midia-loader #midia-files-loader").html("");
                            limit = 0;
                            showing = 0;
                            load_files(false);
                        }
                    });

                    $(document).on("click", "#midia-reload", function() {
                        $(".midia-loader #midia-files-loader").html("");
                        limit = 0;
                        showing = 0;
                        load_files();
                    });

                    var create_rename_url = function (filename) {
                        var url = options.base_url + '/midia/' + filename + '/rename';
                        var isDirNameEmpty = options.directory_name === '';
                        if (!isDirNameEmpty) {
                            url += '?directory_name=' + options.directory_name;
                        }
                        if (options.directory !== '') {
                            if (isDirNameEmpty) {
                                url += '?';
                            } else {
                                url += '&';
                            }
                            url += 'directory=' + options.directory;
                        }

                        return url;
                    };

                    var rename_file = function() {
                        if($(".midia-selected").length) {
                            let rename = prompt('Rename this file to:', $(".midia-selected").data('file').name);
                            if(rename && rename !== $(".midia-selected").data('file').name) {
                                $.ajax({
                                    url: create_rename_url($(".midia-selected").data('file').fullname),
                                    // url: options.base_url + '/midia/'+$(".midia-selected").data('file').fullname+'/rename',
                                    type: 'put',
                                    data: {
                                        newName: rename + "." + $(".midia-selected").data('file').extension
                                    },
                                    dataType: 'json',
                                    headers: {
                                        'X-CSRF-TOKEN': csrf_field
                                    },
                                    beforeSend: function() {
                                        $(".midia-selected").addClass('midia-doload');
                                        $(".midia-choose").addClass('midia-disabled');
                                        $(".midia-delete").addClass('midia-disabled');
                                    },
                                    error: function(xhr) {
                                        alert('ERROR: ' + xhr.status + ' - ' + xhr.responseText);
                                    },
                                    complete: function() {
                                        $(".midia-selected").removeClass('midia-doload');
                                        $(".midia-choose").removeClass('midia-disabled');
                                        $(".midia-delete").removeClass('midia-disabled');
                                    },
                                    success: function(data) {
                                        data = data.success;
                                        $(".midia-selected .midia-name").html(data.fullname);
                                        var new_data = data;
                                        new_data = $.extend($(".midia-selected").data('file'), data);
                                        $(".midia-selected").attr('data-file', new_data);
                                    }
                                });
                            }
                        }
                    }

                    $(document).on("keydown", function(e) {
                        if(e.key == 'Escape') {
                            $(".midia-files .midia-item").removeClass("midia-unselected").removeClass("midia-selected");
                        }

                        if(e.key == 'F2') {
                            rename_file();
                        }
                    });

                    $(document).on("click", ".midia-files .midia-item .midia-item-inner", function() {
                        var _this = $(this).parent();

                        $(".midia-files .midia-item").addClass("midia-unselected");
                        $(".midia-files .midia-item").removeClass("midia-selected");

                        if(_this.hasClass("midia-selected")) {
                            _this.removeClass("midia-selected");
                            _this.removeClass("midia-unselected");
                        }else{
                            _this.addClass("midia-selected");
                        }
                    });

                    $(document).on("dblclick", ".midia-files .midia-item .midia-item-inner", function() {
                        rename_file();
                        return false;
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
                            file = _this.closest('.midia-item').data('file'),
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
                            $("#" + me.data(options.data_target)).val(file_name);
                            if($("#" + me.data(options.data_preview)).length) {
                                $("#" + me.data(options.data_preview)).attr('src', url);
                            }
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
                    $("body").css({
                        overflow: 'initial'
                    });
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