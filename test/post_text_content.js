"use strict";

const assert = require("chai").assert;
const validate = require("jsonfeed-validator");

const { buildJsonFeed } = require("../index.js");

const testMeta = {
  title: "my blog",
  home_page_url: "https://my.blog",
};

const testPosts = [
  {
    data: {
      tags: ["posts"],
      title: "the last day of the before times",
    },
    date: new Date("2020-03-13T07:00:00.000Z"),
    url: "/entries/2020/03/13/",
    templateContent:
      '<p>test content <a href="index.html">link</a><a href="#foo">rel</a></p>',
  },
];

describe("jsonFeed post content_text", () => {
  const jsonFeed = buildJsonFeed({
    banner_image_metadata_field_name: "banner_image",
    content_html: false,
    content_text: true,
    filter_posts_tag: true,
    image_metadata_field_name: "image",
    summary_metadata_field_name: "summary",
    tags_metadata_field_name: "tags",
  });

  it("generates a feed with content_text", async () => {
    const feed = await jsonFeed(testPosts, testMeta);
    const json = JSON.parse(feed);
    assert.equal(json.items[0].content_text, "test content linkrel");
  });
});

describe("jsonFeed post content_html + content_text", () => {
  const jsonFeed = buildJsonFeed({
    banner_image_metadata_field_name: "banner_image",
    content_html: true,
    content_text: true,
    filter_posts_tag: true,
    image_metadata_field_name: "image",
    summary_metadata_field_name: "summary",
    tags_metadata_field_name: "tags",
  });

  it("generates a feed with content_text", async () => {
    const feed = await jsonFeed(testPosts, testMeta);
    const json = JSON.parse(feed);
    assert.equal(json.items[0].content_text, "test content linkrel");
    assert.equal(
      json.items[0].content_html,
      '<p>test content <a href="https://my.blog/entries/2020/03/13/index.html">link</a><a href="#foo">rel</a></p>'
    );
  });
});
