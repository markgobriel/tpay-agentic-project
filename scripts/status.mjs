#!/usr/bin/env node
import fs from "node:fs";
import { formatStatus } from "./status-format.mjs";

const state = JSON.parse(fs.readFileSync(".agent/state.json", "utf8"));
const backlog = JSON.parse(fs.readFileSync("backlog/tasks.json", "utf8"));

console.log(formatStatus(state, backlog));
