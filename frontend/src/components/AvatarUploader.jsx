import { useRef } from "react";
import { FiCamera } from "react-icons/fi";
import defaultAvatar from "../assets/defaultAvatar.jpg";


export default function AvatarUploader({ avatarUrl, onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(e, file);
  };

  return (
    <div className="avatar-uploader" onClick={handleClick}>
      <img src={avatarUrl}
            alt="Photo de profil"
            className="avatar-img"
            onError={e => {
            e.target.onerror = null;         // prevent infinite loop
            e.target.src = defaultAvatar;    // default src
          }}
      />
      <div className="avatar-overlay">
        <FiCamera size={20} />
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleChange}
        className="avatar-input"
      />
    </div>
  );
}
