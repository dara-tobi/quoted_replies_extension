(function () {

  removeQuotedRepliesFloater();

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      if (isStatusPage()) {

        appendQuotedRepliesFloater();
      } else {

        removeQuotedRepliesFloater();
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

    var body = document.querySelector('body');
    var floater = createFloater();

    body.appendChild(floater);
  }

  function removeQuotedRepliesFloater() {

    var floater = document.querySelector('#quoted-replies-floater');

    if (floater) {
      floater.parentNode.removeChild(floater);
    }
  }

  function createFloater() {

    var iconUrl = chrome.extension.getURL("icons/quoted_replies.png");
    var floater = document.createElement('div');

    floater.id = 'quoted-replies-floater';

    floater.style.height = '30px';
    floater.style.width = '30px';

    floater.style.borderRadius = '15px';

    floater.style.backgroundImage = `url(${iconUrl})`;
    floater.style.backgroundPosition = 'center';
    floater.style.backgroundSize = 'contain';

    floater.style.position = 'fixed';
    floater.style.zIndex = '500000000';

    var linksContainer = createLinksContainer();

    if (isLegacyTwitter()) {
      // User is on the regular web Twitter
      floater.style.top = '89px';
      floater.style.left = '47%';
      linksContainer.style.left = '49%';

    } else {
      // User is on the new mobile-like version
      floater.style.top = '88px';
      floater.style.left = '39%';
      linksContainer.style.left = '41%';
    }

    var links = createLinks();

    linksContainer.appendChild(links);
    floater.appendChild(linksContainer);

    return floater;
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
    linksContainer.style.position = 'fixed';
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

})();
