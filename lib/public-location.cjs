"use strict";

/**
 * Hostinger binds Next to 0.0.0.0:$PORT. Next then builds Location headers
 * like https://0.0.0.0:3000/admin — browsers reject that (ERR_ADDRESS_INVALID).
 * Strip bind/loopback hosts down to a same-origin path.
 */
const BIND_HOSTS = new Set(["0.0.0.0", "::", "::1", "127.0.0.1", "localhost"]);

function toPublicLocation(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || raw.length === 0) return value;
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return value;
  }
  if (!BIND_HOSTS.has(parsed.hostname)) return value;
  return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
}

function patchOutgoingRedirects(res) {
  if (res.__certkoLocationPatched) return;
  res.__certkoLocationPatched = true;

  const origSetHeader = res.setHeader.bind(res);
  res.setHeader = function patchedSetHeader(name, value) {
    if (String(name).toLowerCase() === "location") {
      value = toPublicLocation(value);
    }
    return origSetHeader(name, value);
  };

  if (typeof res.appendHeader === "function") {
    const origAppend = res.appendHeader.bind(res);
    res.appendHeader = function patchedAppendHeader(name, value) {
      if (String(name).toLowerCase() === "location") {
        value = toPublicLocation(value);
      }
      return origAppend(name, value);
    };
  }

  const origWriteHead = res.writeHead.bind(res);
  res.writeHead = function patchedWriteHead(statusCode, reason, headers) {
    let hdrs = headers;
    let why = reason;
    if (reason && typeof reason === "object" && !Array.isArray(reason)) {
      hdrs = reason;
      why = undefined;
    }
    if (hdrs && typeof hdrs === "object" && !Array.isArray(hdrs)) {
      for (const key of Object.keys(hdrs)) {
        if (key.toLowerCase() === "location") {
          hdrs[key] = toPublicLocation(hdrs[key]);
        }
      }
    }
    if (why === undefined) return origWriteHead(statusCode, hdrs);
    return origWriteHead(statusCode, why, hdrs);
  };
}

module.exports = { toPublicLocation, patchOutgoingRedirects };
