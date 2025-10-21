

import { API_BASE_URL,PERSONA_ID,TASK_ID,SETTINGS_URL } from "@/config";

export const basicSettings = async () => {
  try {
    const response = await fetch(SETTINGS_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chatbot settings: ${response.status}`);
    }

    const data = await response.json();

    

    console.log(" Chatbot settings loaded:", data);

    return data; 
  } catch (error) {
    console.error(" Error fetching chatbot settings:", error);
    return null;
  }
};
export const createActivity = async (apiKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/activity/`, {
      method: "POST",
      headers: {
        "x-personaas-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        persona_id: PERSONA_ID,
        task_id: TASK_ID,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create activity: ${response.status}`);
    }

    const data = await response.json();
    return data.activity_id;
  } catch (error) {
    console.error("❌ Error creating activity:", error);
    return null;
  }
};

/**
 * Helper function to fetch artifact data
 */
const fetchArtifactData = async (apiKey, activityId, filename) => {
  try {
    const url = `${API_BASE_URL}/artifacts/${activityId}/file/${filename}/download`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-personaas-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Artifact fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error fetching artifact data:", error);
    return null;
  }
};

/**
 * Convert Sanity _ref string into a valid CDN image URL
 * Example: image-011d6d958370596500d0b7166765a3fb1923f198-1016x624-jpg
 */
const imageUrlFromRef = (ref) => {
  if (!ref || typeof ref !== "string") return null;
  const match = ref.match(
    /^image-(?<id>[a-f0-9]+)-(?<dims>\d+x\d+)-(?<fmt>jpg|png|jpeg|webp)$/
  );
  if (!match || !match.groups) return null;
  const { id, dims, fmt } = match.groups;
  return `https://cdn.sanity.io/images/ocl5w36p/prod5/${id}-${dims}.${fmt}`;
};

/**
 * Stream message using SSE (Server-Sent Events)
 */
export const streamMessage = async (apiKey, message, context, activityId, onChunk) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/activity/${activityId}/stream`,
      {
        method: "POST",
        headers: {
          "x-personaas-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          input: message,
          context:context
         }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to stream message: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullResponse = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop();

      for (const part of parts) {
        const lines = part.split("\n");
        let eventType = null;
        let eventData = null;

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventType = line.replace("event:", "").trim();
          } else if (line.startsWith("data:")) {
            eventData = line.replace("data:", "").trim();
          }
        }

        if (eventType === "WorkflowCompleted" && eventData) {
          try {
            const jsonData = JSON.parse(eventData);

            if (jsonData.content) {
              fullResponse = jsonData.content.trim();

              const artifactMatch = fullResponse.match(
                /<artifact>(.*?)<\/artifact>/
              );

              if (artifactMatch) {
                fullResponse = fullResponse
                  .replace(/<artifact>.*?<\/artifact>/, "")
                  .trim();

                const filename = artifactMatch[1];
                const artifactData = await fetchArtifactData(
                  apiKey,
                  activityId,
                  filename
                );

                //  HOTEL SEARCH
                if (filename.startsWith("hotel_search")) {
                  if (artifactData?.hotels?.main_hotels?.length) {
                    const hotelImages = artifactData.hotels.main_hotels.map(
                      (hotel) => ({
                        name: hotel.name,
                        image: hotel.images,
                        city: hotel.city_x,
                        address: hotel.address,
                        hotel_id: hotel.hotel_id,
                      })
                    );

                    console.log("hotelImages:", hotelImages);

                    onChunk({ text: fullResponse, hotels: hotelImages });
                  } else {
                    onChunk({
                      text: "I couldn't find any hotels in the artifact data.",
                    });
                  }
                }

                //  ROOM AVAILABILITY
                else if (filename.startsWith("room_availability")) {
                  try {
                    const roomRates =
                      artifactData?.roomAvailability?.roomRates?.map(
                        (rate) => ({
                          roomCode: rate.roomCode,
                          ratePlans: rate.rooms.map((room) => ({
                            rateName: room.rateContent.name,
                            description: room.rateContent.details.description,
                            breakfastIncluded:
                              room.rateContent.details.indicators
                                ?.breakfastIncluded || false,
                            totalPrice:
                              room.standardRate?.total?.amountWithTaxesFees ||
                              room.memberRate?.total?.amountWithTaxesFees,
                            currency:
                              room.standardRate?.total?.currencyCode ||
                              room.memberRate?.total?.currencyCode ||
                              "INR",
                            rateCode: room.rateCode || "N/A",
                          })),
                        })
                      );

                    localStorage.setItem(
                      "roomAvailability",
                      JSON.stringify(roomRates)
                    );

                    const hotelId = artifactData.hotelId;

                    if (hotelId) {
                      // Fetch room media from Sanity CMS
                      const query = `*[_type == "hotel" && hotelId == "${hotelId}"]{
                      "synxisHotelId" : searchTaxonomies->.synxisHotelId,
                        hotelRooms->{
                          roomsList[] {
                            roomCode,
                            basicInfo {
                              media[] {
                                imageAsset {
                                  image[]{asset{_ref}},
                                  largeImage[]{asset{_ref}}
                                }
                              }
                            }
                          }
                        }
                      }`;

                      const encodedQuery = encodeURIComponent(query);
                      const imageResponse = await fetch(
                        `https://ocl5w36p.apicdn.sanity.io/v2022-10-01/data/query/integrateduat?query=${encodedQuery}`,
                        {
                          method: "GET",
                          headers: { "Content-Type": "application/json" },
                        }
                      );

                      if (!imageResponse.ok)
                        throw new Error("Failed to fetch hotel images");

                      const result = await imageResponse.json();
                      const rooms =
                        result?.result?.[0]?.hotelRooms?.roomsList || [];

                      sessionStorage.setItem("synxisHotelId",result?.result?.[0]?.synxisHotelId ||"");

                      //Create roomImages as objects
                      const roomImages = rooms.map((room) => {
                        // Convert Sanity _ref → CDN URL
                        const image =
                          room.basicInfo?.media
                            ?.map((media) => {
                              const ref =
                                media?.imageAsset?.image?.[0]?.asset?._ref ||
                                media?.imageAsset?.largeImage?.[0]?.asset?._ref;
                              return imageUrlFromRef(ref);
                            })
                            .filter(Boolean) || [];

                        // Match all rate plans by roomCode
                        const matchedRoomRates = roomRates?.find(
                          (r) => r.roomCode === room.roomCode
                        );

                        // Each rate plan under this room
                        const ratePlans =
                          matchedRoomRates?.ratePlans?.map((plan) => ({
                            rateName: plan.rateName || "Standard Rate",
                            description:
                              plan.description || "Room details not available.",
                            totalPrice: plan.totalPrice || "N/A",
                            currency: plan.currency || "INR",
                            breakfastIncluded: plan.breakfastIncluded || false,
                            rateCode: plan.rateCode || "N/A",
                          })) || [];

                        return {
                          roomCode: room.roomCode,
                          image,
                          ratePlans, // <--- store multiple plans here
                        };
                      });

                      console.log("✅ Room objects:", roomImages);

                      // Send back structured data to your chat
                      onChunk({ text: fullResponse, hotels: roomImages || [] });
                    } else {
                      onChunk({ text: fullResponse, hotels: [] });
                    }
                  } catch (err) {
                    console.error("Error processing room availability:", err);
                    onChunk({
                      text: "Unable to process room availability data.",
                    });
                  }
                }
              } else {
                onChunk({ text: fullResponse });
              }
            }
          } catch (err) {
            console.warn("⚠️ Invalid JSON in WorkflowCompleted:", err);
          }
        }
      }
    }

    return fullResponse;
  } catch (error) {
    console.error(" Error streaming message:", error);
    throw error;
  }
};
