// Polyfill CSS.escape which jsdom doesn't implement
if (typeof CSS === 'undefined' || typeof CSS.escape === 'undefined') {
  // @ts-expect-error - polyfilling missing jsdom global
  globalThis.CSS = {
    escape: (value: string) =>
      value.replace(/([^\w-])/g, '\\$1'),
  };
}