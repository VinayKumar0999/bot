import { Routes, Route, Navigate } from "react-router-dom";
import ChatApp from "./components/ChatApp";

function MissingApiKey() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50">
      <h1 className="text-2xl font-semibold text-red-600 mb-4">
        API Key Not Provided
      </h1>
      <p className="text-gray-600 mb-6">
        Please include your API key in the URL, for example:
      </p>
      <code className="bg-gray-200 px-4 py-2 rounded-lg text-sm text-gray-800">
        http://localhost:5173/your-api-key-here
      </code>
    </div>
  );
}

export default function App() {
  
  return (
    <Routes>
       <Route path="/" element={<MissingApiKey />} />
      <Route path="/:paramId" element={<ChatApp />} />
    </Routes>
  );
}
