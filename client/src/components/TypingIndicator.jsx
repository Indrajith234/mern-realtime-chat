import React from 'react';

const TypingIndicator = ({ typers }) => {
  if (!typers || Object.keys(typers).length === 0) return null;

  const names = Object.values(typers);
  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-1 animate-fade-in">
      {/* Animated dots */}
      <div className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-bl-sm msg-received">
        <span
          className="w-2 h-2 rounded-full bg-violet-400 dot-1"
          style={{ display: 'inline-block' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-violet-400 dot-2"
          style={{ display: 'inline-block' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-violet-400 dot-3"
          style={{ display: 'inline-block' }}
        />
      </div>
      <span className="text-xs text-slate-400 italic">{label}…</span>
    </div>
  );
};

export default TypingIndicator;
