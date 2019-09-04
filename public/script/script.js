$("#fileUpload").submit(function (e) {
    //e.preventDefault();
    e.preventDefault();
    var folder = $("#folderID")
    var folderID = folder.attr('data-id')
    console.log("Folder ID")
    console.log(folderID)
    setTimeout(function () {
        console.log("hi")
    }, 1000)
    if ($("#fileField").val() == "") {
        console.log("File Field Check Failed")
        e.preventDefault();
    } else {
        //console.log($("fileField"))
        var formdata = new FormData(this)
        $.ajax({
            url: "/folder/" + folderID + "/file/",
            type: "POST",
            data: formdata,
            processData: false,
            contentType: false,
            success: function (r) {
                console.log("In success")
                console.log("result", r)
                if (r) {
                    console.log("Adding file to database and filesystem.")
                    var parent = $("#fileList")
                    console.log(parent)
                    parent.append("\
                    <div class='ui segment fileItem' data-id='"+r._id+"'>\
                        <i class='icon file outline big'></i>\
                        <span>\
                            <div class='fileName ui header' data-id='"+r._id+"'>"+r.name+"</div>\
                        </span>\
                    </div>")
                    var uploadedDiv = $("#uploadedDiv")
                    //uploadedDiv.css("display","inline")
                    var uploadedList = $("#uploadedList")
                    //uploadedList.append("<li>" + r.name + "</li>")
                    console.log("shoundlt this end")
                    setTimeout(function () {
                        console.log("hi")
                    }, 5000)
                    //document.close()
                }
            },
            error: function (jqXHR, textStatus, error) {
                if (err) {
                    console.log(err)
                }
            },
            complete: function () {
                console.log("completed ajax")
            }
        })
    }
});

//probably an issue with putting getting the folderID here
$("#menu").delegate(".delete", "click", function (e) {
    var folder = $("#folderID")
    var folderID = folder.attr('data-id')
    console.log("click")
    $.ajax({
        url: "/folder/" + folderID + "/file/",
        type: "delete",
        data: { id: $(this).attr("data-id") },
        dataType: "json",
        success: function (r) {
            if (r) {
                console.log(r)
                console.log("removing element")
                // console.log($(this).parent())
                // $(this).parent().remove()
                // setTimeout(function () {
                //     console.log("hi")
                // }, 5000)
            }
        }
    })
})

$("#uploadedDiv").on("click", function (e) {
    $("#uploadedList").css("display", "none")
})

$('#newFolderForm').on('click', function (e) {
    console.log("folder form")
    var form = $('#folderUpload')
    if ($('#folderName').val() != '') {
        form.submit()
    } else {
        console.log("input for new folder was empty, nothing happens")
    }
})

$("#folderUpload").on("submit",function(e){
    
})



$('#newFileForm').on('click', function (e) {
    var form = $('#fileUpload')
    console.log($('#fileField').val())
    if ($('#fileField').val() != '') {
        form.submit()
        $("#newFileDialog").modal("hide")
    } else {
        console.log("Input for new file was empty, nothing happens")
    }
})

$("#renameDialog").delegate(".renameFileInput", "keypress", function (e) {
    if (e.which == 13) {
        var folderID = $("#folderID").attr("data-id")
        var fileID = $(this).attr('data-id')
        console.log("/folder/" + folderID + "/file/" + fileID)
        console.log("Hit enter, Should call AJAX")
        event.preventDefault();
        if ($(this).val() != "") {
            var name = $(this).val()
            console.log("Name Here: " + name)
            $.ajax({
                url: "/folder/" + folderID + "/file/" + fileID,
                type: "POST",
                datatype: "json",
                data: {
                    fileName: name
                },
                success: function (r) {
                    console.log("result:" + r)
                }
            })
        }
    }
})

$("#renameDialog").delegate(".renameFolderInput", "keypress", function (e) {
    if (e.which == 13) {
        var folder = $(this)
        var folderID = folder.attr('data-id')
        console.log(folderID)
        console.log("Hit enter, Should call AJAX")
        event.preventDefault();
        if ($(this).val() != "") {
            var name = $(this).val()
            console.log(name)
            $.ajax({
                url: "/folder/" + folderID,
                type: "POST",
                datatype: "json",
                data: {
                    folderName: name
                },
                success: function (r) {
                    console.log("Result: " + r)
                    $('#renameDialog').modal('hide')
                }
            })
        }
    }
})

