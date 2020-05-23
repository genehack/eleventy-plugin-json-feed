"use strict";

const assert = require("chai").assert;
const validate = require("jsonfeed-validator");

const { buildJsonFeed } = require("../index.js");

const jsonFeed = buildJsonFeed({
  banner_image_metadata_field_name: "banner_image",
  content_html: true,
  content_text: false,
  filter_posts_tag: true,
  image_metadata_field_name: "image",
  summary_metadata_field_name: "summary",
  tags_metadata_field_name: "tags",
});

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

describe("jsonFeed post metadata validation", () => {
  it("requires optional external_url to be a url", async () => {
    const thesePosts = [{ ...testPosts[0], data: { external_url: "foo" } }];
    jsonFeed(thesePosts, testMeta)
      .then(() => assert.fail("fail"))
      .catch((e) => assert.equal(e.message, "post external_url must be a URL"));
  });

  it("requires optional summary be a string", async () => {
    const thesePosts = [{ ...testPosts[0], data: { summary: 2 } }];
    jsonFeed(thesePosts, testMeta)
      .then(() => assert.fail("fail"))
      .catch((e) => assert.equal(e.message, "post summary must be a string"));
  });

  it("requires optional image be a URL", async () => {
    const thesePosts = [{ ...testPosts[0], data: { image: "foo" } }];
    jsonFeed(thesePosts, testMeta)
      .then(() => assert.fail("fail"))
      .catch((e) => assert.equal(e.message, "post image must be a URL"));
  });

  it("requires optional banner_image be a string", async () => {
    const thesePosts = [{ ...testPosts[0], data: { banner_image: "foo" } }];
    jsonFeed(thesePosts, testMeta)
      .then(() => assert.fail("fail"))
      .catch((e) => assert.equal(e.message, "post banner_image must be a URL"));
  });

  it("requires options tags to be an array", async () => {
    const thesePosts = [{ ...testPosts[0], data: { tags: "foo" } }];
    jsonFeed(thesePosts, testMeta)
      .then(() => assert.fail("fail"))
      .catch((e) => assert.equal(e.message, "post tags must be an array"));
  });

  it("requires options tags to be an array of strings", async () => {
    const thesePosts = [{ ...testPosts[0], data: { tags: ["foo", 2, "bar"] } }];
    jsonFeed(thesePosts, testMeta)
      .then(() => assert.fail("fail"))
      .catch((e) => assert.equal(e.message, "all post tags must be strings"));
  });

  it("works when tags is an array of strings", async () => {
    const thesePosts = [{ ...testPosts[0], data: { tags: ["foo", "bar"] } }];
    const feed = await jsonFeed(thesePosts, testMeta);
    const json = JSON.parse(feed);
    assert.deepEqual(json.items[0].tags, ["foo", "bar"]);
  });

  it("strips 'posts' from tags array", async () => {
    const thesePosts = [
      { ...testPosts[0], data: { tags: ["foo", "posts", "bar"] } },
    ];
    const feed = await jsonFeed(thesePosts, testMeta);
    const json = JSON.parse(feed);
    assert.deepEqual(json.items[0].tags, ["foo", "bar"]);
  });

  it("doesn't strip 'posts' from tags array when filter_posts_tag is false", async () => {
    const jsonFeed = buildJsonFeed({
      banner_image_metadata_field_name: "banner_image",
      content_html: true,
      content_text: false,
      filter_posts_tag: false,
      image_metadata_field_name: "image",
      summary_metadata_field_name: "summary",
      tags_metadata_field_name: "tags",
    });
    const thesePosts = [
      { ...testPosts[0], data: { tags: ["foo", "posts", "bar"] } },
    ];
    const feed = await jsonFeed(thesePosts, testMeta);
    const json = JSON.parse(feed);
    assert.deepEqual(json.items[0].tags, ["foo", "posts", "bar"]);
  });
});
