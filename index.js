require('dotenv').config();
const fetch = require('node-fetch');
const sharp = require('sharp');
const Twit = require('twit');

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
const interval = (60 * 1000) * 5;
const screenName = 'awwtomatic';
const Twitter = new Twit(secret);
const url = 'https://www.reddit.com/r/aww/top.json?limit=100';

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
 * Gets the next tweet in the queue
 * or fills the queue with new posts
 * @returns {method}
 */
function getNext() {

  if ( queue.length ) {

    let next = queue.shift(),
        title = next.data.title;

    console.log(' ');
    console.log('Attempting to post...');
    console.log(title);
    console.log('queue length: ', queue.length);

    if ( !timeline.some(t => t.text.includes(title.substring(0, 100))) ) {
      return tweet(next);
    }
    console.log('Seen it. NEXT!!!');
    return getNext();
  }

  return getPosts();
}

/**
 * Gets the top posts from r/aww
 * and removes any posts that are gifs or videos
 * @returns {method}
 */
function getPosts() {

  fetch(url, {cache: 'no-cache'})
    .then(res => res.json())
    .then(json => {

      let posts = json.data.children,
          pngs,
          jpgs,
          imgur;

      // Ignore videos and .gif* files
      posts = posts.filter(p => !p.data.is_video && !p.data.url.includes('.gif'));
      // Gather up the image-based posts
      pngs = posts.filter(p => p.data.url.includes('.png'));
      jpgs = posts.filter(p => p.data.url.includes('.jpg'));
      imgur = posts.filter(p => p.data.url.includes('imgur.com'));
      imgur = handleImgur(imgur);
      // Create our queue of posts
      queue = [...pngs, ...jpgs, ...imgur];
      queue = generateShortLinks(queue);

      return queue;
    });
  return getTimeline();
}

/**
 * Returns the 100 most recent tweets from the bot account
 * @returns {array.<object>}
 */
function getTimeline() {

  let params = { screen_name: screenName, count: 500 };

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
        { url } = p.data;

    p.data.url = url.includes('.jpg')
                  ? p.data.url
                  : `https://i.imgur.com/${id}.jpg`;

    return p;
  });
}

/**
 * Resizes an image to 1000px wide
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
 * Tweets out the post from r/aww
 * @param {object} post A single post from r/aww
 * @returns {method}
 */
function tweet(post) {

  fetch(post.data.url)
    .then(res => res.arrayBuffer())
    .then(base64_encode)
    .then(res => {

      Twitter.post('media/upload', { media_data: res }, (err, data, res) => {

        let mediaIdStr = newFunction(data),
            meta_params = {
              media_id: mediaIdStr,
              alt_text: { text: sanitizeTitle(post.data.title) }
            };

        Twitter.post('media/metadata/create', meta_params, (err, data, res) => {

          if ( !err ) {

            let params = {
              status: `${sanitizeTitle(post.data.title)} ${post.data.shorty}`,
              media_ids: [mediaIdStr]
            };

            Twitter.post('statuses/update', params, (err, data, res) => {
              console.log('Post successfully tweeted!');
              console.log(' ');
              getTimeline();
            });

          } else {
            console.log(' ');
            console.log('There was an error when attempting to post...');
            console.error(err);
            console.log(' ');
          }
        });
      });
    });

  function newFunction(data) {
    return data.media_id_string;
  }
}

// ========================================================
// Init
// ========================================================
getPosts();
setInterval(() => getNext(), interval);
