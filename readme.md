# Reddibot

[![hella whoas](https://img.shields.io/badge/%F0%9F%94%A5-whoa!-brightgreen.svg)]()
[![hella borks](https://img.shields.io/badge/%F0%9F%90%B6-bork!-blue.svg)]()
[![hella meows](https://img.shields.io/badge/%F0%9F%98%B8-meow!-orange.svg)]()
[![hella whoas](https://img.shields.io/badge/unit%20tests-13%2F13-brightgreen.svg)]()
[![Twitter Follow](https://img.shields.io/twitter/follow/reddibot.svg?style=social&label=Follow)](https://twitter.com/reddibot)

A Twitter bot that mirrors top posts from various subreddits to twitter.com.

https://twitter.com/reddibot
___

#### Current subreddits include:

  * animalsbeingderps
  * aww
  * awwducational
  * coloringcorruptions
  * engineeringporn
  * expectationvsreality
  * eyebleach
  * ilikthebred
  * imaginarylandscapes
  * natureisfuckinglit
  * nocontext
  * perfectfit
  * rarepuppers
  * showerthoughts
  * spaceporn
  * superbowl
  * whatswrongwithyourdog
  * woahdude

___

### Prerequisites

* Your own Twitter account with an app created using `https://apps.twitter.com/`.
  * Go to `https://apps.twitter.com/` and click "Create new app"
  * Fill out the form with the required information
  * Click "Create your Twitter application"

* A `.env` file at the root of the application that contains the API keys provided by Twitter when your app was created.
>Note: Your `.env` file should look something like this (replace XXXXXX with the keys provided by Twitter):
```
CONSUMER_KEY=XXXXXX
CONSUMER_SECRET=XXXXXX
ACCESS_TOKEN=XXXXXX
ACCESS_TOKEN_SECRET=XXXXXX
```

### Installation

* `git clone https://github.com/salcido/reddibot.git` (this repository)
* change into the new directory
* `npm install`

### Running / Development

* Start the bot:
  * `npm start`

### Testing

* Running the tests:
  * `npm test`

___

### Built With

* [Node-Fetch](https://github.com/bitinn/node-fetch) - Window.fetch for Node
* [Sharp](https://github.com/lovell/sharp) - Image processing
* [Twit](https://github.com/ttezel/twit) - Twitter API client for Node

### Author

* **Matthew Salcido** - *Initial work* - [salcido](https://github.com/salcido)

### License

This project is licensed under the GPL License - see the [LICENSE](LICENSE) file for details
