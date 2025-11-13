import React from 'react';

interface TextSeparatorProps {
  activeTextButton: string;
  setActiveTextButton: (button: string) => void;
  deleteOriginal: boolean;
  setDeleteOriginal: (deleteOriginal: boolean) => void;
  handleSeparateText: () => void;
  themeColor: string;
}

const TextSeparator: React.FC<TextSeparatorProps> = ({
  activeTextButton,
  setActiveTextButton,
  deleteOriginal,
  setDeleteOriginal,
  handleSeparateText,
  themeColor
}) => {
  return (
    <div className="bg-zinc-700/50 p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-3">Text Separator</h3>
      <div className="space-y-4">
        {/* Separation Type Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTextButton('char')}
            className={`flex-1 p-2 rounded-md text-sm transition-colors ${
              activeTextButton === 'char' 
                ? 'text-zinc-900'
                : 'bg-zinc-600 hover:bg-zinc-500 text-zinc-300'
            }`}
            style={activeTextButton === 'char' ? { backgroundColor: themeColor } : {}}
          >
            Characters
          </button>
          <button
            onClick={() => setActiveTextButton('word')}
            className={`flex-1 p-2 rounded-md text-sm transition-colors ${
              activeTextButton === 'word'
                ? 'text-zinc-900'
                : 'bg-zinc-600 hover:bg-zinc-500 text-zinc-300'
            }`}
            style={activeTextButton === 'word' ? { backgroundColor: themeColor } : {}}
          >
            Words
          </button>
          <button
            onClick={() => setActiveTextButton('line')}
            className={`flex-1 p-2 rounded-md text-sm transition-colors ${
              activeTextButton === 'line'
                ? 'text-zinc-900'
                : 'bg-zinc-600 hover:bg-zinc-500 text-zinc-300'
            }`}
            style={activeTextButton === 'line' ? { backgroundColor: themeColor } : {}}
          >
            Lines
          </button>
        </div>

        {/* Delete Original Toggle */}
        <div 
          onClick={() => setDeleteOriginal(!deleteOriginal)}
          className="flex items-center justify-between p-2 bg-zinc-600 rounded-md cursor-pointer hover:bg-zinc-500 transition-colors"
        >
          <span className="text-sm">Delete Original Layer</span>
          <div className="w-4 h-4 border rounded flex items-center justify-center">
            <div 
              className={`w-2 h-2 rounded-sm transition-colors ${deleteOriginal ? '' : 'hidden'}`}
              style={{ backgroundColor: themeColor }}
            />
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleSeparateText}
          className="w-full p-2 rounded-md text-sm font-medium text-zinc-900"
          style={{ backgroundColor: themeColor }}
        >
          Separate Text
        </button>
      </div>
    </div>
  );
};

export default TextSeparator;