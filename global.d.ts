export {};

declare global {
  interface Window {
    electronAPI?: {
      closeApp: () => void;
      minimizeApp: () => void;
    };
  }

  declare module "*.webp" {
    const value: string;
    export default value;
  }
}
