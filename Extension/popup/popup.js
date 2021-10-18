const sendMessageId = document.getElementById("sendmessageid");
if (sendMessageId) {
  sendMessageId.onclick = function() {
    console.log("sendMessageId clicked");
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {},
            function(response) {
              console.log("message with url sent");
              window.close();
            }
          );
    });
  };
}