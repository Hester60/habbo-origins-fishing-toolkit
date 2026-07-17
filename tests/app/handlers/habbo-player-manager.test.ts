import { describe, expect, it } from 'vitest';
import HabboPlayerManager from '../../../src/app/handlers/habbo-player-manager.js';
import EventBus from '../../../src/app/handlers/event-bus.js';
import PacketParser from '../../../src/core/wire/packet-parser.js';
import PacketReader from '../../../src/core/wire/packet-reader.js';
import EncryptedFrameWriter from '../../../src/core/net/encrypted-frame-writer.js';
import { IncomingHeaders, OutgoingHeaders } from '../../../src/core/protocol/headers.js';
import {
  FakeSocket,
  makeCiphers,
  decryptOutboundChunk,
  readyConnection,
  readOutboundString,
  inbound,
} from '../../test-helper.js';
import { Events } from '../../../src/types.js';

function setup() {
  const socket = new FakeSocket();
  const connection = readyConnection(socket);
  const eventBus = new EventBus<Events>();
  const playerManager = new HabboPlayerManager(connection, eventBus);
  const ciphers = makeCiphers();
  const serverWriter = new EncryptedFrameWriter(ciphers.s2cHeader, ciphers.s2cData);

  return { socket, connection, eventBus, playerManager, ciphers, serverWriter };
}

describe('HabboPlayerManager', () => {
  it('move() sends MOVE(x, y, 0)', () => {
    const { socket, playerManager, ciphers } = setup();

    playerManager.move(12, 7);

    expect(socket.sent).toHaveLength(1);
    const decrypted = decryptOutboundChunk(socket.sent[0], ciphers.c2sHeader, ciphers.c2sData);
    const packet = PacketParser.parse(decrypted);
    expect(packet.header).toBe(OutgoingHeaders.MOVE);

    const reader = new PacketReader(packet.body);
    expect([reader.int(), reader.int(), reader.int()]).toEqual([12, 7, 0]);
  });

  it('startFishing() sends START_FISHING(fishId)', () => {
    const { socket, playerManager, ciphers } = setup();

    playerManager.startFishing(1005);

    expect(socket.sent).toHaveLength(1);
    const decrypted = decryptOutboundChunk(socket.sent[0], ciphers.c2sHeader, ciphers.c2sData);
    const packet = PacketParser.parse(decrypted);
    expect(packet.header).toBe(OutgoingHeaders.START_FISHING);

    const reader = new PacketReader(packet.body);
    expect(reader.int()).toBe(1005);
  });

  it('requestFishingStats() sends GET_FISHING_STATS()', () => {
    const { socket, playerManager, ciphers } = setup();

    playerManager.requestFishingStats();

    expect(socket.sent).toHaveLength(1);
    const decrypted = decryptOutboundChunk(socket.sent[0], ciphers.c2sHeader, ciphers.c2sData);
    const packet = PacketParser.parse(decrypted);
    expect(packet.header).toBe(OutgoingHeaders.GET_FISHING_STATS);
    expect(packet.body).toHaveLength(0);
  });

  it('emits FISH_CAUGHT_MSG with the parsed fields when FISHING_CHAT arrives', () => {
    const { socket, eventBus, serverWriter } = setup();

    let received: [number, string, number] | undefined;
    eventBus.on('FISH_CAUGHT_MSG', (userId, chatMsg, iconID) => {
      received = [userId, chatMsg, iconID];
    });

    socket.simulateReceive(
      serverWriter.encode(
        inbound(IncomingHeaders.FISHING_CHAT, 44, 'You caught a Crappie! (+47 XP)', 1),
      ),
    );

    expect(received).toEqual([44, 'You caught a Crappie! (+47 XP)', 1]);
  });

  it('emits GOLDEN_FISHING_STARTED with the parsed fields when GOLDEN_START arrives', () => {
    const { socket, eventBus, serverWriter } = setup();

    let received: [number, number] | undefined;
    eventBus.on('GOLDEN_FISHING_STARTED', (fishId, seconds) => {
      received = [fishId, seconds];
    });

    socket.simulateReceive(serverWriter.encode(inbound(IncomingHeaders.GOLDEN_START, 1005, 35)));

    expect(received).toEqual([1005, 35]);
  });

  it('emits GOLDEN_FISHING_STATUS with the parsed fields when GOLDEN_STATUS arrives', () => {
    const { socket, eventBus, serverWriter } = setup();

    let received: [number, number, number] | undefined;
    eventBus.on('GOLDEN_FISHING_STATUS', (balance, barProgress, seconds) => {
      received = [balance, barProgress, seconds];
    });

    socket.simulateReceive(serverWriter.encode(inbound(IncomingHeaders.GOLDEN_STATUS, 2, 40, 30)));

    expect(received).toEqual([2, 40, 30]);
  });

  it('emits GOLDEN_FISHING_ENDED when GOLDEN_END arrives', () => {
    const { socket, eventBus, serverWriter } = setup();

    let fired = false;
    eventBus.on('GOLDEN_FISHING_ENDED', () => {
      fired = true;
    });

    socket.simulateReceive(serverWriter.encode(inbound(IncomingHeaders.GOLDEN_END)));

    expect(fired).toBe(true);
  });

  it('submitGoldenGameDirection("L") sends FHM("L")', () => {
    const { socket, playerManager, ciphers } = setup();

    playerManager.submitGoldenGameDirection('L');

    expect(socket.sent).toHaveLength(1);
    const decrypted = decryptOutboundChunk(socket.sent[0], ciphers.c2sHeader, ciphers.c2sData);
    const packet = PacketParser.parse(decrypted);
    expect(packet.header).toBe(OutgoingHeaders.FHM);
    expect(readOutboundString(packet.body, 0)[0]).toBe('L');
  });

  it('submitGoldenGameDirection("R") sends FHM("R")', () => {
    const { socket, playerManager, ciphers } = setup();

    playerManager.submitGoldenGameDirection('R');

    expect(socket.sent).toHaveLength(1);
    const decrypted = decryptOutboundChunk(socket.sent[0], ciphers.c2sHeader, ciphers.c2sData);
    const packet = PacketParser.parse(decrypted);
    expect(packet.header).toBe(OutgoingHeaders.FHM);
    expect(readOutboundString(packet.body, 0)[0]).toBe('R');
  });
});
