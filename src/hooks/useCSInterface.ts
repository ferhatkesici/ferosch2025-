import { useCallback } from 'react';

export const useCSInterface = () => {
  const evalScript = useCallback((script: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && 'CSInterface' in window) {
        const csInterface = new (window as any).CSInterface();
        csInterface.evalScript(script, (result: string) => {
          if (result === 'EvalScript error') {
            reject(new Error(`Error executing script: ${script}`));
            return;
          }
          resolve(result);
        });
      } else {
        reject(new Error('CSInterface not available'));
      }
    });
  }, []);

  const callExtendScriptFunction = useCallback((functionName: string, ...args: any[]): Promise<string> => {
    const argsString = args.map(arg => {
      if (typeof arg === 'string') {
        return `"${arg}"`;
      }
      return arg;
    }).join(', ');
    
    const script = `${functionName}(${argsString})`;
    return evalScript(script);
  }, [evalScript]);

  return {
    evalScript,
    callExtendScriptFunction
  };
};