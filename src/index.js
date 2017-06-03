"use strict";
const fs = require('fs');
const P = require('bluebird');
const debug = require('debug')('crawler');
const Scraper = require('./classes');
const array = require('lodash/array');

const url = 'https://medium.com';
const MAX_CRAWL = 20;
const MAX_THROTTLE = 5;
const OUTPUT = 'out.csv';


class Crawler {

  constructor(maxPages, requestThrottle) {
    this.foundUrls = [];
    this.crawledUrls = {};
    this.crawledSize = 0;
    this.chunkIndex = 0;
    this.maxPages = maxPages;
    this.requestThrottle = requestThrottle;
  }

    crawl(url) {
    return this.crawl(url)
      .then(() => this.crawlChunkWise())
      .then(() => ({ foundUrls: this.foundUrls, crawledUrls: this.crawledUrls }));
  }

  
  crawl(url) {
    const isMediumLink = url.startsWith('https://medium.com');
    if (this.crawledUrls[url] || this.crawledSize >= this.maxPages || !isMediumLink) {
      return P.resolve([]);
    }

    debug(`start crawling : ${url}`);

    return Scraper.findAllLinks(url)
      .tap(() => this.crawledUrls[url] = true)
      .tap(() => this.crawledSize++)
      .then(urlObjects => this.foundUrls = this.foundUrls.concat(urlObjects))
      .then(() => debug(`finished crawling : ${url}`));
  }

  crawlChunkWise() {
    const chunks = array.chunk(this.foundUrls, this.requestThrottle);
    if (this.chunkIndex >= chunks.length) return P.resolve();
    return P.map(chunks[this.chunkIndex++], item => this.crawl(item.link))
      .then(() => this.crawlChunkWise());
  }

}



class CsvConverter {

  static writeToFile(fileName,  data) {
    const stream = fs.createWriteStream(fileName);
    stream.once('open', () => {
      stream.write('Link, Text\n');
      data.forEach(row => stream.write(`${row.link}, ${row.text}\n`));
      stream.end();
    });
  }

}






let crawler = new Crawler(MAX_CRAWL, MAX_THROTTLE);
crawler.crawl(url)
  .then((result) => {
    const newResult = { crawledUrls: result.crawledUrls };
    newResult.foundUrls = array.uniqBy(result.foundUrls, 'link');
    return newResult;
  })
  .then(result => CsvConverter.writeToFile(OUTPUT, result.foundUrls));
