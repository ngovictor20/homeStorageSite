$("#fileUpload").submit(function (e) { 
    //e.preventDefault();
    var folder = $("#folderID")
    var folderID = folder.attr('data-id')
    console.log("Folder ID")
    console.log(folderID)
    if($("#fileField").val() == ""){
        e.preventDefault();
    }else{
        //console.log($("fileField"))
        var formdata = new FormData(this)
        
        $.ajax({
            url: "/folder/"+folderID+"/file/",
            type:"POST",
            data: formdata,
            processData: false,
            contentType: false,
            success: function(r){
                console.log("result",r)
                if(r){
                    console.log("Adding file to database and filesystem.")
                    var parent = $("#fileDiv")
                    console.log("<a href='/folder/"+folderID+'/'+r._id+" data-id="+r._id+">"+r.name+"</a>")
                    parent.append("<a href='/folder/"+folderID+'/'+r._id+"' data-id='"+r._id+"'>"+r.name+"</a>")
                    var uploadedDiv = $("#uploadedDiv")
                    uploadedDiv.css("display","inline")
                    var uploadedList = $("uploadedList")
                    uploadedList.append("<li data-id='"+r._id+"'>"+r.name+"</li>")
                }
            }
        })
    }
});

$(".delete").on("click",function(e){
    var folder = $("#folderID")
    var folderID = folder.attr('data-id')
    console.log("click")
    $.ajax({
        url: "/folder/"+folderID+"/file/",
        type:"delete",
        data: {id:$(this).attr("data-id")},
        success: function(r){
            if(r){
                console.log(r)
            }
        }
    })
})

$("#uploadedDiv").on("click",function(e){
    $("#uploadedList").css("display","none")
})