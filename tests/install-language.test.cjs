const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../install-page.js'), 'utf8');
function harness(language = 'en', options = {}) {
  const events = {}, clicks = {}, writes = [];
  const button = {hidden: true, addEventListener: (type, fn) => { clicks[type] = fn; }};
  const status = {textContent: 'Instructions'};
  const document = {
    documentElement: {lang: language},
    getElementById: id => options.missing === id ? null : id === 'install' ? button : status,
    set cookie(_) { assert.fail('Installation must not write cookies'); },
  };
  vm.runInNewContext(source, {
    document,
    addEventListener: (type, fn) => { events[type] = fn; },
    matchMedia: () => ({matches: !!options.standalone}),
    navigator: {standalone: !!options.appleStandalone},
    localStorage: {
      setItem: (key, value) => {
        if (options.storageFailure) throw Error('Storage unavailable');
        writes.push([key, value]);
      },
      getItem: () => assert.fail('Installation must not read notes or preferences'),
    },
  });
  let prompted = 0, prevented = 0;
  const offer = (outcome = 'accepted', choice) => events.beforeinstallprompt({
    preventDefault: () => { prevented++; },
    prompt: async () => { prompted++; if (options.promptFailure) throw Error('Prompt unavailable'); },
    userChoice: choice || Promise.resolve({outcome}),
  });
  return {button, status, writes, events, offer, click: () => clicks.click(),
    counts: () => ({prompted, prevented})};
}

test('eight installation languages persist only on explicit install and distinguish all five states', async () => {
  const accepted = new Set(), dismissed = new Set(), errors = new Set(), installed = new Set(), standalone = new Set();
  for (const locale of ['es', 'en', 'de', 'fr', 'ja', 'pt', 'it', 'ko']) {
    const h = harness(locale);
    assert.deepEqual(h.writes, []);
    h.offer();
    assert.equal(h.button.hidden, false);
    assert.deepEqual(h.writes, [], 'Browser availability is not a user language choice');
    await h.click();
    const acceptedStatus = h.status.textContent;
    accepted.add(acceptedStatus);
    assert.equal(h.button.hidden, true);
    assert.deepEqual(h.writes, [['pp:lang', locale]]);
    await h.click();
    assert.deepEqual(h.counts(), {prompted: 1, prevented: 1}, 'A native prompt is consumed once');
    h.events.appinstalled();
    installed.add(h.status.textContent);

    const cancel = harness(locale); cancel.offer('dismissed'); await cancel.click();
    dismissed.add(cancel.status.textContent);
    const failure = harness(locale, {promptFailure: true}); failure.offer(); await failure.click();
    errors.add(failure.status.textContent);
    const app = harness(locale, {standalone: true}); standalone.add(app.status.textContent);
    assert.deepEqual(app.writes, []);
    assert.equal(new Set([acceptedStatus, h.status.textContent, cancel.status.textContent, failure.status.textContent, app.status.textContent]).size, 5, 'Acceptance, cancellation, failure, completed installation and app mode are distinct');
  }
  for (const group of [accepted, dismissed, errors, installed, standalone]) assert.equal(group.size, 8, 'Every status has eight localized messages');
  assert.equal(harness('en', {appleStandalone: true}).status.textContent, 'You are using PostisPop in app mode.');
});

test('completed installation is not overwritten by a late prompt result', async () => {
  const h = harness('de');
  let resolveChoice;
  h.offer('accepted', new Promise(resolve => { resolveChoice = resolve; }));
  const pending = h.click();
  h.events.appinstalled();
  resolveChoice({outcome: 'accepted'});
  await pending;
  assert.equal(h.status.textContent, 'PostisPop wurde installiert.');
  assert.equal(h.button.hidden, true);
});

test('missing controls do not intercept native install events', () => {
  for (const missing of ['install', 'install-status']) assert.deepEqual(harness('fr', {missing}).events, {});
});

test('unknown language and unavailable storage cannot break installation', async () => {
  for (const locale of ['__proto__', 'constructor', 'en-US', '<script>']) {
    const h = harness(locale); h.offer(); await h.click();
    assert.deepEqual(h.writes, [], 'Unsupported language must not replace the saved preference');
    assert.equal(h.status.textContent, 'Solicitud aceptada. El navegador completará la instalación.');
  }
  const h = harness('ko', {storageFailure: true}); h.offer(); await h.click();
  assert.equal(h.counts().prompted, 1);
  assert.equal(h.status.textContent, '요청이 수락되었습니다. 브라우저가 설치를 완료합니다.');
});
