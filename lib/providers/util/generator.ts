import {NodeVM} from 'vm2';
import got from 'got';
import {client as redisClient} from '../../redis';

/**
 * Generate key for ttsave.app
 *
 * @param {string} token - Generated token by TTSave
 * @return {string | undefined}
 */
export const keyGeneratorTTSave = async (token: string): Promise<string> => {
  const vm = new NodeVM({
    'compiler': 'javascript',
    'console': 'inherit',
    'require': {
      'external': true,
      'root': './',
    },
  });

  let scriptCache = await redisClient.get('ttsave-scripts');
  if (!scriptCache) {
    const response = await got('https://gist.githubusercontent.com/hansputera/' +
                '70e33b8ac4a9beca4725c95cf517e8a6' +
                    '/raw/9b1bf7f0eee16a69b38e2' +
                        '03782bd46dae1611f8e/ttsave-gen.js', {
      dnsCache: true,
    });

    await redisClient.set('ttsave-scripts', response.body, 'ex', 60 * 10);
    scriptCache = response.body;
  }

  return vm.run(scriptCache + 'module.exports = ' +
        'key(`' + token + '`);', 'generator-ttsave.js');
};
