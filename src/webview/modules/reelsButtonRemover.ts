const REELS_BUTTON_SELECTOR = 'a[href="/reels/"], a[href="/reels"]';

export function buildReelsButtonRemoverModuleScript(): string {
  return `
    function createReelsButtonRemover() {
      var selector = '${REELS_BUTTON_SELECTOR}';
      var pendingRoots = new Set();
      var flushScheduled = false;
      var observer = null;
      var started = false;

      function removeReelsAnchor(element) {
        var target =
          element &&
          element.parentElement &&
          element.parentElement.parentElement &&
          element.parentElement.parentElement.parentElement;

        if (!target || !target.remove) {
          return false;
        }

        target.remove();
        return true;
      }

      function scanRoot(root) {
        if (!root || root.nodeType !== Node.ELEMENT_NODE) {
          return;
        }

        if (root.matches && root.matches(selector)) {
          removeReelsAnchor(root);
          return;
        }

        if (!root.querySelectorAll) {
          return;
        }

        var matches = root.querySelectorAll(selector);
        for (var index = 0; index < matches.length; index += 1) {
          removeReelsAnchor(matches[index]);
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
          attributeFilter: ['href'],
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
