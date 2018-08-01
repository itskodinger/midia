(function($, window, i) {
    $.fn.isInViewport = function() {
        var elementTop = $(this).offset().top;
        var elementBottom = elementTop + $(this).outerHeight();
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
        return elementBottom > viewportTop && elementTop < viewportBottom;
    };

    $.fn.midia = function(options) {
        var options = $.extend({
            title: 'Midia',
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

            $(document).on("click", myid + " .midia-close", function() {
                midia.close();
                return false;
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
                            _this.closest(myid + ' .midia-item').remove();
                        }
                    })
                }
            });

            var limit = 0,
                showing = 0;
            var midia = {
                open: function() {
                    options.onOpen.call(this);

                    if($('.midia-opened.midia-popup').length) {
                        return false;
                    }else{
                        if($(myid + ".midia-wrapper").length) {
                           $(myid + ".midia-wrapper").show();
                            return;
                        }
                    }

                    let clipboard = new ClipboardJS('.midia-copy-url');
                    clipboard.on('success', function(e) {
                        let first_text = $(e.trigger).html();
                        $(e.trigger).html('Copied!');
                        setTimeout(function() {
                            $(e.trigger).html(first_text);
                        }, 1500);
                    });

                    var element = '<div id="' + id + '" class="midia-wrapper'+(options.inline ? ' midia-inline' :'')+'">';
                    element += '<div class="midia-modal">';
                    element += '<div class="midia-content">';
                    element += '    <div class="midia-header">';
                    if(!options.inline) {
                        element += '    <a href="#" class="midia-close">&times;</a>';
                    }
                    element += '        <div class="midia-title">';
                    element += '            <h4>'+options.title+'</h4>';
                    element += '        </div>';
                    element += '        <div class="midia-nav">';
                    element += '            <a href="#midia-page-upload">Upload</a>';
                    element += '            <a href="#midia-page-loader" class="active">All Files</a>';
                    element += '            <a href="#midia-page-help">Help</a>';
                    element += '            <a href="#midia-page-about">About</a>';
                    element += '        </div>';
                    element += '        <div class="midia-nav-right">';
                    element += '            <a class="midia-tool" id="midia-reload" title="Refresh File List">&#8635;</a>';
                    element += '            <input type="text" id="midia-search" class="midia-input" placeholder="Search and hit Enter (Escape to clear)">';
                    element += '        </div>';
                    element += '    </div>';
                    element += '    <div class="midia-body">';
                    element += '        <div class="midia-page midia-upload" id="midia-page-upload">';
                    element += '            <h4>Upload</h4>';
                    element += '            <div class="midia-p">You can upload all file types with maximum size of '+ dropzone_options.maxFilesize +' MB.</div>';
                    element += '            <form class="dropzone" method="post" id="midia-dropzone" enctype="multipart/form-data">';
                    element += '            </form>';
                    element += '        </div>';
                    element += '        <div class="midia-page midia-help" id="midia-page-help">';
                    element += '        <h4>Help</h4>';
                    element += '        <p class="midia-p midia-nolh"><b>Pick File</b></p>';
                    element += '        <p class="midia-p">You can double-click on the media item to select the file or click the "Pick" button.</p>';
                    element += '        <div class="midia-divider"></div>';
                    element += '        <p class="midia-p midia-nolh"><b>Copy File URL</b></p>';
                    element += '        <p class="midia-p">Hover over the hamburger menu on a media item, click on the "Copy URL" menu to copy the URL of the file.</p>';
                    element += '        <div class="midia-divider"></div>';
                    element += '        <p class="midia-p midia-nolh"><b>Download File</b></p>';
                    element += '        <p class="midia-p">Hover over the hamburger menu on a media item, click on the "Download" menu to download the file.</p>';
                    element += '        <div class="midia-divider"></div>';
                    element += '        <p class="midia-p midia-nolh"><b>Rename File</b></p>';
                    element += '        <p class="midia-p">Hover over the hamburger menu on a media item, click on the "Rename" menu and enter the new file name and hit enter.</p>';
                    element += '        <div class="midia-divider"></div>';
                    element += '        <p class="midia-p midia-nolh"><b>Delete File</b></p>';
                    element += '        <p class="midia-p">Hover over the hamburger menu on a media item, click on the "Delete" menu and click "OK" button to delete the file. The deleted file <b>CANNOT</b> be returned, because it has been permanently deleted, think twice before doing this action.</p>';
                    element += '        <div class="midia-divider"></div>';
                    element += '        <p class="midia-p midia-nolh"><b>Refresh File List</b></p>';
                    element += '        <p class="midia-p">You will need to refresh the list of files after uploading or notice changes to the file to make the data file up to date. To refresh the file list, click on the button with the "&#8635;" icon.</p>';
                    element += '        <div class="midia-divider"></div>';
                    element += '        <p class="midia-p midia-nolh"><b>Upload File</b></p>';
                    element += '        <p class="midia-p">Uploading files is very easy, click "Upload" in the navigation, then drag the file you want to upload into the box or click the upload box and select the file you want to upload. You can upload more than one file at a time.</p>';
                    element += '        <div class="midia-divider"></div>';
                    element += '        <p class="midia-p midia-nolh"><b>Search File</b></p>';
                    element += '        <p class="midia-p">To find the file you want, click on the search box and enter your keyword, then hit enter. You can search for files with an extension type, e.g. ".jpg" or something else.</p>';
                    element += '        </div>';
                    element += '        <div class="midia-page" id="midia-page-about">';
                    element += '            <h4>About Midia</h4>';
                    element += '            <div class="midia-p">';
                    element += '            <a href="https://github.com/itskodinger/midia" target="_blank">Midia</a> is a simple media manager for your Laravel project. This package lets you open your files as inline modal. All directories in the folder will be ignored. In other words, can only read the file.';
                    element += '            </div>';
                    element += '            <div class="midia-p">There is no special reason why Midia was created. Just one thing to know, Midia was created to make it easier for non-technical users to manage their files with a good UX. (Though, the creator doesn\'t really understand UX well)</div>';
                    element += '            <div class="midia-divider"></div>';
                    element += '            <div class="midia-p midia-nolh"><b>Meet the creators</b></div>';
                    element += '            <div class="midia-p">The first time, Midia was created by <a target="_blank" href="https://github.com/nauvalazhar">Muhamad Nauval Azhar</a> then became better by the <a target="_blank" href="https://github.com/itskodinger/midia/graphs/contributors">contributors</a>. Thank all contributors.</div>';
                    element += '            <div class="midia-divider"></div>';
                    element += '            <div class="midia-p midia-nolh"><b>Supported By</b></div>';
                    element += '            <div class="midia-p midia-supporter"><a href="https://multinity.com" target="_blank"><img src="https://multinity.com/public/main/img/multinity-logo.png" alt="Multinity"></a><a href="https://kodinger.com" target="_blank"><img src="https://avatars0.githubusercontent.com/u/35509766?s=460&v=4" alt="Kodinger"></a></div>';
                    element += '        </div>';
                    element += '        <div class="midia-page midia-loader" id="midia-page-loader">';
                    element += '            <h4>All Files</h4>';
                    element += '            <div class="midia-message">';
                    element += '            </div>';
                    element += '            <div class="midia-files-outer"><div id="midia-files-loader" class="midia-files">';
                    element += '            </div></div>';
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
                        $(myid).addClass('midia-popup');
                    }
                    if(options.editor !== false && options.inline !== false) {
                        $("body").css({
                            overflow: 'hidden'
                        });
                    }
                    
                    $(myid).addClass('midia-opened');
                    options.onOpened(this);

                    var clear_dropzone_area = function () {
                        $('#midia-dropzone').find('.dz-preview').remove();
                        $('#midia-dropzone').removeClass('dz-started');
                    }

                    $(document).on('click', myid + ' .midia-nav a', function() {
                        let target = $(this).attr('href');
                        $(myid + ' .midia-nav a').removeClass('active');
                        $(this).addClass('active');
                        $(myid + ' .midia-page').hide();
                        $(myid + ' ' + target).show();
                        target == '#midia-page-loader' && $(myid + " #midia-reload").click();
                        target == '#midia-page-upload' && clear_dropzone_area();
                        return false;
                    });

                    Dropzone.autoDiscover = false;
                    var mydropzone = new Dropzone(myid + " #midia-dropzone", dropzone_options);

                    var create_load_url = function (limit, key) {
                        var url = options.base_url + '/midia/get/' + limit + '?key=' + key;
                        if (options.directory_name !== '') {
                            url += '&directory_name=' + options.directory_name;
                        }

                        return url;
                    };

                    var load_files_when_on_screen = function () {
                        if ($(myid + " #midia-loadmore").isInViewport() && $(myid + " #midia-loadmore").css('display') != 'none') {
                            load_files();
                        }
                    }

                    $('.midia-wrapper').scroll(function () {
                        load_files_when_on_screen();
                    });

                    $('window').on('resize scroll', function() {
                        load_files_when_on_screen();
                    });

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
                                $(myid + " .midia-message").html('Error');
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
                                $(myid + " .midia-message").html('Showing ' + showing + " of " + data.total_all + ' file(s)');

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

                                if(data.files.length == data.total && showing == data.total_all) {
                                    $(myid + " #midia-loadmore").hide();
                                }

                                var file = "";
                                $.each(data.files, function(i, item) {
                                    file += "<div class='midia-item' data-id='"+item.fullname+"' data-file='"+JSON.stringify(item)+"'>";
                                    file += "<div class='midia-options-outer'>";
                                    file += "<div class='midia-options-toggle'>&#9776;</div>";
                                    file += "<div class='midia-options'>";
                                    file += "<div class='midia-option midia-copy-url' data-clipboard-text='"+item.url+"'>Copy URL</div>";
                                    file += "<a href='"+item.url+"' class='midia-option' download>Download</a>";
                                    file += "<div class='midia-option midia-rename'>Rename</div>";
                                    file += "<div class='midia-option midia-option-divider'></div>";
                                    file += "<div class='midia-option midia-option-danger midia-delete'>Delete</div>";
                                    file += "</div>";
                                    file += "</div>";
                                    file += "<div class='midia-floating'>";
                                    file += "<a class='midia-btn midia-btn-colored midia-btn-shadow midia-pick'>Pick</a>";
                                    file += "</div>";
                                    file += "<div class='midia-item-inner"+(options.inline != true || (options.inline == true && options.editor != false) ? ' midia-choose' : '')+"'>";
                                    if(item.extension == 'jpg' || item.extension == 'png' || item.extension == 'bmp' || item.extension == 'gif' || item.extension == 'jpeg') {
                                        file += "<div class='midia-image' style='background-image: url("+item.thumbnail+");'></div>";
                                    }else{
                                        file += "<div class='midia-image midia-notimage'>"+item.extension+"</div>";
                                    }
                                    file += "<div class='midia-name' title='"+item.fullname+"'>"+item.fullname+"</div>";
                                    file += "<div class='midia-desc'>";
                                    file += item.size + ' &nbsp;&bull;&nbsp; ' + item.filetime;
                                    file += "</div>";
                                    file += "</div>";
                                    file += "</div>";
                                });
                                loader.append(file);
                                load_files_when_on_screen();
                            }
                        });
                    }
                    load_files();

                    $(document).on("keydown", myid + " #midia-search", function(e) {
                        if(e.key == 'Enter') {
                            if($("#midia-search").val().trim().length > 0) {
                                $(myid + " .midia-loader #midia-files-loader").html("");
                                limit = 0;
                                showing = 0;
                                load_files(false);
                            }else{
                                $("#midia-search").attr('placeholder', 'Please enter at least 1 word');
                            }
                        }

                        if(e.key == 'Escape') {
                            if($("#midia-search").val().trim().length > 0) {
                                $(this).val("");
                                $(myid + " .midia-loader #midia-files-loader").html("");
                                limit = 0;
                                showing = 0;
                                load_files(false);
                            } else {
                                midia.close();
                            }
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

                    var rename_file = function(_this) {
                        if(_this.length) {
                            let rename = prompt('Rename this file to:', _this.data('file').name);
                            if(rename && rename !== _this.data('file').name) {
                                $.ajax({
                                    url: create_rename_url(_this.data('file').fullname),
                                    type: 'put',
                                    data: {
                                        newName: rename + "." + _this.data('file').extension
                                    },
                                    dataType: 'json',
                                    headers: {
                                        'X-CSRF-TOKEN': csrf_field
                                    },
                                    beforeSend: function() {
                                        _this.addClass('midia-doload');
                                        $(myid + " .midia-choose").addClass('midia-disabled');
                                        $(myid + " .midia-delete").addClass('midia-disabled');
                                    },
                                    error: function(xhr) {
                                        alert('ERROR: ' + xhr.status + ' - ' + xhr.responseText);
                                    },
                                    complete: function() {
                                        _this.removeClass('midia-doload');
                                        $(myid + " .midia-choose").removeClass('midia-disabled');
                                        $(myid + " .midia-delete").removeClass('midia-disabled');
                                    },
                                    success: function(data) {
                                        data = data.success;
                                        _this.find(".midia-name").html(data.fullname);
                                        _this.find(".midia-options [download]").attr('href', data.url);
                                        var new_data = data;
                                        new_data = $.extend(_this.data('file'), data);
                                        _this.attr('data-file', new_data);
                                    }
                                });
                            }
                        }
                    }

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

                    let pick_file = function(_this) {
                        let file = _this.closest(myid + ' .midia-item').data('file'),
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
                        }else{
                            $("#" + me.data(options.data_target)).val(file_name);
                            if($("#" + me.data(options.data_preview)).length) {
                                $("#" + me.data(options.data_preview)).attr('src', url);
                            }
                            options.onChoose.call(this, file);
                            midia.close();
                        }
                    }

                    $(document).on("dblclick", myid + " .midia-files .midia-item .midia-choose", function() {
                        pick_file($(this));
                    });

                    $(document).on("click", myid + " .midia-files .midia-item .midia-pick", function() {
                        pick_file($(this));
                    });

                    $(document).on("click", myid + " .midia-files .midia-item .midia-rename", function() {
                        rename_file($(this).closest('.midia-item'));
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
                    if(options.inline == false) {
                        $(myid + ".midia-wrapper").hide();
                        $(myid).removeClass('midia-opened');
                    }
                    if(options.editor !== false && options.inline !== false) {
                        $("body").css({
                            overflow: 'initial'
                        });
                    }
                    let back = $(myid + " .midia-nav a[href=#midia-page-loader]");
                    $(myid + " #midia-page-loader").css('display') == 'none' && back.click();
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
