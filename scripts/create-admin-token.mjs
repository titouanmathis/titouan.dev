#!/usr/bin/env node

/**
 * Bootstrap a headless admin user + Personal Access Token directly in the
 * local EmDash SQLite database.
 *
 * EmDash's normal first-user flow uses WebAuthn (passkey) in the browser admin
 * UI, which can't run headlessly. For local content migration / CI imports we
 * need an API token (EMDASH_TOKEN) without that interactive step. Since whoever
 * runs this already has filesystem access to data.db, minting a token straight
 * into the DB with EmDash's own auth primitives is a legitimate bootstrap.
 *
 * Idempotent: reuses the bootstrap admin user if it already exists, and always
 * issues a fresh token (old ones keep working until revoked).
 *
 * Usage:
 *   node ./scripts/create-admin-token.mjs            # prints the raw token
 *   DB_PATH=./data.db node ./scripts/create-admin-token.mjs
 *
 * The printed token is shown only once — copy it into EMDASH_TOKEN.
 */

import process from 'node:process';
import Database from 'better-sqlite3';
import { ulid } from 'ulidx';
import { generatePrefixedToken, hashPrefixedToken, VALID_SCOPES, Role } from '@emdash-cms/auth';

const DB_PATH = process.env.DB_PATH || './data.db';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'cli-admin@titouan.dev';
const TOKEN_NAME = process.env.TOKEN_NAME || 'legacy-import';

const db = new Database(DB_PATH);
const now = new Date().toISOString();

// 1. Ensure a bootstrap admin user exists.
let user = db.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL);
if (!user) {
	const id = ulid();
	db.prepare(
		`INSERT INTO users (id, email, name, role, email_verified, created_at, updated_at, disabled)
		 VALUES (?, ?, ?, ?, 1, ?, ?, 0)`,
	).run(id, ADMIN_EMAIL, 'CLI Admin', Role.ADMIN, now, now);
	user = { id };
	console.error(`Created admin user ${ADMIN_EMAIL} (${id})`);
} else {
	console.error(`Reusing admin user ${ADMIN_EMAIL} (${user.id})`);
}

// 2. Mint a Personal Access Token with full scopes, using EmDash's own helper
//    so the hash matches what resolveApiToken() expects.
const generated = generatePrefixedToken('ec_pat_');
const raw = generated.raw ?? generated.token;
const hash = generated.hash ?? hashPrefixedToken(raw);
const prefix = generated.prefix;

db.prepare(
	`INSERT INTO _emdash_api_tokens (id, name, token_hash, prefix, user_id, scopes, expires_at, created_at)
	 VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`,
).run(ulid(), TOKEN_NAME, hash, prefix, user.id, JSON.stringify(VALID_SCOPES), now);

db.close();

console.error('API token created (full scopes). Copy it now — it is not stored in plaintext:');
// Raw token to stdout so it can be captured: TOKEN=$(node ./scripts/create-admin-token.mjs)
process.stdout.write(raw + '\n');
