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
    templateContent:
      '<p>test content <a href="index.html">link</a><a href="#foo">rel</a></p>',
  },
];

describe("buildJsonFeed post author validation", () => {
  let feed = "";
  let json = "";

  it("requires author be an object", async () => {
    const thesePosts = [{ ...testPosts[0], data: { author: "foo" } }];
    jsonFeed(thesePosts, testMeta)
      .then(() => assert.fail("fail"))
      .catch((e) => assert.equal(e.message, "author should be an object"));
  });

  it("requires author be an object with at least one of name, url, avatar", async () => {
    const thesePosts = [{ ...testPosts[0], data: { author: {} } }];
    jsonFeed(thesePosts, testMeta)
      .then(() => assert.fail("fail"))
      .catch((e) =>
        assert.equal(
          e.message,
          "must provide at least one of name, url, or avatar for author"
        )
      );
  });

  it("requires author name to be a string", async () => {
    const thesePosts = [{ ...testPosts[0], data: { author: { name: 2 } } }];
    jsonFeed(thesePosts, testMeta)
      .then(() => assert.fail("fail"))
      .catch((e) => assert.equal(e.message, "author name must be a string"));
  });

  it("requires author URL to be a url", async () => {
    const thesePosts = [
      { ...testPosts[0], data: { author: { name: "Jimbob", url: "foo" } } },
    ];
    jsonFeed(thesePosts, testMeta)
      .then(() => assert.fail("fail"))
      .catch((e) => assert.equal(e.message, "author url must be a URL"));
  });

  it("requires author avatar to be a url", async () => {
    const thesePosts = [
      {
        ...testPosts[0],
        data: {
          author: {
            name: "Jimbob",
            url: "https://my.blog/json.feed",
            avatar: "foo",
          },
        },
      },
    ];
    jsonFeed(thesePosts, testMeta)
      .then(() => assert.fail("fail"))
      .catch((e) => assert.equal(e.message, "author avatar must be a URL"));
  });

  it("works when given everything", async () => {
    const thesePosts = [
      {
        ...testPosts[0],
        data: {
          author: {
            name: "Jimbob",
            url: "https://my.blog/json.feed",
            avatar: "https://my.blog/author_avatar.png",
          },
        },
      },
    ];
    const feed = await jsonFeed(thesePosts, testMeta);
  });
});
