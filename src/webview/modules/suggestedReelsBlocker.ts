const SUGGESTED_REEL_SELECTOR = '[data-reel-type="suggested"]';

export function buildSuggestedReelsBlockerModuleScript(): string {
  return `
    function createSuggestedReelsBlocker() {
      var selector = '${SUGGESTED_REEL_SELECTOR}';
      var pendingRoots = new Set();
      var flushScheduled = false;
      var observer = null;
      var started = false;

      function removeSuggestedElement(element) {
        if (!element || !element.parentElement) {
          return false;
        }

        element.parentElement.remove();
        return true;
      }

      function scanRoot(root) {
        if (!root || root.nodeType !== Node.ELEMENT_NODE) {
          return;
        }

        if (root.matches && root.matches(selector)) {
          removeSuggestedElement(root);
          return;
        }

        if (!root.querySelectorAll) {
          return;
        }

        var matches = root.querySelectorAll(selector);
        for (var index = 0; index < matches.length; index += 1) {
          removeSuggestedElement(matches[index]);
        }
      }

      function flush() {
        flushScheduled = false;

        pendingRoots.forEach(function(root) {
          scanRoot(root);
        });

        pendingRoots.clear();
      }

      function scheduleScan(root) {
        if (!root || root.nodeType !== Node.ELEMENT_NODE) {
          return;
        }

        pendingRoots.add(root);

        if (flushScheduled) {
          return;
        }

        flushScheduled = true;
        window.requestAnimationFrame(flush);
      }

      function observeMutations(mutations) {
        for (var mutationIndex = 0; mutationIndex < mutations.length; mutationIndex += 1) {
          var mutation = mutations[mutationIndex];

          if (mutation.type === 'attributes') {
            scheduleScan(mutation.target);
            continue;
          }

          for (var nodeIndex = 0; nodeIndex < mutation.addedNodes.length; nodeIndex += 1) {
            scheduleScan(mutation.addedNodes[nodeIndex]);
          }
        }
      }

      function start() {
        if (started) {
          return;
        }

        var observationRoot = document.documentElement || document.body;
        if (!observationRoot) {
          document.addEventListener('DOMContentLoaded', start, { once: true });
          return;
        }

        started = true;
        scheduleScan(observationRoot);

        observer = new MutationObserver(observeMutations);
        observer.observe(observationRoot, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ['data-reel-type'],
        });
      }

      return {
        start: start,
        stop: function() {
          if (observer) {
            observer.disconnect();
          }
        },
      };
    }
  `;
}
