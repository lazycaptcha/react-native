# @lazycaptcha/react-native

React Native SDK for [LazyCaptcha](https://lazycaptcha.com). WebView-based, works on iOS and Android out of the box.

[![npm](https://img.shields.io/npm/v/@lazycaptcha/react-native.svg)](https://npmjs.com/package/@lazycaptcha/react-native)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @lazycaptcha/react-native react-native-webview
# iOS only:
cd ios && pod install
```

`react-native-webview` is a required peer dependency.

## Usage

### Imperative — the hook

```tsx
import { LazyCaptcha, useLazyCaptcha } from '@lazycaptcha/react-native';
import { Button, Alert } from 'react-native';

export function ContactScreen() {
    const captcha = useLazyCaptcha({
        sitekey: 'YOUR_SITE_KEY',
        type: 'auto',
    });

    async function submit() {
        try {
            const token = await captcha.show();
            await fetch('https://yourapi.com/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'user@example.com',
                    'lazycaptcha-token': token,
                }),
            });
        } catch (err) {
            Alert.alert('Captcha cancelled');
        }
    }

    return (
        <>
            <Button title="Send message" onPress={submit} />
            <LazyCaptcha {...captcha.props} />
        </>
    );
}
```

### Declarative — the component alone

```tsx
import { LazyCaptcha } from '@lazycaptcha/react-native';

function MyScreen() {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <Button title="Verify" onPress={() => setVisible(true)} />
            <LazyCaptcha
                sitekey="YOUR_SITE_KEY"
                visible={visible}
                onVerify={(token) => {
                    setVisible(false);
                    sendTokenToBackend(token);
                }}
                onCancel={() => setVisible(false)}
                onError={(err) => Alert.alert('Error', err)}
            />
        </>
    );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sitekey` | `string` | **required** | Public UUID from your dashboard |
| `type` | `'auto' \| 'image_puzzle' \| 'pow' \| 'behavioral' \| 'text_math'` | `'auto'` | Challenge type |
| `theme` | `'light' \| 'dark'` | `'light'` | Widget theme |
| `baseUrl` | `string` | `'https://lazycaptcha.com'` | Your LazyCaptcha instance |
| `visible` | `boolean` | `true` | Modal visibility (use with `onRequestClose`) |
| `animationType` | `'none' \| 'slide' \| 'fade'` | `'slide'` | Modal animation |
| `onVerify` | `(token: string) => void` | — | Called when user solves |
| `onCancel` | `() => void` | — | Called on backdrop tap / back press |
| `onError` | `(err: string) => void` | — | Called on error |
| `onRequestClose` | `() => void` | — | Android back button handler |

## How it works

The SDK renders the LazyCaptcha widget inside a `react-native-webview`. When the user solves the challenge, an inline script inside the WebView posts the token back to React Native via `ReactNativeWebView.postMessage`. The component picks up the message and fires `onVerify`.

## Server verification

Verify the token from your backend (never trust the client):

```ts
const resp = await fetch('https://lazycaptcha.com/api/captcha/v1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        secret: process.env.LAZYCAPTCHA_SECRET,
        token: req.body['lazycaptcha-token'],
        remote_ip: req.ip,
    }),
});
const { success } = await resp.json();
if (!success) throw new Error('Captcha failed');
```

## Platforms

- iOS 11+
- Android minSdk 21+ (React Native default)

## Expo

Works with Expo managed apps via `expo-dev-client` or any config plugin that includes `react-native-webview`. EAS Build handles it automatically.

## License

[MIT](LICENSE)
