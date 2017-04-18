'use strict';

const cheerio = require('cheerio');
const p = require('path');
const colors = require('colors');
const request = require('request');
const fs = require('fs');
const imgBase = "http://www.omgbeaupeep.com/comics/";
const saveBase = '/Users/grant/Downloads/TWD';
let startIssue = 164;
const urlBase = `http://www.omgbeaupeep.com/comics/The_Walking_Dead/${startIssue}/`;

const download = function (uri, filename, callback) {
  request.head(uri, function(err, res, body){
    if (err) {
      console.log('Error!'.red, e);
    }

    fs.mkdir(p.dirname(filename), function (e) {
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  });
};

console.log('Starting crawl...'.yellow);
startCrawl(urlBase);

function startCrawl (url) {

  request(url, (err, message, res) => {
    var $ = cheerio.load(res.toString()),
        imgPath = imgBase + $('img.picture').attr('src'),
        savePath = p.join(saveBase, getIssueNumber(url).toString(), pad(getPageNumber(url)) + '.jpg');

    // Don't download the file twice
    if (imgPath) {
      let nextUrl = $('img.picture').parent().attr('href');

      fs.stat(savePath, (err, stats) => {
        if (typeof stats === 'undefined') {
          console.log(`Downloading ${imgPath}`.gray);

          download(imgPath, savePath, () => {
            console.log(`Saved ${savePath}!`.green);

            if (nextUrl)
              startCrawl(imgBase + nextUrl);
            else
              console.log('Crawl complete!'.yellow);
          });
        }
      });
    }
  });
}

function getIssueNumber(url) {
  let parts = url.split('/');

  return parseInt(parts[5], 10);
}

function getPageNumber(url) {
  let parts = url.split('/'),
      page = parseInt(parts[6], 10);

  return page ? page : 1;
}

function pad(num) {
  var s = num + "";
  while (s.length < 3) s = "0" + s;
  return s;
}
