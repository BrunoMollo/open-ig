const APP_INSTALL_BANNER_STORAGE_KEY = 'ig_uta_b';
const APP_INSTALL_BANNER_STORAGE_VALUE = '1777155312034';

export function buildAppInstallBannerSuppressorModuleScript(): string {
  return `
    function createAppInstallBannerSuppressor() {
      var storageKey = '${APP_INSTALL_BANNER_STORAGE_KEY}';
      var storageValue = '${APP_INSTALL_BANNER_STORAGE_VALUE}';
      var started = false;

      function ensureStorageFlag() {
        try {
          window.localStorage.setItem(storageKey, storageValue);
        } catch (error) {
          // Ignore storage access errors inside the page context.
        }
      }

      function start() {
        if (started) {
          return;
        }

        started = true;
        ensureStorageFlag();
      }

      return {
        start: start,
        stop: function() {},
      };
    }
  `;
}
