import React, { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';

const NotesEditor = ({ note, onSave }) => {
  const [content, setContent] = useState(note || "");

  useEffect(() => {
    setContent(note || "");
  }, [note]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Notes</h3>
      </div>

      {/* Text Area */}
      <textarea
        className="flex-1 p-4 resize-none outline-none text-slate-600 dark:text-slate-300 dark:bg-slate-800 text-sm leading-relaxed"
        placeholder="Type your notes here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={() => onSave(content)}
      />


    </div>
  );
};

export default NotesEditor;
