#!/usr/bin/env node

'use strict';

const p = require('path'),
      request = require('request'),
      fs = require('fs'),
      cheerio = require('cheerio'),
      winston = require('winston'),
      program = require('commander'),
      config = require('./config.json'),
      jsonfile = require('jsonfile'),
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
      },

      download = (uri, filename, cb) => {
        request.head(uri, (err, res, body) => {
          if (err)
            return winston.error(`Error downloading '${uri}'`, e)

          fs.mkdir(p.dirname(filename), function (e) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', cb)
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
                issue = getIssueNumber(url),
                savePath = p.join(program.directory, issue.toString(), pad(getPageNumber(url)) + '.jpg')

          if (imgPath) {
            const nextUrl = $('img.picture').parent().attr('href'),
                  nextIssue = getIssueNumber(imgBase + nextUrl)

            // fs.stat(savePath, (err, stats) => {
              // if (err) {
                winston.info(`Starting download of ${imgPath}`)

                download(imgPath, savePath, () => {
                  let keepGoing = true

                  winston.info(`Image saved to ${savePath}`)

                  if (nextIssue !== issue) {
                    winston.info(`Issue ${issue} has finished downloading`)
                    keepGoing = (!!program.end && nextIssue <= program.end) && !program.noWalk
                  }

                  if (nextUrl && keepGoing)
                    crawl(imgBase + nextUrl)
                  else
                    winston.info('Crawl complete!')
                })
              // }
            // })
          } else {
            winston.info('Crawl complete!')
          }
        })
      },

      start = () => {
        let baseUrl = 'http://www.omgbeaupeep.com/comics/The_Walking_Dead/$issue/'

        winston.info('Starting crawl...')

        // Intellegently guess the starting issue
        if (program.issue) {
          baseUrl = baseUrl.replace('$issue', program.issue)
          crawl(baseUrl)
        } else {
          fs.readdir(program.directory, (err, issues) => {
            if (err)
              return winston.error(`There was a problem with the path '${program.directory}'. Please check the path and try again`, err)

            issues = issues.filter(i => !(/(^|\/)\.[^\/\.]/g).test(i))
              .map(i => parseInt(i, 10))

            const issue = Math.max.apply(Math, issues) + 1
            baseUrl = baseUrl.replace('$issue', issue)

            crawl(baseUrl)
          })
        }
      };

// Add colors and pretty stuff to console logging
winston.cli()

// Set up the cli program
program.version(require('./package.json').version)
  .option('-i, --issue <n>', 'The issue number at which to start. If none is included, it will start from the last issue downloaded', parseInt)
  .option('-e, --end <n>', 'The issue at which to stop', parseInt)
  .option('-n, --no-walk', 'Only get the single issue')
  .option('-d, --directory <path>', 'The directory in which you wish to put the comic files. Supersedes saved path.', config.directory)
  .option('-s, --save', 'Save the directory configuration')
  .parse(process.argv)

// Check to make sure a directory exists
if (!program.directory) {
  return winston.error('Please include a directory in which you wish to put the files')
}

// Save the directory config file
if (program.directory && program.save) {
  jsonfile.spaces = 2

  jsonfile.writeFile('./config.json', { directory: program.directory }, err => {
    if (err)
      return winston.error(`Error writing config file to ${p.join(__dirname, 'config.json')}`)

    winston.info('Saved directory configuration')
  })
}

start()
