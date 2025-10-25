import React from "react";
import "../../styles/Emoji.css";

const emojis = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
  "😍", "🥰", "😘", "😚", "😗", "❤️", "💕", "💖", "💘", "💞",
  "😎", "🤩", "😏", "😌", "😼",
  "🥺", "😢", "😭", "😞", "😔", "😩", "😫",
  "😠", "😡", "🤬", "😤", "👿",
  "🫶", "👍", "👎", "👏", "🙏", "💯", "🔥", "🌈", "🎉", "💡",
  "👀", "🤔", "🫠", "😶‍🌫️", "🫥", "💀", "😇", "🤑"
];

const EmojiPicker = ({ onSelect }) => {
  return (
    <div className="emoji-picker">
      {emojis.map((emoji, idx) => (
        <span key={idx} onClick={() => onSelect(emoji)}>
          {emoji}
        </span>
      ))}
    </div>
  );
};

export default EmojiPicker;
