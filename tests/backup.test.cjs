const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, rmSync, existsSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { createHash } = require('node:crypto');
const { pathToFileURL } = require('node:url');
const script = resolve(__dirname, '../scripts/backup-supabase.mjs');
const secret = 'TEST_SECRET_MUST_NOT_APPEAR';
const invoke = async (args, extra = {}) => {
  const keys = ['POSTISPOP_BACKUP_AUTHORIZED', 'SUPABASE_DB_URL'];
  const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  Object.assign(process.env, extra);
  try {
    const { main } = await import(pathToFileURL(script));
    await main(args);
    return { code: 0, text: '' };
  } catch (error) {
    assert.equal(error.message.includes(secret), false);
    return { code: 1, text: error.message };
  } finally {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
};

test('backup refuses to connect without authorization or credentials', async () => {
  const target = join(tmpdir(), `postispop-no-export-${process.pid}`);
  let result = await invoke(['--output', target]);
  assert.equal(result.code, 1);
  assert.match(result.text, /POSTISPOP_BACKUP_AUTHORIZED/);
  result = await invoke(['--output', target], { POSTISPOP_BACKUP_AUTHORIZED: '1' });
  assert.equal(result.code, 1);
  assert.match(result.text, /SUPABASE_DB_URL/);
  assert.equal(existsSync(target), false);
});

test('backup rejects another project and insecure TLS without exposing credentials', async () => {
  for (const url of [
    `postgresql://postgres:${secret}@db.wrong-project.supabase.co:5432/postgres`,
    `postgresql://postgres:${secret}@db.htfyjefmviwlgmfqrwue.supabase.co:5432/postgres?sslmode=disable`
  ]) {
    const result = await invoke(['--output', '/tmp/unused-backup-test'], { POSTISPOP_BACKUP_AUTHORIZED: '1', SUPABASE_DB_URL: url });
    assert.equal(result.code, 1);
    assert.match(result.text, /Conexión rechazada/);
  }
});

test('backup refuses to save private data inside the repository', async () => {
  const result = await invoke(['--output', resolve(__dirname, '../private-backup-test')], {
    POSTISPOP_BACKUP_AUTHORIZED: '1',
    SUPABASE_DB_URL: `postgresql://postgres:${secret}@db.htfyjefmviwlgmfqrwue.supabase.co:5432/postgres`
  });
  assert.equal(result.code, 1);
  assert.match(result.text, /fuera del repositorio/);
});

test('offline verifier rejects tampering and incomplete/traversing manifests', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'postispop-manifest-test-'));
  const content = 'TEST FIXTURE ONLY';
  const files = ['database.dump', 'roles.sql', 'database.toc'].map((path) => {
    writeFileSync(join(folder, path), content);
    return { path, bytes: Buffer.byteLength(content), sha256: createHash('sha256').update(content).digest('hex') };
  });
  const manifest = { format: 'postispop-database-export-v1', projectRef: 'htfyjefmviwlgmfqrwue', files };
  try {
    writeFileSync(join(folder, 'manifest.json'), JSON.stringify(manifest));
    writeFileSync(join(folder, 'database.dump'), 'tampered');
    let result = await invoke(['--verify', folder]);
    assert.equal(result.code, 1);
    assert.match(result.text, /integridad/);
    manifest.files[0].path = '../outside';
    writeFileSync(join(folder, 'manifest.json'), JSON.stringify(manifest));
    result = await invoke(['--verify', folder]);
    assert.equal(result.code, 1);
    assert.match(result.text, /Manifiesto incompleto/);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
