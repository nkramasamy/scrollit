var g_getPath = "scrollposition/";
var g_postPath = "updatescrollposition/";
var g_baseUrl = "https://scrollit.azurewebsites.net/";

function sendGetRequest(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", g_baseUrl+g_getPath+url);
    xhr.send();
    xhr.onreadystatechange = (e) => {
        console.log(xhr.responseText)
    }
};

function sendPostRequest(data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", g_baseUrl+g_postPath);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        console.log(xhr.status);
        console.log(xhr.responseText);
    }};

    console.log(data);
    xhr.send(data);
}

$(window).on('load', function() {
    setTimeout(20000);
    console.log("Wasted 20sec");
    var url = window.location.href;
    var host = window.location.host;
    var officeHosts = ["sharepoint.com", "office.net", "office.com", "officeapps.live.com"];

    var currScrollY = 0;
    var prevScrollY = 0;
    
    sendGetRequest(url);
    
    // check if it is o365 app
    var isOfficeApp = false;
    for(var ohost of officeHosts)
    {
        console.log("host", host, ' ohost ', ohost,  "url ", url);
        if (host.search(ohost) >= 0) {
            
            if (url.search(".pptx") >= 0 || url.search("powerpoint") >= 0) {
                isOfficeApp = true;
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
                    currScrollY = $("#EditingThumbnailsPanel").scrollTop();
                    var data = {
                        "url": url,
                        "position": currScrollY
                    };
                    sendPostRequest(data);
                });
                break;
            }
            else // if (url.search(".docx") >= 0)
            {
                isOfficeApp = true;
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
                    currScrollY = scrollY;
                    // sessionStorage.setItem("scroll", scrollY);
                    var data = {
                        "url": url,
                        "position": currScrollY
                    };
                    sendPostRequest(data);
                });
                break;
            }
        }
    }
    
    if (!isOfficeApp) {
        // other websites
        console.log("Other website ", host,
            " window.host", window.location.host,
            " hostname", window.location.hostname,
            " href", window.location.href);
        $(window).scroll('scroll', function(event) {
            currScrollY = window.scrollY;
            console.log('Scrolling ', currScrollY);
            var data = {
                "url": url,
                "position": currScrollY
            };
            sendPostRequest(data);
        });
    }
});

