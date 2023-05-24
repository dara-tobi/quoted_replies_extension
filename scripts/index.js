// check if quoted replies button has already been added to article; if not, add it
let shouldAddQuotedRepliesButton = (article) => {
  return !article.classList.contains('qtr-icon-added');
};

// get color of retweet button
let getButtonColorFromExistingSVGs = (span) => {
  if (!span) {
    return '';
  }
  let retweetButtonComputedStyle = window.getComputedStyle(span);
  return retweetButtonComputedStyle.getPropertyValue('color');
};

// add quoted replies button to DOM
let addQuotedRepliesToDom = (retweetButton, quotedRepliesButton) => {
  retweetButton.parentNode.insertBefore(quotedRepliesButton, retweetButton.nextSibling);
};

// add hover title to quoted replies button
let addQuotedRepliesButtonHoverTitle = (quotedRepliesButton) => {
  quotedRepliesButton.addEventListener('mouseover', (event) => {
    let hasAddedQuotedRepliesButtonHoverTitleToDOM = document.querySelector('#ext-quoted-replies-q-title');
    if (hasAddedQuotedRepliesButtonHoverTitleToDOM) {
      return;
    }
    let titleParent = document.createElement('div');
    titleParent.innerHTML = `
      <div role="tooltip">
        <span dir="ltr" data-testid="HoverLabel">
          <span>See Quotes</span>
        </span>
      </div>
    `;

    // get position of quoted replies button
    let quotedRepliesButtonPosition = quotedRepliesButton.getBoundingClientRect();

    titleParent.style.top = `${quotedRepliesButtonPosition.top + 35}px`;
    titleParent.style.left = `${quotedRepliesButtonPosition.left - 20}px`;
    titleParent.id = 'ext-quoted-replies-q-title';
    if (isTweetOpen(quotedRepliesButton.querySelector('a').href)) {
      titleParent.style.top = `${quotedRepliesButtonPosition.top + 40}px`;
      titleParent.style.left = `${quotedRepliesButtonPosition.left - 24}px`;
    }
    document.body.appendChild(titleParent);
  });

  // remove hover title when mouse leaves button
  quotedRepliesButton.addEventListener('mouseout', () => {
    let hasAddedQuotedRepliesButtonHoverTitleToDOM = document.querySelector('#ext-quoted-replies-q-title');
    if (hasAddedQuotedRepliesButtonHoverTitleToDOM) {
      hasAddedQuotedRepliesButtonHoverTitleToDOM.remove();
    }
  });
};

// get status id for tweet
let getStatusId = (article) => {
  let username = article.querySelector('[data-testid="User-Name"]').querySelector('a').href.split('/').pop();
  let hrefs = Array.from(article.querySelectorAll('a[href*=status]')).map((el) => el.href);
  let statusHref = hrefs?.filter((href) => href.match(`https:\/\/twitter.com\/${username}\/status\/[0-9]+$`))?.pop();
  let statusId = statusHref?.split('/')?.pop();

  return statusId;
};

// get url to use for searching for quote tweets
let getQuoteTweetsSearchUrl = (article) => {
  let statusId = getStatusId(article);
  return `https://twitter.com/search?q=quoted_tweet_id%3A${statusId}&f=live`;
};

let isTweetOpen = (quoteTweetsSearchUrl) => {
  return quoteTweetsSearchUrl.includes(location.href.split('/').pop());
}

// create quoted replies button
let createQuotedRepliesButton = (buttonClasses, retweetButtonColor, svgClasses, quoteTweetsSearchUrl) => {
  let quotedRepliesButton = document.createElement('div');
  quotedRepliesButton.setAttribute('data-testid', 'quoted-replies-q');
  quotedRepliesButton.setAttribute('aria-label', 'Retweet with comment');
  quotedRepliesButton.setAttribute('role', 'button');
  quotedRepliesButton.setAttribute('tabindex', '0');
  quotedRepliesButton.setAttribute('data-focusable', 'true');
  quotedRepliesButton.setAttribute('data-qa', 'quoted-replies-q');
  quotedRepliesButton.setAttribute('data-focusable', 'true');
  quotedRepliesButton.setAttribute('class', buttonClasses);
  quotedRepliesButton.classList.add("ext-quoted-replies-q");
  quotedRepliesButton.style.color = retweetButtonColor;
  quotedRepliesButton.innerHTML = `
    <a href="${quoteTweetsSearchUrl}" target="_blank" rel="noopener noreferrer" style="color: ${retweetButtonColor}">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <text font-size="21" x="50%" y="55%" text-anchor="middle" alignment-baseline="middle" font-weight="bold">Q</text>
      </svg>
    </a>
  `;
  quotedRepliesButton.querySelector('svg').setAttribute('class', svgClasses);

  if (isTweetOpen(quoteTweetsSearchUrl)) {
    quotedRepliesButton.classList.remove('ext-quoted-replies-q');
    quotedRepliesButton.classList.add('ext-quoted-replies-q-active');
  }

  return quotedRepliesButton;
};

let getColorsAndClassesFromRetweetOrReplyButton = (article, retweetButton, unRetweetButton) => {
  let buttonColor;
  let buttonClasses;
  let svgClasses;

  if (retweetButton) {
    let retweetSVG = retweetButton.querySelector('svg');
    svgClasses = retweetSVG.getAttribute('class');
    buttonClasses = retweetButton.getAttribute('class');
    buttonColor = getButtonColorFromExistingSVGs(retweetSVG);
  }

  // unretweet button is green. We want to use a neutral color, so we'll use the comment button color
  if (unRetweetButton) {
    let replyButton = article.querySelector('[data-testid="reply"]')
    let commentSVG = replyButton.querySelector('svg');
    svgClasses = commentSVG.getAttribute('class');
    buttonClasses = replyButton.getAttribute('class');
    buttonColor = getButtonColorFromExistingSVGs(commentSVG);
  }

  return {buttonClasses, svgClasses, buttonColor};
}

// add extension features to tweet article
let addExtensionFeaturesToTweetArticle = (node) => {
  let article = node.querySelector('article');

  if (article) {
    if (shouldAddQuotedRepliesButton(article)) {
      let retweetButton = article.querySelector('[data-testid="retweet"]');
      let unRetweetButton = article.querySelector('[data-testid="unretweet"]');

      if (!retweetButton && !unRetweetButton) {
        return;
      }

      if (unRetweetButton) {
        retweetButton = unRetweetButton;
      }

      let {buttonClasses, svgClasses, buttonColor} = getColorsAndClassesFromRetweetOrReplyButton(article, retweetButton, unRetweetButton);

      if (retweetButton) {
        let quoteTweetsSearchUrl = getQuoteTweetsSearchUrl(article);
        let quotedRepliesButton = createQuotedRepliesButton(buttonClasses, buttonColor, svgClasses, quoteTweetsSearchUrl);
        addQuotedRepliesToDom(retweetButton, quotedRepliesButton);
        addQuotedRepliesButtonHoverTitle(quotedRepliesButton);

        // add class to article so we know we've added the extension features to this tweet
        article.classList.add('qtr-icon-added');
      }
    }
  }
};

// initialize extension
let initQuotedRepliesExtension = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (!node.querySelector) {
            return;
          }
          addExtensionFeaturesToTweetArticle(node);
        });
      }
    });
  });

  // start observing changes to the body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// run extension
initQuotedRepliesExtension();