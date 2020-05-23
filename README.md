# eleventy-plugin-json-feed

An [Eleventy](https://github.com/11ty/eleventy) plugin for generating
a [JSON Feed](https://jsonfeed.org/) using the Nunjucks templating engine.

## Installation

Available on [npm](https://www.npmjs.com/package/eleventy-plugin-json-feed).

```
npm install eleventy-plugin-json-feed --save
```

Open up your Eleventy config file, `require` the plugin, and then use
`addPlugin` to activate and configure it:

```
const pluginJsonFeed = require("eleventy-plugin-json-feed");
module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginJsonFeed);
};
```

Copy the provided sample feed template into your working directory and
then customize it for your site:

```
cp node_modules/eleventy-plugin-json-feed/sample/json.feed.njk
$EDITOR ./json.feed.njk
```

Note that you will need to have `"njk"` listed in the
`templateFormats` list in your `.eleventy.js`.

## Options

This plugin currently provides no user configurable options.

## Example

This plugin makes a `jsonFeed` shortcode available to the Nunjucks
templater. It expects to be called like this:

```
{% jsonFeed collections.posts, metadata, 10 %}
```

The third argument is the number of most recent posts to be included
in the feed. If not provided, it defaults to 10.

## Contributing

Patches and pull requests welcome.

## License

MIT © John SJ Anderson
