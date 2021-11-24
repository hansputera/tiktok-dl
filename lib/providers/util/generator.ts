import {NodeVM} from 'vm2';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

/**
 * Generate key for ttsave.app
 *
 * @param {string} token - Generated token by TTSave
 * @return {string}
 */
export const keyGeneratorTTSave = (token: string): string => {
  const vm = new NodeVM({
    'compiler': 'javascript',
    'console': 'inherit',
    'require': {
      'external': true,
      'root': './',
    },
  });


  return vm.run(readFileSync(
      resolve(__dirname, 'tools', 'ttsave.js'), 'utf8',
  ) +
        'module.exports = key(`' + token + '`);', 'generator-ttsave.js');
};
