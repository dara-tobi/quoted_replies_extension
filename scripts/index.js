(function () {

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
    floater.style.top = '40px';
    floater.style.left = '20px';

    var linksContainer = createLinksContainer();
    var links = createLinks();

    linksContainer.appendChild(links);
    floater.appendChild(linksContainer);

    return floater;
  }

  function createLinksContainer() {

    var linksContainer = document.createElement('div');

    linksContainer.className = 'quotedRepliesLinkDiv';
    linksContainer.textContent = 'Links:';
    linksContainer.style.width = '40px';
    linksContainer.style.height = '22px';
    linksContainer.style.borderRadius = '15px';
    linksContainer.style.padding = '8px';
    linksContainer.style.textAlign = 'center';
    linksContainer.style.background = 'white';
    linksContainer.style.position = 'fixed';
    linksContainer.style.left = '49px';
    linksContainer.style.fontFamily = 'sans-serif';
    linksContainer.style.fontSize = 'xx-small';

    return linksContainer;
  }

  function createLinks() {

    var url = window.location;
    var searchLinkType1 = '/search?f=tweets&vertical=default&q=' + url.href;
    var searchLinkType2 = '/search?f=tweets&vertical=default&q=' + url.hostname + url.pathname;
    var link = document.createElement('a');

    link.style.color = '#003fa7';
    link.style.fontFamily = 'sans-serif';
    link.style.display = 'inline-block';

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
})();
