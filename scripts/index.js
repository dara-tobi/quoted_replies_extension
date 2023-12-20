// import utiility script





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
  retweetButton.parentNode.parentNode.insertBefore(quotedRepliesButton, retweetButton.parentNode.nextSibling);
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

    titleParent.style.top = `${quotedRepliesButtonPosition.top + 28}px`;
    titleParent.style.left = `${quotedRepliesButtonPosition.left - 32}px`;
    titleParent.id = 'ext-quoted-replies-q-title';
    if (isTweetOpen(quotedRepliesButton.querySelector('a').href)) {
      titleParent.style.top = `${quotedRepliesButtonPosition.top + 43}px`;
      titleParent.style.left = `${quotedRepliesButtonPosition.left - 30}px`;
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

// get username from article
let getUsername = (article) => {
  return article.querySelector('[data-testid="User-Name"]').querySelector('a').href.split('/').pop();
};

// get all hrefs from article
let getHrefs = (article) => {
  return Array.from(article.querySelectorAll('a[href*=status]')).map((el) => el.href);
};

// filter out hrefs that aren't status hrefs.
// Status hrefs are hrefs that contain the username and status id.
// Examples: https://twitter.com/username/status/123456789, https://twitter.com/username/status/123456789/analytics, https://twitter.com/username/status/123456789/likes
let getStatusHrefs = (hrefs, username) => {
  return hrefs?.filter((href) => href.match(`https:\/\/twitter.com\/${username}\/status\/[0-9]+`));
};

// get status id from href by using regex and capturing the status id
let getStatusIdFromHrefs = (statusHrefs) => {
  return statusHrefs
    .shift() // first status href
    .match(/https:\/\/twitter.com\/[a-zA-Z0-9_]+\/status\/([0-9]+)/) // regex to get and capture status id
    .pop(); // captured status id
};

// get status id for tweet
let getStatusId = (article) => {
  let username = getUsername(article);
  let hrefs = getHrefs(article);
  let statusHrefs = getStatusHrefs(hrefs, username);
  let statusId = getStatusIdFromHrefs(statusHrefs);

  return statusId;
};

// get url to use for searching for quote tweets
let getQuoteTweetsSearchUrl = (article) => {
  let statusId = getStatusId(article);
  return `https://twitter.com/search?q=(quoted_tweet_id%3A${statusId})&f=live`;
};

let isTweetOpen = (quoteTweetsSearchUrl) => {
  return quoteTweetsSearchUrl.includes(location.href.split('/').pop());
}

let resetAriaLabels = (quotedRepliesButton) => {
  quotedRepliesButton.setAttribute('aria-label', 'See Quote Tweets');

  let retweetWithCommentLabel = quotedRepliesButton.querySelector('[aria-label="Retweet"]');
  if (retweetWithCommentLabel) {
    retweetWithCommentLabel.removeAttribute('aria-label');
  }

  let ariaHasPopupMenu = quotedRepliesButton.querySelector('[aria-haspopup="menu"]');
  if (ariaHasPopupMenu) {
    ariaHasPopupMenu.removeAttribute('aria-haspopup');
  }

  let retweetTestId = quotedRepliesButton.querySelector('[data-testid="retweet"]');
  if (retweetTestId) {
    retweetTestId.removeAttribute('data-testid');
  }
};

// create quoted replies button
let createQuotedRepliesButton = (article, buttonClasses, retweetButtonColor, svgClasses, quoteTweetsSearchUrl, retweetButton) => {
  // clone retweet button
  let quotedRepliesButton = retweetButton.cloneNode(true);

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
  let formerSVG = quotedRepliesButton.querySelector('svg');
  let svgParent = formerSVG.parentNode;
  svgParent.removeChild(formerSVG);
  let newSVGLink = document.createElement('div');
  newSVGLink.innerHTML = `
    <a class="ext-quoted-replies-link" href="${quoteTweetsSearchUrl}" style="display:block; color: ${retweetButtonColor}">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <text font-size="21" x="50%" y="55%" text-anchor="middle" alignment-baseline="middle" font-weight="bold">Q</text>
      </svg>
    </a>
  `;
  svgParent.appendChild(newSVGLink);

  quotedRepliesButton.querySelector('svg').setAttribute('class', svgClasses);
  let textTransitionContainer = quotedRepliesButton.querySelector('[data-testid="app-text-transition-container"]');
  if (textTransitionContainer) {
    textTransitionContainer.parentNode.remove();
  }
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
    buttonClasses = retweetButton.parentNode.getAttribute('class');
    buttonColor = getButtonColorFromExistingSVGs(retweetSVG);
  }

  // unretweet button is green. We want to use a neutral color, so we'll use the comment button color
  if (unRetweetButton) {
    let replyButton = article.querySelector('[data-testid="reply"]')
    let commentSVG = replyButton.querySelector('svg');
    svgClasses = commentSVG.getAttribute('class');
    buttonClasses = replyButton.parentNode.getAttribute('class');
    buttonColor = getButtonColorFromExistingSVGs(commentSVG);
  }

  return { buttonClasses, svgClasses, buttonColor };
}

