# TWD Comic Downloader

Downloads TWD comics from [OMG.BEAU.PEEP](http://www.omgbeaupeep.com).

![TWD](http://www.omgbeaupeep.com/comics/mangas/The%20Walking%20Dead/001%20-%20The%20Walking%20Dead%20001/The-Walking-Dead-Comic-001.jpg)

```
$ twd -h

  Usage: twd [options]

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -i, --issue <n>         The issue number at which to start. If none is included, it will start from the last issue downloaded
    -e, --end <n>           The issue at which to stop
    -n, --no-walk           Only get the single issue
    -d, --directory <path>  The directory in which you wish to put the comic files. Supersedes saved path.
    -s, --save              Save the directory configuration
```

## Installation

```
$ npm i -g twd-comic-downloader
```
