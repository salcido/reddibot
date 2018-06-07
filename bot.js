// =======================================================
//  Overview
//  -----------------------------------------------------
//  Awwbot mirrors top image-based posts from various
//  animal/nature subreddits and tweets them.
//  -----------------------------------------------------
//  @author: Matthew Salcido
//  @github: https://www.github.com/salcido
//  @source: https://github.com/salcido/awwbot
//  @bot-url: https://www.twitter.com/awwtomatic
// =======================================================

// NOTE: posts from r/aww are dominating the bot's posts
// TODO: fetch r/aww separately and append to queue
// or work through subs array sequentially for each post?

// ========================================================
// Module Dependencies
// ========================================================
require('dotenv').config();
const fetch = require('node-fetch');
const sharp = require('sharp');
const Twit = require('twit');

// ========================================================
// Assets
// ========================================================
const { colors } = require('./assets/colors');
const { logo } = require('./assets/logo');

// ========================================================
// Auth values
// ========================================================
const secret = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

// ========================================================
// Global vars
// ========================================================
const Twitter = new Twit(secret);
// Time between posts and updates
// https://en.wikipedia.org/wiki/Pomodoro_Technique
const interval = (60 * 1000) * 25;
// Number of posts to return from each subreddit
const limit = 100;
// Bot's twitter handle for timeline data
const screenName = 'awwtomatic';
// Subs to pull posts from
const subs = ['aww', 'awwducational', 'rarepuppers', 'eyebleach', 'animalsbeingderps', 'superbowl', 'ilikthebred'];
// Minimum number of upvotes a post should have
const threshold = 1000;

// ========================================================
// Post queue and twitter timeline arrays
// ========================================================
let queue = [];
let timeline = [];

// ========================================================
// Functions (alphabetical)
// ========================================================

/**
 * Alphabetizes posts
 * @param {object} postA A subreddit post
 * @param {object} postB A subreddit post
 * @returns {number}
 */
function alphabetize(postA, postB) {

  let a = postA.data.subreddit.toLowerCase(),
      b = postB.data.subreddit.toLowerCase();

  return a > b ? 1 : (a < b ? -1 : 0);
}

/**
 * Converts raw buffer data to base64 string
 * @param {string} buffer Raw image data
 * @returns {string}
 */
function base64Encode(buffer) {

  if ( buffer.byteLength > 5000000 )  {
    return resize(Buffer.from(buffer, 'base64'));
  }

  return new Buffer(buffer).toString('base64');
}

/**
 * Converts imgur links to actual image url if needed.
 * @param {array.<object>} posts Posts from r/aww
 * @returns {array}
 */
function generateImgurUrl(posts) {

  return posts.map(p => {

    let id = p.data.url.split('/')[3],
        url = p.data.url;

    p.data.url = url.includes('.jpg')
                  ? p.data.url
                  : `https://i.imgur.com/${id}.jpg`;

    return p;
  });
}

/**
 * Creates a shortlink to use in the tweet
 * @param {array.<object>} posts Posts from a subreddit
 * @returns {array}
 */
function generateShortLinks(posts) {
  return posts.map(p => {
    let shorty = p.data.permalink.split('/')[4];
    p.data.shorty = `https://redd.it/${shorty}`;
    return p;
  });
}

/**
 * Generates a url that points to the .mp4 version
 * of a .gifv file on imgur
 * @param {object} post A post object
 * @returns {object}
 */
function generateVideoUrl(post) {

  let extension = /.gifv$/g,
      url = post.data.url;

  if ( extension.test(url) ) {
    post.data.url = url.slice(0, url.length - 5) + '.mp4';
  }

  return post;
}

/**
 * Gets posts from each subreddit within the
 * `subs` array.
 * @returns {promise}
 */
function getAllPosts() {
  // Show logo on startup
  console.log(colors.cyan, `${logo}`);
  // Grab our data
  getPosts().then(posts => {
    // Process our post data
    queue = generateShortLinks(posts);
    queue = queue.sort(alphabetize).reverse();

    return getTimeline();
  });
}

/**
 * Gets the next tweet in the queue
 * or fills the queue with new posts
 * @returns {method}
 */
