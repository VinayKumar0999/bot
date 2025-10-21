export default function ChatHeader({setIsModalOpen,basicSettingsData}) {
   const logoUrl =  "src/assets/greeting-person.png";
  const themeColor = basicSettingsData?.theme_color || "#f59e0b"; 
  return (
    <div  className="bg-gradient-to-r p-4  flex items-center justify-between" style={{
        background: `linear-gradient(to right, ${themeColor}, ${themeColor})`,
      }}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-white flex items-end justify-center overflow-hidden">
            <div className="text-2xl"> <img src={basicSettingsData?.logo_url} alt="greeting"  /></div>
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">{basicSettingsData.title}</h1>
          <p className="text-amber-100 text-sm">Welcome to {basicSettingsData.title}</p>
        </div>
      </div>
      <button onClick={() => setIsModalOpen(false)} className="text-white hover:bg-amber-800 rounded-full p-1 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}