"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var SomeClass = function () {
  function SomeClass(url) {
    _classCallCheck(this, SomeClass);

    this.url = url;
  }

  _createClass(SomeClass, [{
    key: 'print',
    value: function print(callback) {

      request('https://medium.com', function (error, response, html) {
        var json = [];

        if (!error && response.statusCode == 200) {
          var $ = cheerio.load(html);
          //  console.log($('a'))
          $('a').each(function (i, element) {

            var link = $(this);
            var title = link.text();
            var url = link.attr('href');

            var isValidLink = url.startsWith('https://medium.com');
            if (isValidLink) {

              // console.log(url)
              json.push({ 'title': title, 'url': url });
            }

            // var rank = a.parent().parent().text();


            // Our parsed meta data object

          });

          console.log("==========");
          callback(json);
        }
      });
    }
  }]);

  return SomeClass;
}();

module.exports = SomeClass;