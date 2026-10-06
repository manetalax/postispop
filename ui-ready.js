// DOM enhancements must never race React's first hydration commit.
export function whenReactReady(callback) {
  if (document.documentElement.dataset.ppReady === 'true') {
    callback();
    return;
  }
  window.addEventListener('postispop:ui-ready', callback, { once: true });
}
