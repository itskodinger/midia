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
            directory_name: '',
            dropzone: {},
            onOpen: function() {},
            onOpened: function() {},
            onClose: function() {},
            onChoose: function() {}
        }, options);

        this.each(function() {
            i++;

            let me = $(this),
                csrf_field = options.csrf_field,
                id = 'midia-' + Math.random().toString(36).substring(7),
                myid = '#' + id;

            $(document).on("click", myid + " .midia-close", function() {
                midia.close();
            });

            $(document).on("click", function(e) {
                if(!$(e.target).closest(myid + ' .midia-item').hasClass("midia-item")) {
                    $(myid + " .midia-item").removeClass("midia-selected");
                    $(myid + " .midia-item").removeClass("midia-unselected");
                }
            });

            $(document).on("click", myid + " .midia-delete", function() {
                var create_delete_url = function (filename){
                    var url = options.base_url + '/midia/' + filename + '/delete';
                    var isDirNameEmpty = options.directory_name === '';
                    if (!isDirNameEmpty) {
                        url += '?directory_name=' + options.directory_name;
                    }

                    return url;
                };

                let _this = $(this),
                    ask = confirm('File will be deleted and this action can\'t be undone, do you want to continue?');

                if(ask) {
                    $.ajax({
                        url: create_delete_url(_this.closest(myid + ' .midia-item').data('file').fullname),
                        // url: options.base_url + '/midia/'+_this.closest('.midia-item').data('file').fullname+'/delete',
                        type: 'delete',
                        headers: {
                            'X-CSRF-TOKEN': csrf_field
                        },
                        dataType: 'json',
                        beforeSend: function() {
                            $(myid + " .midia-delete").addClass('midia-disabled');
                            $(myid + " .midia-delete").html('Deleting');
                        },
                        error: function(xhr) {
                            alert('ERROR: ' + xhr.status + ' - ' + xhr.responseText);
                        },
                        complete: function() {
                            $(myid + " .midia-delete").removeClass('midia-disabled');
                            $(myid + " .midia-delete").html('Delete');
                        },
                        success: function(data) {
                            $(myid + " .midia-item.midia-selected").remove();
                            $(myid + " .midia-item").removeClass('midia-unselected');
                        }
                    })
                }
            });

            var limit = 0,
                showing = 0;
            var midia = {
                open: function() {
                    options.onOpen.call(this);

                    if($(myid + ".midia-wrapper").length) {
                        $(myid + ".midia-wrapper").show();
                        return;
                    }

                    var element = '<div id="' + id + '" class="midia-wrapper'+(options.inline ? ' midia-inline' :'')+'">';
                    element += '<div class="midia-modal">';
                    element += '<div class="midia-content">';
                    element += '    <div class="midia-header">';
                    element += '        <div class="midia-title">';
                    element += '            <h4>'+options.title+'</h4>';
                    element += '            <p>'+options.paragraph+'</p>';
                    element += '        </div>';
                    element += '        <div class="midia-nav">';
                    element += '            <a id="midia-total">...</a>';
                    element += '            <a href="#" id="midia-upload">Upload</a>';
                    element += '            <a href="#" id="midia-reload">Reload</a>';
                    if(!options.inline) {
                        element += '            <a href="#" class="midia-close">Close</a>';
                    }
                    element += '        </div>';
                    element += '        <div class="midia-input-outer">';
                    element += '            <input type="text" id="midia-search" class="midia-input" placeholder="Search and hit Enter (Escape to clear)">';
                    element += '        </div>';
                    element += '    </div>';
                    element += '    <div class="midia-body">';
                    element += '        <div class="midia-upload">';
                    element += '            <form class="dropzone" method="post" id="midia-dropzone" enctype="multipart/form-data">';
                    element += '            </form>';
                    element += '        </div>';
                    element += '        <div class="midia-loader">';
                    element += '            <div id="midia-files-loader" class="midia-files">';
                    element += '            </div>';
                    element += '            <div class="midia-outer-loadmore"><div class="midia-btn midia-btn-primary" id="midia-loadmore">Load More</div></div>';
                    element += '        </div>';
                    element += '    </div>';
                    element += '</div>';
                    element += "</div>";
                    element += "</div>";
                    element += "</div>";


                    if(options.inline) {
                        me.append(element);
                    }else{
                        $("body").append(element);
                    }
                    if(options.editor !== false && options.inline !== false) {
                        $("body").css({
                            overflow: 'hidden'
                        });
                    }
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
                    var mydropzone = new Dropzone(myid + " #midia-dropzone", dropzone_options);

                    $(document).on("click", myid + " #midia-upload", function() {
                        let _this = $(this);

                        if(!$(myid + " .midia-upload").hasClass("midia-active")) {
                            $(myid + " .midia-upload").addClass("midia-active");
                            $(myid + " .midia-loader").hide();
                            $(myid + " #midia-search").hide();
                            $(myid + " #midia-reload").hide();
                            $(myid + " .midia-upload").show();
                            _this.html('Back');
                        }else{
                            _this.html('Uplaod');
                            $(myid + " .midia-upload").removeClass("midia-active");
                            $(myid + " .midia-upload").hide();
                            $(myid + " .midia-loader").show();
                            $(myid + " #midia-search").show();
                            $(myid + " #midia-reload").show();
                            $(myid + " .midia-loader #midia-files-loader").html("");
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

                        return url;
                    };

                    var load_files = function(success) {
                        limit += 1;
                        var loader = $(myid + " #midia-files-loader"),
                            key = $(myid + " #midia-search").val();

                        $.ajax({
                            url: create_load_url(limit, key),
                            dataType: 'json',
                            headers: {
                                'X-CSRF-TOKEN': csrf_field
                            },
                            beforeSend: function() {
                                $(myid + " .midia-files").append('<div class="midia-loading"><img src="'+options.base_url+'/vendor/midia/spinner.svg"><div>Please wait</div></div>');
                                $(myid + " #midia-loadmore").hide();
                                if(key) {
                                    $(myid + " #midia-search").attr('disabled', true);
                                }
                            },
                            error: function(xhr) {
                                $(myid + " #midia-total").html('Error');
                                loader.html('<div class=\'midia-notfound\'>ERROR: ' + xhr.status + ' - ' + xhr.responseJSON.data + '</div>');
                            },
                            complete: function() {
                                $(myid + " .midia-loading").remove();
                                if(key) {
                                    $(myid + " #midia-search").attr('disabled', false);
                                }
                            },
                            success: function(data) {
                                $(myid + " #midia-loadmore").show();
                                showing += data.files.length;
                                $(myid + " #midia-total").html(showing + " of " + data.total);

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
                                    $(myid + " .midia-files-loader").append("<div class='midia-p'>Directory is Empry</div>")
                                }

                                if(!data.files.length) {
                                    $(myid + " #midia-loadmore").hide();
                                    return;
                                }

                                if(data.files.length == data.total || showing == data.total) {
                                    $(myid + " #midia-loadmore").hide();
                                }

                                var file = "";
                                $.each(data.files, function(i, item) {
                                    file += "<div class='midia-item' data-id='"+item.fullname+"' data-file='"+JSON.stringify(item)+"'>";
                                    file += "<div class='midia-item-inner'>";
                                    if(item.extension == 'jpg' || item.extension == 'png' || item.extension == 'bmp' || item.extension == 'gif' || item.extension == 'jpeg') {
                                        file += "<div class='midia-image'><img src='"+item.thumbnail+"' alt='"+item.fullname+"'></div>";
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

                    $(document).on("keydown", myid + " #midia-search", function(e) {
                        if(e.key == 'Enter') {
                            $(myid + " .midia-loader #midia-files-loader").html("");
                            limit = 0;
                            showing = 0;
                            load_files(false);
                        }

                        if(e.key == 'Escape') {
                            $(this).val("");
                            $(myid + " .midia-loader #midia-files-loader").html("");
                            limit = 0;
                            showing = 0;
                            load_files(false);
                        }
                    });

                    $(document).on("click", myid + " #midia-reload", function() {
                        $(myid + " .midia-loader #midia-files-loader").html("");
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

                        return url;
                    };

                    var rename_file = function() {
                        if($(myid + " .midia-selected").length) {
                            let rename = prompt('Rename this file to:', $(myid + " .midia-selected").data('file').name);
                            if(rename && rename !== $(myid + " .midia-selected").data('file').name) {
                                $.ajax({
                                    url: create_rename_url($(myid + " .midia-selected").data('file').fullname),
                                    // url: options.base_url + '/midia/'+$(".midia-selected").data('file').fullname+'/rename',
                                    type: 'put',
                                    data: {
                                        newName: rename + "." + $(myid + " .midia-selected").data('file').extension
                                    },
                                    dataType: 'json',
                                    headers: {
                                        'X-CSRF-TOKEN': csrf_field
                                    },
                                    beforeSend: function() {
                                        $(myid + " .midia-selected").addClass('midia-doload');
                                        $(myid + " .midia-choose").addClass('midia-disabled');
                                        $(myid + " .midia-delete").addClass('midia-disabled');
                                    },
                                    error: function(xhr) {
                                        alert('ERROR: ' + xhr.status + ' - ' + xhr.responseText);
                                    },
                                    complete: function() {
                                        $(myid + " .midia-selected").removeClass('midia-doload');
                                        $(myid + " .midia-choose").removeClass('midia-disabled');
                                        $(myid + " .midia-delete").removeClass('midia-disabled');
                                    },
                                    success: function(data) {
                                        data = data.success;
                                        $(myid + " .midia-selected .midia-name").html(data.fullname);
                                        var new_data = data;
                                        new_data = $.extend($(myid + " .midia-selected").data('file'), data);
                                        $(myid + " .midia-selected").attr('data-file', new_data);
                                    }
                                });
                            }
                        }
                    }

                    $(document).on("keydown", function(e) {
                        if(e.key == 'Escape') {
                            $(myid + " .midia-files .midia-item").removeClass("midia-unselected").removeClass("midia-selected");
                        }

                        if(e.key == 'F2') {
                            rename_file();
                        }
                    });

                    $(document).on("click", myid + " .midia-files .midia-item .midia-item-inner", function() {
                        var _this = $(this).parent();

                        $(myid + " .midia-files .midia-item").addClass("midia-unselected");
                        $(myid + " .midia-files .midia-item").removeClass("midia-selected");

                        if(_this.hasClass("midia-selected")) {
                            _this.removeClass("midia-selected");
                            _this.removeClass("midia-unselected");
                        }else{
                            _this.addClass("midia-selected");
                        }
                    });

                    $(document).on("dblclick", myid + " .midia-files .midia-item .midia-item-inner", function() {
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

                    $(document).on("click", myid + " .midia-files .midia-item .midia-choose", function() {
                        let _this = $(this),
                            file = _this.closest(myid + ' .midia-item').data('file'),
                            file_name = file.fullname;

                        if(options.file_name == 'url') {
                            file_name = file.url;
                        }

                        var url = file.url;
                        var field_name = getUrlParam('field_name');
                        var is_ckeditor = getUrlParam('CKEditor');
                        var is_fcke = typeof data != 'undefined' && data['Properties']['Width'] != '';
                        var is_summernote = (options.editor == 'summernote');

                        if(window.tinyMCEPopup) {
                            choose.tinymce3(url);
                        }else if(field_name) {
                            choose.tinymce4(url, field_name);
                        }else if(is_ckeditor) {
                            choose.ckeditor3(url);
                        }else if(is_fcke) {
                            choose.ckeditor2(url);
                        }else if(is_summernote) {
                            window.opener.SetUrl(url);
                            if (window.opener) {
                              window.close();
                            }
                        } else {
                            $(myid + " #" + me.data(options.data_target)).val(file_name);
                            if($(myid + " #" + me.data(options.data_preview)).length) {
                                $(myid + " #" + me.data(options.data_preview)).attr('src', url);
                            }
                            options.onChoose.call(this, file);
                            midia.close();
                        }

                    });

                    $(document).on("click", myid + " #midia-loadmore", function() {
                        let _this = $(this);

                        _this.html('Working');
                        _this.addClass('midia-disabled');
                        load_files(function() {
                            _this.removeClass('midia-disabled');
                            _this.html('Load More');
                        });
                    });

                    $(document).on("click", myid + " .midia-disabled", function() {
                        return false;
                    });
                },
                close: function() {
                    $(myid + ".midia-wrapper").hide();
                    if(options.editor !== false && options.inline !== false) {
                        $("body").css({
                            overflow: 'initial'
                        });
                    }
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