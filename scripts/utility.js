let debug = false;

class TwitterSearchUrlUtility {
  constructor(url) {
    this.url = url;
    this.decodedUrl = decodeURIComponent(url);
    this.urlQuery = new URL(this.decodedUrl).searchParams;
    this.init()
    this.getFilters()
  }

  init() {
    if (debug) console.log(this.urlQuery)
    if (debug) console.log(this.decodedUrl)
  }

  validateFilterType(filterType) {
    if (!filterType) {
      throw "no filter type specified"
    }

    if (!this.urlQuery.get("q")) {
      throw "no query found"
    }
  }

  addExactPhrase(phrase) {
    if (!phrase) {
      throw "no phrase specified"
    }

    if (!this.urlQuery.get("q")) {
      throw "no query found"
    }

    this.removeExactPhrase();
    let query = this.urlQuery.get("q");
    query += ` ("${phrase}")`;
    this.updateQuery(query);
    return this;
  }

  removeExactPhrase() {
    let query = this.urlQuery.get("q");
    if (query.includes(`"`)) {
      query = query.replace(/".*"/g, "").replace(/\(\)/g, "");
    }

    this.updateQuery(query);
    return this;
  }

  addNegativeExactPhrase(phrase) {
    if (!phrase) {
      throw "no phrase specified"
    }

    if (!this.urlQuery.get("q")) {
      throw "no query found"
    }

    this.removeNegativeExactPhrase();
    let query = this.urlQuery.get("q");
    query += ` (-"${phrase}")`;
    this.updateQuery(query);
    return this;
  }

  removeNegativeExactPhrase() {
    let query = this.urlQuery.get("q");
    if (query.includes(`"`)) {
      query = query.replace(/-\s*".*"/g, "").replace(/\(\)/g, "");
    }

    this.updateQuery(query);
    return this;
  }

  addNegativeNonExactPhrase(phrase) {
    if (!phrase) {
      throw "no phrase specified"
    }

    if (!this.urlQuery.get("q")) {
      throw "no query found"
    }

    this.removeNegativeNonExactPhrase();
    let query = this.urlQuery.get("q");
    let phraseParts = phrase.split(" ");
    phraseParts.forEach((part) => {
      // space after all parts except last
      if (phraseParts.indexOf(part) !== phraseParts.length - 1) {
        query += ` (-"${part}")`;
      } else {
        query += ` (-"${part}")`;
      }
    })

    this.updateQuery(query);
    return this;
  }

