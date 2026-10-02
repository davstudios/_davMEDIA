import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

export function exportedPath(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value.path === 'string') return value.path;
  if (value && typeof value.default === 'string') return value.default;
  if (value && value.default && typeof value.default.path === 'string') return value.default.path;
  return '';
}

export function packageBinaryCandidates(requireFn, packageName, binaryName, suffix, envValue = '') {
  const candidates = [];
  if (envValue) candidates.push(envValue);
  try {
    const value = requireFn(packageName);
    const direct = exportedPath(value);
    if (direct) candidates.push(direct);
  } catch {}
  try {
    const entry = requireFn.resolve(packageName);
    candidates.push(join(dirname(entry), `${binaryName}${suffix}`));
  } catch {}
  return [...new Set(candidates.filter(Boolean))];
}

export function firstExisting(candidates) {
  return candidates.find((candidate) => existsSync(candidate)) || '';
}