//$("#folderDiv,#fileDiv").delegate(".moveFolder,.moveFile", "click", function (e) {
$("#menu").delegate(".moveFolder,.moveFile", "click", function (e) {
    console.log("Move request for folder")
    var folder = $(this)
    var parentFolder = $("#folderID")
    var parentFolderID = parentFolder.attr("data-id")
    var folderID = folder.attr('data-id')
    var moveDialog = $("#moveFolderDialog")
    var moveFolderList = $("#moveFolderList")
    var moveFileList = $("#moveFileList")
    var ajaxURL
    if (folderID) {
        moveDialog.css("display", "inline")
        console.log(folderID)
        console.log("Calling AJAX")
        $.ajax({
            url: "/folder/" + parentFolderID + "/move",
            type: "POST",
            dataType: "json",
            success: function (response) {
                if (response.err) {
                    console.log("ERROR: " + response.err)
                } else {
                    console.log("Deleting Children from Lists")
                    moveFolderList.children().remove()
                    moveFileList.children().remove()
                    $(".moveHere").remove()
                    $("#moveFolderDialog").modal('show')
                    console.log(response)
                    moveFolderList.append("<div id='moveFolderBack' data-id='" + response.parentFolder + "'>back</div>")
                    response.childFolders.forEach(function (x) {
                        if (folder.has(".moveFile")) {
                            moveFolderList.append("<div class='ui segment'><div class='moveFolderItem item' data-id='" + x._id + "'>" + x.name + "<div class='moveButton' data-id='" + x._id + "' src-id='" + folderID + "' isFile='true'>Move Here</div></div></div><br>")
                        } else {
                            moveFolderList.append("<div class='ui segment'><div class='moveFolderItem' data-id='" + x._id + "'>" + x.name + "<div class='moveButton' data-id='" + x._id + "' src-id='" + folderID + "'>Move Here</div></div></div><br>")
                        }
                    })
                    response.childFiles.forEach(function (x) {
                        moveFileList.append("<div class='ui moveFileItem segment' data-id='" + x._id + "'>" + x.name + "</div>")
                    })
                    moveDialog.append("<div class='moveHere' data-id'" + response._id + "'>Move To This Folder</div>")
                }
            }
        })

    } else {
        console.log("ERROR, folderID does not exist")
    }
})

$("#moveFolderDialog").delegate(".moveButton", "click", function (e) {
    var destFolderID = $(this).attr('data-id')
    var srcFolderID = $(this).attr('src-id')
    var parentFolderID = $("#folderID").attr('data-id')
    let ajaxURL
    if ($(this).attr('isFile') === "true") {
        console.log("Is a file calling for move request")
        ajaxURL = "/folder/" + parentFolderID + "/file/" + srcFolderID
    } else {
        ajaxURL = "/folder/" + srcFolderID
    }
    $.ajax({
        url: ajaxURL,
        type: "PUT",
        dataType: "json",
        data: {
            destFolderID: destFolderID
        },
        success: function (response) {
            if (response.err) {
                console.log("ERROR: " + response.err)
            } else {
                console.log("MOVE SUCCESSFUL")
            }
        }
    })
})


// $("#cancelMoveButton").on("click",function(e){
//     console.log("cancel button event")
//     var moveDialog = $("#moveFolderDialog")
//     moveDialog.css("display","none")
// })

$("#moveDialogCancel").on("click", function (e) {
    console.log("Deleting children")
    var moveFolderList = $("#moveFolderList")
    var moveFileList = $("#moveFileList")
    moveFolderList.children().remove()
    moveFileList.children().remove()
})

$("#moveFolderDialog").delegate("#moveFolderBack,.moveFolderItem,.moveHere", "click", function (e) {
    console.log("Back Button Was Pressed")
    var folder = $(this)
    var folderID = folder.attr('data-id')
    var moveDialog = $("#moveFolderDialog")
    var moveFolderList = $("#moveFolderList")
    var moveFileList = $("#moveFileList")
    if (folderID) {
        moveDialog.css("display", "inline")
        console.log(folderID)
        console.log("Calling AJAX")
        $.ajax({
            url: "/folder/" + folderID + "/move",
            type: "POST",
            dataType: "json",
            success: function (response) {
                if (response.err) {
                    console.log("ERROR: " + response.err)
                } else {
                    console.log("Back button was pressed")
                    console.log(response)
                    moveFolderList.children().remove()
                    moveFileList.children().remove()
                    if (response.parentFolder != null) {
                        moveFolderList.append("<div id='moveFolderBack' data-id='" + response.parentFolder + "'>back</div>")
                    }
                    response.childFolders.forEach(function (x) {
                        moveFolderList.append("<div class='moveFolderItem ui segment' data-id='" + x._id + "'>" + x.name + "<div class='moveButton' data-id='" + x._id + "' src-id='" + folderID + "'>Move Here</div></div>")
                    })
                    response.childFiles.forEach(function (x) {
                        moveFileList.append("<div class='moveFileItem ui segment' data-id='" + x._id + "'>" + x.name + "</div>")
                    })
                }
            }
        })

    } else {
        console.log("ERROR, folderID does not exist")
    }
})

