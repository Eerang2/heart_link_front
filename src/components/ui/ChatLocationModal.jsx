import React from "react";
import ChatLocation from "./ChatLocation";
import "../../styles/Modal.css";

const ChatLocationModal = ({ onClose, onSelect }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <ChatLocation onSelect={(location) => {
          onSelect(location);
          onClose();
        }} />
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
};

export default ChatLocationModal;
