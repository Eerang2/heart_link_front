import React, { useEffect, useRef } from "react";

const MapMessage = ({ location }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;
    const container = mapRef.current;
    const map = new window.kakao.maps.Map(container, {
      center: new window.kakao.maps.LatLng(location.lat, location.lng),
      level: 3
    });
    new window.kakao.maps.Marker({
      map,
      position: new window.kakao.maps.LatLng(location.lat, location.lng)
    });
  }, [location]);

  const kakaoMapUrl = `https://map.kakao.com/link/map/${location.name},${location.lat},${location.lng}`;

  return (
    <div style={{ marginTop: "6px", borderRadius: "8px", overflow: "hidden" }}>
      <a
        href={kakaoMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "block" }}
      >
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "200px",
            pointerEvents: "none", // 클릭은 a태그로만
            borderRadius: "8px"
          }}
        />
      </a>
    </div>
  );
};

export default MapMessage;
