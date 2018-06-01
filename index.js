const TwitterPackage = require('twitter');
require('dotenv').config();

const secret = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
}

const Twitter = new TwitterPackage(secret);

/**
 * Tweets out a message
 * @param {string} message The message content
 * @returns {undefined}
 */
function tweet(message) {

  Twitter.post('statuses/update', { status: `${message}` }, (error, tweet, response) => {

    if (error) console.log(error);

    console.log(tweet);  // Tweet body.
    //console.log(response);  // Raw response object.
  });
}

tweet('testing again...');
