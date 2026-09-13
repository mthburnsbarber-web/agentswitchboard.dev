import * as fs from 'node:fs';
import * as path from 'node:path';

export function createJsonFile(file: string, value: unknown): boolean {
  let descriptor: number;
  try {
    descriptor = fs.openSync(file, 'wx', 0o644);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return false;
    throw error;
  }
  try {
    fs.writeFileSync(descriptor, JSON.stringify(value, null, 2) + '\n');
  } finally {
    fs.closeSync(descriptor);
  }
  return true;
}

export function updateJsonFile<T>(file: string, update: (current: T | undefined) => T): void {
  // Exclusive creation serializes cooperating writers without a check-then-open race.
  const lock = `${file}.lock`;
  const lockDescriptor = fs.openSync(lock, 'wx', 0o600);
  let temporaryDirectory: string | undefined;
  try {
    let current: T | undefined;
    let descriptor: number | undefined;
    try {
      descriptor = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    if (descriptor !== undefined) {
      try {
        current = JSON.parse(fs.readFileSync(descriptor, 'utf8')) as T;
      } finally {
        fs.closeSync(descriptor);
      }
    }
    const contents = JSON.stringify(update(current), null, 2) + '\n';
    temporaryDirectory = fs.mkdtempSync(path.join(path.dirname(file), '.changelog-'));
    const temporaryFile = path.join(temporaryDirectory, 'data.json');
    fs.writeFileSync(temporaryFile, contents, { flag: 'wx', mode: 0o644 });
    // Rename replaces a destination symlink itself; it never writes through it.
    fs.renameSync(temporaryFile, file);
  } finally {
    if (temporaryDirectory !== undefined) fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    fs.closeSync(lockDescriptor);
    fs.unlinkSync(lock);
  }
}
