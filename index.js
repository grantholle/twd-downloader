#!/usr/bin/env node

'use strict';

const p = require('path'),
      colors = require('colors')
      request = require('request'),
      fs = require('fs'),
      cheerio = require('cheerio'),
      prompt = require('prompt'),
      winston = require('winston'),
      program = require('commander'),
      config = require('./config.json'),
      imgBase = "http://www.omgbeaupeep.com/comics/",

      getIssueNumber = url => {
        const parts = url.split('/')

        return parseInt(parts[5], 10)
      },

      getPageNumber = url => {
        const parts = url.split('/'),
            page = parseInt(parts[6], 10)

        return page ? page : 1
      },

      pad = num => {
        let s = num + ""

        while (s.length < 3)
          s = "0" + s

        return s;
      }

      download = (uri, filename, callback) => {
        request.head(uri, (err, res, body) => {
          if (err) {
            console.log('Error!'.red, e)
          }

          fs.mkdir(p.dirname(filename), function (e) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback)
          })
        })
      },

      crawl = url => {

        request(url, (err, message, res) => {
          if (err) {
            return winston.error(`Requesting ${url} failed`, err)
          }

          const $ = cheerio.load(res.toString()),
              imgPath = imgBase + $('img.picture').attr('src'),
              savePath = p.join(saveBase, getIssueNumber(url).toString(), pad(getPageNumber(url)) + '.jpg')

          if (imgPath) {
            const nextUrl = $('img.picture').parent().attr('href')

            fs.stat(savePath, (err, stats) => {
              if (err) {
                winston.info(`Downloading ${imgPath}`)

                download(imgPath, savePath, () => {
                  winston.info(`Saved ${savePath}!`)

                  if (nextUrl)
                    crawl(imgBase + nextUrl)
                  else
                    winston.info('Crawl complete!')
                })
              }
            })
          }
        })
      };

program.version(require('./package.json').version)
  .option('-i', '--issue', 'The issue number at which you wish to start')
  .option('-d', '--directory', 'The directory in which you wish to put the comic files')
  .parse

winston.info('Starting crawl...')
crawl(urlBase)
