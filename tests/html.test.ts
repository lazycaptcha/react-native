import { buildCaptchaHtml } from '../src/html';

describe('buildCaptchaHtml', () => {
    it('embeds the sitekey', () => {
        const html = buildCaptchaHtml({
            sitekey: 'my-key',
            baseUrl: 'https://lazycaptcha.com',
            type: 'auto',
            theme: 'light',
        });
        expect(html).toContain('data-sitekey="my-key"');
    });

    it('escapes HTML in attributes', () => {
        const html = buildCaptchaHtml({
            sitekey: '<script>alert(1)</script>',
            baseUrl: 'https://lazycaptcha.com',
            type: 'auto',
            theme: 'light',
        });
        expect(html).not.toContain('<script>alert(1)</script>');
        expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('loads the widget script from baseUrl', () => {
        const html = buildCaptchaHtml({
            sitekey: 'k',
            baseUrl: 'https://my.example.com',
            type: 'auto',
            theme: 'dark',
        });
        expect(html).toContain('https://my.example.com/api/captcha/v1/lazycaptcha.js');
    });

    it('includes the bridge postMessage code', () => {
        const html = buildCaptchaHtml({
            sitekey: 'k', baseUrl: 'https://x.y', type: 'auto', theme: 'light',
        });
        expect(html).toContain('window.ReactNativeWebView');
        expect(html).toContain('postMessage');
    });
});
