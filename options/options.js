(function(){
  var checkbox = document.querySelector('#should-save-last-position');

  checkbox.addEventListener('change', toggleSavingOfLastPosition);

  chrome.storage.local.get(['positionOptions'], function(options) {

    if (options.positionOptions) {
      checkbox.checked = options.positionOptions.shouldSaveLastPosition;
    }
  
  });

  function toggleSavingOfLastPosition(e) {

    chrome.storage.local.get(['positionOptions'], function(options) {
      if (!options.positionOptions) {
        options.positionOptions = {};
      }

      options.positionOptions.shouldSaveLastPosition = e.target.checked;


      chrome.storage.local.set({
        ['positionOptions']: options.positionOptions
      });

    });
  }
})();