  removeNegativeNonExactPhrase() {
    let query = this.urlQuery.get("q");
    if (query.includes(`"`)) {
      query = query.replace(/\(-\".*\"\)/g, "").replace(/\(\)/g, "");
    }

    this.updateQuery(query);
    return this;
  }

  addNonExactPhrase(phrase) {
    if (!phrase) {
      throw "no phrase specified"
    }

    if (!this.urlQuery.get("q")) {
      throw "no query found"
    }

    this.removeNonExactPhrase();
    let query = this.urlQuery.get("q");
    let phraseParts = phrase.split(" ");
    phraseParts.forEach((part) => {
      // space after all parts except last
      if (phraseParts.indexOf(part) !== phraseParts.length - 1) {
        query += ` ("${part}")`;
      } else {
        query += ` ("${part}")`;
      }
    })

    if (debug) console.log('final query', query)

    this.updateQuery(query);
    return this;
  }

  removeNonExactPhrase() {
    let query = this.urlQuery.get("q");
    if (query.includes(`"`)) {
      query = query.replace(/\(\".*\"\)/g, "").replace(/\(\)/g, "");
    }

    this.updateQuery(query);
    return this;
  }

  removeMinLikes() {
    let query = this.urlQuery.get("q");
    if (query.includes("(min_faves:")) {
      query = query.replace(/\(min_faves:\d+\)/g, "")
    }

    if (query.includes("min_faves:")) {
      query = query.replace(/min_faves:\d+/g, "")
    }

    this.updateQuery(query);
    return this;
  }

  removeMinRetweets() {
    let query = this.urlQuery.get("q");
    if (query.includes("(min_retweets:")) {
      query = query.replace(/\(min_retweets:\d+\)/g, "")
    }

    if (query.includes("min_retweets:")) {
      query = query.replace(/min_retweets:\d+/g, "")
    }

    this.updateQuery(query);
    return this;
  }

  addComments() {
    if (!this.getTweetId()) {
      throw "no tweet id found"
    }

    if (!this.urlQuery.get("q")) {
      throw "no query found"
    }

    this.removeComments();
    let query = this.urlQuery.get("q");
    query = query.replace(/quoted_tweet_id:(\d+)/g, `quoted_tweet_id:$1 OR conversation_id:$1`);
    this.updateQuery(query);
    console.log('added commentsssssss!!!!')
    return this;
  }

  removeComments() {
    let query = this.urlQuery.get("q");
    if (query.includes("conversation_id:")) {
      query = query.replace(/\sOR conversation_id:\d+/g, "");
      console.log('replaced out conversation_id',query)
      console.log('query',query)
    }

    this.updateQuery(query);
    return this;
  }

  addMinRetweets(minRetweets) {
    if (!minRetweets) {
      throw "no min retweets specified"
    }

    if (!this.urlQuery.get("q")) {
      throw "no query found"
    }

    this.removeMinRetweets();
    let query = this.urlQuery.get("q");
    query += ` (min_retweets:${minRetweets})`;
    this.updateQuery(query);
    return this;
  }

  addMinLikes(minLikes) {
    if (!minLikes) {
      throw "no min likes specified"
    }

    if (!this.urlQuery.get("q")) {
      throw "no query found"
    }

    this.removeMinLikes();
    let query = this.urlQuery.get("q");
    query += ` (min_faves:${minLikes})`;
    this.updateQuery(query);
    return this;
  }

  // add positive filter
  addPositiveFilter(filterType) {
    if (debug) console.log(`add positive filter for ${filterType} in`, this.decodedUrl)
    this.validateFilterType(filterType);
    this.removeNegativeFilter(filterType);
    this.removePositiveFilter(filterType);
    let query = this.urlQuery.get("q");
    query += ` (filter:${filterType})`;
    this.updateQuery(query);
    if (debug) console.log(`done add positive filter for ${filterType} in`, this.decodedUrl)
    return this;
  }

  // remove positive filter
  removePositiveFilter(filterType) {
    this.validateFilterType(filterType);
    let query = this.urlQuery.get("q");
    if (debug) console.log(`remove positive filter for ${filterType} in`, this.decodedUrl)
    if (query.includes(`(filter:${filterType})`)) {
      query = query.replace(`(filter:${filterType})`, "")
    }

    if (query.includes(`filter:${filterType}`)) {
      query = query.replace(`filter:${filterType}`, "")
    }

    this.updateQuery(query);
    if (debug) console.log(`done remove positive filter for ${filterType} in`, this.decodedUrl)
    return this;
  }

  // add negative filter
  addNegativeFilter(filterType) {
    if (debug) console.log(`add negative filter for ${filterType} in`, this.decodedUrl)
    this.validateFilterType(filterType);
    this.removeNegativeFilter(filterType);
    this.removePositiveFilter(filterType);
    let query = this.urlQuery.get("q");
    query += ` (-filter:${filterType})`;

    this.updateQuery(query);
    if (debug) console.log(`done add negative filter for ${filterType} in`, this.decodedUrl)
    return this;
  }

  // remove negative filter
  removeNegativeFilter(filterType) {
    if (debug) console.log(`remove negative filter for ${filterType} in`, this.decodedUrl)
    this.validateFilterType(filterType);
    let query = this.urlQuery.get("q");
    if (debug) console.log('negative filter query',query)
    if (query.includes(`(-filter:${filterType})`)) {
      query = query.replace(`(-filter:${filterType})`, "")
    }

    if (debug) console.log('new negative filter query',query)

    if (query.includes(`-filter:${filterType}`)) {
      query = query.replace(`-filter:${filterType}`, "")
    }
    
    this.updateQuery(query);
    if (debug) console.log(`done remove negative filter for ${filterType} in`, this.decodedUrl)
    return this;
  }

  updateQuery(query) {
    const url = new URL(this.decodedUrl);
    if (debug) console.log('query', query)
    url.searchParams.set("q", query);

    if (debug) console.log('new search params',url.searchParams)
    this.url = url.toString().replace(/%28/g, "(").replace(/%29/g, ")").replace(/\+/g, '%20').replace(/%22/g, '"').replace(/(%20){2,}/g, ' ').replace(/\s{2,}/g, ' ')
    this.decodedUrl = decodeURIComponent(this.url);
    this.urlQuery = new URL(this.decodedUrl).searchParams;
    if (debug) console.log('new url', this.url)
  }

  isSearchUrl() {
    return this.url.includes("twitter.com/search");
  }

  isLatest() {
    return this.url.includes("f=live");
  }

  getTweetId() {
    if (!this.isQuotedTweet()) {
      return null;
    }

    const url = new URL(this.decodedUrl);
    const params = new URLSearchParams(url.search);
    return params.get("q").match(/quoted_tweet_id:(\d+)/)?.[1];
  }

  isQuotedTweet() {
    return this.url.includes("quoted_tweet_id");
  }

  hasMinLikes() {
    return !!this.getMinLikes();
  }

  hasMinRetweets() {
    return !!this.getMinRetweets();
  }

  hasPositiveFilterForComments() {
    return this.url.includes("conversation_id");
  }

  isTop() {
    return !this.isLatest();
  }

  hasNegativeFilterForReplies() {
    return this.decodedUrl.includes("-filter:replies");
  }

  hasPositiveFilterForReplies() {
    return this.decodedUrl.includes("filter:replies") && !this.decodedUrl.includes("-filter:replies");
  }

  hasNegativeFilterForMedia() {
    return this.decodedUrl.includes("-filter:media");
  }

  hasPositiveFilterForMedia() {
    return this.decodedUrl.includes("filter:media") && !this.decodedUrl.includes("-filter:media");
  }

  hasNegativeFilterForVideos() {
    return this.decodedUrl.includes("-filter:videos");
  }

  hasPositiveFilterForVideos() {
    return this.decodedUrl.includes("filter:videos") && !this.decodedUrl.includes("-filter:videos");
  }

  hasNegativeFilterForImages() {
    return this.decodedUrl.includes("-filter:images");
  }

  hasPositiveFilterForImages() {
    return this.decodedUrl.includes("filter:images") && !this.decodedUrl.includes("-filter:images");
  }

  hasNegativeFilterForFollows() {
    return this.decodedUrl.includes("-filter:follows");
  }

  hasPositiveFilterForFollows() {
    return this.decodedUrl.includes("filter:follows") && !this.decodedUrl.includes("-filter:follows");
  }

  hasFilter() {
    return this.decodedUrl.includes("filter:");
  }

  getFilters() {
    let filters = [];
    if (this.hasFilter()) {
      filters = this.decodedUrl.match(/filter:(\w+)/g).map((filter) => {
        return filter.replace("filter:", "");
      });
    }

    return filters;
  }

  getMinLikes() {
    let likes = null;
    return !isNaN(likes = parseInt(this.decodedUrl.match(/min_faves:(\d+)/)?.[1])) ? likes : null;
  }

  getMinRetweets() {
    let retweets = null;
    return !isNaN(retweets = parseInt(this.decodedUrl.match(/min_retweets:(\d+)/)?.[1])) ? retweets : null;
  }

  getPositiveExactPhrase() {
    return this.decodedUrl.match(/\(\"\D+\"\)/)?.[0].replace(/\"/g, "").replace(/[\(\)]/g, "")
    // make sure it doesn't have a negative phrase
      .replace(this.getNegativeExactPhrase(), "").replace(/-/g, "") || null;
  }

  getNegativeExactPhrase() {
    return this.decodedUrl.match(/\(-\"\D+\"\)/)?.[0].replace(/\"/g, "").replace(/[\(\)]/g, "").replace(/-/g, "") || null;
  }

  getPositiveNonExactPhrase() {
    return this.decodedUrl.match(/\(\".*\"\)/)?.[0].replace(/\"/g, "").replace(/[\(\)]/g, "")
      .replace(this.getNegativeNonExactPhrase(), "").replace(/-/g, "") || null;
  }

  getNegativeNonExactPhrase() {
    return this.decodedUrl.match(/\(-\".*\"\)/)?.[0].replace(/\"/g, "").replace(/[\(\)]/g, "").replace(/-/g, "") || null;
  }

  hasPhrase() {
    return !!(this.hasPositivePhrase() || this.hasNegativePhrase());
  }

  hasPositivePhrase() {
    return !!(this.getPositiveExactPhrase() || this.getPositiveNonExactPhrase() && !this.hasNegativePhrase());
  }

  hasNegativePhrase() {
    return !!(this.getNegativeExactPhrase() || this.getNegativeNonExactPhrase());
  }

  hasExactNegativePhrase() {
    return !!(this.getNegativeExactPhrase());
  }

  hasNonExactNegativePhrase() {
    return !!(this.getNegativeNonExactPhrase());
  }

  hasExactPositivePhrase() {
    return !!(this.getPositiveExactPhrase());
  }

  hasNonExactPositivePhrase() {
    return !!(this.getPositiveNonExactPhrase());
  }

  getPositivePhrase() {
    return this.getPositiveExactPhrase() || this.getPositiveNonExactPhrase();
  }

  getNegativePhrase() {
    return this.getNegativeExactPhrase() || this.getNegativeNonExactPhrase();
  }
}
