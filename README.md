# eleventy-plugin-json-feed

An [Eleventy](https://github.com/11ty/eleventy) plugin for generating
a [JSON Feed](https://jsonfeed.org/) using the Nunjucks templating engine.

## Installation

Available on [npm](https://www.npmjs.com/package/eleventy-plugin-json-feed).

```bash
npm install --save eleventy-plugin-json-feed
```

## Using the plugin

Open up your Eleventy config file, `require` the plugin, and then use
`addPlugin` to activate and configure it:

```js
const pluginJsonFeed = require("eleventy-plugin-json-feed");
module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginJsonFeed, options);
};
```

Copy the provided sample feed template into your working directory and
then customize it for your site:

```bash
cp node_modules/eleventy-plugin-json-feed/sample/json.feed.njk
$EDITOR ./json.feed.njk
```

Note that you will need to have `"njk"` listed in the
`templateFormats` list in your `.eleventy.js`.

## How this plugin works

This plugin makes a `jsonFeed` shortcode available to the Nunjucks
templater. It expects to be called like this:

```twig
{% jsonFeed collections.posts, metadata, 10 %}
```

The third argument is the number of most recent posts to be included
in the feed. If not provided, it defaults to 10. If `0` is provided,
all posts will be included in the generated feed.

The sample template at `sample/json.feed.njk` should provide a good
starting point for almost every use case.

## Options

You can modify the behavior of this plugin by passing an options
object as the second argument to `addPlugin`. The default options set
by the plugin are:

```js
const defaultOptions = {
  banner_image_metadata_field_name: "banner_image",
  content_html: true,
  content_text: false,
  filter_posts_tag: true,
  image_metadata_field_name: "image",
  summary_metadata_field_name: "summary",
  tags_metadata_field_name: "tags",
};
```

* `banner_image_metadata_field_name`: will be used as the name of the
  YAML front matter attribute where the URL of an banner image is
  stored. If found, the value of this attribute will be used to set
  the `item.banner_image` value for the corresponding post item in the
  generated feed. Note that this field, if present, must contain a
  string value, or an error will be thrown.
* `content_html`: boolean indicating if post HTML should be included
  in the feed.
* `content_text`: boolean indicating if a text version of post content
  should be included in the feed.
* `filter_posts_tag`: boolean indicating if a tag of `posts` should be
  filtered out of the `tags` metadata if it is present.
* `image_metadata_field_name`: will be used as the name of the YAML
  front matter attribute where the URL of an image associated with the
  post is stored. If found, the value of this attribute will be used
  to set the `item.image` value for the corresponding post item in the
  generated feed. Note that this field, if present, must contain a
  string value, or an error will be thrown.
* `summary_metadata_field_name`: will be used as the name of the YAML
  front matter attribute where the short summary of a post is stored.
  If found, the value of this attribute will be used to set the
  `item.summary` value for the corresponding post item in the
  generated feed. Note that this field, if present, must contain a
  string value, or an error will be thrown.
* `tags_metadata_field_name`: will be used as the name of the YAML
  front matter attribute where an array of tags categorizing a post is
  stored. If found, the value of this attribute will be used to set
  the `item.summary** value for the corresponding post item in the
  generated feed. Note that this field must contain an array of
  strings or an error will be thrown.

**IMPORTANT NOTE:** At least one of `content_html` and `content_text`
_MUST_ be true, or an error will be thrown. It is allowed to set them
both to true.

### Example options

Say you've got a blog and want to generate a JSON feed containing the
HTML representation of your posts. You sometimes use a
`social_media_image` key in your front matter when you want to feature
an image on social media, and each post has an attribute called
`categories` that's an array of category names. You have an attribute
called `description` that's a short synopsis of your post content.

If that's the case, you'd want to load this plugin like this:

```js
const pluginJsonFeed = require("eleventy-plugin-json-feed");
module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginJsonFeed, {
    content_html: true,
    image_metadata_field_name: "social_media_image",
    summary_metadata_field_name: "description",
    tags_metadata_field_name: "categories"
  });
};
```

## Icon

If you'd like to display a JSON Feed icon on your site, I recommend the
[one](https://pfefferle.dev/openwebicons/icons/#openwebicons-jsonfeed)
in [openwebicons](https://pfefferle.dev/openwebicons/)

## Testing & Validation

The test suite can be run with `npm test`. An ASCII coverage report
can be generated with `npm run cover`; an HTML version can be
generated with `npm run html-cover`.

Feeds generated with this module should correctly validate with
[`jsonfeed-validator`](https://www.npmjs.com/package/jsonfeed-validator).

## Contributing

Patches and pull requests welcome.

## License

MIT © John SJ Anderson
