
# <%= _.titleize(name) %>


> The author of [Eskimo](http://eskimo.io) highly recommends reading [ZAG by Marty Neumeier]() and adding an onliness statement here.  After completed, you can delete this blockquote from the Markdown file.

> "What's the one thing that makes your brand both different and compelling?  What makes you the 'only'?  Complete a simple onliness statement.  Add detail by answering what, how, who, where, when, and why." &ndash; Marty Neumeier

> (e.g. "Eskimo is the only boilerplate for Node.js developers who want a proven, quick, and easy way to build rapid MVP's in 0-60 days.")

**TODO**: <%= _.titleize(name) %> is the only &hellip; that &hellip;


# Install

```bash
git clone git@github.com:yourname/<%= _.slugify(name) %>.git
cd <%= _.slugify(name) %>
npm install
```


# Configuration

Configuration (e.g. database and logging setting per environment) is stored in "boot/config.js".


# Usage

## Development

Default:

```bash
node app
```

Debugging:

```bash
DEBUG=* node app
```

## Production

> Production environment requires that you have built out the "assets/dist" folder.

Build project with [gulp.js](http://gulpjs.com/):

```bash
npm install -g gulp
gulp build
```

> Now you can proceed to running in production mode with optional `recluster` support.

Default:

```bash
sudo NODE_ENV=production node app
```

[Recluster](https://github.com/doxout/recluster):

```bash
sudo NODE_ENV=production node cluster
# kill -s SIGUSR2 %d
```


# Tests

```bash
npm test
```


# Contributors

See "package.json" for a list of contributors.  Learn how to add contributors using [npm's docs](https://www.npmjs.org/doc/files/package.json.html#people-fields-author-contributors).


# License

**TODO**: [Choose a license](http://choosealicense.com/) and insert it here.


