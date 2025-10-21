import { useState, useEffect, useRef } from "react";
import { createActivity, streamMessage, basicSettings } from "../services/api";
import {useApiKey} from "./useApiKey"


export const useChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi, I am Ira.",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [inputValuetoShow, setInputValuetoShhow] = useState("");
  const [activityId, setActivityId] = useState(sessionStorage.getItem("activityId") || null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSend, setAutoSend] = useState(false);
  const [basicSettingsData, setBasicSettingsData] = useState(null);
  const [context,setContext]=useState("");

  //  Ref guard to prevent double API calls in React StrictMode
  const hasFetched = useRef(false);

   const apiKey = useApiKey();
  //  console.log("apiKey",apiKey);
   

  //  Clear session storage on reload/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("activityId");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  //  Fetch welcome message from API (only once)
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchBasicSettings = async () => {
      try {
        const res = await basicSettings();
        setBasicSettingsData(res)
        if (res?.welcome_message) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === 1
                ? { ...msg, text: `${msg.text}\n${res.welcome_message}` }
                : msg
            )
          );
        }
      } catch (err) {
        console.error(" Error fetching welcome message:", err);
      }
    };

    fetchBasicSettings();
  }, []);

  //  Auto-send handler
  useEffect(() => {
    if (autoSend) {
      handleSend();
      setAutoSend(false);
    }
  }, [autoSend]);

  //  Send message & stream bot response
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValuetoShow,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setInputValuetoShhow("");
    setContext("");
    setIsLoading(true);

    try {
      let currentActivityId = activityId;

      if (!currentActivityId) {
        currentActivityId = await createActivity(apiKey);
        if (!currentActivityId) throw new Error("Failed to create activity");
        setActivityId(currentActivityId);
        sessionStorage.setItem("activityId", currentActivityId);
        console.log(" New activity created:", currentActivityId);
      }

      const botMessageId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          text: "",
          hotels: [],
          sender: "bot",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ]);

      await streamMessage(apiKey,currentInput, context, currentActivityId, (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  text: chunk.text || "",
                  hotels: chunk.hotels || [],
                }
              : msg
          )
        );
      });

      console.log(" Message stream completed");
    } catch (error) {
      console.error(" Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  //  Quick action handler
  const handleQuickAction = (action) => {
    setInputValue(action);
    setInputValuetoShhow(action);
    // setAutoSend(true);
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    handleSend,
    handleQuickAction,
    inputValuetoShow,
    setInputValuetoShhow,
    setAutoSend,
    basicSettingsData,
    context,
    setContext

  };
};