addClassToQuotedRepliesButtonBg = (quotedRepliesButton) => {
  // find the div that has an empty innerHtml
  let emptyDiv = Array.from(quotedRepliesButton.querySelectorAll('div')).find((div) => div.innerHTML === '');
  emptyDiv.classList.add('ext-quoted-replies-q-svg-container-bg');
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

      let { buttonClasses, svgClasses, buttonColor } = getColorsAndClassesFromRetweetOrReplyButton(article, retweetButton, unRetweetButton);

      if (retweetButton) {
        let quoteTweetsSearchUrl = getQuoteTweetsSearchUrl(article);
        let quotedRepliesButton = createQuotedRepliesButton(article, buttonClasses, buttonColor, svgClasses, quoteTweetsSearchUrl, retweetButton);

        resetAriaLabels(quotedRepliesButton);
        addClassToQuotedRepliesButtonBg(quotedRepliesButton);
        addQuotedRepliesToDom(retweetButton, quotedRepliesButton);
        addQuotedRepliesButtonHoverTitle(quotedRepliesButton);

        // add class to article so we know we've added the extension features to this tweet
        article.classList.add('qtr-icon-added');
      }
    }
  }
};

let toggleGreenUnderline = (event) => {
  let checkbox = event.target;
  if (checkbox.checked) {
    checkbox.closest('p').style.borderBottom = '1px solid mediumaquamarine';
  } else {
    checkbox.closest('p').style.borderBottom = '1px solid transparent';
  }
}

// add listeners for checkboxex: likes, retweets, positive phrase, negative phrase. So that when the checkbox is checked,
// and the value is entered, the submit button is enabled. But if the checkbox is unchecked, the submit button is disabled
let addEventListenersForLikesRetweetsAndPhrases = () => {
  // run validations for inputs: likes, retweets, positive phrase, negative phrase, when the user types in the input or checks the checkbox
  let likesCount = document.getElementById('likesCount');
  let retweetsCount = document.getElementById('retweetsCount');
  let keyword = document.getElementById('keyword');
  let excludeKeyword = document.getElementById('excludeKeyword');

  let likesCheckbox = document.getElementById('hasMinLikes');
  let retweetsCheckbox = document.getElementById('hasMinRetweets');
  let positivePhraseCheckbox = document.getElementById('hasPositivePhrase');
  let negativePhraseCheckbox = document.getElementById('hasNegativePhrase');

  let submitButton = document.getElementById('submit');
  
  let runValidations = () => {
    let shouldDisableSubmitButton = false;
    if (likesCheckbox.checked) {
      if (likesCount.value) {
        console.log('likes count value', likesCount.value);

        // submitButton.disabled = false;
      } else {
        // disable submit button
        console.log('disable submit button for likes count');
        shouldDisableSubmitButton = true;
      }
    }

    if (retweetsCheckbox.checked) {
      if (retweetsCount.value) {
        // submitButton.disabled = false;
      } else {
        console.log('disable submit button for retweets count');
        shouldDisableSubmitButton = true;
      }
    }

    if (positivePhraseCheckbox.checked) {
      if (keyword.value) {
        // submitButton.disabled = false;
      } else {
        console.log('disable submit button for positive phrase');
        shouldDisableSubmitButton = true;
      }
    }

    if (negativePhraseCheckbox.checked) {
      if (excludeKeyword.value) {
        console.log('enable submit button for negative phrase');
        // submitButton.disabled = false;
      } else {
        console.log('disable submit button for negative phrase');
        shouldDisableSubmitButton = true;
      }
    }

    if (shouldDisableSubmitButton) {
      submitButton.disabled = true;
    } else {
      console.log('enable submit button');
      submitButton.disabled = false;
    }
    console.log('run validations');
  }

  likesCount.addEventListener('change', runValidations);
  retweetsCount.addEventListener('change', runValidations);
  keyword.addEventListener('keyup', runValidations);
  excludeKeyword.addEventListener('keyup', runValidations);
  likesCheckbox.addEventListener('change', runValidations);
  retweetsCheckbox.addEventListener('change', runValidations);
  positivePhraseCheckbox.addEventListener('change', runValidations);
  negativePhraseCheckbox.addEventListener('change', runValidations);
}



