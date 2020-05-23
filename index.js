"use strict";

const { isArray, isBoolean, isEmpty, isObject, isString } = require("lodash");
const posthtml = require("posthtml");
const posthtmlUrls = require("posthtml-urls");
const striptags = require("striptags");
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

function _require_string(field, title) {
  if (!isString(field)) {
    throw new Error(`${title} must be a string`);
  }
  return field;
}

function _validate_author(author) {
  if (!isObject(author)) {
    throw new Error("author should be an object");
  }

  let retAuthor = {};

  // all of these are optional and must be strings
  const possibleFields = ["name", "url", "avatar"];

  for (const field of possibleFields) {
    if (author[field]) {
      _require_string(author[field], `author ${field}`);
    }
    retAuthor[field] = author[field];
  }

  // author must contain at least one key
  if (isEmpty(retAuthor)) {
    throw new Error(
      "must provide at least one of name, url, or avatar for author"
    );
  }

  return retAuthor;
}

const defaultOptions = {
  banner_image_metadata_field_name: "banner_image",
  content_html: true,
  content_text: false,
  filter_posts_tag: true,
  image_metadata_field_name: "image",
  summary_metadata_field_name: "summary",
  tags_metadata_field_name: "tags",
};

module.exports = {
  configFunction: (eleventyConfig, userOptions) => {
    const options = { ...defaultOptions, ...userOptions };

    // at least one of these must be true or nothing is gonna work
    if (!options.content_html && !options.content_text) {
      throw new Error(
        "you must specify at least one of content_html or content_text in the eleventy-plugin-json-feed options."
      );
    }

    eleventyConfig.addNunjucksAsyncShortcode(
      "jsonFeed",
      async (allPosts, meta, n = 10) => {
        // grab the last `n` posts
        const offset = n < 0 ? n : 0 - n;
        const posts = allPosts.slice(offset).reverse();

        // version is required. we are generating a version 1 feed
        let feed = {
          version: "https://jsonfeed.org/version/1",
        };

        // title is required and must be a string
        if (!meta.title) {
          throw new Error("JSON feed requires a title");
        }
        feed.title = _require_string(meta.title, "feed title");

        // home_page_url is optional and must be a string
        if (!meta.home_page_url) {
          throw new Error(
            "home_page_url is required by eleventy-plugin-json-feed"
          );
        }
        feed.home_page_url = _require_string(
          meta.home_page_url,
          "home_page_url"
        );

        // feed_url is optional and must be a string
        if (meta.feed_url) {
          feed.feed_url = _require_string(meta.feed_url, "feed_url");
        }

        // description is optional and must be a string
        if (meta.description) {
          feed.description = _require_string(meta.description, "description");
        }

        // user_comment is optional and must be a string
        if (meta.user_comment) {
          feed.user_comment = _require_string(
            meta.user_comment,
            "user_comment"
          );
        }

        // next_url is optional and must be a string
        if (meta.next_url) {
          feed.next_url = _require_string(meta.next_url, "next_url");
        }

        // icon is optional and must be a string
        if (meta.icon) {
          feed.icon = _require_string(meta.icon, "meta_icon");
        }

        // favicon is optional and must be a string
        if (meta.favicon) {
          feed.favicon = _require_string(meta.favicon, "favicon");
        }

        // author is optional but must follow the rules if present
        if (meta.author) {
          feed.author = _validate_author(meta.author);
        }

        // expired is optional but should be a bool
        if (meta.expired) {
          if (!isBoolean(meta.expired)) {
            throw new Error("expired field must be a boolean value");
          }
          feed.expired = meta.expired;
        }

        // hubs is an optional array of objects
        if (meta.hubs) {
          if (!isArray(meta.hubs)) {
            throw new Error("hubs must be an array");
          }

          if (!meta.hubs.every((x) => isObject(x))) {
            throw new Error("hubs must be an array of objects");
          }

          feed.hubs = meta.hubs;
        }

        // items is required
        feed.items = [];

        for (const post of posts) {
          const absPostUrl = _absUrl(post.url, meta.home_page_url);

          const item = {
            id: absPostUrl, // required, string
            url: absPostUrl, // optional, string
          };

          // external_url is optional and must be a string
          if (post.data.external_url) {
            item.external_url = _require_string(
              post.data.external_url,
              "post external_url"
            );
          }

          // title is optional and must be a string
          if (post.data.title) {
            item.title = _require_string(post.data.title, "post title");
          }

          // content_html and content_text are each optional strings.
          // at least one must be present. both may be present. (and
          // we already checked that at least one content_* option was
          // set.)
          if (options.content_html) {
            item.content_html = await _prepPostForJsonFeed(
              post.templateContent,
              absPostUrl
            );
          }

          if (options.content_text) {
            let html = item.content_html
              ? item.content_html
              : await _prepPostForJsonFeed(post.templateContent, absPostUrl);

            item.content_text = striptags(html);
          }

          // summary is optional and must be a string
          if (post.data[options.summary_metadata_field_name]) {
            item.summary = _require_string(
              post.data[options.summary_metadata_field_name],
              `post ${options.summary_metadata_field_name}`
            );
          }

          // image is optional and must be a string
          if (post.data[options.image_metadata_field_name]) {
            item.image = _require_string(
              post.data[options.image_metadata_field_name],
              `post ${options.image_metadata_field_name}`
            );
          }

          // banner_image is optional and must be a string
          if (post.data[options.banner_image_metadata_field_name]) {
            item.banner_image = _require_string(
              post.data[options.banner_image_metadata_field_name],
              `post ${options.banner_image_metadata_field_name}`
            );
          }

          // date_published is optional and should be a Date
          // but we'll always have a post.date, so let's use it
          item.date_published = post.date.toISOString();

          // TODO figure out if item.date_modified support is possible
          // to support

          // post authors validate the same as feed authors
          if (post.data.author) {
            item.author = _validate_author(post.data.author);
          }

          // tags is an optional array of strings
          if (post.data[options.tags_metadata_field_name]) {
            // just to make it shorter
            const tagField = options.tags_metadata_field_name;

            if (!isArray(post.data[tagField])) {
              throw new Error(`post ${tagField} must be an array.`);
            }

            if (!post.data[tagField].every((x) => isString(x))) {
              throw new Error(`all post ${tagField} must be strings.`);
            }

            let tags = post.data[tagField];
            if (options.filter_posts_tag) {
              tags = tags.filter(x=>x!=="posts");
            }

            if (!isEmpty(tags)) {
              item.tags = tags;
            }
          }

          feed.items.push(item);
        }

        return JSON.stringify(feed, null, 2);
      }
    );
  },
};
