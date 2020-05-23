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
  {
    data: {
      tags: ["posts"],
      title: "last post",
    },
    date: new Date("2020-03-12T07:00:00.000Z"),
    url: "/entries/2020/03/12/",
    templateContent: "<p>last post</p>",
  },
];

describe("buildJsonFeed", () => {
  let feed = "";
  let json = "";

  it("should be a function", () => {
    assert.isFunction(buildJsonFeed, "is a function");
  });

  const jsonFeed = buildJsonFeed({ content_html: true });
  it("that returns a function when called", () => {
    assert.isFunction(jsonFeed, "is a function");
  });

  it("should return a feed if configured and called correctly", async () => {
    feed = await jsonFeed(testPosts, testMeta);
    assert.isString(feed, "is an string");
  });

  it("that feed should parse into an object", () => {
    json = JSON.parse(feed);
    assert.isObject(json, "that parses into an object");
  });

  it("and that object should be a valid JSON feed", () => {
    assert.ok(validate(json));
  });

  it("will return a feed with posts from the other end if given a negative offset", async () => {
    const reverse_feed = await jsonFeed(testPosts, testMeta, -1);
    assert.isString(reverse_feed, "is an string");

    const reverse_json = JSON.parse(reverse_feed);
    assert.ok(validate(reverse_json));

    assert.equal(reverse_json.items[0].content_html, "<p>last post</p>");
  });
});