let addQuotedRepliesControlPanelEventListeners = () => {
  const fakeCheckBoxes = document.querySelectorAll('.checkmark');
  for (var i = 0; i < fakeCheckBoxes.length; i++) {
    fakeCheckBoxes[i].addEventListener('click', function () {
      if (this.parentNode.querySelector('input[type=checkbox]').checked) {
        // trigger change event on  checkbox
        this.parentNode.querySelector('input[type=checkbox]').checked = false;
        this.parentNode.querySelector('input[type=checkbox]').dispatchEvent(new Event('change'));
      } else {
        this.parentNode.querySelector('input[type=checkbox]').checked = true;
        // ensure that the eventlistener on the checkbox is triggered
        this.parentNode.querySelector('input[type=checkbox]').dispatchEvent(new Event('change'));
      }
    });
  }

  var checkboxes = document.querySelectorAll('input[type=checkbox]');
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener('change', toggleGreenUnderline);
  }

  var negatingFiltersMap = {
    'hasNegativeFilterForImages': 'hasPositiveFilterForImages',
    'hasNegativeFilterForVideos': 'hasPositiveFilterForVideos',
    'hasNegativeFilterForFollows': 'hasPositiveFilterForFollows',
    'hasPositiveFilterForImages': 'hasNegativeFilterForImages',
    'hasPositiveFilterForVideos': 'hasNegativeFilterForVideos',
    'hasPositiveFilterForFollows': 'hasNegativeFilterForFollows',
  };

  var negatingFilters = Object.keys(negatingFiltersMap);
  negatingFilters.forEach(function (negatingFilter) {
    document.getElementById(negatingFilter).addEventListener('change', function () {
      if (this.checked) {
        // green outline
        // this.closest('p').style.outline = '1px solid mediumaquamarine';
        // uncheck the negating filter
        document.getElementById(negatingFiltersMap[negatingFilter]).checked = false;
        document.getElementById(negatingFiltersMap[negatingFilter]).dispatchEvent(new Event('change'));
      } else {
        // this.closest('p').style.outline = 'none';
      }
    });
  });
}

