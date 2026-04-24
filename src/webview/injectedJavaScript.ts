export type WebViewBridgeMessage =
  | { type: 'bridge-ready' }
  | { type: 'log'; payload: string }
  | { type: 'custom-event'; payload?: unknown };

const BRIDGE_NAMESPACE = '__OPEN_IG__';

export function buildInjectedJavaScript(): string {
  return `
    (function() {
      if (window.${BRIDGE_NAMESPACE} && window.${BRIDGE_NAMESPACE}.bridgeReady) {
        return true;
      }

      function postMessage(message) {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        } catch (error) {
          // Ignore bridge errors inside the page context.
        }
      }

      window.${BRIDGE_NAMESPACE} = {
        bridgeReady: true,
        version: '1.0.0',
        postMessage: postMessage,
      };

      postMessage({ type: 'bridge-ready' });
      return true;
    })();
    true;
  `;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseWebViewMessage(raw: string): WebViewBridgeMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || typeof parsed.type !== 'string') {
      return null;
    }

    if (parsed.type === 'bridge-ready') {
      return { type: 'bridge-ready' };
    }

    if (parsed.type === 'log' && typeof parsed.payload === 'string') {
      return { type: 'log', payload: parsed.payload };
    }

    if (parsed.type === 'custom-event') {
      return { type: 'custom-event', payload: parsed.payload };
    }

    return null;
  } catch {
    return null;
  }
}
