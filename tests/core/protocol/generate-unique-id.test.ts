import { describe, expect, it } from 'vitest';
import generateUniqueId from '../../../src/core/protocol/generate-unique-id.js';

describe('generateUniqueId', () => {
  const ID_REGEX =
    /^BX1-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

  it('generates a well-formed BX1-xxxx-xxxx-xxxx-xxxx-xxxx id, using only Crockford Base32 characters', () => {
    for (let i = 0; i < 1000; i++) {
      expect(generateUniqueId()).toMatch(ID_REGEX);
    }
  });

  it('does not always generate the same id', () => {
    const ids = new Set<string>();

    for (let i = 0; i < 100; i++) {
      ids.add(generateUniqueId());
    }

    expect(ids.size).toBeGreaterThan(1);
  });
});
