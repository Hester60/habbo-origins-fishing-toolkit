const CROCKFORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates a well-formed but meaningless UNIQUEID (header 6) — confirmed
 * against the decompiled client's `startSession` (hh_entry, Login Handler
 * Class): `send("UNIQUEID", [#string: getMachineID()])`. Despite the old
 * community name ("release token"), this is a machine/device fingerprint,
 * not a session or auth token — the real client sources it from a native
 * Xtra (`BobbaXtra.Device_GetMachineId()`), falling back to a timestamp-based
 * id if the Xtra is unavailable. The server never actually validates its
 * content, only that it looks like BX1-XXXX-XXXX-XXXX-XXXX-XXXX (Crockford
 * base32, no I/O/0/1 to avoid visual confusion) — a format that doesn't match
 * either of the real client's own generation methods, but passes regardless.
 * A fresh random one per connection means there's nothing to capture or keep
 * refreshed, unlike a real captured id which can go stale.
 */
export default function generateUniqueId(): string {
  const GROUPS = 5;
  const GROUP_SIZE = 4;

  const groups: string[] = [];

  for (let i = 0; i < GROUPS; i++) {
    let group = '';

    for (let j = 0; j < GROUP_SIZE; j++) {
      const index = Math.floor(Math.random() * CROCKFORD_ALPHABET.length);
      group += CROCKFORD_ALPHABET[index];
    }

    groups.push(group);
  }

  return `BX1-${groups.join('-')}`;
}
