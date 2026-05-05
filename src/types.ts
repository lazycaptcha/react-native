export type LazyCaptchaType = 'auto' | 'image_puzzle' | 'pow' | 'behavioral' | 'text_math' | 'press_hold' | 'rotate_align';
export type LazyCaptchaTheme = 'light' | 'dark' | 'auto';
export type LazyCaptchaWidgetPreset = 'standard' | 'compact' | 'newsletter' | 'login';
export type LazyCaptchaWidgetWidth = number | string;

export interface LazyCaptchaProps {
    /** Public site key from your LazyCaptcha dashboard (UUID). */
    sitekey: string;
    /** Challenge type. */
    type?: LazyCaptchaType;
    /** Light or dark widget theme. */
    theme?: LazyCaptchaTheme;
    /** Widget preset. */
    widget?: LazyCaptchaWidgetPreset;
    /** Optional width override. The hosted widget caps widths at 500px. */
    width?: LazyCaptchaWidgetWidth;
    /** Base URL of your LazyCaptcha instance. */
    baseUrl?: string;
    /** Called when the user completes the challenge flow. */
    onVerify?: (token: string) => void;
    /** Called when the user dismisses / cancels. */
    onCancel?: () => void;
    /** Called on any error (network, widget init, etc.). */
    onError?: (error: string) => void;
    /** Control visibility (for modal-style presentation). */
    visible?: boolean;
    /** Modal animation type. */
    animationType?: 'none' | 'slide' | 'fade';
    /** Close callback (fires on backdrop tap / back button). */
    onRequestClose?: () => void;
}

export interface LazyCaptchaBridgeMessage {
    type: 'token' | 'error' | 'ready';
    token?: string;
    error?: string;
}
