#!/usr/bin/env node
// Read-only database export. No restore, migration, credential reset or deployment.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { chmod, lstat, mkdtemp, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REF = 'htfyjefmviwlgmfqrwue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REQUIRED = ['database.dump', 'roles.sql', 'database.toc'];
const safeFailure = (message) => Object.assign(new Error(message), { safe: true });

function run(command, args, env, capture = false) {
  return new Promise((accept, reject) => {
    const child = spawn(command, args, { env, stdio: ['ignore', 'pipe', 'pipe'], shell: false });
    const chunks = [];
    let bytes = 0;
    child.stdout.on('data', (part) => {
      if (capture) {
        bytes += part.length;
        if (bytes > 16 * 1024 * 1024) child.kill();
        else chunks.push(part);
      }
    });
    // Database diagnostics can contain credentials or private data. Never relay them.
    child.stderr.resume();
    child.on('error', () => reject(safeFailure(`No se pudo ejecutar ${command}; comprueba su instalación y permisos.`)));
    child.on('close', (code) => code === 0 && bytes <= 16 * 1024 * 1024
      ? accept(Buffer.concat(chunks).toString('utf8'))
      : reject(safeFailure(`${command} falló. Revisa versión, TLS, conexión y permisos por un canal privado. No se certificó el respaldo.`)));
  });
}

async function digest(path) {
  const hash = createHash('sha256');
  for await (const part of createReadStream(path)) hash.update(part);
  return hash.digest('hex');
}

function validateToc(toc) {
  for (const [schema, table] of [['auth', 'users'], ['auth', 'identities'], ['storage', 'buckets'], ['storage', 'objects']]) {
    if (!new RegExp(` TABLE DATA ${schema} ${table} `).test(toc)) {
      throw safeFailure(`El archivo no acredita la tabla de datos requerida ${schema}.${table}.`);
    }
  }
}

async function verify(directory) {
  const folder = await realpath(directory);
  const manifestPath = join(folder, 'manifest.json');
  if (!(await lstat(manifestPath)).isFile()) throw safeFailure('El manifiesto no es un archivo regular.');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.format !== 'postispop-database-export-v1' || manifest.projectRef !== REF ||
      !Array.isArray(manifest.files) || manifest.files.length !== REQUIRED.length ||
      !REQUIRED.every((name) => manifest.files.filter((entry) => entry.path === name).length === 1)) {
    throw safeFailure('Manifiesto incompleto o formato/proyecto incorrecto.');
  }
  for (const entry of manifest.files) {
    if (!REQUIRED.includes(entry.path) || !Number.isSafeInteger(entry.bytes) || entry.bytes <= 0 || !/^[a-f0-9]{64}$/.test(entry.sha256)) {
      throw safeFailure('Entrada de manifiesto inválida.');
    }
    const path = join(folder, entry.path);
    const info = await lstat(path);
    if (!info.isFile() || info.size !== entry.bytes || await digest(path) !== entry.sha256) {
      throw safeFailure('La integridad del respaldo no coincide con el manifiesto.');
    }
  }
  const extra = (await readdir(folder)).filter((name) => ![...REQUIRED, 'manifest.json'].includes(name));
  if (extra.length) throw safeFailure('Hay archivos fuera del manifiesto; verifica su procedencia por separado.');
  const toc = await run('pg_restore', ['--list', join(folder, 'database.dump')], { PATH: process.env.PATH }, true);
  validateToc(toc);
  console.log('Integridad SHA-256 y estructura del archivo verificadas. Supabase sigue siendo parcial; restauración no probada.');
}

