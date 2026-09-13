import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createJsonFile, updateJsonFile } from './content-files';

let directory: string;
let file: string;

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'content-files-test-'));
  file = path.join(directory, 'content.json');
});
afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));

describe('exclusive agent creation', () => {
  it('creates new JSON and leaves an existing record unchanged', () => {
    expect(createJsonFile(file, { name: 'first' })).toBe(true);
    expect(createJsonFile(file, { name: 'second' })).toBe(false);
    expect(JSON.parse(fs.readFileSync(file, 'utf8'))).toEqual({ name: 'first' });
  });

  it('refuses existing and dangling symlinks without touching their targets', () => {
    const target = path.join(directory, 'target.json');
    fs.writeFileSync(target, 'original');
    fs.symlinkSync(target, file);
    expect(createJsonFile(file, { overwritten: true })).toBe(false);
    expect(fs.readFileSync(target, 'utf8')).toBe('original');
    fs.unlinkSync(target);
    expect(createJsonFile(file, { created: true })).toBe(false);
    expect(fs.existsSync(target)).toBe(false);
  });

  it('propagates errors other than duplicate creation', () => {
    expect(() => createJsonFile(path.join(directory, 'missing', 'file'), {})).toThrow();
  });
});

describe('changelog updates', () => {
  it('creates a missing file and preserves older entries newest last', () => {
    updateJsonFile<string[]>(file, (current = []) => ['first', ...current]);
    updateJsonFile<string[]>(file, (current = []) => ['second', ...current]);
    expect(JSON.parse(fs.readFileSync(file, 'utf8'))).toEqual(['second', 'first']);
    expect(fs.readdirSync(directory)).toEqual(['content.json']);
  });

  it('preserves malformed input and releases the writer lock', () => {
    fs.writeFileSync(file, 'malformed json');
    expect(() => updateJsonFile(file, () => [])).toThrow();
    expect(fs.readFileSync(file, 'utf8')).toBe('malformed json');
    expect(fs.readdirSync(directory)).toEqual(['content.json']);
  });

  it('refuses a target symlink', () => {
    const target = path.join(directory, 'target.json');
    fs.writeFileSync(target, '["original"]');
    fs.symlinkSync(target, file);
    expect(() => updateJsonFile(file, () => ['replaced'])).toThrow();
    expect(fs.readFileSync(target, 'utf8')).toBe('["original"]');
  });

  it('does not follow a symlink swapped in after reading the file', () => {
    const target = path.join(directory, 'target.json');
    fs.writeFileSync(file, '["old"]');
    fs.writeFileSync(target, '["untouched"]');
    updateJsonFile<string[]>(file, (current = []) => {
      fs.unlinkSync(file);
      fs.symlinkSync(target, file);
      return ['new', ...current];
    });
    expect(fs.readFileSync(target, 'utf8')).toBe('["untouched"]');
    const descriptor = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    try {
      expect(fs.fstatSync(descriptor).isFile()).toBe(true);
      expect(JSON.parse(fs.readFileSync(descriptor, 'utf8'))).toEqual(['new', 'old']);
    } finally {
      fs.closeSync(descriptor);
    }
  });

  it('rejects a concurrent writer without removing its lock or changing data', () => {
    fs.writeFileSync(file, '["old"]');
    fs.writeFileSync(`${file}.lock`, 'other writer');
    expect(() => updateJsonFile(file, () => ['new'])).toThrow();
    expect(fs.readFileSync(file, 'utf8')).toBe('["old"]');
    expect(fs.readFileSync(`${file}.lock`, 'utf8')).toBe('other writer');
  });

  it('leaves the original intact when the update callback fails', () => {
    fs.writeFileSync(file, '["old"]');
    expect(() => updateJsonFile(file, () => { throw new Error('abort'); })).toThrow('abort');
    expect(fs.readFileSync(file, 'utf8')).toBe('["old"]');
    expect(fs.readdirSync(directory)).toEqual(['content.json']);
  });
});