$("#menu").delegate('.copy', 'click', function (e) {
    var folder = $("#folderID")
    var folderID = folder.attr('data-id')
    var fileID = $(this).attr('data-id')
    if (folderID) {
        console.log(folderID)
        console.log(fileID)
        console.log("/folder/" + folderID + "/file/" + fileID + "/copy")
        console.log("Calling AJAX")
        $.ajax({
            url: "/folder/" + folderID + "/file/" + fileID + "/copy",
            type: "POST",
            dataType: "json",
            success: function (response) {
                if (response.err) {
                    console.log("ERROR: " + response.err)
                } else {
                    console.log("Move Successful")
                    console.log(response)
                }
            }
        })
    } else {
        console.log("ERROR, folderID does not exist")
    }
})

$("#folderList").delegate(".folderLink", "dblclick", function (e) {
    console.log("Double click event for folder link")
    var folder = $(this)
    var folderID = folder.attr('data-id')
    var url = "/folder/" + folderID
    console.log(url)
    window.location.replace(url)
})

// $(document).bind('click', function(e) {
//     console.log(e.target)
//     if(!$(e.target).is('#focus')) {
//         $("#focus").attr("id","focus")
//     }else{
//         $("#focus").attr("id","")
//     }
//   });


//Focus on an item
$(".folderItem,.fileItem").on("click", function (e) {
    console.log("Add focus")
    $("#focus").attr("id", "")
    $(this).attr("id", "focus")
})

//CONTEXT MENU STUFF
$("#folderList,#fileList").delegate(".folderItem,.fileItem","contextmenu", function (e) {
    $("#focus").attr("id", "")
    $(this).attr("id", "focus")
    console.log("Context Menu")
    var menu = $('#menu')
    var doc = $(this)
    var docID = doc.attr('data-id')
    menu.children().remove()
    if (doc.hasClass("folderItem")) {
        console.log("Folder Item")
        menu.append("\
        <div class='moveFolder ui segment' data-id='"+ docID + "'>Move</div>\
        <div class='ui segment'><form id='deleteFolderForm' action='/folder/"+ docID + "?_method=DELETE' method='POST' data-id='" + docID + "'><div id='deleteFormSubmit'>Delete</div></form></div>\
        <div class='renameFolder ui segment' data-id='"+ docID + "'>Rename Folder</div>")
    } else if (doc.hasClass("fileItem")) {
        console.log("File Item")
        menu.append("\
        <div class='delete ui segment' data-id='"+ docID + "'>Delete File</div>\
        <div class='copy ui segment' data-id='"+ docID + "'>Copy File</div>\
        <div class='renameFile ui segment' data-id='"+ docID + "'>Rename File</div>\
        <div class='moveFile ui segment' data-id="+ docID + ">Move File</div>\
        <div class='ui segment'><a href='/folder/"+ docID + "/file/" + docID + "' data-id='" + docID + "'>Download File</a></div>")
    }
    menu.css({
        top: e.pageY + 'px',
        left: e.pageX + 'px'
    }).show();

    return false;
})

$(document).ready(function () {
    $('#menu').click(function () {
        $('#menu').hide();
    });
    $(document).click(function () {
        $('#menu').hide();
    });
});

$("#menu").delegate(".renameFile,.renameFolder", "click", function (e) {
    var menu = $("#menu")
    var doc = $(this)
    var docID = doc.attr('data-id')
    var renameDialog = $("#renameDialog")
    console.log(doc)
    renameDialog.children().remove()
    if (doc.hasClass("renameFolder")) {
        console.log("rename folder")
        renameDialog.append("<div class='ui header'>Rename</div>\
        <div class='ui input fluid'><input class='renameFolderInput' type='text' name='name' data-id='" + docID + "'></input></div>\
        <div class='actions'><div class='ui button'>Submit</div><div class='ui cancel button'>Cancel</div></div>")
    } else if (doc.hasClass("renameFile")) {
        console.log("rename folder")
        renameDialog.append("<div class='ui header'>Rename</div>\
        <div class='ui input fluid'><input class='renameFileInput' type='text' name='name' data-id='" + docID + "'></input></div>\
        <div class='actions'><div class='ui button'>Submit</div><div class='ui cancel button'>Cancel</div></div>")
    }
    renameDialog.modal('show')
})

$('#deleteFormSubmit').on("click", function (e) {
    console.log("Submit form to delete")
    $('#deleteFolderForm').submit()
})

//NAV BAR BUTTONS
$("#newFileNavButton").on("click", function (e) {
    $("#newFileDialog").modal('show')
})

$("#newFolderNavButton").on("click", function (e) {
    $("#newFolderDialog").modal('show')
})

$('body').on('click', function (e) {
    console.log(e.target)
})