'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require('bluebird');
var scraperjs = require('scraperjs');
var array = require('lodash/array');
var string = require('lodash/string');

var Scraper = function () {
  function Scraper() {
    _classCallCheck(this, Scraper);
  }

  _createClass(Scraper, null, [{
    key: 'findAllLinks',
    value: function findAllLinks(url) {
      return Promise.resolve(scraperjs.StaticScraper.create(url).scrape(Scraper.jqueryLinkExtract)).then(function (data) {
        return array.uniqBy(data, 'link');
      });
    }
  }, {
    key: 'jqueryLinkExtract',
    value: function jqueryLinkExtract($) {
      return $('a').map(function extractLink() {
        var link = Scraper.cleanUrl($(this).attr('href'));
        return { link: link, text: $(this).text() };
      }).get();
    }
  }, {
    key: 'cleanUrl',
    value: function cleanUrl(url) {
      var prefixed = url.startsWith('//') ? 'https:' + url : url;
      var noHash = prefixed.split('#')[0];
      return string.trimEnd(noHash, '/');
    }
  }]);

  return Scraper;
}();

module.exports = Scraper;