let setControlsFromUrl = () => {
  let url = location.href;
  let utiility = new TwitterSearchUrlUtility(url);
  let urlHasPositiveFilterForImages = utiility.hasPositiveFilterForImages();
  let urlHasNegativeFilterForImages = utiility.hasNegativeFilterForImages();
  let urlHasPositiveFilterForVideos = utiility.hasPositiveFilterForVideos();
  let urlHasNegativeFilterForVideos = utiility.hasNegativeFilterForVideos();
  let urlHasPositiveFilterForFollows = utiility.hasPositiveFilterForFollows();
  let urlHasNegativeFilterForFollows = utiility.hasNegativeFilterForFollows();
  let urlHasPositivePhrase = utiility.hasPositivePhrase();
  let urlHasNegativePhrase = utiility.hasNegativePhrase();
  let urlHasMinLikes = utiility.hasMinLikes();
  let urlHasMinRetweets = utiility.hasMinRetweets();
  let minRetweets = utiility.getMinRetweets();
  let minLikes = utiility.getMinLikes();
  let urlhasPositiveFilterForComments = utiility.hasPositiveFilterForComments();

  if (urlHasPositiveFilterForImages) {
    document.getElementById('hasPositiveFilterForImages').checked = true;
    document.getElementById('hasPositiveFilterForImages').dispatchEvent(new Event('change'));
  }

  if (urlHasNegativeFilterForImages) {
    document.getElementById('hasNegativeFilterForImages').checked = true;
    document.getElementById('hasNegativeFilterForImages').dispatchEvent(new Event('change'));
  }

  if (urlHasPositiveFilterForVideos) {
    document.getElementById('hasPositiveFilterForVideos').checked = true;
    document.getElementById('hasPositiveFilterForVideos').dispatchEvent(new Event('change'));
  }

  if (urlHasNegativeFilterForVideos) {
    document.getElementById('hasNegativeFilterForVideos').checked = true;
    document.getElementById('hasNegativeFilterForVideos').dispatchEvent(new Event('change'));
  }

  if (urlHasPositiveFilterForFollows) {
    document.getElementById('hasPositiveFilterForFollows').checked = true;
    document.getElementById('hasPositiveFilterForFollows').dispatchEvent(new Event('change'));
  }

  if (urlHasNegativeFilterForFollows) {
    document.getElementById('hasNegativeFilterForFollows').checked = true;
    document.getElementById('hasNegativeFilterForFollows').dispatchEvent(new Event('change'));
  }

  if (urlHasPositivePhrase) {
    document.getElementById('hasPositivePhrase').checked = true;
    document.getElementById('hasPositivePhrase').dispatchEvent(new Event('change'));
    document.getElementById('keyword').value = utiility.getPositivePhrase();
    console.log('positive phrase is:', utiility.getPositivePhrase())
  }

  if (urlHasNegativePhrase) {
    document.getElementById('hasNegativePhrase').checked = true;
    document.getElementById('hasNegativePhrase').dispatchEvent(new Event('change'));
    document.getElementById('excludeKeyword').value = utiility.getNegativePhrase();
    console.log('negative phrase is:', utiility.getNegativePhrase())
  }

  if (urlHasMinLikes) {
    document.getElementById('hasMinLikes').checked = true;
    document.getElementById('hasMinLikes').dispatchEvent(new Event('change'));
    document.getElementById('likesCount').value = minLikes;
  }

  if (urlHasMinRetweets) {
    document.getElementById('hasMinRetweets').checked = true;
    document.getElementById('hasMinRetweets').dispatchEvent(new Event('change'));
    document.getElementById('retweetsCount').value = minRetweets;
  }

  if (urlhasPositiveFilterForComments) {
    document.getElementById('hasPositiveFilterForComments').checked = true;
    document.getElementById('hasPositiveFilterForComments').dispatchEvent(new Event('change'));
  }
}

let createSearchUtilityFromPageUrl = () => {
  setControlsFromUrl();
}

let removeAllFilters = () => {
  let url = location.href;
  let utiility = new TwitterSearchUrlUtility(url);
  utiility.removeComments();
  utiility.removeNegativeFilter('images');
  utiility.removeNegativeFilter('videos');
  utiility.removeNegativeFilter('follows');
  utiility.removePositiveFilter('follows');
  utiility.removePositiveFilter('videos');
  utiility.removePositiveFilter('images');
  // utiility.removeExactPhrase();
  // utiility.removeNonExactPhrase();
  // utiility.removeNegativeExactPhrase();
  // utiility.removeNegativeNonExactPhrase();
  utiility.removeMinLikes();
  utiility.removeMinRetweets();

  return utiility;

}

