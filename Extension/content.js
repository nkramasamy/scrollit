$(window).on('load', function() {
    // Word
    console.log("Loaded Word ", $("#WACViewPanel"));

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

    // Powerpoint
    console.log("Loaded Powerpoint ", $("#EditingThumbnailsPanel"));

    if($("#EditingThumbnailsPanel") == null || $("#EditingThumbnailsPanel") == undefined)
    {
        return;
    }

    // select the closest slide
    var arr = $("#EditingThumbnailsPanel").children().children();
    var selectedSlideIdx = 0;
    var currPosPpt = sessionStorage.getItem("scrollPpt");
    if (arr != null && currPosPpt != null)
    {
        console.log("currPosPpt: ", currPosPpt);
        for(selectedSlideIdx = 0; selectedSlideIdx < arr.length; selectedSlideIdx++) {
            // get first slide whose topOffset is greater then currPosPpt
            console.log("slide ", selectedSlideIdx, " offset: ", arr[selectedSlideIdx].offsetTop);
            if (arr[selectedSlideIdx].offsetTop >= currPosPpt)
            {
                break;
            }
        }
        console.log("Selected selectedSlideIdx", selectedSlideIdx+1);
        if (arr[selectedSlideIdx]) arr[selectedSlideIdx].click();
    }

    $("#EditingThumbnailsPanel").scroll(function() {
        console.log("Scroll to: ", $("#EditingThumbnailsPanel").scrollTop());
        sessionStorage.setItem("scrollPpt",
            $("#EditingThumbnailsPanel").scrollTop());
    });
});