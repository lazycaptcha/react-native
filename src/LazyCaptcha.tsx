import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { buildCaptchaHtml } from './html';
import type { LazyCaptchaBridgeMessage, LazyCaptchaProps } from './types';

/**
 * Modal LazyCaptcha component for React Native.
 *
 * Renders the widget inside a WebView; when the user solves the challenge,
 * the onVerify callback fires with the token.
 */
export function LazyCaptcha(props: LazyCaptchaProps) {
    const {
        sitekey,
        type = 'auto',
        theme = 'light',
        baseUrl = 'https://lazycaptcha.com',
        visible = true,
        animationType = 'slide',
        onVerify,
        onError,
        onCancel,
        onRequestClose,
    } = props;

    const [loading, setLoading] = useState(true);
    const resolvedOnce = useRef(false);

    const html = useMemo(
        () => buildCaptchaHtml({ sitekey, baseUrl, type, theme }),
        [sitekey, baseUrl, type, theme]
    );

    const handleMessage = useCallback(
        (event: WebViewMessageEvent) => {
            let msg: LazyCaptchaBridgeMessage;
            try {
                msg = JSON.parse(event.nativeEvent.data);
            } catch {
                onError?.('invalid_bridge_message');
                return;
            }

            if (msg.type === 'ready') {
                setLoading(false);
                return;
            }
            if (msg.type === 'token' && msg.token && !resolvedOnce.current) {
                resolvedOnce.current = true;
                onVerify?.(msg.token);
                return;
            }
            if (msg.type === 'error' && !resolvedOnce.current) {
                resolvedOnce.current = true;
                onError?.(msg.error || 'unknown_error');
            }
        },
        [onVerify, onError]
    );

    const content = (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={() => {
                    onCancel?.();
                    onRequestClose?.();
                }}
            />
            <View style={[styles.card, theme === 'dark' && styles.cardDark]}>
                <WebView
                    originWhitelist={['*']}
                    source={{ html, baseUrl }}
                    onMessage={handleMessage}
                    javaScriptEnabled
                    domStorageEnabled
                    style={styles.webview}
                    androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
                    onError={() => onError?.('webview_error')}
                />
                {loading && (
                    <View style={styles.loader} pointerEvents="none">
                        <ActivityIndicator size="large" />
                    </View>
                )}
            </View>
        </View>
    );

    // If visible is explicitly controlled, wrap in a Modal
    if (visible !== undefined) {
        return (
            <Modal
                visible={visible}
                transparent
                animationType={animationType}
                onRequestClose={() => {
                    onCancel?.();
                    onRequestClose?.();
                }}
            >
                {content}
            </Modal>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: '92%',
        maxWidth: 360,
        height: 420,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    cardDark: {
        backgroundColor: '#1a1a2e',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
