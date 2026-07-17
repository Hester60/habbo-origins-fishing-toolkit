import { HostConfig, Hotels } from '../../types.js';

export const HOSTS_CONFIG: { [K in Hotels]: HostConfig } = {
  hhous: {
    extVarsUrl: 'http://origins-gamedata.habbo.com/external_variables/1',
    host: 'game-ous.habbo.com',
    port: 40001,
  },
  hhoes: {
    extVarsUrl: 'http://origins-gamedata.habbo.es/external_variables/1',
    host: 'game-oes.habbo.com',
    port: 40001,
  },
  hhobr: {
    extVarsUrl: 'http://origins-gamedata.habbo.com.br/external_variables/1',
    host: 'game-obr.habbo.com',
    port: 40001,
  },
};
