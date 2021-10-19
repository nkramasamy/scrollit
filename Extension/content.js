var g_getPath = "scrollposition/";
var g_postPath = "updatescrollposition/";
var g_baseUrl = "https://scrollit.azurewebsites.net/";
var g_urlFinal = "";

/*
function sendGetRequest(url, data) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", g_baseUrl+g_getPath+url);
    xhr.send();
    xhr.onreadystatechange = (e) => {
        console.log("GET result", xhr.responseText)
        data = xhr.responseText;
    }
};
*/

function getHash(urlStr) {
    var hash = 0;
    if (urlStr.length == 0) return hash;
    for (i = 0 ;i<urlStr.length ; i++)
    {
        ch = urlStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch;
        hash = hash & hash;
    }
    return hash;
};

function sendPostRequest(data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", g_baseUrl+g_postPath+String(data.url)+"/"+String(data.position));
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        console.log(xhr.status);
        console.log(xhr.responseText);
    }};

    console.log(data);
    xhr.send();
}

$(window).on('load', function() {
    var url = window.location.href;
    var host = window.location.host;
    var officeHosts = ["sharepoint.com", "office.net", "office.com", "officeapps.live.com"];

    /*var childLoc = window.location;
    var parentLoc = window.parent.location;
    while (parentLoc && (childLoc != parentLoc)) {
        childLoc = window.parent.location;
        parentLoc = window.parent.parent.location;
    }
    g_urlFinal = childLoc.href;*/
    g_urlFinal = url;
    var pageTitle = document.title;
    var currScrollY = 0;
    var urlHash = getHash(g_urlFinal);
    console.log("urlHash ", urlHash);
    console.log("final url", g_urlFinal);

    // check if it is o365 app
    var isOfficeApp = false;
    for(var ohost of officeHosts)
    {
        if (host.search(ohost) >= 0) {
            urlHash = getHash(pageTitle);
            if (g_urlFinal.search(".ppt") >= 0 || g_urlFinal.search("powerpoint") >= 0 ||
                pageTitle.search(".ppt") >= 0) {
                isOfficeApp = true;
                // Powerpoint
                console.log("Loaded Powerpoint doc with title", pageTitle);
                
                if($("#EditingThumbnailsPanel") == null || $("#EditingThumbnailsPanel") == undefined)
                {
                    console.log("EditingThumbnailsPanel not found");
                    return;
                }

                $("#EditingThumbnailsPanel").scroll(function() {
                    console.log("Scroll to: ", $("#EditingThumbnailsPanel").scrollTop());
                    currScrollY = $("#EditingThumbnailsPanel").scrollTop();
                    var data = {
                        "url": urlHash,
                        "position": currScrollY
                    };
                    if (currScrollY > 0) sendPostRequest(data);
                });
                break;
            }
            else // if (url.search(".docx") >= 0)
            {
                isOfficeApp = true;
                // Word
                console.log("Loaded Word doc with title", pageTitle);
            
                if($("#WACViewPanel") == null || $("#WACViewPanel") == undefined)
                {
                    console.log("WACViewPanel not found");
                    return;
                }
            
           
                $("#WACViewPanel").scroll(function() { //.box is the class of the div
                    var scrollY = $("#WACViewPanel").scrollTop();
                    console.log(scrollY);
                    currScrollY = scrollY;
                    // sessionStorage.setItem("scroll", scrollY);
                    var data = {
                        "url": urlHash,
                        "position": currScrollY
                    };
                    if (currScrollY > 0) sendPostRequest(data);
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
                "url": urlHash,
                "position": currScrollY
            };
            if (currScrollY > 0) sendPostRequest(data);
        });
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // var url = window.location.href;
    var host = window.location.host;
    var officeHosts = ["sharepoint.com", "office.net", "office.com", "officeapps.live.com"];

    var currScrollY = 0;
    var isOfficeApp = false;
    var urlHash = getHash(g_urlFinal);
    var pageTitle = document.title;

    for(var ohost of officeHosts) {
        if (host.search(ohost) >= 0) {
            isOfficeApp = true;
            urlHash = getHash(pageTitle);
        }
    }

    console.log("addListener urlhash ", urlHash);
    var prevScrollY = 0;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", g_baseUrl+g_getPath+urlHash);
    xhr.send();
    xhr.onreadystatechange = (e) => {
        prevScrollY = parseFloat(xhr.responseText);
        console.log("GET result", prevScrollY);
        if (!prevScrollY) {
            console.log("prevScrollY is null");
            return;
        }

        if (isOfficeApp) {
            if (g_urlFinal.search(".ppt") >= 0 || g_urlFinal.search("powerpoint") >= 0 ||
                pageTitle.search(".ppt") >= 0) {
                // Powerpoint
                if($("#EditingThumbnailsPanel") == null || $("#EditingThumbnailsPanel") == undefined)
                {
                    console.log("EditingThumbnailsPanel not found");
                    return;
                }

                // select the closest slide
                var arr = $("#EditingThumbnailsPanel").children().children();
                var selectedSlideIdx = 0;
                var currPosPpt = prevScrollY; // sessionStorage.getItem("scrollPpt");
                if (arr && currPosPpt && currPosPpt > 0)
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

                    if (!arr[selectedSlideIdx+1]) console.log("array is null");

                    console.log("Selected selectedSlideIdx", selectedSlideIdx+1);
                    arr[selectedSlideIdx+1].click();
                }
            }
            else // if (g_urlFinal.search(".docx") >= 0)
            {
                // Word
                if($("#WACViewPanel") == null || $("#WACViewPanel") == undefined)
                {
                    console.log("WACViewPanel not found");
                    return;
                }
            
                var scrollY = prevScrollY; // sessionStorage.getItem("scroll");
                if(scrollY)
                {
                    $("#WACViewPanel").scrollTop(scrollY);
                    console.log("View panel scrolled");
                }
            }
        }
        else {
            // other websites
            console.log("addListener Other website ", host,
                " window.host", window.location.host,
                " hostname", window.location.hostname,
                " href", window.location.href);
            window.scrollTo({
                top: prevScrollY,
                behavior: 'smooth'});
        }
    }

});