let setUrlFromControls = () => {
  let utiility = removeAllFilters();
  console.log('url', utiility.url, utiility.decodeUrl);
  if (document.getElementById('hasPositiveFilterForImages').checked) {
    utiility.addPositiveFilter('images');
  }

  if (document.getElementById('hasNegativeFilterForImages').checked) {
    utiility.addNegativeFilter('images');
  }

  if (document.getElementById('hasPositiveFilterForVideos').checked) {
    utiility.addPositiveFilter('videos')
  }

  if (document.getElementById('hasNegativeFilterForVideos').checked) {
    utiility.addNegativeFilter('videos');
  }

  if (document.getElementById('hasPositiveFilterForFollows').checked) {
    utiility.addPositiveFilter('follows')
  }

  if (document.getElementById('hasNegativeFilterForFollows').checked) {
    utiility.addNegativeFilter('follows');
  }

  if (document.getElementById('hasPositivePhrase').checked) {
    try {
      utiility.addNonExactPhrase(document.getElementById('keyword').value);
    } catch (error) {
      // disable submit button
      document.getElementById('submit').disabled = true;
    }

  }

  if (document.getElementById('hasNegativePhrase').checked) {
    try {
      utiility.addNegativeNonExactPhrase(document.getElementById('excludeKeyword').value);
    } catch (error) {
      document.getElementById('submit').disabled = true;
    }
  }

  if (document.getElementById('hasMinLikes').checked) {
    try {
      utiility.addMinLikes(document.getElementById('likesCount').value);
    } catch (error) {
      // disable submit button
      document.getElementById('submit').disabled = true;
    }

  }

  if (document.getElementById('hasMinRetweets').checked) {
    try {
      utiility.addMinRetweets(document.getElementById('retweetsCount').value);
    } catch (error) {
      // disable submit button
      document.getElementById('submit').disabled = true;
    }
  }

  if (document.getElementById('hasPositiveFilterForComments').checked) {
    utiility.addComments();
  }
  console.log('new url', utiility.url, utiility.decodeUrl);
  location.href = utiility.url;
}

let addSubmitButtonEventListener = () => {
  document.getElementById('submit').addEventListener('click', function () {
    // start loading animation on button
    this.value = 'Loading...';
    this.disabled = true;
    // animate loading
    let loadingAnimation = document.createElement('div');
    loadingAnimation.classList.add('ext-quoted-replies-loading-animation');
    this.parentNode.appendChild(loadingAnimation);
    // animate loading
    setTimeout(() => {
      loadingAnimation.classList.add('ext-quoted-replies-loading-animation-active');
    }, 100);

    setUrlFromControls();
  });
}



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

  if (location.href.includes('search?q=(quoted_tweet_id')) {
    console.log('add control panel');
    addQuotedRepliesControlPanel();

  } else {
    console.log('no way to add control panel');
  }
};

