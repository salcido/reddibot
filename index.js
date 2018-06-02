// fetch posts from r/aww
// remove non-image posts
// push results to `queue`
// pop one result from queue and check to see if it's been tweeted before
// if it's been tweeted, discard it and get next result (repeat)
// tweet result

require('dotenv').config();
const fetch = require('node-fetch');
const Twit = require('twit');
const secret = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

const Twitter = new Twit(secret);
const url = 'https://www.reddit.com/r/aww/top.json?limit=100';

let queue = [];
let interval = 60 * 1000;
let timeline = [];

/**
 * Converts raw buffer data to base64 string
 * @param {string} buffer Raw image data
 * @returns {string}
 */
function base64_encode(buffer) {
  return new Buffer(buffer).toString('base64');
}

/**
 * Gets the top posts from r/aww
 * and removes any posts that are videos.
 * @returns {assignment}
 */
function getPosts() {

  fetch(url, {cache: 'no-cache'})
    .then(res => res.json())
    .then(json => {

      let posts = json.data.children;
      // let { title, url, is_video, permalink } = post.data;
      posts = posts.filter(p => !p.data.is_video && !p.data.url.includes('.gif'));

      return queue = posts.filter(p => p.data.url.includes('.jpg') || p.data.url.includes('.png'));
    });
    getTimeline();
}

/**
 * Gets the next tweet in the queue
 * or fills the queue with new posts
 * @returns {method}
 */
async function getNext() {

  if ( queue.length ) {

    let next = queue.shift(),
        { title } = next.data;

    console.log(title);
    console.log('queue length: ', queue.length);

    if ( !timeline.some(t => t.text.includes(title.substring(0, 115))) ) {
      return tweet(next);
    }
    return getNext();
  }

  return getPosts();
}

/**
 * Returns the 100 most recent tweets from the bot account
 * @returns {array.<object>}
 */
function getTimeline() {

  let params = { screen_name: 'awwwtobot', count: 100 };

  return Twitter.get('statuses/user_timeline', params, (err, data, response) => {
    return timeline = data;
  });
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

      Twitter.post('media/upload', { media_data: res }, (err, data, response) => {

        let mediaIdStr = data.media_id_string,
            meta_params = {
              media_id: mediaIdStr,
              alt_text: { text: post.data.title }
            };

        Twitter.post('media/metadata/create', meta_params, (err, data, response) => {

          if ( !err ) {

            let params = {
              status: post.data.title,
              media_ids: [mediaIdStr]
            };

            Twitter.post('statuses/update', params, (err, data, response) => {
              console.log('Post successfully tweeted!');
              console.log('Updating timeline data...');
              getTimeline();
            });

          } else {
            console.log('Error!!!', err);
          }
        });
      });
    });
}

getPosts();
setInterval(() => getNext(), interval);
