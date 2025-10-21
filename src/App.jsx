import { Routes, Route, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import ChatApp from "./components/ChatApp";
import { useEffect } from "react";

function MissingApiKey() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50">
      <h1 className="text-2xl font-semibold text-red-600 mb-4">
        Bot ID Not Provided
      </h1>
      <p className="text-gray-600 mb-6">
        Please include your Bot ID in the URL, for example:
      </p>
      <code className="bg-gray-200 px-4 py-2 rounded-lg text-sm text-gray-800">
        {window.location.origin}?botId=your-bot-id-here
      </code>
    </div>
  );
}

function QueryParamHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const botId = searchParams.get('botId');

  useEffect(() => {
    if (botId) {
      navigate(`/${botId}`);
    }
  }, [botId, navigate]);

  return <MissingApiKey />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<QueryParamHandler />} />
      <Route path="/:paramId" element={<ChatApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}