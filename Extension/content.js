$(window).on('load', function() {
    console.log("Loaded",$("#WACViewPanel"));

    if($("#WACViewPanel") == null || $("#WACViewPanel") == undefined)
    {
        return;
    }

    var scrollY = sessionStorage.getItem("scroll");
    if(scrollY)
    {
        $("#WACViewPanel").on('load', function() {
            console.log("View panel loaded");
        });

        $("#WACViewPanel").scrollTop(scrollY);
        console.log("View panel scrolled");
    }

    $("#WACViewPanel").scroll(function() { //.box is the class of the div
        var scrollY = $("#WACViewPanel").scrollTop();
        console.log(scrollY);
        sessionStorage.setItem("scroll", scrollY);
    });
});