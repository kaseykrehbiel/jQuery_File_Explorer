if(jQuery) {
(function ($) {
    var FileExplorer = function (e, o) {
        // Get Options
        $.ajax({
            method: "POST",
            url: o.script,
            data: 'jqfeAction=getoptions&location=root',
            success: function (r) {
                var obj = eval("(" + r + ")");
                $(e).data('o', obj);
                $(e).data('script', o.script);
                // Check Error Conditions
                if (!jQuery.ui) error = 'File Explorer requires jQuery UI to operate.';
                else if ((!$(e).data('o').toolbar.enabled) && ($(e).data('o').toolbar.createFolder || $(e).data('o').toolbar.deleteFolder || $(e).data('o').toolbar.uploadFile || $(e).data('o').deleteFile)) error = 'Toolbar must be enabled for toolbar functions to work.';
                else if (!($(e).data('o').actionEvent == 'click' || $(e).data('o').actionEvent == 'dblclick' || $(e).data('o').actionEvent == "")) error = "File Explorer folder event may only be 'click' or 'dblclick'.";
                else {
                    // Behaviors
                    $(e).find('*').live('selectstart', function () {
                        return false;
                    });
                    $(e).find('.jqfeContent').find('div').live('dblclick', function (event) {
                        if (event.target != this) return true;
                        var parent = $(this).parent();
                        while (parent.data('location') == undefined && parent != $(e)) {
                            parent = parent.parent();
                        }
                        $(parent).dblclick();
                        return false;
                    });
                    $(e).find('.jqfeContent').find('div').live('click', function (event) {
                        if (event.target != this) return true;
                        var parent = $(this).parent();
                        while (parent.data('location') == null && parent != $(e)) {
                            parent = parent.parent();
                        }
                        parent.click();
                    });
                    $(e).find('.jqfeList').find('li.jqfeDir:not(.jqfeOpen)').live($(e).data('o').actionEvent, function (event) {
                        if (event.target != this) return true; // Ignore parent live() events
                        $(this).addClass('jqfeWait');
                        openFolder($(this));
                    });
                    $(e).find('.jqfeContent').find('li.jqfeDir.jqfeOpen').live($(e).data('o').actionEvent, function (event) {
                        if (event.target != this) return true; // Ignore parent live() events
                        closeFolder($(this));
                    });
                    $(e).find('.jqfeContent').find('li').live('click', function (event) {
                        if (event.target != this) return true; // Ignore parent live() events
                        selectElement($(this));
                    });
                    $(e).find('.jqfeContent').find('li.jqfeFile').live('dblclick', function (event) {
                        openFile($(this));
                    });

                    $(e).children().remove(); // Empty the container element
                    $(e).addClass('jqfeContainer');

                    if ($(e).data('o').toolbar.enabled) {
                        // Build the Toolbar
                        var eTb = $('<div class="jqfeToolbar ui-widget-header">'
                          + ($(e).data('o').toolbar.createFolder ? '<button class="jqfeBtn jqfeBtnCf" type="button" title="Create Folder"></button>' : '')
                          + ($(e).data('o').toolbar.uploadFile ? '<button class="jqfeBtn jqfeBtnUl" type="button" title="Upload File"></button>' : '')
                          + (($(e).data('o').toolbar.createFolder || $(e).data('o').toolbar.deleteFolder || $(e).data('o').toolbar.uploadFile || $(e).data('o').toolbar.deleteFile) ? '<button class="jqfeBtn jqfeBtnRn" type="button" title="Rename"></button>' : '')
                          + (($(e).data('o').toolbar.deleteFolder || $(e).data('o').toolbar.deleteFile) ? '<button class="jqfeBtn jqfeBtnDl" type="button" title="Delete"></button>' : '')
                          + '<button class="jqfeBtn jqfeBtnRf" type="button" title="Refresh"></button>'
                          + '</div>');
                        $(e).append(eTb);
                        $('.jqfeBtn').button();

                        // Build the Toolbar's Functionality

                        // Create Folder Toolbar Button (Generate the Create Folder Dialog)
                        if ($(e).data('o').toolbar.createFolder) {
                            $(eTb).children('.jqfeBtnCf').click(function () {
                                if (!($(e).data('o').actOnRoot) && $(e).data('jqfeSelected').hasClass('jqfeMaster')) {
                                    errorDialog('Create a Folder', 'You are not permitted to create folders in the root folder.');
                                } else if ($(e).data('jqfeSelected').data('type') != 'folder') {
                                    errorDialog('Upload a File', 'You must select a folder to create a folder in.');
                                } else {
                                    var dialog = $('<div class="jqfeDialog jqfeCfPrompt"><label>Folder Name:</label><input /></div>').dialog({
                                        title: "Create a Folder",
                                        buttons: {
                                            "OK": function () {
                                                jqfeCreateFolder($(this).children('input').val());
                                                $(this).remove();
                                            },
                                            "Cancel": function () {
                                                $(this).remove();
                                            }
                                        },
                                        resizable: false,
                                        modal: true,
                                        draggable: false
                                    }).keyup(function (event) {
                                        if (event.keyCode == 13) {
                                            $(this).parent().find('button').first().click()
                                        }
                                    });
                                }
                            });
                        }

                        // Upload File Toolbar Button (Generate the Upload File Dialog)
                        if ($(e).data('o').toolbar.uploadFile) {
                            $(eTb).children('.jqfeBtnUl').click(function () {
                                if (!($(e).data('o').actOnRoot) && $(e).data('jqfeSelected').hasClass('jqfeMaster')) {
                                    errorDialog('Upload a File', 'You are not permitted to upload files to the root folder.');
                                } else if ($(e).data('jqfeSelected').data('type') != 'folder') {
                                    errorDialog('Upload a File', 'You must select a folder to upload the file to.');
                                } else {
                                    $('<div class="jqfeDialog jqfeUlPrompt">'
                           + '   <form class="jqfeUlForm">'
                           + '      <div class="jqfeFI">'
                           + '         <input class="jqfeUl" type="file" name="file" />'
                           + '         <input name="location" type="hidden" value="" />'
                           + '         <input name="jqfeUlMaxSize" type="hidden" value="' + $(e).data('o').toolbar.uploadMaxSize + '" />'
                           + '         <input name="jqfeAction" type="hidden" value="upload" />'
                           + '         <input name="jqfeFT" type="hidden" value="' + $(e).data('o').toolbar.fileTypes + '" />'
                           + '      </div>'
                           + '    </form>'
                           + '</div>').dialog({
                               title: "Upload a File",
                               buttons: {
                                   "OK": function () {
                                       jqfeUploadFile($(this));
                                       $(this).remove();
                                   },
                                   "Cancel": function () {
                                       $(this).remove();
                                   }
                               },
                               resizable: false,
                               modal: true,
                               draggable: false
                           }).keyup(function (event) {
                               if (event.keyCode == 13) {
                                   $(this).parent().find('button').first().click()
                               }
                           });
                                }
                            });
                        }

                        // Rename Toolbar Button (Generate the Rename Dialog)
                        if ($(e).data('o').toolbar.deleteFolder || $(e).data('o').toolbar.deleteFile) {
                            $(eTb).children('.jqfeBtnRn').click(function () {
                                if ($(e).data('jqfeSelected').hasClass('jqfeMaster')) {
                                    errorDialog('Rename', 'You cannot rename the root folder.');
                                } else if (!($(e).data('o').actOnRoot) && $(e).data('jqfeSelected').parent().closest('li').hasClass('jqfeMaster')) {
                                    errorDialog('Rename', 'You cannot rename files or folders on the root level.');
                                } else {
                                    $('<div class="jqfeDialog jqfeRnPrompt"><label>Enter a new name:</label><input /></div>').dialog({
                                        title: "Rename",
                                        buttons: {
                                            "OK": function () {
                                                jqfeRename($(this));
                                                $(this).remove();
                                            },
                                            "Cancel": function () {
                                                $(this).remove();
                                            }
                                        },
                                        resizable: false,
                                        modal: true,
                                        draggable: false
                                    }).keyup(function (event) {
                                        if (event.keyCode == 13) {
                                            $(this).parent().find('button').first().click()
                                        }
                                    });
                                }
                            });
                        }

                        // Delete Toolbar Button (Generate the Delete Dialog)
                        if ($(e).data('o').toolbar.deleteFolder || $(e).data('o').toolbar.deleteFile) {
                            $(eTb).children('.jqfeBtnDl').click(function () {
                                if ($(e).data('jqfeSelected').hasClass('jqfeMaster')) {
                                    errorDialog('Delete', 'You cannot delete the root folder.');
                                } else if (!($(e).data('o').actOnRoot) && $(e).data('jqfeSelected').parent().closest('li').hasClass('jqfeMaster')) {
                                    errorDialog('Delete', 'You cannot delete files or folders on the root level.');
                                } else if (!($(e).data('o').toolbar.deleteFile) && $(e).data('jqfeSelected').data('type') == "file") {
                                    errorDialog('Delete', 'You do not have permission to delete files.');
                                } else if ((!($(e).data('o').toolbar.deleteFolder) && $(e).data('jqfeSelected').data('type') == "folder")) {
                                    errorDialog('Delete', 'You do not have permission to delete folders.');
                                } else {
                                    $('<div class="jqfeDialog jqfeDlPrompt">Are you sure you wish to delete the selected object?</div>').dialog({
                                        title: "Delete",
                                        buttons: {
                                            "OK": function () {
                                                jqfeDelete($(this));
                                                $(this).remove();
                                            },
                                            "Cancel": function () {
                                                $(this).remove();
                                            }
                                        },
                                        resizable: false,
                                        modal: true,
                                        draggable: false
                                    }).keyup(function (event) {
                                        if (event.keyCode == 13) {
                                            $(this).parent().find('button').first().click()
                                        }
                                    });
                                }
                            });

                        }

                        // Refresh Toolbar Button (Refresh the File Explorer)
                        $(eTb).children('.jqfeBtnRf').click(function () {
                            selectElement($(e).find('.jqfeMaster'));
                            openFolder($(e).data('jqfeSelected'));
                        });
                    }
                    var $jqfeMaster = '<ul class="jqfeContent jqfeList ui-widget-content"><li class="jqfeDir jqfeItem jqfeOpen jqfeMaster" data-location="' + $(e).data('o').root + '" data-type="folder">' + ($(e).data('o').displayRoot ? '<div class="jqfeObjName">' + $(e).data('o').root + '</div>' : '') + '</li></ul>';
                    $(e).append($jqfeMaster);
                    selectElement($(e).find('.jqfeMaster'));
                    openFolder($(e).data('jqfeSelected'));
                }
                if (error) errorDialog('jQuery File Explorer Error', error);
            },
            error: function (x) {
                errorDialog('File Explorer Options', 'The jQuery File Explorer failed to retrieve options from the script file.');
                $('#jqfeLog').append(x.responseText);
            }
        });

        // File Explorer Functions

        var errorDialog = function (title, message) {
            $('<div>' + message + '</div>').dialog({
                title: title,
                buttons: {
                    "OK": function () {
                        $(this).remove();
                    }
                },
                resizable: false,
                modal: true,
                draggable: false
            }).keyup(function (event) {
                if (event.keyCode == 13) {
                    $(this).parent().find('button').first().click()
                }
            });
        };

        var selectElement = function (el) {
            $(e).find('.jqfeSelected').removeClass('jqfeSelected');
            $(el).addClass('jqfeSelected');
            $(e).data('jqfeSelected', el);
        };

        var openFolder = function (el) {
            $(el).find('ul').remove();
            var h = $(el).html();
            $(el).html($(e).data('o').waitPrompt);
            $(el).addClass('jqfeWait');
            $.ajax({
                type: "POST",
                url: $(e).data('script'),
                data: "location=" + escape(el.data('location'))
                + ($(e).data('o').showFileSize ? "&fs=true" : "")
                + ($(e).data('o').showFileDate ? "&fd=true" : "")
                + "&ft=" + $(e).data('o').fileTypes
                + "&cr=" + $(e).data('o').createRoot,
                dataType: "html",
                success: function (re) {
                    $(e).data('jqfeSelected').html(h).append(re).removeClass('jqfeWait').addClass('jqfeOpen');
                },
                error: function (x) {
                    $(e).data('jqfeSelected').html(h);
                    errorDialog('Folder Open', 'The jQuery File Explorer cannot open this folder.');
                    $('#jqfeLog').append(x.responseText);
                }
            });
        };

        var closeFolder = function (el) {
            if ($(e).data('jqfeSelected').html() == el.html()) {
                $(el).removeClass('jqfeOpen').removeClass('jqfeSelected').children('ul').remove();
                $(e).data('jqfeSelected', $(e).find('.jqfeMaster'));
            }
        };

        var openFile = function (el) {
            window.open(el.data('location'));
        };

        var jqfeCreateFolder = function (name) {
            if (/[^a-zA-Z0-9 .]/.test(name)) {
                errorDialog('Create a Folder', 'Error: You cannot use special characters in folder names.');
            } else {
                $.ajax({
                    type: "POST",
                    url: $(e).data('script'),
                    data: "jqfeAction=createfolder&location=" + escape($(e).data('jqfeSelected').data('location')) + "&newfolder=" + escape(name),
                    dataType: "html",
                    success: function (response) {
                        if (response == null || response == '') {
                            $(e).data('jqfeSelected').find('ul').append('<li id="jqfeCF"></li>');
                            var cfEl = $('#jqfeCF');
                            cfEl.addClass('jqfeDir');
                            cfEl.addClass('jqfeItem');
                            cfEl.attr('data-location', $(e).data('jqfeSelected').data('location') + '/' + name);
                            cfEl.attr('data-type', 'folder');
                            cfEl.append('<div class="jqfeObjName">' + name + '</div>');
                            cfEl.removeAttr('id');
                        } else {
                            errorDialog('Create a Folder', 'Error: The folder could not be created.');
                            $('#jqfeLog').append(response);
                        }
                    }
                });
            }
        };

        var jqfeUploadFile = function (el) {
            var filename = $(el).find('input[type="file"]').val().substring($(el).find('input[type="file"]').val().lastIndexOf('\\') + 1);
            var rand = new Date().getTime();
            var jqfeUlFrame = $('<iframe name="jqfeUlFrame' + rand + '" id="jqfeUlFrame' + rand + '" style="display:none"></iframe>');
            $(e).append(jqfeUlFrame);
            $(jqfeUlFrame).load(function () {
                if ($.browser.msie) {
                    var uR = $('#jqfeUlFrame' + rand)[0].contentWindow.document.getElementsByTagName('body')[0].innerHTML;
                } else {
                    var uR = $('#jqfeUlFrame' + rand)[0].contentDocument.getElementsByTagName('body')[0].innerHTML;
                }
                if (uR.indexOf('size') != -1) {
                    var obj = eval('(' + uR + ')');
                    $(e).data('jqfeSelected').children('ul').append('<li class="jqfeFile jqfeExt' + filename.substr(filename.lastIndexOf('.') + 1) + '" data-type="file" data-location="' + $(e).data('jqfeSelected').data('location') + '/' + filename + '"><div class="jqfeObjName">' + filename + '</div>' + ($(e).data('o').showFileSize ? '<div class="jqfeSize">' + obj.size + '</div>' : '') + ($(e).data('o').showFileDate ? '<div class="jqfeDate">' + obj.date + '</div>' : '') + '</li>');
                } else {
                    if (uR.indexOf('File already exists') != -1) {
                        errorDialog('Upload a File', 'Error: The specified file already exists.');
                    } else if (uR.indexOf('file types') != -1) {
                        errorDialog('Upload a File', 'Error: You may only upload these file types: ' + $(e).data('o').fileTypes);
                    } else if (uR.indexOf('File is too large.') != -1) {
                        errorDialog('File is too large. (Max upload size = ' + $(e).data('o').uploadMaxSize + ')');
                    } else {
                        errorDialog('Upload a File', 'Error: The file failed to upload.');
                    }
                    $('#jqfeLog').append(uR);
                }
                return false;
            });
            var ulForm = el.find('form');
            ulForm.attr('action', $(e).data('script'));
            ulForm.attr('method', 'post');
            ulForm.attr('jqfeUl', filename);
            ulForm.find('input[name="location"]').val($(e).data('jqfeSelected').data('location'));
            ulForm.find('input[name="jqfeUlMaxSize"]').val($(e).data('o').uploadMaxSize);
            ulForm.find('input[name=jqfeAction]').val('upload');
            ulForm.find('input[name=jqfeFT]').val($(e).data('o').fileTypes);
            ulForm.attr('enctype', 'multipart/form-data');
            ulForm.attr('encoding', 'multipart/form-data');
            ulForm.attr('target', 'jqfeUlFrame' + rand);
            ulForm.submit();
        };

        var jqfeRename = function (el) {
            var newname = $(el).find('input').val();
            var type = $(e).data('jqfeSelected').data('type');
            var ext = (type == 'file' ? $(e).data('jqfeSelected').data('location').substr($(e).data('jqfeSelected').data('location').lastIndexOf('.')) : '');
            var parentLocation = $(e).data('jqfeSelected').parent().closest('.jqfeOpen').data('location')
            $.ajax({
                type: "POST",
                url: $(e).data('script'),
                data: 'jqfeAction=rename' + $(e).data('jqfeSelected').data('type')
                + '&location=' + escape($(e).data('jqfeSelected').data('location'))
                + '&newname=' + escape(newname)
                + '&parentlocation=' + escape(parentLocation),
                dataType: "html",
                success: function (r) {
                    if (r == null || r == '') {
                        console.log($(e).data('jqfeSelected'))
                        $(e).data('jqfeSelected').data('location', parentLocation + '/' + newname + ext)
                        $(e).data('jqfeSelected').children('.jqfeObjName').html(newname + ext);
                    } else {
                        errorDialog('Rename', 'Error: Rename failed.');
                        $('#jqfeLog').append(r);
                    }
                },
                error: function (r) {
                    errorDialog('Rename', 'Error: Rename failed.');
                    $('#jqfeLog').append(r.responseText);
                }
            });
        };

        var jqfeDelete = function (el) {
            $.ajax({
                type: "POST",
                url: $(e).data('script'),
                data: "jqfeAction=delete" + $(e).data('jqfeSelected').data('type') + '&location=' + escape($(e).data('jqfeSelected').data('location')),
                dataType: "html",
                success: function (response) {
                    if (response == null || response == '' || response == '<pre></pre>') {
                        $(e).data('jqfeSelected').remove();
                    } else {
                        errorDialog('Delete', 'Error: Delete failed.');
                        console.log(response);
                        $('#jqfeLog').append(response);
                    }
                    selectElement($(e).find('.jqfeMaster'));
                },
                error: function (response) {
                    errorDialog('Delete', 'Error: Delete failed.');
                    $('#jqfeLog').append(response);
                }
            });
        }

        var error = "";

    };

    $.fn.fileExplorer = function (o) {
        return this.each(function () {
            var e = $(this);
            if ($(e).data('fileExplorer')) {
                'The fileExplorer plugin cannot be executed twice on the same element.';
                return false;
            }
            var fileExplorer = new FileExplorer(this, o);
            $(e).data('fileExplorer', fileExplorer);
        });
    };
})(jQuery);
}