import { buildAppInstallBannerSuppressorModuleScript } from './modules/appInstallBannerSuppressor';
import { buildInjectedAppScript, type InjectedModuleRegistration } from './main';
import { buildReelsButtonRemoverModuleScript } from './modules/reelsButtonRemover';
import { buildSuggestedReelsBlockerModuleScript } from './modules/suggestedReelsBlocker';

export type WebViewBridgeMessage =
  | { type: 'bridge-ready' }
  | { type: 'log'; payload: string }
  | { type: 'custom-event'; payload?: unknown };

const BRIDGE_NAMESPACE = '__OPEN_IG__';
const injectedModules: InjectedModuleRegistration[] = [
  {
    key: 'appInstallBannerSuppressor',
    factoryName: 'createAppInstallBannerSuppressor',
    script: buildAppInstallBannerSuppressorModuleScript(),
    autoStart: true,
  },
  {
    key: 'suggestedReelsBlocker',
    factoryName: 'createSuggestedReelsBlocker',
    script: buildSuggestedReelsBlockerModuleScript(),
    autoStart: true,
  },
  {
    key: 'reelsButtonRemover',
    factoryName: 'createReelsButtonRemover',
    script: buildReelsButtonRemoverModuleScript(),
    autoStart: true,
  },
];

export function buildInjectedJavaScript(): string {
  return buildInjectedAppScript(BRIDGE_NAMESPACE, injectedModules);
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
