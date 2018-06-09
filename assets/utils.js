// =======================================================
//  Overview
//  -----------------------------------------------------
//  Utility functions for processing post data
//  and other tasks
//  -----------------------------------------------------
//  @author: Matthew Salcido
//  @github: https://www.github.com/salcido
//  @source: https://github.com/salcido/awwbot
//  @bot-url: https://www.twitter.com/awwtomatic
// =======================================================
const utils = {
  /**
   * Alphabetizes posts
   * @param {object} postA A subreddit post
   * @param {object} postB A subreddit post
   * @returns {number}
   */
  alphabetize: function(postA, postB) {

    let a = postA.data.subreddit.toLowerCase(),
        b = postB.data.subreddit.toLowerCase();

    return a > b ? 1 : (a < b ? -1 : 0);
  },
  /**
   * Converts imgur links to actual image url if needed.
   * @param {array.<object>} posts Posts from r/aww
   * @returns {array}
   */
  generateImgurUrl: function(posts) {

    return posts.map(p => {

      let id = p.data.url.split('/')[3],
          url = p.data.url;

      p.data.url = url.includes('.jpg') ?
        p.data.url :
        `https://i.imgur.com/${id}.jpg`;

      return p;
    });
  },
  /**
   * Creates a shortlink to use in the tweet
   * @param {array.<object>} posts Posts from a subreddit
   * @returns {array}
   */
  generateShortLinks: function(posts) {
    return posts.map(p => {
      let shorty = p.data.permalink.split('/')[4];
      p.data.shorty = `https://redd.it/${shorty}`;
      return p;
    });
  },
  /**
   * Generates a url that points to the .mp4 version
   * of a .gifv file on imgur
   * @param {object} post A post object
   * @returns {object}
   */
  generateVideoUrl: function(post) {

    let extension = /.gifv$/g,
        url = post.data.url;

    if (extension.test(url)) {
      post.data.url = url.slice(0, url.length - 5) + '.mp4';
    }

    return post;
  },
  /**
   * Determins if a post is a text-only post
   * @param {object} post A post from a subreddit
   * @returns {boolean}
   */
  isTextSub: function(post, textSubs) {
    return textSubs.some(s => {
      return post.data.subreddit.toLowerCase().indexOf(s) > -1;
    });
  },
  /**
   * Decorates the post object with a `meta` property
   * which is used to determine which method to use
   * when tweeting
   * @param {array.<object>} posts Subreddit posts
   * @param {string} type The type of media in the post
   * @returns {array}
   */
  meta: function(posts, type) {
    posts.forEach(p => p.data.meta = type);
    return posts;
  },
  /**
   * Returns the number of ms between tweets
   * @param {number} mins Number of minutes between tweets
   */
  minutes: function(mins) {
    return (60 * 1000) * mins;
  },
  /**
   * Converts common HTML entities into strings
   * @param {string} title The title from the post
   * @returns {string}
   */
  sanitizeTitle: function(title) {
    return title = title.replace(/&amp;/g, '&')
                        .replace(/&gt;/g, '>')
                        .replace(/&lt;/g, '<')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, '\'')
                        .replace(/“/g, '"')
                        .replace(/”/g, '"')
                        .replace(/‘/g, '\'')
                        .replace(/’/g, '\'')
                        .replace(/&mdash;/g, '-')
                        .replace(/&ndash;/g, '-')
                        .replace(/&hellip;/g, '...');
  },
  /**
   * Returns the local time
   * @param {number} offset The UTC time offset
   * @param {number} nextTweet Time until the next tweet
   * @returns {string}
   */
  timestamp: function(offset, nextTweet = 0) {

    let d = new Date();

    d.setMinutes(d.getMinutes() + (nextTweet / 60000));

    let utc = d.getTime() + (d.getTimezoneOffset() * 60000),
      nd = new Date(utc + (3600000 * offset));

    return nd.toLocaleString();
  }
};

exports.utils = utils;
