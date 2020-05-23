"use strict";

const posthtml = require("posthtml");
const posthtmlUrls = require("posthtml-urls");
const { URL } = require("url");

function _absUrl(url, base) {
  try {
    return new URL(url, base).toString();
  } catch (e) {
    return url;
  }
}

async function _prepPostForJsonFeed(content, base) {
  const munger = posthtml().use(
    posthtmlUrls({
      eachURL: function (url, attr, element) {
        url = url.trim();

        // #anchor in-page
        if (url.indexOf("#") === 0) {
          return url;
        }

        return _absUrl(url, base);
      },
    })
  );

  const mungedContent = await munger.process(content);

  return mungedContent.html.replace(/\n/g, " ");
}

module.exports = {
  configFunction: (eleventyConfig, userOptions) => {
    eleventyConfig.addNunjucksAsyncShortcode(
      "jsonFeed",
      async (allPosts, meta, n = 10) => {
        // grab the last `n` posts
        const offset = n < 0 ? n : 0 - n;
        const posts = allPosts.slice(offset).reverse();

        let feed = {
          version: "https://jsonfeed.org/version/1",
        };

        // TODO there's a better way to do this
        if (meta.title) feed.title = meta.title;
        if (meta.url) feed.home_page_url = meta.url;
        if (meta.feed.url) feed.feed_url = meta.feed.url;
        if (meta.description) feed.description = meta.description;
        if (meta.icon) feed.icon = meta.icon;
        if (meta.favicon) feed.favicon = meta.favicon;

        if (
          meta.author.name ||
          meta.author.url ||
          meta.author.avatar ||
          meta.url
        ) {
          feed.author = {};

          if (meta.author.name) feed.author.name = meta.author.name;

          if (meta.author.url) feed.author.url = meta.author.url;
          else if (meta.url) feed.author.url = meta.url;

          if (meta.author.avatar) feed.author.avatar = meta.author.avatar;
        }

        feed.items = [];

        for (const post of posts) {
          const absPostUrl = _absUrl(post.url, meta.url);
          const content_html = await _prepPostForJsonFeed(
            post.templateContent,
            absPostUrl
          );

          feed.items.push({
            id: absPostUrl,
            title: post.data.title,
            summary: post.data.description,
            date_published: post.date.toISOString(),
            url: absPostUrl,
            content_html,
          });
        }

        return JSON.stringify(feed, null, 2);
      }
    );
  },
};
