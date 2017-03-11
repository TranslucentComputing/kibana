module.exports = (config, log) => {
  let encryptionKey = config.get('shield.encryptionKey');
  /**
   * Used to pad encryptionKey to ensure 32 characters in length
   *
   * @param {string} key
   * @returns {string}
   */

  function paddedKey(key) {
    while (key.length < 32) {
      key = '0' + key;
    }

    return key;
  }

  if (encryptionKey == null) {
    throw new Error('shield.encryptionKey is required in kibana.yml.');
  } else if (encryptionKey.length < 32) {
    log('The encryptionKey specified can be more secure. Please update ' +
      'shield.encryptionKey to be at least 32 characters.');

    config.set('shield.encryptionKey', paddedKey(encryptionKey));
  }
};
