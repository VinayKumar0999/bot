export default function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  basicSettingsData,
  disabled,
  inputValuetoShow,
  setInputValuetoShhow,
  
}) {
  const handelvalue = (value) => {
    
      onChange(value);
    setInputValuetoShhow(value);
  };
  const themeColor = basicSettingsData?.theme_color || "#f59e0b"; 

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={inputValuetoShow}
          onChange={(e) => handelvalue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your message"
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:ring-2  text-sm"
          style={{
            "--tw-ring-color": basicSettingsData?.theme_color || "#f59e0b", // fallback amber
          }}
          disabled={disabled}
        />

        <button
          onClick={onSend}
          disabled={disabled || value.trim().length < 1}
          className="p-2 bg-gradient-to-r  text-white from-amber-600 to-amber-700 rounded-full hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, ${themeColor}, ${themeColor})`,
          }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
