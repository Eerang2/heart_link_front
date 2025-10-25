import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import * as StompJs from "@stomp/stompjs";
import api from "../api/axiosInstance";
import Emoji from "../components/ui/Emoji";
import "../styles/Chatting.css";
import { useNavigate } from "react-router-dom";
import ProfileModal from "../components/ProfileModal";

// 서버가 ENUM(대문자)으로 받는 경우 안전 매핑
const REASON_MAP = {
  spam: "SPAM",
  abuse: "ABUSE",
  fraud: "FRAUD",
  inappropriate: "INAPPROPRIATE",
  impersonation: "IMPERSONATION",
  other: "OTHER",
};

const Chatting = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [heartedUserIds, setHeartedUserIds] = useState(new Set());

  const [isComposing, setIsComposing] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");
  const currentUserId = token ? Number(JSON.parse(atob(token.split(".")[1])).sub) : null;

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!token) return;

      try {
        const [chatRoomRes, pendingRes] = await Promise.all([
          api.get("/api/on/chat-rooms"),
          api.get("/api/on/chat-rooms/pending"),
        ]);

        const rooms = chatRoomRes.data;
        const pending = pendingRes.data;

        const converted = await Promise.allSettled(
            rooms.map(async (room) => {
              try {
                const messagesRes = await api.get(`/api/on/chat-rooms/${room.chatRoomId}/messages`);
                const msgList = messagesRes.data.map((msg) => ({
                  from: msg.senderId === currentUserId ? "me" : "other",
                  text: msg.content,
                  time: new Date(msg.sentAt).getTime(),
                }));

                return {
                  chatRoomId: room.chatRoomId, // 채팅방 ID ✨
                  opponentId: room.opponentMemberId, // 상대 유저 ID ✨
                  name: room.opponentNickname,
                  image: room.opponentProfileImageUrl || "/images/default-profile.png",
                  unreadCount: room.unreadMessageCount,
                  messages: msgList,
                  lastMessage: msgList.length > 0 ? msgList[msgList.length - 1].text : "",
                };
              } catch (e) {
                console.error(`❌ 메시지 로딩 실패 (chatRoomId: ${room.chatRoomId})`, e);
                return null;
              }
            })
        );

        setChatUsers(converted.filter((r) => r.status === "fulfilled").map((r) => r.value));
        setPendingRequests(pending);
      } catch (error) {
        console.error("채팅방 목록 조회 실패:", error);
      }
    };

    fetchChatRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onInputKeyDown = (e) => {
    const composing = isComposing || e.nativeEvent.isComposing || e.keyCode === 229;
    if (e.key === "Enter" && !composing) {
      e.preventDefault();
      handleSend();
    }
  };


  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [selectedUser?.messages?.length]);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws/chat");
    const stompClient = new StompJs.Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
      },
      onStompError: (frame) => {
        console.error("❌ STOMP 오류:", frame.headers["message"]);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, []);

  useEffect(() => {
    if (!stompClientRef.current || !selectedUser || !isConnected || !stompClientRef.current.connected) return;

    // ✅ 채팅방 토픽은 chatRoomId를 사용
    const topic = `/topic/chatroom.${selectedUser.chatRoomId}`;
    const subscription = stompClientRef.current.subscribe(topic, (message) => {
      const body = JSON.parse(message.body);

      if (body.senderId === currentUserId) return;

      const newMsg = {
        from: "other",
        text: body.content,
        time: new Date(body.sentAt).getTime(),
      };

      setChatUsers((prev) => {
        const updated = prev.map((user) =>
            Number(user.chatRoomId) === Number(selectedUser.chatRoomId)
                ? { ...user, messages: [...user.messages, newMsg], lastMessage: body.content }
                : user
        );
        setSelectedUser(updated.find((u) => Number(u.chatRoomId) === Number(selectedUser.chatRoomId)));
        return updated;
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedUser, isConnected, currentUserId]);

  const handleSend = async () => {
    if (!message.trim() || !selectedUser) return;

    try {
      const payload = { senderId: currentUserId, content: message };

      // ✅ 발행 목적지도 chatRoomId
      stompClientRef.current?.publish({
        destination: `/app/chat.send.${selectedUser.chatRoomId}`,
        body: JSON.stringify(payload),
      });

      const newMsg = { from: "me", text: message, time: Date.now() };

      const updated = chatUsers.map((user) =>
          Number(user.chatRoomId) === Number(selectedUser.chatRoomId)
              ? { ...user, messages: [...user.messages, newMsg], lastMessage: message }
              : user
      );

      setChatUsers(updated);
      setSelectedUser(updated.find((u) => Number(u.chatRoomId) === Number(selectedUser.chatRoomId)));
      setMessage("");
      setShowEmoji(false);
    } catch (err) {
      console.error("WebSocket 메시지 전송 실패", err);
    }
  };

  const handleUserClick = async (user) => {
    try {
      // ✅ 읽음 처리도 chatRoomId
      await api.post(`/api/on/chat-rooms/${user.chatRoomId}/read`);
      const updated = chatUsers.map((u) =>
          u.chatRoomId === user.chatRoomId ? { ...u, unreadCount: 0 } : u
      );
      setChatUsers(updated);
      setSelectedUser(user);
    } catch (e) {
      console.error("읽음 처리 실패", e);
    }
  };

  function mapAndValidateProfile(raw) {
    if (!raw || typeof raw !== "object") {
      throw new Error("PROFILE_EMPTY");
    }

    const memberId = raw.memberId ?? raw.id;
    if (!memberId && memberId !== 0) throw new Error("MISSING_MEMBER_ID");

    const name = raw.name ?? raw.nickname;
    if (!name) throw new Error("MISSING_NAME");

    const ageRaw = raw.age ?? raw.ageYears;
    const ageNum = Number(ageRaw);
    if (!Number.isFinite(ageNum) || ageNum <= 0) throw new Error("MISSING_OR_INVALID_AGE");

    const city = raw.city ?? raw?.location?.city;
    const district = raw.district ?? raw?.location?.district;
    if (!city || !district) throw new Error("MISSING_LOCATION");

    let interests = [];
    if (Array.isArray(raw.interests)) {
      interests = raw.interests.map((i) => (typeof i === "string" ? i : i?.tag)).filter(Boolean);
    } else if (Array.isArray(raw.interestList)) {
      interests = raw.interestList.map((i) => (typeof i === "string" ? i : i?.tag)).filter(Boolean);
    }
    if (!Array.isArray(interests) || interests.length === 0) throw new Error("MISSING_INTERESTS");

    let images = [];
    if (Array.isArray(raw.images) && raw.images.length) {
      images = [...raw.images]
          .sort((a, b) => {
            const ra = String(a.role || "").toUpperCase();
            const rb = String(b.role || "").toUpperCase();
            if (ra.includes("MAIN") && !rb.includes("MAIN")) return -1;
            if (!ra.includes("MAIN") && rb.includes("MAIN")) return 1;
            return 0;
          })
          .map((it) => it.url)
          .filter(Boolean);
    } else {
      const main = raw.mainImageUrl ? [raw.mainImageUrl] : [];
      const subs = Array.isArray(raw.subImageUrls) ? raw.subImageUrls : [];
      images = [...main, ...subs].filter(Boolean);
    }
    if (!images.length) throw new Error("MISSING_IMAGES");

    return {
      memberId,
      name,
      age: ageNum,
      location: `${city} · ${district}`,
      interests,
      images,
    };
  }

  const openProfileModal = async (user) => {
    try {
      // ✅ 모달은 상대 유저 ID(opponentId) 사용
      const targetId = user.opponentId;
      if (targetId == null) {
        throw new Error("NO_OPPONENT_ID_IN_CHAT_USER");
      }

      const res = await api.get(`/api/on/profile/modal/${targetId}`);
      const mapped = mapAndValidateProfile(res.data);

      setProfileData(mapped);
      setIsProfileOpen(true);
    } catch (err) {
      console.error("❌ 프로필 불러오기/검증 실패:", err);
      alert(`프로필 데이터를 불러오지 못했습니다.\n사유: ${err?.message ?? "UNKNOWN"}`);
    }
  };

  const sortedChatUsers = [...chatUsers].sort((a, b) => {
    const aTime = a.messages[a.messages.length - 1]?.time || 0;
    const bTime = b.messages[b.messages.length - 1]?.time || 0;
    return bTime - aTime;
  });


  const submitReport = async ({ type, content, evidenceUrl = null }) => {
    try {
      // 신고 대상: 프로필 모달이 열려있다면 modal의 memberId, 아니면 현재 선택된 상대
      const targetMemberId = profileData?.memberId ?? selectedUser?.opponentMemberId;
      if (!targetMemberId) {
        alert("신고 대상 ID를 확인할 수 없습니다.");
        return;
      }

      // 선택: 최근 N개의 메시지를 증거로 첨부하고 싶다면 아래 사용
      const recentMessages = (selectedUser?.messages ?? [])
          .slice(-10)
          .map((m) => ({
            from: m.from,               // "me" | "other"
            text: m.text,
            time: m.time,               // 서버가 원하면 ISO로: new Date(m.time).toISOString()
          }));

      // 현재 SPA 경로(어디서 신고했는지)
      const pageUrl = window.location.href;

      const reasonType = REASON_MAP[type?.toLowerCase?.()] || "OTHER";

      // ⚠️ 실제 백엔드 경로/필드명에 맞춰 주세요.
      const payload = {
        targetMemberId,
        chatRoomId: selectedUser?.chatRoomId ?? null,
        reasonType,                // "SPAM" | "ABUSE" | ...
        content,                   // 신고 상세 내용 (서버가 description이면 필드명 바꾸세요)
        evidenceUrl,               // 선택: 외부 증빙 URL
        pageUrl,                   // 신고 발생 위치
        messageSamples: recentMessages, // 선택: 최근 대화 샘플
    };

      await api.post("/api/on/report", payload);
      alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.");
      setIsProfileOpen(false);
    } catch (err) {
      console.error("❌ 신고 전송 실패:", err);
      alert("신고 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleAccept = async (matchingId) => {
    try {
      await api.post(`/api/on/chat-rooms/matchings/${matchingId}/accept`);
      alert("수락했습니다!");

      const [chatRoomRes, pendingRes] = await Promise.all([
        api.get("/api/on/chat-rooms"),
        api.get("/api/on/chat-rooms/pending"),
      ]);

      const rooms = chatRoomRes.data;
      const pending = pendingRes.data;
      setPendingRequests(pending);

      const newRoom = rooms.find((r) => r.matchingId === matchingId);
      if (!newRoom) return;

      const messagesRes = await api.get(`/api/on/chat-rooms/${newRoom.chatRoomId}/messages`);
      const newUser = {
        chatRoomId: newRoom.chatRoomId,
        opponentId: newRoom.opponentId,
        name: newRoom.opponentNickname,
        image: newRoom.opponentProfileImageUrl || "/images/default-profile.png",
        unreadCount: 0,
        messages: messagesRes.data.map((msg) => ({
          from: msg.senderId === currentUserId ? "me" : "other",
          text: msg.content,
          time: new Date(msg.sentAt).getTime(),
        })),
        lastMessage: messagesRes.data.length
            ? messagesRes.data[messagesRes.data.length - 1].content
            : "",
      };

      setChatUsers((prev) => [...prev, newUser]);
      setSelectedUser(newUser);
      setActiveTab("chat");
    } catch (e) {
      console.error("수락 실패", e);
    }
  };

  const handleReject = async (matchingId) => {
    try {
      await api.post(`/api/on/chat-rooms/matchings/${matchingId}/reject`);
      alert("거절했습니다!");
      window.location.reload();
    } catch (e) {
      console.error("거절 실패", e);
    }
  };

  return (
      <div className="chat-page">
        <aside className="chat-sidebar">
          <div className="chat-tabs">
            <button className={activeTab === "chat" ? "active" : ""} onClick={() => setActiveTab("chat")}>
              채팅
            </button>
            <button className={activeTab === "request" ? "active" : ""} onClick={() => setActiveTab("request")}>
              요청
            </button>
          </div>

          <ul className="chat-user-list">
            {activeTab === "chat" &&
                sortedChatUsers.map((user) => (
                    <li key={user.chatRoomId}>
                      <img
                          src={user.image}
                          alt="프로필"
                          className="chat-profile-img"
                          onClick={() => openProfileModal(user)}
                          style={{ cursor: "pointer" }}
                      />
                      <span className="chat-user-name" onClick={() => handleUserClick(user)} style={{ cursor: "pointer" }}>
                  {user.name}
                        {user.unreadCount > 0 && <span className="chat-unread-badge">{user.unreadCount}</span>}
                </span>
                      <span className="chat-last-message">
                  {user.lastMessage?.length > 5 ? `${user.lastMessage.slice(0, 5)}...` : user.lastMessage}
                </span>
                    </li>
                ))}

            {activeTab === "request" &&
                pendingRequests.map((req) => (
                    <li key={req.matchingId} className="chat-request-item">
                      <img
                          src={req.opponentProfileImageUrl || "/images/default-profile.png"}
                          alt="프로필"
                          className="chat-profile-img"
                      />
                      <span className="chat-user-name">{req.opponentNickname}</span>
                      <div className="chat-request-buttons">
                        <button onClick={() => handleAccept(req.matchingId)}>수락</button>
                        <button onClick={() => handleReject(req.matchingId)}>거절</button>
                      </div>
                    </li>
                ))}
          </ul>
        </aside>

        <main className="chat-main">
          {selectedUser ? (
              <div className="chat-box">
                <div className="chat-header">
                  <img
                      src={selectedUser.image}
                      className="chat-profile-img"
                      alt="프로필"
                      onClick={() => openProfileModal(selectedUser)}
                      style={{ cursor: "pointer" }}
                  />
                  {/* 필요하다면 상대 유저 ID를 표시 */}
                  <span className="chat-header-name">{selectedUser.name}</span>
                </div>

                <div className="chat-messages" ref={messagesEndRef}>
                  {selectedUser.messages.map((msg, idx) => (
                      <div key={idx} className={`chat-message-wrapper ${msg.from}`}>
                        {msg.from === "other" && (
                            <div className="chat-avatar">
                              <img src={selectedUser.image} alt="상대 프로필" />
                              <span>{selectedUser.name}</span>
                            </div>
                        )}
                        <div className={`chat-message ${msg.from === "me" ? "me" : "other"}`}>{msg.text}</div>
                      </div>
                  ))}
                </div>

                <div className="chat-input-section">
                  <button className="emoji-button" onClick={() => setShowEmoji(!showEmoji)}>
                    😊
                  </button>
                  {showEmoji && <Emoji onSelect={(emoji) => setMessage((prev) => prev + emoji)}/>}
                  <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onCompositionStart={() => setIsComposing(true)}
                      onCompositionEnd={(e) => {
                        setIsComposing(false);
                        // 조합 종료 직후 값 반영 안전장치
                        setMessage(e.target.value);
                      }}
                      onKeyDown={onInputKeyDown}
                      placeholder="메시지를 입력하세요..."
                  />
                  <button onClick={handleSend}>전송</button>
                </div>
              </div>
          ) : (
              <div className="chat-placeholder">채팅할 사람을 선택하세요.</div>
          )}
        </main>

        <ProfileModal
            open={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            profile={profileData}
            hearted={profileData ? heartedUserIds.has(profileData.memberId) : false}
            onToggleHeart={() => {
              if (!profileData) return;
              setHeartedUserIds((prev) => {
                const copy = new Set(prev);
                if (copy.has(profileData.memberId)) copy.delete(profileData.memberId);
                else copy.add(profileData.memberId);
                return copy;
              });
            }}
            onReportSubmit={async (type, content, evidenceUrl) => {
              await submitReport({ type, content, evidenceUrl });
            }}
            onGoProfile={() => {
              if (!profileData) return;
              setIsProfileOpen(false);
              navigate(`/profiles/${profileData.memberId}`);
            }}
        />
      </div>
  );
};

export default Chatting;