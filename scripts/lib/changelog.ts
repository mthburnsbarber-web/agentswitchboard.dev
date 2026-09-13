/**
 * Append entries to content/changelog.json (newest first).
 * Used by weekly-drop.ts and cms.ts so the audit log maintains itself.
 * Dates are included automatically going forward; older seeded entries
 * may omit them.
 */

import * as path from 'path';
import { updateJsonFile } from './content-files';

export interface ChangelogEntry {
  action: 'added' | 'removed' | 'updated';
  slug: string;
  name: string;
  note?: string;
  date?: string;
}

const FILE = path.resolve(process.cwd(), 'content', 'changelog.json');

export function appendChangelog(entries: ChangelogEntry | ChangelogEntry[]): void {
  const additions = (Array.isArray(entries) ? entries : [entries]).map((e) => ({
    ...e,
    date: e.date ?? new Date().toISOString().slice(0, 10),
  }));
  updateJsonFile<ChangelogEntry[]>(FILE, (list = []) => [...additions, ...list]);
}