function getNext() {

  if ( queue.length ) {

    let post = queue.shift(),
        title = post.data.title;

    console.log(' ');
    console.log(colors.reset, 'Attempting to post...');
    console.log(title);
    console.log('queue length: ', queue.length);

    if ( !timeline.some(t => t.text.includes(title.substring(0, 100))) ) {

      tweet(post);
      // Reset the queue after tweeting so that we're only tweeting
      // the most upvoted, untweeted post every interval
      return queue = [];
    }

    console.log('Seen it. NEXT!!!');
    return getNext();
  }

  return getAllPosts();
}

/**
 * Gets the top posts from a subreddit
 * and removes any posts that are gifs or videos.
 * Also updates imgur links to point directly to
 * the image on imgur.com
 * @returns {method}
 */
function getPosts() {

  let url = `https://www.reddit.com/r/${subs.join('+')}/top.json?limit=${limit}`;

  // List subs in query
  console.log(colors.yellow, 'Gathering new posts...');

  return fetch(url, {cache: 'no-cache'})
  .then(res => res.json())
  .then(json => {

    let images,
        imgur,
        jpgs,
        pngs,
        posts = json.data.children;

    // Replace any necessary characters in the title
    posts.forEach(p => p.data.title = sanitizeTitle(p.data.title));

    // Ignore videos and .gif* files;
    // make sure the upvotes meet the threshold
    images = posts.filter(p => !p.data.is_video
                            && !p.data.url.includes('.gif')
                            && p.data.ups >= threshold);

    // Gather up the image-based posts
    pngs = images.filter(p => p.data.url.includes('.png'));
    jpgs = images.filter(p => p.data.url.includes('.jpg'));
    imgur = images.filter(p => p.data.url.includes('imgur.com')
                            && !p.data.url.includes('.jpg'));
    imgur = generateImgurUrl(imgur);

    // Update the queue with new posts
    queue.push(...pngs, ...jpgs, ...imgur);

    return queue;
  });
}

/**
 * Returns the local time
 * @param {number} offset The UTC time offset
 * @returns {string}
 */
function getTime(offset) {

  let d = new Date(),
      utc = d.getTime() + (d.getTimezoneOffset() * 60000),
      nd = new Date(utc + (3600000 * offset));

  return nd.toLocaleString();
}

/**
 * Returns the 200 most recent tweets from the bot account
 * @returns {array.<object>}
 */
function getTimeline() {

  let params = { screen_name: screenName, count: 200 };

  return Twitter.get('statuses/user_timeline', params, (err, data, res) => {
    return timeline = data;
  });
}

/**
 * Resizes an image to 1000px wide so that
 * it will be under the 5mb limit Twitter requires
 * @param {string} buffer Raw image data
 * @returns {string}
 */
function resize(buffer) {

  return sharp(buffer).resize(1000).toBuffer()
         .then(data => new Buffer(data).toString('base64'));
}

/**
 * Converts common HTML entities into strings
 * @param {string} title The title from the post
 * @returns {string}
 */
function sanitizeTitle(title) {

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
}

/**
 * Grabs the post from Reddit and tweets it
 * @param {object} post A single post from a subreddit
 * @returns {method}
 */
function tweet(post) {

  fetch(post.data.url)
    .then(res => res.arrayBuffer())
    .then(base64Encode)
    .then(res => {

      let title = post.data.title;

      Twitter.post('media/upload', { media_data: res }, (err, data, res) => {

        let mediaIdStr = data.media_id_string,
            meta_params = {
              media_id: mediaIdStr,
              alt_text: { text: title }
            };

        Twitter.post('media/metadata/create', meta_params, (err, data, res) => {

          if ( !err ) {

            let params = {
              status: `${title} ${post.data.shorty} \n#${post.data.subreddit}`,
              media_ids: [mediaIdStr]
            };

            Twitter.post('statuses/update', params, (err, data, res) => {
              console.log(colors.green, 'Post successfully tweeted!');
              console.log(colors.green, getTime(-7));
              console.log(' ');
              getTimeline();
            });

          } else {
            console.log(' ');
            console.log(colors.red, 'There was an error when attempting to post...');
            console.error(err);
            console.log(' ');
          }
        });
      });
    });
}

// ========================================================
// Init
// ========================================================
// let's get something positive from the internet for once...
getAllPosts();
setInterval(() => getNext(), interval);
