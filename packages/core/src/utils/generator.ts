/**
 * Generate key for ttsave.app
 *
 * @param {string} token - Generated token by TTSave
 * @return {string | undefined}
 */
export const keyGeneratorTTSave = async (token: string): Promise<string> => {
  const expectedLen = token.length / 3;

  return token.split('').reverse().join('').slice(-expectedLen);
};
