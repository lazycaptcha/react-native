import { useCallback, useState } from 'react';
import type { LazyCaptchaProps } from './types';

export interface UseLazyCaptchaOptions {
    sitekey: string;
    type?: LazyCaptchaProps['type'];
    theme?: LazyCaptchaProps['theme'];
    baseUrl?: string;
}

export interface UseLazyCaptchaReturn {
    visible: boolean;
    token: string | null;
    error: string | null;
    show: () => Promise<string>;
    hide: () => void;
    reset: () => void;
    props: {
        sitekey: string;
        type?: LazyCaptchaProps['type'];
        theme?: LazyCaptchaProps['theme'];
        baseUrl?: string;
        visible: boolean;
        onVerify: (t: string) => void;
        onCancel: () => void;
        onError: (e: string) => void;
        onRequestClose: () => void;
    };
}

/**
 * Hook that drives the <LazyCaptcha /> modal imperatively.
 *
 *   const { show, props } = useLazyCaptcha({ sitekey: 'xyz' });
 *
 *   async function handleSubmit() {
 *     const token = await show();
 *     await fetch('/api/...', {
 *       body: JSON.stringify({ 'lazycaptcha-token': token, ...data }),
 *     });
 *   }
 *
 *   return <>
 *     <Button onPress={handleSubmit} title="Submit" />
 *     <LazyCaptcha {...props} />
 *   </>;
 */
export function useLazyCaptcha(options: UseLazyCaptchaOptions): UseLazyCaptchaReturn {
    const [visible, setVisible] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [resolver, setResolver] = useState<{
        resolve: (t: string) => void;
        reject: (e: Error) => void;
    } | null>(null);

    const show = useCallback((): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            setResolver({ resolve, reject });
            setToken(null);
            setError(null);
            setVisible(true);
        });
    }, []);

    const hide = useCallback(() => setVisible(false), []);

    const reset = useCallback(() => {
        setToken(null);
        setError(null);
    }, []);

    const onVerify = useCallback((t: string) => {
        setToken(t);
        setVisible(false);
        resolver?.resolve(t);
        setResolver(null);
    }, [resolver]);

    const onCancel = useCallback(() => {
        setVisible(false);
        resolver?.reject(new Error('cancelled'));
        setResolver(null);
    }, [resolver]);

    const onError = useCallback((e: string) => {
        setError(e);
        setVisible(false);
        resolver?.reject(new Error(e));
        setResolver(null);
    }, [resolver]);

    return {
        visible,
        token,
        error,
        show,
        hide,
        reset,
        props: {
            sitekey: options.sitekey,
            type: options.type,
            theme: options.theme,
            baseUrl: options.baseUrl,
            visible,
            onVerify,
            onCancel,
            onError,
            onRequestClose: onCancel,
        },
    };
}