async function backup(output) {
  if (process.env.POSTISPOP_BACKUP_AUTHORIZED !== '1') {
    throw safeFailure('Falta POSTISPOP_BACKUP_AUTHORIZED=1. Solo habilitar en un entorno con autorización administrativa existente.');
  }
  if (!process.env.SUPABASE_DB_URL) throw safeFailure('Falta SUPABASE_DB_URL con credenciales administrativas autorizadas. No se ha exportado nada.');
  let url;
  try { url = new URL(process.env.SUPABASE_DB_URL); } catch { throw safeFailure('SUPABASE_DB_URL no es una URL PostgreSQL válida.'); }
  const user = decodeURIComponent(url.username);
  const direct = [`db.${REF}.supabase.co`, `db.${REF}.supabase.com`].includes(url.hostname) && ['postgres', `postgres.${REF}`].includes(user);
  const pooler = /^[a-z0-9-]+\.pooler\.supabase\.com$/.test(url.hostname) && user === `postgres.${REF}`;
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.password || (!direct && !pooler) ||
      (url.port && url.port !== '5432') || url.pathname !== '/postgres' || url.hash ||
      [...url.searchParams.keys()].some((key) => key !== 'sslmode') ||
      (url.searchParams.has('sslmode') && url.searchParams.get('sslmode') !== 'verify-full')) {
    throw safeFailure('Conexión rechazada: usa el proyecto PostisPop, puerto 5432, base postgres, conexión directa/session pooler y TLS verify-full.');
  }
  if (!output || !isAbsolute(output)) throw safeFailure('Indica --output con una ruta absoluta privada, fuera del repositorio.');
  const target = resolve(output);
  const parent = await realpath(dirname(target));
  const canonicalTarget = join(parent, basename(target));
  const repository = await realpath(ROOT);
  const inside = relative(repository, canonicalTarget);
  if (!inside || (!inside.startsWith(`..${sep}`) && inside !== '..' && !isAbsolute(inside))) {
    throw safeFailure('El respaldo debe guardarse fuera del repositorio.');
  }
  // The final directory must be new. Never overwrite an existing export.
  try { await lstat(canonicalTarget); throw safeFailure('El destino ya existe; elige un nombre nuevo.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const env = {
    PATH: process.env.PATH, PGHOST: url.hostname, PGPORT: '5432', PGDATABASE: 'postgres',
    PGUSER: user, PGPASSWORD: decodeURIComponent(url.password), PGSSLMODE: 'verify-full',
    PGCONNECT_TIMEOUT: '20', PGAPPNAME: 'postispop-readonly-backup',
    PGOPTIONS: '-c default_transaction_read_only=on',
    ...(process.env.PGSSLROOTCERT ? { PGSSLROOTCERT: process.env.PGSSLROOTCERT } : {})
  };
  // URL/password are never arguments or console output. Only PostgreSQL children receive them.
  const versions = {};
  for (const tool of ['pg_dump', 'pg_dumpall', 'pg_restore']) {
    const version = await run(tool, ['--version'], { PATH: process.env.PATH }, true);
    versions[tool] = version.trim().slice(0, 100);
  }
  const folder = await mkdtemp(join(parent, '.postispop-backup-partial-'));
  const startedAt = new Date().toISOString();
  const previousUmask = process.umask(0o077);
  try {
    await run('pg_dump', ['--no-password', '--format=custom', '--file', join(folder, 'database.dump')], env);
    await run('pg_dumpall', ['--no-password', '--roles-only', '--no-role-passwords', '--file', join(folder, 'roles.sql')], env);
    const toc = await run('pg_restore', ['--list', join(folder, 'database.dump')], { PATH: process.env.PATH }, true);
    validateToc(toc);
    await writeFile(join(folder, 'database.toc'), toc, { mode: 0o600 });
    const files = [];
    for (const name of REQUIRED) {
      const path = join(folder, name);
      await chmod(path, 0o600);
      const info = await lstat(path);
      if (!info.size) throw safeFailure('La exportación produjo un archivo vacío.');
      files.push({ path: name, bytes: info.size, sha256: await digest(path) });
    }
    await writeFile(join(folder, 'manifest.json'), JSON.stringify({
      format: 'postispop-database-export-v1', projectRef: REF, startedAt, finishedAt: new Date().toISOString(),
      status: 'partial-supabase-export', versions, files,
      coverage: {
        databaseSchemaAndData: 'exported; no schema filters; restore not tested',
        auth: 'database tables included; provider configuration and keys not exported',
        roles: 'exported without login passwords; snapshot separate from database',
        storage: 'database metadata only; object binaries NOT exported',
        edgeFunctions: 'NOT exported', projectConfiguration: 'NOT exported',
        secretsAndEncryptionKeys: 'NOT exported separately; SQL may itself contain sensitive values',
        github: 'NOT exported by this script'
      }, restoreTested: false
    }, null, 2) + '\n', { mode: 0o600 });
    await rename(folder, canonicalTarget);
    console.log('Exportación parcial de base de datos terminada. No incluye todo Supabase; ejecutar --verify y ensayo de restauración aislado.');
  } catch (error) {
    await rm(folder, { recursive: true, force: true }).catch(() => {});
    throw error;
  } finally {
    env.PGPASSWORD = '';
    process.umask(previousUmask);
  }
}

export async function main(args) {
  if (args.length === 1 && args[0] === '--help') {
    console.log('node scripts/backup-supabase.mjs --output /ruta/privada/nuevo-respaldo\nnode scripts/backup-supabase.mjs --verify /ruta/privada/respaldo\nExporta solo base de datos/roles. Requiere acceso autorizado y herramientas PostgreSQL. Ver docs/RESPALDO_Y_RESTAURACION.md.');
  } else if (args.length === 2 && args[0] === '--verify') await verify(args[1]);
  else if (args.length === 2 && args[0] === '--output') await backup(args[1]);
  else throw safeFailure('Uso inválido. Consulta --help.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.safe ? error.message : 'Operación fallida. No se certificó el respaldo. Revisa el entorno por un canal privado.');
    process.exitCode = 1;
  });
}
