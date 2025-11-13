declare class CSInterface {
  constructor();
  evalScript(script: string, callback?: (result: string) => void): void;
  getExtensionID(): string;
}

interface Window {
  __adobe_cep__: any;
}