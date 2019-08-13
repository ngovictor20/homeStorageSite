$("#fileUpload").submit(function (e) {
    //e.preventDefault();
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
                    console.log("<a href='/folder/" + folderID + '/' + r._id + " data-id=" + r._id + ">" + r.name + "</a>")
                    parent.append("<li><a href='/folder/" + folderID + "/" + r._id + "' data-id='" + r._id + "'>" + r._id + "</a>\
                    <div class='delete' data-id='"+ r._id + "'>x</div></li>")
                    var uploadedDiv = $("#uploadedDiv")
                    //uploadedDiv.css("display","inline")
                    var uploadedList = $("uploadedList")
                    uploadedList.append("<li>" + r.name + "</li>")
                    console.log("shoundlt this end")
                    setTimeout(function () {
                        console.log("hi")
                    }, 5000)
                    //document.close()
                }
            },
            error: function(jqXHR,textStatus,error){
                if(err){
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
$("#fileDiv").delegate(".delete", "click", function (e) {
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
                console.log($(this).parent())
                $(this).parent().remove()
                setTimeout(function () {
                    console.log("hi")
                }, 5000)
            }
        }
    })
})

$("#uploadedDiv").on("click", function (e) {
    $("#uploadedList").css("display", "none")
})