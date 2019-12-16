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
  chrome.tabs.sendMessage(tab.id, {
    message: 'toggleFloatingElements'
  });
});

chrome.runtime.onMessage.addListener(function(info){
  if (info.message === 'floaterPositionChanged') {
    chrome.runtime.openOptionsPage();
  }
  if (info.message === 'saveNewFloaterPosition') {
    chrome.storage.local.set({
      ['positionOptions']: info.positions
    });
  }
});
