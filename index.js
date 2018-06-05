// =======================================================
//  Overview
//  -----------------------------------------------------
//  Awwbot mirrors posts from reddit.com's r/aww,
//  r/rarepuppers, r/awwducational, and r/eyebleach
//  subreddits for top image-based posts and tweets them.
//  -----------------------------------------------------
//  @author: Matthew Salcido
//  @github: https://www.github.com/salcido
//  @source: https://github.com/salcido/awwbot
//  @bot-url: https://www.twitter.com/awwtomatic
// =======================================================

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
const interval = (60 * 1000) * 5;
// Number of posts to return from each subreddit
const limit = 50;
// Bot's twitter handle for timeline data
const screenName = 'awwtomatic';
// change to:
// awwmatic
// theawwbot
// _awwbot
// awwpibot
// aww_tobot

// add subreddit source as hashtag to tweet

// Subs to pull posts from
const subs = ['aww', 'Awwducational', 'rarepuppers', 'Eyebleach', 'AnimalsBeingDerps'];
// Minimum number of upvotes a post should have
const threshold = 500;

// ========================================================
// Post queue and twitter timeline arrays
// ========================================================
let queue = [];
let timeline = [];

// ========================================================
// Functions (alphabetical)
// ========================================================
/**
 * Converts raw buffer data to base64 string
 * @param {string} buffer Raw image data
 * @returns {string}
 */
function base64_encode(buffer) {
  if ( buffer.byteLength > 5000000 ) return resize(Buffer.from(buffer, 'base64'));
  return new Buffer(buffer).toString('base64');
}

/**
 * Creates a shortlink to use in the tweet
 * @param {array.<object>} posts Posts from r/aww
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
 * Gets posts from each subreddit within the
 * `subs` array.
 * @returns {promise}
 */
function getAllPosts() {
  // Show logo on startup
  console.log(colors.cyan, `${logo}`);
  // Grab our data
  Promise.all(subs.map(getPosts)).then(() => {
    queue = generateShortLinks(queue);
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

    let next = queue.shift(),
        title = next.data.title;

    console.log(' ');
    console.log(colors.reset, 'Attempting to post...');
    console.log(title);
    console.log('queue length: ', queue.length);

    if ( !timeline.some(t => t.text.includes(title.substring(0, 100))) ) {
      return tweet(next);
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
function getPosts(sub) {

  let url = `https://www.reddit.com/r/${sub}/top.json?limit=${limit}`;

  console.log(colors.yellow, 'getting posts for', sub);

  return new Promise((resolve, reject) => {
    fetch(url, {cache: 'no-cache'})
    .then(res => res.json())
    .then(json => {

      let filtered,
          imgur,
          jpgs,
          pngs,
          posts = json.data.children;

      // Ignore videos and .gif* files;
      // make sure the post has at least 500 upvotes
      filtered = posts.filter(p => !p.data.is_video
                                && !p.data.url.includes('.gif')
                                && p.data.ups >= threshold);

      // Gather up the image-based posts
      pngs = filtered.filter(p => p.data.url.includes('.png'));
      jpgs = filtered.filter(p => p.data.url.includes('.jpg'));
      imgur = filtered.filter(p => p.data.url.includes('imgur.com'));
      imgur = handleImgur(imgur);

      // Update the queue with new posts
      queue.push(...pngs, ...jpgs, ...imgur);
      return resolve();
    });
  });
}

/**
 * Returns the 300 most recent tweets from the bot account
 * @returns {array.<object>}
 */
function getTimeline() {

  let params = { screen_name: screenName, count: 300 };

  return Twitter.get('statuses/user_timeline', params, (err, data, res) => {
    return timeline = data;
  });
}

/**
 * Converts imgur links to actual image url if needed.
 * @param {array.<object>} posts Posts from r/aww
 * @returns {array}
 */
function handleImgur(posts) {

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
 * Resizes an image to 1000px wide so that
 * it will be under the 5mb limit Twitter requires
 * @param {string} buffer Raw image data
 * @returns {string}
 */
function resize(buffer) {

  return sharp(buffer)
          .resize(1000)
          .toBuffer()
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
                      .replace(/&#39;/g, '\'');
}

/**
 * Grabs the post from Reddit and tweets it
 * @param {object} post A single post from a subreddit
 * @returns {method}
 */
function tweet(post) {

  fetch(post.data.url)
    .then(res => res.arrayBuffer())
    .then(base64_encode)
    .then(res => {

      let title = sanitizeTitle(post.data.title);

      Twitter.post('media/upload', { media_data: res }, (err, data, res) => {

        let mediaIdStr = data.media_id_string,
            meta_params = {
              media_id: mediaIdStr,
              alt_text: { text: title }
            };

        Twitter.post('media/metadata/create', meta_params, (err, data, res) => {

          if ( !err ) {

            let params = {
              status: `${title} ${post.data.shorty} \n #${post.data.subreddit}`,
              media_ids: [mediaIdStr]
            };

            Twitter.post('statuses/update', params, (err, data, res) => {
              console.log(colors.green, 'Post successfully tweeted!');
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
