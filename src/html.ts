import type { LazyCaptchaTheme, LazyCaptchaType, LazyCaptchaWidgetPreset, LazyCaptchaWidgetWidth } from './types';

/**
 * Builds the HTML shell loaded inside the WebView. The shell loads the
 * LazyCaptcha widget, waits for a token, and posts it back to React Native
 * via the ReactNativeWebView.postMessage bridge.
 */
export function buildCaptchaHtml(opts: {
    sitekey: string;
    baseUrl: string;
    type: LazyCaptchaType;
    theme: LazyCaptchaTheme;
    widget: LazyCaptchaWidgetPreset;
    width?: LazyCaptchaWidgetWidth;
}): string {
    const { sitekey, baseUrl, type, theme, widget, width } = opts;
    const scriptUrl = `${baseUrl.replace(/\/$/, '')}/api/captcha/v1/lazycaptcha.js`;

    const body = escapeHtml(theme === 'dark' ? '#1a1a2e' : '#ffffff');
    const widthAttr = width === undefined || width === null
        ? ''
        : ` data-width="${escapeHtml(String(width))}"`;

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
    <style>
        html, body { margin:0; padding:0; height:100%; background:${body};
                     font-family:-apple-system,BlinkMacSystemFont,Roboto,sans-serif; }
        body { display:flex; align-items:center; justify-content:center; padding:24px; box-sizing:border-box; }
        #wrap { width:100%; max-width:500px; }
    </style>
</head>
<body>
    <div id="wrap">
        <div class="lazycaptcha"
             data-sitekey="${escapeHtml(sitekey)}"
             data-type="${escapeHtml(type)}"
             data-theme="${escapeHtml(theme)}"
             data-widget="${escapeHtml(widget)}"${widthAttr}></div>
    </div>
    <script src="${escapeHtml(scriptUrl)}" async defer></script>
    <script>
    (function () {
        function postToRN(payload) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            }
        }
        function ready() {
            postToRN({ type: 'ready' });
        }
        var tries = 0;
        var timer = setInterval(function () {
            tries++;
            if (tries > 120) {  // ~60s
                clearInterval(timer);
                postToRN({ type: 'error', error: 'widget_load_timeout' });
                return;
            }
            if (window.LazyCaptcha && typeof window.LazyCaptcha.getToken === 'function') {
                if (tries === 1 || tries === 2) ready();
                var el = document.querySelector('.lazycaptcha');
                if (!el) return;
                var t = window.LazyCaptcha.getToken(el);
                if (t) {
                    clearInterval(timer);
                    postToRN({ type: 'token', token: t });
                }
            }
        }, 500);
    })();
    </script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
