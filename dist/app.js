"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var P = require('bluebird');
var debug = require('debug')('crawler');
var Scraper = require('./scraper');
var array = require('lodash/array');

var url = 'https://medium.com';
var MAX_CRAWL = 20;
var MAX_THROTTLE = 5;
var OUTPUT = 'out.csv';

var Crawler = function () {
  function Crawler(maxPages, requestThrottle) {
    _classCallCheck(this, Crawler);

    this.foundUrls = [];
    this.crawledUrls = {};
    this.crawledSize = 0;
    this.chunkIndex = 0;
    this.maxPages = maxPages;
    this.requestThrottle = requestThrottle;
  }

  _createClass(Crawler, [{
    key: 'crawl',
    value: function crawl(url) {
      var _this = this;

      return this._crawl(url).then(function () {
        return _this._crawlChunkWise();
      }).then(function () {
        return { foundUrls: _this.foundUrls, crawledUrls: _this.crawledUrls };
      });
    }
  }, {
    key: '_crawl',
    value: function _crawl(url) {
      var _this2 = this;

      var isMediumLink = url.startsWith('https://medium.com');
      if (this.crawledUrls[url] || this.crawledSize >= this.maxPages || !isMediumLink) {
        return P.resolve([]);
      }

      debug('start crawling : ' + url);

      return Scraper.findAllLinks(url).tap(function () {
        return _this2.crawledUrls[url] = true;
      }).tap(function () {
        return _this2.crawledSize++;
      }).then(function (urlObjects) {
        return _this2.foundUrls = _this2.foundUrls.concat(urlObjects);
      }).then(function () {
        return debug('finished crawling : ' + url);
      });
    }
  }, {
    key: '_crawlChunkWise',
    value: function _crawlChunkWise() {
      var _this3 = this;

      var chunks = array.chunk(this.foundUrls, this.requestThrottle);
      if (this.chunkIndex >= chunks.length) return P.resolve();
      return P.map(chunks[this.chunkIndex++], function (item) {
        return _this3._crawl(item.link);
      }).then(function () {
        return _this3._crawlChunkWise();
      });
    }
  }]);

  return Crawler;
}();

var CsvConverter = function () {
  function CsvConverter() {
    _classCallCheck(this, CsvConverter);
  }

  _createClass(CsvConverter, null, [{
    key: 'writeToFile',
    value: function writeToFile(fileName, data) {
      var stream = fs.createWriteStream(fileName);
      stream.once('open', function () {
        stream.write('Link, Text\n');
        data.forEach(function (row) {
          return stream.write(row.link + ', ' + row.text + '\n');
        });
        stream.end();
      });
    }
  }]);

  return CsvConverter;
}();

var crawler = new Crawler(MAX_CRAWL, MAX_THROTTLE);
crawler.crawl(url).then(function (result) {
  var newResult = { crawledUrls: result.crawledUrls };
  newResult.foundUrls = array.uniqBy(result.foundUrls, 'link');
  return newResult;
}).then(function (result) {
  return CsvConverter.writeToFile(OUTPUT, result.foundUrls);
});