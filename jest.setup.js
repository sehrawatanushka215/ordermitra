// Adds custom matchers like toBeInTheDocument(), toHaveClass(), etc.
require("@testing-library/jest-dom");

// jsdom doesn't expose the web streams API that the "ai" package's transitive
// deps (eventsource-parser, provider-utils) touch at import time.
const { TextEncoder, TextDecoder } = require("util");
const { ReadableStream, WritableStream, TransformStream } = require("stream/web");

Object.assign(globalThis, {
  TextEncoder,
  TextDecoder,
  ReadableStream,
  WritableStream,
  TransformStream,
});
