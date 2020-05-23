"use strict";

const assert = require("chai").assert;
const validate = require("jsonfeed-validator");

const { configFunction } = require("../index.js");

const testConfig = {
  addNunjucksAsyncShortcode: (x, y) => true,
};

const testOptions = {
  content_html: true,
};

describe("configFunction", () => {
  it("should be a function", () => {
    assert.isFunction(configFunction, "is a function");
  });

  it("that returns true when called", () => {
    const result = configFunction(testConfig, testOptions);
    assert.isUndefined(result, "result");
  });

  it("that needs to be passed one of config_html or content_text", () => {
    assert.throws(() => {
      configFunction(testConfig, { content_html: false, content_text: false });
    }, "you must specify at least one of content_html or content_text in the eleventy-plugin-json-feed options.");
  });

  it("that works when passed config_html", () => {
    const result = configFunction(testConfig, {
      content_html: true,
      content_text: false,
    });
    assert.isUndefined(result, "result");
  });

  it("that works when passed config_text", () => {
    const result = configFunction(testConfig, {
      content_html: false,
      content_text: true,
    });
    assert.isUndefined(result, "result");
  });
});
