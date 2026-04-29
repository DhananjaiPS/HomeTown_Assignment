import React from 'react';
import { Settings2 } from 'lucide-react';

const ModeSelector = ({ currentMode, setMode }) => {
  const modes = [
    { id: 'normal', label: 'Normal Chat' },
    { id: 'hint', label: 'Hint Mode' },
    { id: 'viva', label: 'Viva Mock' },
    { id: 'strict_teacher', label: 'Strict Teacher' }
  ];

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
      <Settings2 size={14} className="text-gray-400" />
      <select
        value={currentMode}
        onChange={(e) => setMode(e.target.value)}
        className="bg-transparent text-xs font-medium text-gray-600 outline-none cursor-pointer"
      >
        {modes.map(mode => (
          <option key={mode.id} value={mode.id}>{mode.label}</option>
        ))}
      </select>
    </div>
  );
};

export default ModeSelector;
