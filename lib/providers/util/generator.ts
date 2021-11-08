/**
 * Generate key for ttsave.app
 *
 * @param {string} token - Generated token by TTSave
 * @return {string}
 */
export const keyGeneratorTTSave = (token: string): string => {
  // the key must have 550 character length. ~ hansputera
  const tokenReversed = token.split('').reverse().join('');
  return tokenReversed.slice(-550);
};
