var g_getPath = "scrollposition/";
var g_postPath = "updatescrollposition/";
var g_baseUrl = "https://scrollit.azurewebsites.net/";
var g_urlFinal = "";

function sendGetRequest(url, data) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", g_baseUrl+g_getPath+url);
    xhr.send();
    xhr.onreadystatechange = (e) => {
        console.log("GET result", xhr.responseText)
        data = xhr.responseText;
    }
};

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

    var url2 = (window.location != window.parent.location)
            ? document.referrer
            : document.location.href;

    var childLoc = window.location;
    var parentLoc = window.parent.location;
    while (parentLoc && (childLoc != parentLoc)) {
        childLoc = window.parent.location;
        parentLoc = window.parent.parent.location;
    }
    g_urlFinal = childLoc.href;

    var currScrollY = 0;
    var urlHash = getHash(g_urlFinal);
    console.log("urlHash ", urlHash);
    console.log("final url", g_urlFinal);

    // check if it is o365 app
    var isOfficeApp = false;
    for(var ohost of officeHosts)
    {
        console.log("host", host, ' ohost ', ohost,  "url ", g_urlFinal);
        var idx = g_urlFinal.search("sourcedoc=");
        if (host.search(ohost) >= 0 && idx > 0) {
            
            var docUidStr = g_urlFinal.slice(idx);
            var docUid = docUidStr.slice(0, docUidStr.search("&"));
            urlHash = getHash(docUid);
            console.log("OFFICE DOC", docUid);
            if (g_urlFinal.search(".pptx") >= 0 || g_urlFinal.search("powerpoint") >= 0) {
                isOfficeApp = true;
                // Powerpoint
                console.log("Loaded Powerpoint ", $("#EditingThumbnailsPanel"));

                if($("#EditingThumbnailsPanel") == null || $("#EditingThumbnailsPanel") == undefined)
                {
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
                console.log("Loaded Word ", $("#WACViewPanel"));
            
                if($("#WACViewPanel") == null || $("#WACViewPanel") == undefined)
                {
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

    var url2 = (window.location != window.parent.location)
            ? document.referrer
            : document.location.href;

    var currScrollY = 0;
    var isOfficeApp = false;
    var urlHash = getHash(g_urlFinal);

    for(var ohost of officeHosts) {
        console.log("host", host, ' ohost ', ohost,  "g_urlFinal ", g_urlFinal);
        var idx = g_urlFinal.search("sourcedoc=");
        if (host.search(ohost) >= 0 && idx > 0) {
            isOfficeApp = true;
            var docUidStr = g_urlFinal.slice(idx);
            var docUid = docUidStr.slice(0, docUidStr.search("&"));
            console.log("OFFICE DOC", docUid);
            urlHash = getHash(docUid);
        }
    }

    console.log("addListener urlhash ", urlHash);
    console.log("g_urlFinal parent", url2);
    var prevScrollY = 0;
    // prevScrollY = parseFloat(sendGetRequest(urlHash));
    var xhr = new XMLHttpRequest();
    xhr.open("GET", g_baseUrl+g_getPath+urlHash);
    xhr.send();
    xhr.onreadystatechange = (e) => {
        prevScrollY = parseFloat(xhr.responseText);
        console.log("GET result", xhr.responseText);

        if (isOfficeApp) {
            if (g_urlFinal.search(".pptx") >= 0 || g_urlFinal.search("powerpoint") >= 0) {
                isOfficeApp = true;
                // Powerpoint
                if($("#EditingThumbnailsPanel") == null || $("#EditingThumbnailsPanel") == undefined)
                {
                    return;
                }

                // select the closest slide
                var arr = $("#EditingThumbnailsPanel").children().children();
                var selectedSlideIdx = 0;
                var currPosPpt = prevScrollY; // sessionStorage.getItem("scrollPpt");
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
                    if (arr[selectedSlideIdx+1]) arr[selectedSlideIdx+1].click();
                }
            }
            else // if (g_urlFinal.search(".docx") >= 0)
            {
                isOfficeApp = true;
                // Word
                if($("#WACViewPanel") == null || $("#WACViewPanel") == undefined)
                {
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