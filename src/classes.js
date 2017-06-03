const Promise = require('bluebird');
const scraperjs = require('scraperjs');
const array = require('lodash/array');
const string = require('lodash/string');

class Scraper {

  static findAllLinks(url) {
    return Promise.resolve(
      scraperjs.StaticScraper
        .create(url)
        .scrape(Scraper.jqueryLinkExtract)
    )
      .then(data => array.uniqBy(data, 'link'));
  }

  static jqueryLinkExtract($) {
    return $('a').map(function extractLink() {
      const link = Scraper.cleanUrl($(this).attr('href'));
      return { link, text: $(this).text() };
    }).get();
  }

  static cleanUrl(url) {
    const prefixed = url.startsWith('//') ? `https:${url}` : url;
    const noHash = prefixed.split('#')[0];
    return string.trimEnd(noHash, '/');
  }

}

module.exports = Scraper;
