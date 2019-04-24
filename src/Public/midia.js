/******************************************
 * Midia
 *
 * This plugin is used by Midia : Simple media manager for your Laravel project.
 *
 * @author          Muhamad Nauval Azhar
 * @copyright       Copyright (c) 2018 Itskodinger
 * @license         Midia is licensed under the MIT license.
 * @github          https://github.com/itskodinger/midia
 * @version         1.2.2
 *
 ******************************************/

(function($, window)
{
    $.fn.midia = function(option, settings)
    {
        if(typeof option === 'object')
        {
            settings = option;
        }
        else if(typeof option === 'string')
        {
            var values = [];
            var elements = this.each(function()
            {
                var data = $(this).data('_midia');
                if(data)
                {
                    if(option === 'refresh') { data.refresh(); }
                    else if(option === 'open') { data.open(); }
                    else if(option === 'close') { data.close(); }
                    else if(data[option] !== undefined && typeof data[option] !== 'function') {
                        values.push(data[option]);
                    }
                    else if($.fn.midia.defaultSettings[option] !== undefined)
                    {
                        if(settings !== undefined) { data.settings[option] = settings; }
                        else { values.push(data.settings[option]); }
                    }
                }
            });

            if(values.length === 1) { return values[0]; }
            if(values.length > 0) { return values; }
            else { return elements; }
        }

        return this.each(function()
        {
            var $elem = $(this);

            var data = $(this).data('_midia');
            if (data) {
                if (settings == option) {
                    data.settings = $.extend(data.settings, settings);
                    $elem.data('_midia', data);
                }
                return;
            }

            var dataAttributes = {};
            $.each($elem.data(), function (key, value) {
                if (key.startsWith('midia')) {
                    if (key = key.replace('midia', '')) {
                        dataAttributes[key.toLowerCase()] = value;
                    }
                }
            });

            var $settings = $.extend({}, $.fn.midia.defaultSettings, settings || {}, dataAttributes);
            var midia = new Midia($settings, $elem);
            $elem.data('_midia', midia);
        });
    }

    $.fn.midia.defaultSettings = {
        title: 'Midia', // modal title
        identifier: 'fullname', // file attribute that used as identifier
        inline: false, // inline mode
        locale: 'en',
        editor: false, // editor mode
        base_url: '', // base url
        file_name: 'url', // get return as 'url', you can fill with other file attributes, ie.'fullname' or 'name'
        data_target: 'input',
        data_preview: 'preview',
        csrf_field: $("meta[name='csrf-token']").attr('content'),
        directory_name: '',
        dropzone: {},
        actions: ['copy_url', 'download', 'rename', 'delete'],
        can_choose: true,
        load_ajax_type: 'get',
        initial_value: null,
        initial_preview: null,
        onOpen: function() {},
        onOpened: function() {},
        onClose: function() {},
        onChoose: function(file) {},
        customLoadUrl: null,
        customUploadUrl: null,
        customRenameUrl: null,
        customDeleteUrl: null,
    };

    function Midia(settings, $elem)
    {
        this.settings = settings;
        this.$elem = $elem;
        this.refresh();

        return this;
    }

    Midia.prototype =
    {
        refresh: function () {
            if (this.id) {
                $('#' + this.id).remove();
                this.$elem.off();
            }

            this.el = null;
            this.file = null;
            this.value = null;
            this.totalLoadLimit = 0;
            this.totalFiles = 0;
            this.totalShows = 0;
            this.init();
        },

        _isInViewport: function(obj) {
            var elementTop = obj.offset().top;
            var elementBottom = elementTop + obj.outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();
            return elementBottom > viewportTop && elementTop < viewportBottom;
        },

        _createMidiaElement: function () {
            let options = this.settings;

            var element = '<div id="' + this.id + '" class="midia-wrapper'+(options.inline ? ' midia-inline' :'')+'">';
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
            element += '            <a href="#midia-page-upload">'+midiaLang['Upload']+'</a>';
            element += '            <a href="#midia-page-loader" class="active">'+midiaLang['All Files']+'</a>';
            element += '            <a href="#midia-page-help">'+midiaLang["Help"]+'</a>';
            element += '            <a href="#midia-page-about">'+midiaLang["About"]+'</a>';
            element += '        </div>';
            element += '        <div class="midia-nav-right">';
            element += '            <a class="midia-tool" id="midia-reload" title="'+midiaLang["Refresh File List"]+'">&#8635;</a>';
            element += '            <input type="text" id="midia-search" class="midia-input" placeholder="'+midiaLang["Search and hit Enter (Escape to clear)"]+'">';
            element += '        </div>';
            element += '    </div>';
            element += '    <div class="midia-body">';
            element += '        <div class="midia-page midia-upload" id="midia-page-upload">';
            element += '            <h4>'+midiaLang["Upload"]+'</h4>';
            element += '            <div class="midia-p">' + midiaLang["You can upload all file types with maximum size of :filesize MB."].replace(":filesize", options.dropzone.maxFilesize) + '</div>';
            element += '            <form class="dropzone" method="post" id="midia-dropzone" enctype="multipart/form-data">';
            element += '            </form>';
            element += '        </div>';
            element += '        <div class="midia-page midia-help" id="midia-page-help">';
            element += '        <h4>' + midiaLang['Help'] + '</h4>';
            element += '        <p class="midia-p midia-nolh"><b>'+midiaLang["Pick File"]+'</b></p>';
            element += '        <p class="midia-p">'+midiaLang['You can double-click on the media item to select the file or click the "Pick" button.']+'</p>';
            element += '        <div class="midia-divider"></div>';
            element += '        <p class="midia-p midia-nolh"><b>'+midiaLang["Copy File URL"]+'</b></p>';
            element += '        <p class="midia-p">'+midiaLang['Hover over the hamburger menu on a media item, click on the "Copy URL" menu to copy the URL of the file.']+'</p>';
            element += '        <div class="midia-divider"></div>';
            element += '        <p class="midia-p midia-nolh"><b>'+midiaLang["Download File"]+'</b></p>';
            element += '        <p class="midia-p">'+midiaLang["Hover over the hamburger menu on a media item, click on the \"Download\" menu to download the file."]+'</p>';
            element += '        <div class="midia-divider"></div>';
            element += '        <p class="midia-p midia-nolh"><b>'+midiaLang["Rename File"]+'</b></p>';
            element += '        <p class="midia-p">'+midiaLang["Hover over the hamburger menu on a media item, click on the \"Rename\" menu and enter the new file name and hit enter."]+'</p>';
            element += '        <div class="midia-divider"></div>';
            element += '        <p class="midia-p midia-nolh"><b>'+midiaLang["Delete File"]+'</b></p>';
            element += '        <p class="midia-p">'+midiaLang["Hover over the hamburger menu on a media item, click on the \"Delete\" menu and click \"OK\" button to delete the file. The deleted file <b>CANNOT</b> be returned, because it has been permanently deleted, think twice before doing this action."]+'</p>';
            element += '        <div class="midia-divider"></div>';
            element += '        <p class="midia-p midia-nolh"><b>'+midiaLang["Refresh File List"]+'</b></p>';
            element += '        <p class="midia-p">'+midiaLang["You will need to refresh the list of files after uploading or notice changes to the file to make the data file up to date. To refresh the file list, click on the button with the \"&#8635;\" icon."]+'</p>';
            element += '        <div class="midia-divider"></div>';
            element += '        <p class="midia-p midia-nolh"><b>'+midiaLang["Upload File"]+'</b></p>';
            element += '        <p class="midia-p">'+midiaLang["Uploading files is very easy, click \"Upload\" in the navigation, then drag the file you want to upload into the box or click the upload box and select the file you want to upload. You can upload more than one file at a time."]+'</p>';
            element += '        <div class="midia-divider"></div>';
            element += '        <p class="midia-p midia-nolh"><b>'+midiaLang["Search File"]+'</b></p>';
            element += '        <p class="midia-p">'+midiaLang["To find the file you want, click on the search box and enter your keyword, then hit enter. You can search for files with an extension type, e.g. \".jpg\" or something else."]+'</p>';
            element += '        </div>';
            element += '        <div class="midia-page" id="midia-page-about">';
            element += '            <h4>'+midiaLang["About Midia"]+'</h4>';
            element += '            <div class="midia-p">';
            element += '            '+midiaLang["<a href=\"https://github.com/itskodinger/midia\" target=\"_blank\">Midia</a> is a simple media manager for your Laravel project. This package lets you open your files as inline modal. All directories in the folder will be ignored. In other words, can only read the file."]+'';
            element += '            </div>';
            element += '            <div class="midia-p">'+midiaLang["There is no special reason why Midia was created. Just one thing to know, Midia was created to make it easier for non-technical users to manage their files with a good UX. (Though, the creator doesn\'t really understand UX well)"]+'</div>';
            element += '            <div class="midia-divider"></div>';
            element += '            <div class="midia-p midia-nolh"><b>'+midiaLang["Meet the creators"]+'</b></div>';
            element += '            <div class="midia-p">'+midiaLang["The first time, Midia was created by <a target=\"_blank\" href=\"https://github.com/nauvalazhar\">Muhamad Nauval Azhar</a> then became better by the <a target=\"_blank\" href=\"https://github.com/itskodinger/midia/graphs/contributors\">contributors</a>. Thank all contributors."]+'</div>';
            element += '            <div class="midia-divider"></div>';
            element += '            <div class="midia-p midia-nolh"><b>'+midiaLang["Supported By"]+'</b></div>';
            element += '            <div class="midia-p midia-supporter"><a href="https://multinity.com" target="_blank"><img src="https://multinity.com/public/main/img/multinity-logo.png" alt="Multinity"></a><a href="https://kodinger.com" target="_blank"><img src="https://avatars0.githubusercontent.com/u/35509766?s=460&v=4" alt="Kodinger"></a></div>';
            element += '        </div>';
            element += '        <div class="midia-page midia-loader" id="midia-page-loader">';
            element += '            <h4>'+midiaLang["All Files"]+'</h4>';
            element += '            <div class="midia-message">';
            element += '            </div>';
            element += '            <div class="midia-files-outer"><div id="midia-files-loader" class="midia-files">';
            element += '            </div></div>';
            element += '            <div class="midia-outer-loadmore"><div class="midia-btn midia-btn-primary" id="midia-loadmore">'+midiaLang["Load More"]+'</div></div>';
            element += '        </div>';
            element += '    </div>';
            element += '</div>';
            element += "</div>";
            element += "</div>";
            element += "</div>";

            return element;
        },

        _actions: {
            copy_url: function (item) {
                return "<div class='midia-option midia-copy-url' data-clipboard-text='"+item.url+"'>"+midiaLang["Copy URL"]+"</div>";
            },

            download: function (item) {
                return "<a href='"+item.url+"' class='midia-option' download>"+midiaLang["Download"]+"</a>";
            },

            rename: function (item) {
                return "<div class='midia-option midia-rename'>"+midiaLang["Rename"]+"</div>";
            },

            delete: function (item) {
                return "<div class='midia-option midia-option-divider'></div>"
                       + "<div class='midia-option midia-option-danger midia-delete'>"+midiaLang["Delete"]+"</div>"
                       + "<div class='midia-option midia-option-divider'></div>";
            }
        },

        init: function () {

            if (this.el) {
                return;
            }

            let midia = this,
                $elem = this.$elem,
                options = this.settings,
                id = 'midia-' + Math.random().toString(36).substring(7),
                myid = '#' + id;

            this.id = id;

            $.ajax({
                url: this.settings.base_url + "/vendor/midia/lang/midia-lang-" + this.settings.locale + ".js",
                dataType: 'script',
                async: false
            });

            var dropzone_language_strings = {
                dictDefaultMessage: midiaLang["Drop files here to upload"],
                dictFallbackMessage: midiaLang["Your browser does not support drag'n'drop file uploads."],
                dictFallbackText: midiaLang["Please use the fallback form below to upload your files like in the olden days."],
                dictFileTooBig: midiaLang["File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB."],
                dictInvalidFileType: midiaLang["You can't upload files of this type."],
                dictResponseError: midiaLang["Server responded with {{statusCode}} code."],
                dictCancelUpload: midiaLang["Cancel upload"],
                dictCancelUploadConfirmation: midiaLang["Are you sure you want to cancel this upload?"],
                dictRemoveFile: midiaLang["Remove file"],
                dictMaxFilesExceeded: midiaLang["You can not upload any more files."]
            };

            var default_dropzone_options = options.dropzone;
            if(typeof default_dropzone_options.url !== 'undefined') {
                delete default_dropzone_options.url;
            }

            if(typeof default_dropzone_options.headers !== 'undefined') {
                delete default_dropzone_options.headers;
            }

            var dropzone_options = default_dropzone_options;
            this.settings.dropzone = dropzone_options = $.extend({
                url: midia._createUploadUrl(),
                // url: options.base_url + '/midia/upload',
                headers: {
                    'X-CSRF-TOKEN': options.csrf_field
                },
                maxFilesize: 2
            }, default_dropzone_options, dropzone_language_strings);

            let clipboard = new ClipboardJS('.midia-copy-url');
            clipboard.on('success', function(e) {
                let first_text = $(e.trigger).html();
                $(e.trigger).html(midiaLang['Copied!']);
                setTimeout(function() {
                    $(e.trigger).html(first_text);
                }, 1500);
            });

            let element = midia._createMidiaElement();

            if(options.inline) {
                $elem.append(element);
            }else{
                $("body").append(element);
                $(myid).addClass('midia-popup');
            }

            $(myid).hide();

            this.el = $(myid);

            Dropzone.autoDiscover = false;
            var mydropzone = new Dropzone(myid + " #midia-dropzone", dropzone_options);

            $(document).on('click', myid + ' .midia-nav a', function() {
                let target = $(this).attr('href');
                $(myid + ' .midia-nav a').removeClass('active');
                $(this).addClass('active');
                $(myid + ' .midia-page').hide();
                $(myid + ' ' + target).show();
                target == '#midia-page-loader' && $(myid + " #midia-reload").click();
                target == '#midia-page-upload' && midia._clearDropzoneArea();
                return false;
            });

            $(document).on("keydown", myid + " #midia-search", function(e) {
                let $search = $(this);
                if(e.key == 'Enter') {
                    if($search.val().trim().length > 0) {
                        midia._reset();
                    }else{
                        $search.attr('placeholder', midiaLang['Please enter at least 1 word']);
                    }
                }

                if(e.key == 'Escape') {
                    if($search.val().trim().length > 0) {
                        $search.val('');
                        midia._reset();
                    } else {
                        midia.close();
                    }
                }
            });

            $(document).on("click", myid + " #midia-reload", function() {
                midia._reset();
            });

            $(document).on("click", myid + " .midia-close", function() {
                midia.close();
                return false;
            });

            $('.midia-wrapper').scroll(function () {
                midia._loadFilesWhenOnScreen();
            });

            $(window).on('resize scroll', function() {
                midia._loadFilesWhenOnScreen();
            });

            $(document).on("click", myid + " #midia-loadmore", function() {
                let loader = $(this);

                loader.addClass('midia-disabled').text(midiaLang['Working']);
                midia._loadFiles(function() {
                    loader.removeClass('midia-disabled').text(midiaLang['Load More']);
                });
            });

            $(document).on("click", myid + " .midia-disabled", function() {
                return false;
            });

            $(document).on("dblclick", myid + " .midia-files .midia-item .midia-choose", function() {
                midia._pickFile($(this));
            });

            $(document).on("click", myid + " .midia-files .midia-item .midia-pick", function() {
                midia._pickFile($(this));
            });

            $(document).on("click", myid + " .midia-files .midia-item .midia-rename", function() {
                midia._renameFile($(this).closest('.midia-item'));
            });

            $(document).on("click", myid + " .midia-delete", function() {
                midia._deleteFile($(this));
            });

            let target = $elem.data(options.data_target);
            options.initial_value && $("#" + target).val(options.initial_value);

            let preview = $elem.data(options.data_preview);
            options.initial_preview && $("#" + preview).attr('src', options.initial_preview);

            if(options.inline == true) {
                midia.open();
            }else{
                $elem.on("click", function() {
                    midia.open();
                });
            }
        },

        _show: function () {
            let myid = '#' + this.id;
            $(myid + ".midia-wrapper").show();
            $(myid + " #midia-search").val('');
            $(myid + " .midia-nav a[href='#midia-page-loader']").click();
        },

        _createUploadUrl: function () {
            let options = this.settings;
            if (typeof options.customUploadUrl === 'function') {
                return options.customUploadUrl();
            }
            var url = options.base_url + '/midia/upload';
            var isDirNameEmpty = options.directory_name === '';
            if (!isDirNameEmpty) {
                url += '?directory_name=' + options.directory_name;
            }

            return url;
        },

        _clearDropzoneArea: function () {
            let myid = '#' + this.id;
            $(myid + ' #midia-dropzone').find('.dz-preview').remove();
            $(myid + ' #midia-dropzone').removeClass('dz-started');
        },

        _createLoadUrl: function (limit, key) {
            let options = this.settings;
            if (typeof options.customLoadUrl === 'function') {
                return options.customLoadUrl(limit, key);
            }
            var url = options.base_url + '/midia/get/' + limit + '?key=' + key;
            if (options.directory_name !== '') {
                url += '&directory_name=' + options.directory_name;
            }

            return url;
        },

        _messageInfo: function (msg) {
            $('#' + this.id + " .midia-message").html(msg);
        },

        _messageOnContainer: function (msg) {
            $('#' + this.id + " #midia-files-loader").html(msg);
        },

        _setCounter: function (showing, totalFiles) {
            this._messageInfo(midiaLang['Showing :count of :total file:s.'].replace(":count", showing).replace(":total", totalFiles).replace(":s", totalFiles === 1 ? '' : 's'));
        },

        _createFileElement: function (item) {
            let midia = this,
                options = this.settings;

            let file = "<div class='midia-item' data-id='"+item.fullname+"' data-file='"+JSON.stringify(item)+"'>";
            file += "<div class='midia-options-outer'>";
            if (options.actions.length) {
                file += "<div class='midia-options-toggle'>&#9776;</div>";
                file += "<div class='midia-options'>";
                file += "<div class='midia-option'><strong>"+midiaLang["Options"]+"</strong> : </div>";
                $.each(options.actions, function (index, action) {
                    if (midia._actions[action] !== undefined) {
                        file += midia._actions[action](item);
                    }
                });
                file += "</div>";
            }
            file += "</div>";
            if (options.can_choose) {
                file += "<div class='midia-floating'>";
                file += "<a class='midia-btn midia-btn-colored midia-btn-shadow midia-pick'>"+midiaLang["Pick"]+"</a>";
                file += "</div>";
            }
            file += "<div class='midia-item-inner"+(options.inline != true || (options.inline == true && options.editor != false) ? ' midia-choose' : '')+"'>";
            if(item.extension == 'jpg' || item.extension == 'png' || item.extension == 'bmp' || item.extension == 'gif' || item.extension == 'jpeg') {
                file += "<div class='midia-image' style='background-image: url(\""+item.thumbnail+"\");'></div>";
            }else{
                file += "<div class='midia-image midia-notimage'>"+item.extension+"</div>";
            }
            file += "<div class='midia-name' title='"+item.fullname+"'>"+item.fullname+"</div>";
            file += "<div class='midia-desc'>";
            file += item.size + ' &nbsp;&bull;&nbsp; ' + this._localizeTime(item.filetime);
            file += "</div>";
            file += "</div>";
            file += "</div>";

            return file;
        },

        _localizeTime: function(time){
            for(var key in midiaLang.duration){
                time = time.replace(key, midiaLang.duration[key]);
            }
            return time;
        },

        _loadFiles: function(success) {
            let midia = this,
                id = this.id,
                myid = '#' + id,
                options = this.settings,
                limit = ++this.totalLoadLimit;

            var loader = $(myid + " #midia-files-loader"),
                key = $(myid + " #midia-search").val();

            $.ajax({
                url: midia._createLoadUrl(limit, key),
                type: options.load_ajax_type,
                dataType: 'json',
                headers: {
                    'X-CSRF-TOKEN': options.csrf_field
                },
                beforeSend: function() {
                    $(myid + " .midia-files").append('<div class="midia-loading"><img src="'+options.base_url+'/vendor/midia/spinner.svg"><div>'+midiaLang["Please wait"]+'</div></div>');
                    $(myid + " #midia-loadmore").hide();
                    if(key) {
                        $(myid + " #midia-search").attr('disabled', true);
                    }
                },
                error: function(xhr) {
                    $(myid + " .midia-message").html(midiaLang['Error']);
                    midia._messageOnContainer('<div class=\'midia-notfound\'>' + midiaLang["ERROR: "] + xhr.status + ' - ' + xhr.responseJSON.data + '</div>');
                },
                complete: function() {
                    $(myid + " .midia-loading").remove();
                    if(key) {
                        $(myid + " #midia-search").attr('disabled', false);
                    }
                    midia._focusToSearch();
                },
                success: function(data) {
                    $(myid + " #midia-loadmore").show();
                    showing = midia.totalShows += data.files.length,
                    totalFiles = midia.totalFiles = data.total;

                    midia._setCounter(showing, totalFiles);

                    if(data.total_all == 0) {
                        midia._messageOnContainer("<div class='midia-notfound'>"+midiaLang["Your directory is empty"]+"</div>");
                    }

                    if(midia.totalLoadLimit == 0 && data.total_all > 0 && data.files.length == 0) {
                        midia._messageOnContainer("<div class='midia-notfound'>"+midiaLang["Whoops, file with name <i>:key</i> couldn't be found"].replace(":key", key) + "</div>");
                    }

                    if(success) {
                        success.call(this);
                    }
                    if(data.files.length == 0 && limit == 0) {
                        $(myid + " .midia-files-loader").append("<div class='midia-p'>"+midiaLang["Directory is Empty"]+"</div>")
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
                        file += midia._createFileElement(item);
                    });
                    loader.append(file);
                    midia._loadFilesWhenOnScreen();
                }
            });
        },

        _loadFilesWhenOnScreen: function () {
            let id = this.id,
                myid = '#' + id;

            if (this._isInViewport($(myid + " #midia-loadmore")) && $(myid + " #midia-loadmore").css('display') != 'none') {
                this._loadFiles();
            }
        },

        _focusToSearch: function () {
            let id = this.id,
                myid = '#' + id;
            setTimeout(function () {
                $(myid + " #midia-search").focus();
            }, 300);
        },

        _reset: function () {
            this.totalLoadLimit = this.totalShows = 0;
            this._messageOnContainer('');
            this._loadFiles(false);
        },

        _createRenameUrl: function (file) {
            let options = this.settings;

            if (typeof options.customRenameUrl === 'function') {
                return options.customRenameUrl(file);
            }
            var url = options.base_url + '/midia/' + file + '/rename';
            var isDirNameEmpty = options.directory_name === '';
            if (!isDirNameEmpty) {
                url += '?directory_name=' + options.directory_name;
            }

            return url;
        },

        _renameFile: function(file) {
            if(file.length) {
                let midia = this,
                    id = this.id,
                    myid = '#' + id,
                    options = this.settings;

                let rename = prompt(midiaLang['Rename this file to:'], file.data('file').name);
                if(rename && rename !== file.data('file').name) {
                    $.ajax({
                        url: midia._createRenameUrl(file.data('file')[options.identifier]),
                        type: 'put',
                        data: {
                            newName: rename + "." + file.data('file').extension
                        },
                        dataType: 'json',
                        headers: {
                            'X-CSRF-TOKEN': options.csrf_field
                        },
                        beforeSend: function() {
                            file.addClass('midia-doload');
                            $(myid + " .midia-choose").addClass('midia-disabled');
                            $(myid + " .midia-delete").addClass('midia-disabled');
                        },
                        error: function(xhr) {
                            alert(midiaLang['ERROR: '] + xhr.status + ' - ' + xhr.responseText);
                        },
                        complete: function() {
                            file.removeClass('midia-doload');
                            $(myid + " .midia-choose").removeClass('midia-disabled');
                            $(myid + " .midia-delete").removeClass('midia-disabled');
                        },
                        success: function(data) {
                            data = data.success;
                            file.find(".midia-name").html(data.fullname);
                            file.find(".midia-options [download]").attr('href', data.url);
                            var new_data = data;
                            new_data = $.extend(file.data('file'), data);
                            file.attr('data-file', new_data);
                        }
                    });
                }
            }
        },

        _getUrlParam: function(paramName) {
            var reParam = new RegExp('(?:[\?&]|&)' + paramName + '=([^&]+)', 'i');
            var match = window.location.search.match(reParam);
            return ( match && match.length > 1 ) ? match[1] : null;
        },

        _tinymce4: function(url, field_name) {
            parent.document.getElementById(field_name).value = url;

            if(typeof parent.tinyMCE !== "undefined") {
                parent.tinyMCE.activeEditor.windowManager.close();
            }
            if(typeof parent.$.fn.colorbox !== "undefined") {
                parent.$.fn.colorbox.close();
            }
        },
        _tinymce3: function(url) {
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
        _ckeditor3: function(url) {
            if (window.opener) {
                window.opener.CKEDITOR.tools.callFunction(this._getUrlParam('CKEditorFuncNum'), url);
            } else {
                parent.CKEDITOR.tools.callFunction(this._getUrlParam('CKEditorFuncNum'), url);
                parent.CKEDITOR.tools.callFunction(this._getUrlParam('CKEditorCleanUpFuncNum'));
            }
        },
        _ckeditor2: function(url) {
            var p = url;
            var w = data['Properties']['Width'];
            var h = data['Properties']['Height'];
            window.opener.SetUrl(p,w,h);
        },

        _pickFile: function(_file) {
            let options = this.settings,
                file = _file.closest('#' + this.id + ' .midia-item').data('file'),
                file_name = file[options.file_name];

            this.file = file;

            var url = file.url;
            var field_name = this._getUrlParam('field_name');
            var is_ckeditor = this._getUrlParam('CKEditor');
            var is_fcke = typeof data != 'undefined' && data['Properties']['Width'] != '';
            var is_summernote = (options.editor == 'summernote');

            if(window.tinyMCEPopup) {
                this._tinymce3(url);
            }else if(field_name) {
                this._tinymce4(url, field_name);
            }else if(is_ckeditor) {
                this._ckeditor3(url);
            }else if(is_fcke) {
                this._ckeditor2(url);
            }else if(is_summernote) {
                window.opener.SetUrl(url);
                if (window.opener) {
                  window.close();
                }
            }else{
                this.value = file_name;

                let target = this.$elem.data(options.data_target);
                let preview = this.$elem.data(options.data_preview);

                file.target = target;
                $("#" + target).val(file_name);

                if($("#" + preview).length) {
                    $("#" + preview).attr('src', file.thumbnail).attr('src-full', url);
                    file.preview = preview;
                }

                typeof options.onChoose === 'function' && options.onChoose.call(this, file);
                this.close();
            }
        },

        _createDeleteUrl: function (file){
            let options = this.settings;
            if (typeof options.customDeleteUrl === 'function') {
                return options.customDeleteUrl(file);
            }
            var url = options.base_url + '/midia/' + file + '/delete';
            var isDirNameEmpty = options.directory_name === '';
            if (!isDirNameEmpty) {
                url += '?directory_name=' + options.directory_name;
            }

            return url;
        },

        _deleteFile: function (file) {
            let midia = this,
                id = this.id,
                myid = '#' + id,
                options = this.settings,
                ask = confirm(midiaLang['File will be deleted and this action can\'t be undone, do you want to continue?']);

            if(ask) {
                $.ajax({
                    url: this._createDeleteUrl(file.closest(myid + ' .midia-item').data('file')[options.identifier]),
                    // url: options.base_url + '/midia/'+file.closest('.midia-item').data('file').fullname+'/delete',
                    type: 'delete',
                    headers: {
                        'X-CSRF-TOKEN': options.csrf_field
                    },
                    dataType: 'json',
                    beforeSend: function() {
                        $(myid + " .midia-delete").addClass('midia-disabled');
                        $(myid + " .midia-delete").html('Deleting');
                    },
                    error: function(xhr) {
                        alert(midiaLang['ERROR: '] + xhr.status + ' - ' + xhr.responseText);
                    },
                    complete: function() {
                        $(myid + " .midia-delete").removeClass('midia-disabled');
                        $(myid + " .midia-delete").html(midiaLang['Delete']);
                    },
                    success: function(data) {
                        file.closest(myid + ' .midia-item').remove();
                        midia._updateCounter();
                    }
                });
            }
        },

        _updateCounter: function () {
            if (this.totalShows == this.totalFiles) {
                let myid = '#' + this.id,
                    showing = $(myid + ' .midia-files .midia-item').length,
                    totalFiles = this.totalFiles;

                if (showing < this.totalShows) {
                    let diff = this.totalShows - showing;
                    this.totalShows = showing;
                    totalFiles = this.totalFiles -= diff;
                }

                this._setCounter(showing, totalFiles);
                if(showing == 0 && totalFiles == 0) {
                    this._messageOnContainer("<div class='midia-notfound'>" + midiaLang["Your directory is empty"] + "</div>");
                }
            }
        },

        open: function() {
            let midia = this,
                $elem = this.$elem,
                id = this.id,
                myid = '#' + id,
                options = this.settings;


            typeof options.onOpen === 'function' && options.onOpen.call(this);

            if($(myid + ".midia-wrapper").length) {
                midia._show();
                return;
            }

            $(myid).addClass('midia-opened');
            if(options.editor !== false && options.inline !== false) {
                $("body").css({
                    overflow: 'hidden'
                });
            }

            typeof options.onOpened === 'function' && options.onOpened.call(this);

            midia._reset();
        },

        close: function() {
            let midia = this,
                id = this.id,
                myid = '#' + id,
                options = this.settings;

            if(options.inline == false) {
                $(myid + ".midia-wrapper").hide();
                $(myid).removeClass('midia-opened');
            }
            if(options.editor !== false && options.inline !== false) {
                $("body").css({
                    overflow: 'initial'
                });
            }
            typeof options.onClose === 'function' && options.onClose.call(this);
        },

        empty: function () {
            let midia = this,
                id = this.id,
                myid = '#' + id,
                options = this.settings;

            midia.value = null;
            midia.file = null;


        }
    }

    $('[data-midia]').midia();

})(jQuery, window);
