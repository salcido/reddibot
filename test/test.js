// =======================================================
//  Overview
//  -----------------------------------------------------
//  Unit tests for utilis.js methods
//  -----------------------------------------------------
//  @author: Matthew Salcido
//  @github: https://www.github.com/salcido
//  @source: https://github.com/salcido/reddibot
//  @bot-url: https://www.twitter.com/reddibot
// =======================================================
const assert = require('assert');
const { utils: { alphabetize,
                 filterImages,
                 filterImgur,
                 filterJpgs,
                 filterPngs,
                 filterTexts,
                 generateImgurUrl,
                 generateShortLinks,
                 isTextSub,
                 meta,
                 minutes,
                 sanitizeTitle
                }} = require('../assets/utils');
// ========================================================
// Tests
// ========================================================

describe('utility', () => {
// ========================================================
// Alphabetize
// ========================================================
  describe('alphabetize', () => {
    it('should return 1 when a > b', () => {
      let postA = { data: { subreddit: 'zoro'}},
          postB = { data: { subreddit: 'alpha'}};
      assert.equal(alphabetize(postA, postB), 1);
    });
  });
  describe('alphabetize', () => {
    it('should return -1 when b > a', () => {
      let postA = { data: { subreddit: 'alpha'}},
          postB = { data: { subreddit: 'zoro'}};
      assert.equal(alphabetize(postA, postB), -1);
    });
  });
  describe('alphabetize', () => {
    it('should return 0 when b === a', () => {
      let postA = { data: { subreddit: 'alpha'}},
          postB = { data: { subreddit: 'alpha'}};
      assert.equal(alphabetize(postA, postB), 0);
    });
  });
// ========================================================
// filterImages
// ========================================================
  describe('filterImages', () => {
    it('should return an array of image-based posts', () => {
      let posts = [
        {
          data: {
            is_video: false,
            title: 'A short title',
            subreddit: 'aww',
            url: 'https://www.reddit.com/r/something.jpg'
          }
        },
        {
          data: {
            is_video: false,
            title: 'A slightly longer title',
            subreddit: 'nocontext',
            url: 'https://www.reddit.com/r/something.gif'
          }
        }
      ];
      assert.equal(
        JSON.stringify(filterImages(posts)),
        JSON.stringify([{ data: {
          is_video: false,
          title: 'A short title',
          subreddit: 'aww',
          url: 'https://www.reddit.com/r/something.jpg'
        }}]));
    });
  });
// ========================================================
// filterImgur
// ========================================================
  describe('filterImgur', () => {
    it('should return an array of imgur posts', () => {
      let images = [{ data: { url: 'https://www.imgur.com/asdf'}},
                    { data: { url: 'https://www.imgur.com/qwerty.jpg'}}];
      assert.equal(
        JSON.stringify(filterImgur(images)),
        JSON.stringify([{ data: { url: 'https://www.imgur.com/asdf'}}]));
    });
  });
// ========================================================
// filterJpgs
// ========================================================
  describe('filterJpgs', () => {
    it('should return an array of jpg posts', () => {
      let images = [{ data: { url: 'https://www.imgur.com/asdf.jpg'}},
                    { data: { url: 'https://www.imgur.com/qwerty.png'}}];
      assert.equal(
        JSON.stringify(filterJpgs(images)),
        JSON.stringify([{ data: { url: 'https://www.imgur.com/asdf.jpg'}}]));
    });
  });
// ========================================================
// filterPngs
// ========================================================
  describe('filterPngs', () => {
    it('should return an array of png posts', () => {
      let images = [{ data: { url: 'https://www.imgur.com/asdf.jpg'}},
                    { data: { url: 'https://www.imgur.com/qwerty.png'}}];
      assert.equal(
        JSON.stringify(filterPngs(images)),
        JSON.stringify([{ data: { url: 'https://www.imgur.com/qwerty.png'}}]));
    });
  });
// ========================================================
// filterTexts
// ========================================================
  describe('filterTexts', () => {
    it('should return an array of text posts', () => {
      let posts = [
        {
          data: {
            is_video: false,
            title: 'A short title',
            subreddit: 'nocontext',
            ups: 9001
          }
        },
        {
          data: {
            is_video: true,
            title: 'A slightly longer title',
            subreddit: 'funny',
            ups: 420
          }
        }
      ];
      assert.equal(
        JSON.stringify(filterTexts(posts)),
        JSON.stringify([{ data: {
          is_video: false,
          title: 'A short title',
          subreddit: 'nocontext',
          ups: 9001
        }}]));
    });
  });
// ========================================================
// generateImgurUrl
// ========================================================
  describe('generateImgurUrl', () => {
    it('should rewrite the imgur url', () => {
      let post = [{ data: { url: 'https://www.imgur.com/asdf'}}];
      assert.equal(
        JSON.stringify(generateImgurUrl(post)),
        JSON.stringify([{ data: { url: 'https://i.imgur.com/asdf.jpg'}}]));
    });
  });
// ========================================================
// generateShortLinks
// ========================================================
  describe('generateShortLinks', () => {
    it('should create a shortlink', () => {
      let post = [{ data: { permalink: '/r/a/b/8pr4gv/some_post_title/'}}];
      assert.equal(
        JSON.stringify(generateShortLinks(post)),
        JSON.stringify([{ data: { permalink: '/r/a/b/8pr4gv/some_post_title/',
                                  shorty: 'https://redd.it/8pr4gv',}}])
      );
    });
  });
// ========================================================
// isTextSub
// ========================================================
  describe('isTextSub', () => {
    it('should return true if the subreddit is included in the textsub array', () => {
      let subs = ['nocontext', 'showerthoughts'],
          post = { data: { subreddit: 'nocontext'}};
      assert.equal(isTextSub(post, subs), true);
    });
  });
// ========================================================
// meta
// ========================================================
  describe('meta', () => {
    it('should add the correct meta property to the post object', () => {
      let posts = [{ data: {}}];
      assert.equal(
        JSON.stringify(meta(posts, 'text')),
        JSON.stringify([{ data: { meta: 'text'}}])
      );
    });
  });
// ========================================================
// minutes
// ========================================================
  describe('minutes', () => {
    it('should return 60000 when a value of 1 is passed', () => {
      assert.equal(minutes(1), 60000);
    });
  });
// ========================================================
// sanitizeTitle
// ========================================================
  describe('sanitizeTitle', () => {
    it('should replace the characters in the title', () => {
      let title = 'Someone’s long &amp; boring title with a bunch of &quot;bad&quot; characters.oh boy&hellip;';
      assert.equal(
        sanitizeTitle(title),
        'Someone\'s long & boring title with a bunch of "bad" characters. oh boy...' );
    });
  });
});
