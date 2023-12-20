// create the container div, headings, checkboxes, inputs and submit button for the control panel
let createControlPanel = () => {
  let controlPanel = document.createElement('div');
  controlPanel.style.position = 'sticky';
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
                <label for="hasMinLikes">show only Tweets with at least <input type="number"
                        id="likesCount" placeholder="0">
                    likes</label>
            </p>
            <p class="relative hasMinRetweets"><input type="checkbox" id="hasMinRetweets">
                <span class="checkmark"></span>
                <label for="hasMinRetweets">show only Tweets with at least <input type="number"
                        id="retweetsCount" placeholder="0">
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
                <label for="hasPositivePhrase">show only Tweets that contain <br><input type="text" size="32" id="keyword"
                        placeholder="e.g. amapiano"></label>
            </p>
            <p class="relative hasNegativePhrase"><input type="checkbox" id="hasNegativePhrase">
                <span class="checkmark"></span>
                <label for="hasNegativePhrase">hide Tweets that contain <br><input type="text" size="32" id="excludeKeyword"
                        placeholder="e.g. bohemian rhapsody"></label>
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

// add event listeners for checkboxes and inputs.

let addQuotedRepliesControlPanelEventListeners = () => {
  const fakeCheckBoxes = document.querySelectorAll('.checkmark');
  for (var i = 0; i < fakeCheckBoxes.length; i++) {
    // When a checkmark is clicked, the checkbox should be checked or unchecked. Trigger the change event on the real checkbox
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
    // When a negating filter is checked, the other negating filter should be unchecked.
    // Trigger the change event on the other negating filter
    document.getElementById(negatingFilter).addEventListener('change', function () {
      if (this.checked) {
        document.getElementById(negatingFiltersMap[negatingFilter]).checked = false;
        document.getElementById(negatingFiltersMap[negatingFilter]).dispatchEvent(new Event('change'));
      }
    });
  });
}


// add listeners for checkboxes: likes, retweets, positive phrase, negative phrase. When the checkbox is checked,
// and the value is entered, the submit button is enabled. But if the checkbox is checked and the value is not entered,
// the submit button is disabled. The validations are run on change and keyup events to ensure that the submit button
// is enabled or disabled as the user types and changes the checkbox state.
let addEventListenersForLikesRetweetsAndPhrases = () => {
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
      if (!likesCount.value) {
        shouldDisableSubmitButton = true;
      }
    }

    if (retweetsCheckbox.checked) {
      if (!retweetsCount.value) {
        shouldDisableSubmitButton = true;
      }
    }

    if (positivePhraseCheckbox.checked) {
      if (!keyword.value) {
        shouldDisableSubmitButton = true;
      }
    }

    if (negativePhraseCheckbox.checked) {
      if (!excludeKeyword.value) {
        shouldDisableSubmitButton = true;
      }
    }

    if (shouldDisableSubmitButton) {
      submitButton.disabled = true;
    } else {
      submitButton.disabled = false;
    }
  }

  likesCount.addEventListener('change', runValidations);
  likesCount.addEventListener('keyup', runValidations);
  retweetsCount.addEventListener('change', runValidations);
  retweetsCount.addEventListener('keyup', runValidations);
  keyword.addEventListener('keyup', runValidations);
  excludeKeyword.addEventListener('keyup', runValidations);
  likesCheckbox.addEventListener('change', runValidations);
  retweetsCheckbox.addEventListener('change', runValidations);
  positivePhraseCheckbox.addEventListener('change', runValidations);
  negativePhraseCheckbox.addEventListener('change', runValidations);
}

// when the page loads, check or uncheck checkboxes, and fill inputs in the control panel, using information in the url.
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
  }

  if (urlHasNegativePhrase) {
    document.getElementById('hasNegativePhrase').checked = true;
    document.getElementById('hasNegativePhrase').dispatchEvent(new Event('change'));
    document.getElementById('excludeKeyword').value = utiility.getNegativePhrase();
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

// create a search utility from the page url
let createSearchUtilityFromPageUrl = () => {
  setControlsFromUrl();
}

// remove all filters from the url. Always run this function before setting the url from the controls.
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
  utiility.removeNegativeExactPhrase();
  utiility.removeNegativeNonExactPhrase();
  utiility.removeExactPhrase();
  utiility.removeNonExactPhrase();
  utiility.removeMinLikes();
  utiility.removeMinRetweets();

  return utiility;
}

// set the url from the controls. This function is called when the submit button is clicked.
// It removes all filters from the url, then adds the filters from the controls.
let setUrlFromControls = () => {
  let utiility = removeAllFilters();
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
      document.getElementById('submit').disabled = true;
    }
  }

  if (document.getElementById('hasPositiveFilterForComments').checked) {
    utiility.addComments();
  }

  // update the url for the page. This triggers the page to reload with the new url that has the filters applied
  // based on the inputs and checkboxes in the control panel.
  location.href = utiility.url;
}

// add event listener for submit button
// when the submit button is clicked, the url is set from the controls. And the button is disabled and the text is changed
let addSubmitButtonEventListener = () => {
  document.getElementById('submit').addEventListener('click', function () {
    this.value = 'Loading...';
    this.disabled = true;
    setUrlFromControls();
  });
}

// detect scroll direction
let detectScrollDirection = (event) => {
  let scrollDirection = '';
  if (event.deltaY < 0) {
    scrollDirection = 'up';
  } else if (event.deltaY > 0) {
    scrollDirection = 'down';
  }

  return scrollDirection;
}

// add event listener for scroll
let addEventListenerForScroll = () => {
  let scrollDirection = '';
  document.addEventListener('wheel', (event) => {
    scrollDirection = detectScrollDirection(event);
    try {
      if (scrollDirection === 'up') {
        document.querySelector('.ext-quoted-replies-control-panel').parentElement.style.bottom = '-400px';
        document.querySelector('.ext-quoted-replies-control-panel').parentElement.style.top = '0px';
      } else if (scrollDirection === 'down') {
        document.querySelector('.ext-quoted-replies-control-panel').parentElement.style.top = '-720px';
        document.querySelector('.ext-quoted-replies-control-panel').parentElement.style.bottom = '0px';
      }
    } catch (error) {
      // something is wrong with the scroll event listener. Ignore it.
    }
  });
}

// add quoted replies control panel to the sidebar
let addQuotedRepliesControlPanel = () => {
  if (document.querySelector('.ext-quoted-replies-control-panel')) {
    return;
  }

  let sidebarColumn = document.querySelector('[data-testid="sidebarColumn"]');
  let timeout;

  if (!sidebarColumn) {
    timeout = setTimeout(() => {
      addQuotedRepliesControlPanel();
    }, 1000);
  } else {
    let controlPanel = createControlPanel();
    // add control panel to sidebar as the first child

    sidebarColumn.insertBefore(controlPanel, sidebarColumn.firstChild);
    addQuotedRepliesControlPanelEventListeners();
    createSearchUtilityFromPageUrl();
    addSubmitButtonEventListener();
    addEventListenersForLikesRetweetsAndPhrases();
    addEventListenerForScroll();
    // remove timeout
    clearTimeout(timeout);
  }
}