let createControlPanel = () => {
  let controlPanel = document.createElement('div');
  controlPanel.style.position = 'sticky';
  controlPanel.style.top = '-720px';
  controlPanel.innerHTML = `
    <div class="ext-quoted-replies-control-panel" style=" width: 100%; border-radius: 16px;">
      <div class="ext-quoted-replies-control-panel-header">
        <h3 class="ext-quoted-replies-control-panel-header-title">Quote Controls</h3>
      </div>
      <div class="ext-quoted-replies-control-panel-body">
        <div id="quoted-replies-controls">


          <h4>CONVERSATION</h4>
          <p class="relative hasPositiveFilterForComments"><input type="checkbox" id="hasPositiveFilterForComments">
              <span class="checkmark"></span>
              <label for="hasPositiveFilterForComments">include direct replies</label>
          </p>
      

          <h4>MEDIA</h4>
          <p class="relative hasPositiveFilterForImages"><input type="checkbox" id="hasPositiveFilterForImages">
              <span class="checkmark"></span>
              <label for="hasPositiveFilterForImages">show only Tweets with images</label>
          </p>
      
          <p class="relative hasNegativeFilterForImages"><input type="checkbox" id="hasNegativeFilterForImages">
              <span class="checkmark"></span>
              <label for="hasNegativeFilterForImages">hide Tweets with images</label>
          </p>
      
          <p style="border-top: 1px solid #eee; margin: 0 10px;"></p>
      
      
          <p class="relative hasPositiveFilterForVideos"><input type="checkbox" id="hasPositiveFilterForVideos">
              <span class="checkmark"></span>
              <label for="hasPositiveFilterForVideos">show only Tweets with videos</label>
          </p>
      
          <p class="relative hasNegativeFilterForVideos"><input type="checkbox" id="hasNegativeFilterForVideos">
              <span class="checkmark"></span>
              <label for="hasNegativeFilterForVideos">hide Tweets with videos</label>
          </p>
      

          <h4>POPULAR TWEETS</h4>
          <p class="relative hasMinLikes"><input type="checkbox" id="hasMinLikes">
              <span class="checkmark"></span>
              <label for="hasMinLikes">show only Tweets with at least <input type="number" style="width: 50px;"
                      id="likesCount" placeholder="">
                  likes</label>
          </p>
          <p class="relative hasMinRetweets"><input type="checkbox" id="hasMinRetweets">
              <span class="checkmark"></span>
              <label for="hasMinRetweets">show only Tweets with at least <input type="number" style="width: 50px;"
                      id="retweetsCount" placeholder="">
                  retweets</label>
          </p>
      

          <h4>FAMILIAR PEOPLE</h4>
          <p class="relative hasPositiveFilterForFollows"><input type="checkbox" id="hasPositiveFilterForFollows">
              <span class="checkmark"></span>
              <label for="hasPositiveFilterForFollows">show only Tweets from people I follow</label>
          </p>
          <p class="relative hasNegativeFilterForFollows"><input type="checkbox" id="hasNegativeFilterForFollows">
              <span class="checkmark"></span>
              <label for="hasNegativeFilterForFollows">hide Tweets from people I follow</label>
          </p>
      


          <h4>KEYWORDS</h4>
          <p class="relative hasPositivePhrase"><input type="checkbox" id="hasPositivePhrase">
              <span class="checkmark"></span>
              <label for="hasPositivePhrase">show only Tweets that contain <br><input type="text" id="keyword"
                      placeholder=""></label>
          </p>
          <p class="relative hasNegativePhrase"><input type="checkbox" id="hasNegativePhrase">
              <span class="checkmark"></span>
              <label for="hasNegativePhrase">hide Tweets that contain <br><input type="text" id="excludeKeyword"
                      placeholder=""></label>
          </p>
      
          <input type="button" id="submit" value="Apply Filters" class="apply-filters-quoted-replies-panel-button">
        </div>
      </div>
      <div class="ext-quoted-replies-control-panel-footer">
      </div>
    </div>
  `;
  return controlPanel;
}

// let addEventListenersForLikesRetweetsAndPhrases = () => {
//   // when user types in likes count, enable submit button

// }

let addQuotedRepliesControlPanel = () => {
  if (document.querySelector('.ext-quoted-replies-control-panel')) {
    return;
  }
  // data-testid="sidebarColumn"
  let sidebarColumn = document.querySelector('[data-testid="sidebarColumn"]');
  let timeout;

  if (!sidebarColumn) {
    console.log('no sidebar column, will try again in 1 second');
    timeout = setTimeout(() => {
      addQuotedRepliesControlPanel();
    }, 1000);
  } else {
    console.log('found sidebar column');
    let controlPanel = createControlPanel();
    // add control panel to sidebar as the first child

    sidebarColumn.insertBefore(controlPanel, sidebarColumn.firstChild);
    addQuotedRepliesControlPanelEventListeners();
    createSearchUtilityFromPageUrl();
    addSubmitButtonEventListener();
    addEventListenersForLikesRetweetsAndPhrases();
    // remove timeout 
    clearTimeout(timeout);
  }




}

// run extension
initQuotedRepliesExtension();