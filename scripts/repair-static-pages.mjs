// Legal documents are complete static HTML. Their recovered vinext router has
// no server/router context and intercepts ordinary links with a runtime error.
export function repairLegalPage(html) {
  return html
    .replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (script, attributes) =>
      /\btype=["']application\/ld\+json["']/i.test(attributes) ? script : '')
    .replace(/<link\b(?=[^>]*\brel=["']modulepreload["'])[^>]*>/gi, '')
    .replace(/href=(["'])\/(privacy|terms|legal|cookies)\1/g, 'href=$1/$2.html$1');
}
