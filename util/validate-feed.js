#! /usr/bin/env node

"use strict";

const fs = require("fs");
const { isEmpty } = require("lodash");
const validate = require("jsonfeed-validator");

const file = process.argv[2];
if (!file) {
  console.error("Must provide file to validate!");
}

const feed = JSON.parse(fs.readFileSync(file, "utf8"));

const results = validate(feed);

if (isEmpty(results)) {
  process.stdout.write("Feed is valid.\n");
  process.exit(0);
} else {
  process.stdout.write("Feed is invalid. See below:\n");
  console.log(results);
  process.exit(1);
}
