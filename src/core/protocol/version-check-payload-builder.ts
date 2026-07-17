import Vl64Codec from '../wire/vl64-codec.js';
import ShockwaveString from '../wire/shockwave-string.js';

/**
 * Builds the raw VERSIONCHECK payload (header 5) — confirmed against the
 * decompiled client's `startSession` (hh_entry, Login Handler Class):
 * `send("VERSIONCHECK", [#integer: buildNumber, #string: clientUrl, #string: extVarsUrl])`.
 * The only field the server actually checks is the build number (VL64-encoded).
 * `buildNumber` is the internal build id, not the public version — the two are
 * offset by a constant +803 (e.g. public "330" -> internal 1133); this class
 * takes the public version and applies that offset itself. `clientUrl` is
 * `"2"` in every real capture: the decompiled source only sends the real
 * client URL when running as an embedded browser plugin with a matching
 * `src` param, which is never the case for a standalone/bot connection — it
 * falls back to the literal string `"2"` instead. `extVarsUrl` is the real
 * gamedata URL (`getExtVarPath()` client-side). Sent as-is, raw
 * (PacketWriter.raw(...)), never through .str() — it's not length-prefixed
 * as a whole like a normal outbound string would be.
 */
export default class VersionCheckPayloadBuilder {
  static build(extVarsUrl: string, version: number): Buffer {
    return Buffer.concat([
      Vl64Codec.encode(version + 803),
      ShockwaveString.write('2'),
      ShockwaveString.write(extVarsUrl),
    ]);
  }
}
