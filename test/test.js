const assert = require('assert');
const { utils: { alphabetize,
                 generateImgurUrl,
                 generateShortLinks,
                 isTextSub,
                 meta,
                 minutes,
                 sanitizeTitle
                }} = require('../assets/utils');
// alphabetize
describe('utility', () => {
  // alphabetize
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
  // generateImgurUrl
  describe('alphabetize', () => {
    it('should rewrite the imgur url', () => {
      let post = [{ data: { url: 'https://www.imgur.com/asdf'}}];
      assert.equal(
        JSON.stringify(generateImgurUrl(post)),
        JSON.stringify([{ data: { url: 'https://i.imgur.com/asdf.jpg'}}]));
    });
  });
  // generateShortLinks
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
  // isTextSub
  describe('isTextSub', () => {
    it('should return true if the subreddit is included in the textsub array', () => {
      let subs = ['nocontext', 'showerthoughts'],
          post = { data: { subreddit: 'nocontext'}};
      assert.equal(isTextSub(post, subs), true);
    });
  });
  // meta
  describe('meta', () => {
    it('should add the correct meta property to the post object', () => {
      let posts = [{ data: {}}];
      assert.equal(
        JSON.stringify(meta(posts, 'text')),
        JSON.stringify([{ data: { meta: 'text'}}])
      );
    });
  });
  // minutes
  describe('minutes', () => {
    it('should return 60000 when a value of 1 is passed', () => {
      assert.equal(minutes(1), 60000);
    });
  });
  // sanitizeTitle
  describe('sanitizeTitle', () => {
    it('should replace the characters in the title', () => {
      let title = 'Someone’s long &amp; boring title with a bunch of &quot;bad&quot; characters.oh boy&hellip;';
      assert.equal(
        sanitizeTitle(title),
        'Someone\'s long & boring title with a bunch of "bad" characters. oh boy...' );
    });
  });
});
