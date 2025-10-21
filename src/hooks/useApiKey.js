// src/hooks/useApiKey.js
import { useParams } from "react-router-dom";

export function useApiKey() {
  const { paramId } = useParams();
  const apiKey = paramId 
  return apiKey;
}
