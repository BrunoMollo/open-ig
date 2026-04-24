import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';

import {
  buildInjectedJavaScript,
  parseWebViewMessage,
  type WebViewBridgeMessage,
} from '../../webview/injectedJavaScript';

const INSTAGRAM_URL = 'https://www.instagram.com/';

function isInstagramUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    return hostname === 'instagram.com' || hostname.endsWith('.instagram.com');
  } catch {
    return false;
  }
}

async function openExternalUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.warn('Failed to open external URL', url, error);
  }
}

function handleBridgeMessage(message: WebViewBridgeMessage) {
  if (message.type === 'log') {
    console.log('[open-ig]', message.payload);
  }
}

export function InstagramWebView() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const injectedJavaScript = useMemo(() => buildInjectedJavaScript(), []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) {
        return false;
      }

      webViewRef.current?.goBack();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [canGoBack]);

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.unsupportedContainer}>
        <View style={styles.unsupportedContent}>
          <Text style={styles.unsupportedTitle}>Open IG is mobile-only for now.</Text>
          <Text style={styles.unsupportedText}>Run this app on iOS or Android.</Text>
        </View>
      </SafeAreaView>
    );
  }

  function handleNavigationStateChange(navigationState: WebViewNavigation) {
    setCanGoBack(navigationState.canGoBack);
  }

  function handleShouldStartLoadWithRequest(request: WebViewNavigation) {
    if (isInstagramUrl(request.url)) {
      return true;
    }

    void openExternalUrl(request.url);
    return false;
  }

  function handleMessage(event: WebViewMessageEvent) {
    const message = parseWebViewMessage(event.nativeEvent.data);

    if (!message) {
      return;
    }

    handleBridgeMessage(message);
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: INSTAGRAM_URL }}
        style={styles.webView}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onMessage={handleMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  unsupportedContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  unsupportedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  unsupportedTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  unsupportedText: {
    marginTop: 8,
    color: '#d1d5db',
    fontSize: 16,
    textAlign: 'center',
  },
});
