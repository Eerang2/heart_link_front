import React, { useEffect, useRef, useState } from "react";

const ChatLocation = ({ onSelect }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState([]);
  const [isKakaoReady, setIsKakaoReady] = useState(false);
  const markers = useRef([]);

  // ✅ Kakao 로드될 때까지 polling 방식으로 기다림
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 3,
        });
        setMap(map);
        setIsKakaoReady(true);
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (!isKakaoReady || !map) {
      alert("지도를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setPlaces(data);

        if (data.length > 0) {
          const firstPlace = data[0];
          const center = new window.kakao.maps.LatLng(firstPlace.y, firstPlace.x);
          map.setCenter(center);
        }
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  const handlePlaceClick = (place) => {
    if (!map) return;

    // 기존 마커 제거
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    const position = new window.kakao.maps.LatLng(place.y, place.x);
    map.setCenter(position);

    const marker = new window.kakao.maps.Marker({
      map,
      position,
    });
    markers.current.push(marker);

    onSelect?.({
      name: place.place_name,
      address: place.road_address_name || place.address_name,
      lat: place.y,
      lng: place.x,
    });
  };

  return (
    <div>
      <div style={{ display: "flex", marginBottom: "6px", gap: "4px" }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="장소를 검색하세요"
        />
        <button onClick={handleSearch} style={{ padding: "6px 12px" }}>검색</button>
      </div>

      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "300px",
          borderRadius: "8px",
          backgroundColor: "#f2f2f2",
        }}
      />

      <ul
        style={{
          marginTop: "6px",
          paddingLeft: "0",
          listStyle: "none",
          maxHeight: "200px",
          overflowY: "auto",
          border: "1px solid #eee",
          borderRadius: "8px",
        }}
      >
        {places.map((place, idx) => (
          <li
            key={idx}
            onClick={() => handlePlaceClick(place)}
            style={{ cursor: "pointer", padding: "6px 10px", borderBottom: "1px solid #f2f2f2" }}
          >
            📍 {place.place_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatLocation;
