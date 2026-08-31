#!/usr/bin/env node
/**
 * Hostinger Node.js Web Apps often look for `server.js` as the app entry.
 * Always boot the custom server (binds $PORT immediately + CMS warm-gate).
 * Prefer hPanel Start = `npm start` — this file is the fallback entry.
 */
"use strict";
require("./server.cjs");
