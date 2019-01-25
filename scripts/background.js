chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

  if (changeInfo.url) {

    chrome.tabs.sendMessage(tabId, {
      message: 'urlChanged',
      url: changeInfo.url
    });
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

  if (changeInfo.status === 'complete') {

    chrome.tabs.sendMessage(tabId, {
      message: 'pageLoaded'
    });
  }
});

chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.executeScript(tab.Id, {
    file: 'scripts/index.js'
  }, () => {
    if (chrome.runtime.lastError) {
      // Some error occurred while running tabs.executeScript
    }
  });
});
