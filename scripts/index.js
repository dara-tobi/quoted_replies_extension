(function () {

  chrome.runtime.onMessage.addListener(

  function(request, sender, sendResponse) {
    if (!isStatusPage()) {
      removeQuotedRepliesFloater();
    } else {
      if (request.message === 'urlChanged' || request.message === 'pageLoaded') {

        removeQuotedRepliesFloater();
        appendQuotedRepliesFloater();

      } else {
        toggleQuotedRepliesFloater();
      }
    }
  });

  function isStatusPage() {

    var urlParts = window.location.pathname.split('/');

    if (urlParts[2] && urlParts[2] === 'status') {
      return true;
    }

    return false;
  }

  function appendQuotedRepliesFloater() {
    if (isStatusPage()) {

      var body = document.querySelector('body');
      var floatingElements = createFloatingElements();

      chrome.storage.local.get(['positionOptions'], function(options) {
        var positionChanged = options.positionOptions &&
          options.positionOptions.positionChanged;

        if (options.positionOptions) {
          if (options.positionOptions.left && options.positionOptions.top) {
            floatingElements.style.left = options.positionOptions.left;
            floatingElements.style.top = options.positionOptions.top;
          }
        }


        if (!positionChanged) {
          floatingElements.title = 'click and drag to reposition';
        }

        body.appendChild(floatingElements);

      });
    }
  }

  function removeQuotedRepliesFloater() {

    var floaterContainer = document.querySelector('#floater-container');

    if (floaterContainer) {
      floaterContainer.parentNode.removeChild(floaterContainer);
    }
  }

  function createFloatingElements() {

    var iconUrl = chrome.extension.getURL("icons/quoted_replies.png");
    var floater = document.createElement('div');
    var floaterContainer = document.createElement('div');
    var closeIcon = createCloseIcon();

    floaterContainer.id = 'floater-container';

    floaterContainer.style.position = 'fixed';
    floaterContainer.style.width = '85px';
    floaterContainer.style.height = '40px';
    floaterContainer.draggable = 'true';
    floaterContainer.style.cursor = 'move';

    floaterContainer.addEventListener('dragenter', enableDrag);
    floaterContainer.addEventListener('dragend', endDrag);


    floater.id = 'quoted-replies-floater';

    floater.style.height = '30px';
    floater.style.width = '30px';

    floater.style.borderRadius = '15px';

    floater.style.backgroundImage = `url(${iconUrl})`;
    floater.style.backgroundPosition = 'center';
    floater.style.backgroundSize = 'contain';
    floater.style.position = 'relative';
    floaterContainer.style.zIndex = '500000000';

    var linksContainer = createLinksContainer();

    if (isLegacyTwitter()) {
      // User is on the regular web Twitter

      floaterContainer.style.top = '89px';
      floaterContainer.style.left = '47%';

    } else {
      // User is on the new mobile-like version

      floaterContainer.style.top = '88px';
      floaterContainer.style.left = '39%';

    }

    var links = createLinks();

    linksContainer.appendChild(links);
    floater.appendChild(linksContainer);
    floater.appendChild(closeIcon);
    floaterContainer.appendChild(floater);

    return floaterContainer;
  }

  function createLinksContainer() {

    var linksContainer = document.createElement('div');

    linksContainer.className = 'quotedRepliesLinkDiv';
    linksContainer.style.color = '#003fa7';
    linksContainer.style.lineHeight = '10px';
    linksContainer.textContent = 'Links:';
    linksContainer.style.width = '40px';
    linksContainer.style.height = '22px';
    linksContainer.style.borderRadius = '15px';
    linksContainer.style.padding = '8px';
    linksContainer.style.textAlign = 'center';
    linksContainer.style.background = 'white';
    linksContainer.style.position = 'relative';
    linksContainer.style.left = '25px';
    linksContainer.style.fontFamily = 'sans-serif';
    linksContainer.style.fontSize = 'xx-small';

    return linksContainer;
  }

  function createLinks() {

    var url = window.location;
    var searchLinkType1 = 'https://twitter.com/search?f=tweets&vertical=default&q=' + url.href;
    var searchLinkType2 = 'https://twitter.com/search?f=tweets&vertical=default&q=' + url.hostname + url.pathname;
    var link = document.createElement('a');

    link.target = '_blank';
    link.style.color = '#003fa7';
    link.style.fontFamily = 'sans-serif';
    link.style.display = 'inline-block';
    link.style.textDecoration = 'underline';

    var linksDiv = document.createElement('div');
    linksDiv.style.textAlign = 'left';
    linksDiv.style.marginTop = '4px';

    var link1 = link.cloneNode();
    link1.href = searchLinkType1;
    link1.style.width = '30%';
    link1.style.marginLeft = '2px';
    link1.style.marginRight = '20px';
    link1.textContent = '1';

    var link2 = link.cloneNode();
    link2.href = searchLinkType2;
    link2.textContent = '2';

    linksDiv.appendChild(link1);
    linksDiv.appendChild(link2);

    return linksDiv;
  }

  function isLegacyTwitter() {

    return !!document.querySelector('.permalink-tweet');
  }

  var boxBeginY, boxBeginX, mouseBeginX, mouseBeginY;

  function enableDrag(e) {

    var pos = e.currentTarget.getBoundingClientRect();

    boxBeginX = pos.x;
    boxBeginY = pos.y;
    mouseBeginX = e.clientX;
    mouseBeginY = e.clientY;

    e.currentTarget.style.display = 'none';
  }

  function endDrag(e) {

    e.currentTarget.style.display = 'block';

    e.currentTarget.style.left = e.clientX - (mouseBeginX - boxBeginX) + "px";
    e.currentTarget.style.top = e.clientY - (mouseBeginY - boxBeginY) + "px";

    e.currentTarget.title = '';

    chrome.storage.local.get(['positionOptions'], updatePosition.bind(null, e));
  }

  function createCloseIcon() {

    var closeIcon = document.createElement('span');

    closeIcon.textContent = 'x';

    closeIcon.style.background = '#700';
    closeIcon.style.color = 'white';
    closeIcon.style.height = '16px';
    closeIcon.style.width = '16px';

    closeIcon.style.display = 'inline-block';
    closeIcon.style.fontFamily = 'sans-serif';
    closeIcon.style.fontSize = 'xx-small';
    closeIcon.style.lineHeight = '1.8em';
    closeIcon.style.textAlign = 'center';

    closeIcon.style.borderRadius = '10px';
    closeIcon.style.cursor = 'pointer';

    closeIcon.style.left = '70px';
    closeIcon.style.position = 'relative';
    closeIcon.style.top = '-49px';


    closeIcon.addEventListener('click', dismissFloatingElements);

    return closeIcon;
  }

  function dismissFloatingElements() {

    var floaterContainer = document.querySelector('#floater-container');

    floaterContainer.parentNode.removeChild(floaterContainer);
  }

  function updatePosition(e, options) {

    if (!options) {
      options = {};
    }

    if (options.positionOptions) {
      if (options.positionOptions.shouldSaveLastPosition) {

        options.positionOptions.left = e.target.style.left;
        options.positionOptions.top = e.target.style.top;
      }

    } else {
      options.positionOptions = {};
    }

    if (!options.positionOptions.optionsPageOpened) {

      chrome.runtime.sendMessage({
        message: 'floaterPositionChanged'
      });

      options.positionOptions.optionsPageOpened = true;
    }

    options.positionOptions.positionChanged = true;

    chrome.storage.local.set({
      ['positionOptions']: options.positionOptions
    });
  }

  function toggleQuotedRepliesFloater() {
    if (document.querySelector('#floater-container')) {
      removeQuotedRepliesFloater();
    } else {
      appendQuotedRepliesFloater();
    }
  }

})();
