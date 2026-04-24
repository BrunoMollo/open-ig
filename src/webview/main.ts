export type InjectedModuleRegistration = {
  autoStart?: boolean;
  factoryName: string;
  key: string;
  script: string;
};

export function buildInjectedAppScript(
  namespace: string,
  modules: readonly InjectedModuleRegistration[],
): string {
  const moduleDefinitions = modules.map((module) => module.script).join('\n');
  const moduleInstances = modules
    .map(
      (module) =>
        `'${module.key}': typeof ${module.factoryName} === 'function' ? ${module.factoryName}() : null`,
    )
    .join(',\n');
  const moduleAutoStarts = modules
    .filter((module) => module.autoStart)
    .map(
      (module) => `
        if (registeredModules['${module.key}'] && typeof registeredModules['${module.key}'].start === 'function') {
          registeredModules['${module.key}'].start();
        }
      `,
    )
    .join('\n');

  return `
    (function() {
      if (window.${namespace} && window.${namespace}.bridgeReady) {
        return true;
      }

      function postMessage(message) {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        } catch (error) {
          // Ignore bridge errors inside the page context.
        }
      }

      ${moduleDefinitions}
      var registeredModules = {
        ${moduleInstances}
      };

      window.${namespace} = {
        bridgeReady: true,
        version: '1.0.0',
        postMessage: postMessage,
        modules: registeredModules,
      };

      ${moduleAutoStarts}
      postMessage({ type: 'bridge-ready' });
      return true;
    })();
    true;
  `;
}
