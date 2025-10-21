import { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ChatMessage({
  message,
  setAutoSend,
  setInputValuetoShhow,
  setInputValue,
  basicSettingsData,
  setContext
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  

  // refs for carousel containers
  const hotelCarouselRef = useRef(null);
  const roomCarouselRef = useRef(null);

  const observerRef = useRef(null);


  const handleHotelClick = (name, id) => {
    setInputValuetoShhow(`I am interested in ${name}`);
    setInputValue(`I am interested in ${name} which has hotel_id : ${id}`);
    setContext("");
    setAutoSend(true);
  };

  const handleRoomClick = (roomCode,rateCode)=>{
    console.log("room",rateCode);
    
    const storeId = sessionStorage.getItem("synxisHotelId") || "";
    setInputValuetoShhow(`I am interested in ${roomCode} `);
    setInputValue(`User is interested in room , Room Code: ${roomCode}, Rate Code: ${rateCode} and store id is: ${storeId} `);
    setContext("");
    setAutoSend(true);
  }

  const isTyping =
    message.sender === "bot" &&
    (typeof message.text !== "string" || !message.text.trim());

  const isHotelData =
    Array.isArray(message.hotels) &&
    message.hotels.length > 0 &&
    message.hotels[0]?.hotel_id;

  const isRoomData =
    Array.isArray(message.hotels) &&
    message.hotels.length > 0 &&
    message.hotels[0]?.roomCode;

  // Observe which slide is most visible inside the carousel root
  useEffect(() => {
    if (!message.hotels || message.hotels.length === 0) return;

    // choose proper root depending on whether it's hotel or room carousel
    const root =
      (isHotelData && hotelCarouselRef.current) ||
      (isRoomData && roomCarouselRef.current) ||
      null;

    // Find the slide elements that we added data-index to
    const items = root
      ? root.querySelectorAll(".carousel-item[data-index]")
      : document.querySelectorAll(".carousel-item[data-index]");

    if (!items || items.length === 0) return;

    // disconnect any existing observer
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // when a slide is sufficiently visible inside the root, mark it active
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            if (!Number.isNaN(idx)) {
              setActiveIndex(idx);
            }
          }
        });
      },
      {
        root, // root is the carousel container so intersection is relative to it
        threshold: 0.6, // tune: 0.6 means 60% visible to be considered active
        rootMargin: "0px",
      }
    );

    items.forEach((item) => observerRef.current.observe(item));

    return () => observerRef.current?.disconnect();
  }, [message.hotels, isHotelData, isRoomData]);

  // Whenever active item changes, set input values accordingly
  useEffect(() => {
    if (isHotelData) {
      const activeHotel = message.hotels[activeIndex];
      if (activeHotel) {
        setContext(
          `user is looking for ${activeHotel.name} which has hotel_id : ${activeHotel.hotel_id}`
        );
        
      }
    }

    if (isRoomData) {
      const activeRoom = message.hotels[activeIndex];
      if (activeRoom) {
        const rateCode = activeRoom.ratePlans?.[0]?.rateCode || "N/A";
        const storeId = sessionStorage.getItem("synxisHotelId") || "";
        setContext(
          `User is looking for room , Room Code: ${activeRoom.roomCode}, Rate Code: ${rateCode} and store id is: ${storeId}`
        );
        
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, isHotelData, isRoomData]);

  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      } message-animate`}
    >
      <div
        className={`flex gap-2 max-w-[80%] ${
          message.sender === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="flex flex-col">
          <div
            className={`rounded-2xl px-4  py-3 ${
              message.sender === "user"
                ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-tr-none"
                : "bg-white text-gray-800 shadow-sm rounded-tl-none"
            }`}
            style={
              message.sender === "user"
                ? {
                    background: basicSettingsData.theme_color,
                    fontSize:basicSettingsData.query_font_size
                  }
                : {
                  background:basicSettingsData.response_bubble_color,
                  fontSize:basicSettingsData.response_font_size
                }
            }
          >
            {/* Typing Indicator */}
            {isTyping ? (
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            ) : (
              <>
                {/* Message Text */}
                {typeof message.text === "string" && message.text.trim() && (
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                )}

                {/* HOTEL CAROUSEL */}
                {message.sender === "bot" && isHotelData && (
                  <div className="mt-3">
                    {/* root for IntersectionObserver */}
                    <div ref={hotelCarouselRef} className="w-[250px]">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {message.hotels.map((hotel, idx) => (
                            <CarouselItem key={idx}>
                              
                              <div
                                data-index={idx}
                                className={`carousel-item p-1 flex flex-col items-center`}
                              >
                                <div className="relative w-full">
                                  <img
                                    src={hotel.image}
                                    alt={hotel.name}
                                    className={`rounded-xl w-full h-48 object-cover shadow-md transition-transform duration-300 ${
                                      activeIndex === idx ? "scale-105" : ""
                                    }`}
                                    onClick={() =>
                                      handleHotelClick(hotel.name, hotel.hotel_id)
                                    }
                                  />

                                  {/* Hotel Carousel Controls */}
                                  <CarouselPrevious
                                    className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 shadow-md border border-gray-300 rounded-full transition-all hover:scale-110"
                                    size="icon"
                                    variant="outline"
                                  />
                                  <CarouselNext
                                    className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 shadow-md border border-gray-300 rounded-full transition-all hover:scale-110"
                                    size="icon"
                                    variant="outline"
                                  />
                                </div>

                                <p className="text-sm font-semibold mt-2 text-center">
                                  {hotel.name}
                                </p>
                                <p className="text-xs text-gray-500 text-center">
                                  {hotel.city}
                                </p>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                    </div>
                  </div>
                )}

                {/* ROOM CAROUSEL */}
                {message.sender === "bot" && isRoomData && (
                  <div className="mt-3">
                    <div
                      ref={roomCarouselRef}
                      className="relative w-[300px] overflow-hidden"
                    >
                      <Carousel className="w-full">
                        <CarouselContent>
                          {message.hotels.map((room, idx) => (
                            <CarouselItem key={idx}>
                              <div
                                data-index={idx}
                                className="carousel-item relative flex flex-col items-center p-2 transition-all duration-300"
                              >
                                {/* Room Image */}
                                <div className="relative w-full">
                                  <img
                                    src={
                                      Array.isArray(room.image)
                                        ? room.image[0]
                                        : room.image
                                    }
                                    alt={room.roomCode}
                                    className={`rounded-xl w-full h-52 object-cover shadow-md ${
                                      activeIndex === idx ? "scale-105" : ""
                                    }`}
                                    onClick={()=>handleRoomClick(room.roomCode,room.ratePlans[0].rateCode)}
                                  />

                                  {/* Room Carousel Controls */}
                                  <CarouselPrevious
                                    className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 shadow-md border border-gray-300 rounded-full transition-all hover:scale-110"
                                    size="icon"
                                    variant="outline"
                                  />
                                  <CarouselNext
                                    className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 shadow-md border border-gray-300 rounded-full transition-all hover:scale-110"
                                    size="icon"
                                    variant="outline"
                                  />
                                </div>

                                {/* Room Info */}
                                <div
                                  className={`text-center mt-3 w-full transition-all duration-300 ${
                                    !room.ratePlans?.length ? "pb-2" : ""
                                  }`}
                                >
                                  <p className="text-sm font-semibold">
                                    Room Code: {room.roomCode}
                                  </p>

                                  {/* Rate Plans */}
                                  {Array.isArray(room.ratePlans) &&
                                  room.ratePlans.length > 0 ? (
                                    <div className="mt-2 space-y-2">
                                      {room.ratePlans.map((plan, i) => (
                                        <div
                                          key={i}
                                          className="border border-gray-200 rounded-xl p-2 text-left bg-gray-50 shadow-sm"
                                        >
                                          <p className="text-sm font-semibold text-gray-800">
                                            {plan.rateName || "Unnamed Plan"}
                                          </p>

                                          {plan.breakfastIncluded && (
                                            <p className="text-xs text-green-600 font-medium mt-1">
                                              Breakfast included
                                            </p>
                                          )}

                                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                            {plan.description ||
                                              "No description available."}
                                          </p>

                                          {plan.totalPrice && (
                                            <p className="text-sm font-bold mt-2 text-amber-600">
                                              {plan.currency || "INR"}{" "}
                                              {plan.totalPrice}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs  text-gray-500 mt-2">
                                      No rate plans available.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Timestamp */}
          <span
            className={`text-xs text-gray-500 mt-1 ${
              message.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}
