export const secret = "zapier first program";
export const salt = "this needs to be a long string";

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
export const cur_dir = dirname(fileURLToPath(import.meta.url));
export const views_path = path.join(cur_dir, 'views');



export const tokenLength = 128;

export const debugMode = true;

export let cur_year = null;
// import crypto from 'crypto';
// console.log(crypto.pbkdf2Sync("123", salt, 100000, 64, 'sha512').toString('hex'))