import React from 'react';
import TextSeparator from './TextSeparator';

interface TextTabProps {
  activeTextButton: string;
  setActiveTextButton: (button: string) => void;
  deleteOriginal: boolean;
  setDeleteOriginal: (deleteOriginal: boolean) => void;
  handleSeparateText: () => void;
  themeColor: string;
}

const TextTab: React.FC<TextTabProps> = ({
  activeTextButton,
  setActiveTextButton,
  deleteOriginal,
  setDeleteOriginal,
  handleSeparateText,
  themeColor
}) => {
  return (
    <div className="space-y-4">
      <TextSeparator
        activeTextButton={activeTextButton}
        setActiveTextButton={setActiveTextButton}
        deleteOriginal={deleteOriginal}
        setDeleteOriginal={setDeleteOriginal}
        handleSeparateText={handleSeparateText}
        themeColor={themeColor}
      />
    </div>
  );
};

export default TextTab;