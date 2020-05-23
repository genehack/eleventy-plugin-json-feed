"use strict";

const assert = require("chai").assert;
const validate = require("jsonfeed-validator");

const { buildJsonFeed } = require("../index.js");

const jsonFeed = buildJsonFeed({ content_html: true });

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
    templateContent: "<p>test content</p>",
  },
];

describe("buildJsonFeed metadata validation", () => {
  let feed = "";
  let json = "";

  // test required fields: title, home_page_url
  it("requires a title", async () => {
    jsonFeed(testPosts, { home_page_url: "https://my.blog" }).catch((e) =>
      assert.equal(e.message, "JSON feed requires a title")
    );
  });

  it("requires a home_page_url", async () => {
    jsonFeed(testPosts, { title: "my.blog" })
      .then(() => assert.fail("fail"))
      .catch((e) =>
        assert.equal(
          e.message,
          "home_page_url is required by eleventy-plugin-json-feed"
        )
      );
  });

  const optionalUrlFields = [
    "home_page_url",
    "feed_url",
    "next_url",
    "icon",
    "favicon",
  ];

  it("requires various optional fields to be URLs", () => {
    for (const field of optionalUrlFields) {
      const thisTestMeta = { ...testMeta };
      thisTestMeta[field] = "foo";
      jsonFeed(testPosts, thisTestMeta)
        .then(() => assert.fail("fail"))
        .catch((e) => assert.equal(e.message, `${field} must be a URL`));
    }
  });

  const optionalStringFields = ["description", "user_comment"];

  it("requires various optional fields to be strings", async () => {
    for (const field of optionalStringFields) {
      const thisTestMeta = { ...testMeta };
      thisTestMeta[field] = 2;
      jsonFeed(testPosts, thisTestMeta)
        .then(() => assert.fail("fail"))
        .catch((e) => assert.equal(e.message, `${field} must be a string`));
    }
  });

  it("requires expired to be a boolean", async () => {
    jsonFeed(testPosts, { ...testMeta, expired: 2 })
      .then(() => assert.fail("fail"))
      .catch((e) =>
        assert.equal(e.message, `expired field must be a boolean value`)
      );
  });

  it("works if expired is a boolean", async () => {
    let feed = await jsonFeed(testPosts, { ...testMeta, expired: true });
    assert.isString(feed, "is a string");
  });

  it("requires hubs to be an array", async () => {
    jsonFeed(testPosts, { ...testMeta, hubs: true })
      .then(() => assert.fail("fail"))
      .catch((e) => assert.equal(e.message, `hubs must be an array`));
  });

  it("requires hubs to be an array of objects", async () => {
    jsonFeed(testPosts, { ...testMeta, hubs: ["true"] })
      .then(() => assert.fail("fail"))
      .catch((e) =>
        assert.equal(e.message, `hubs must be an array of objects`)
      );
  });

  it("works when hubs is an array of objects", async () => {
    let feed = await jsonFeed(testPosts, { ...testMeta, hubs: [{}, {}] });
    assert.isString(feed, "is a string");
  });
});
