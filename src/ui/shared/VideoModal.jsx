/**
 * ui/shared/VideoModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable full-screen video modal.
 * Also listens for the custom "open-demo-video" DOM event as a fallback.
 *
 * Props:
 *  isOpen   – boolean
 *  videoUrl – string
 *  title    – string
 *  onClose  – fn()
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";

export function VideoModal({ isOpen, videoUrl, title, onClose }) {
  const [internalUrl, setInternalUrl]     = useState(null);
  const [internalTitle, setInternalTitle] = useState("Demo Video");
  const videoRef = useRef(null);

  // Listen for custom event fallback
  useEffect(() => {
    const handleOpen = (e) => {
      const detail = e.detail;
      if (typeof detail === "string") {
        setInternalUrl(detail);
        setInternalTitle("Demo Video");
      } else if (detail && typeof detail === "object") {
        setInternalUrl(detail.url || null);
        setInternalTitle(detail.title || "Demo Video");
      }
      document.body.style.overflow = "hidden";
    };
    window.addEventListener("open-demo-video", handleOpen);
    return () => window.removeEventListener("open-demo-video", handleOpen);
  }, []);

  const activeUrl   = videoUrl !== undefined ? videoUrl : internalUrl;
  const activeTitle = title || internalTitle || "Demo Video";
  const shouldShow  = isOpen !== undefined ? (isOpen && Boolean(activeUrl)) : Boolean(internalUrl);

  const handleClose = () => {
    if (videoRef.current) videoRef.current.pause();
    setInternalUrl(null);
    document.body.style.overflow = "";
    if (onClose) onClose();
  };

  useEffect(() => {
    if (shouldShow) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (videoRef.current) videoRef.current.pause();
    }
    return () => { document.body.style.overflow = ""; };
  }, [shouldShow]);

  useEffect(() => {
    if (!shouldShow) return;
    const handleKeyDown = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shouldShow]);

  if (!shouldShow || !activeUrl) return null;

  return (
    <div className="video-modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true" aria-label={activeTitle}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal-header">
          <div className="video-modal-title">
            <Play size={16} fill="currentColor" />
            <span>{activeTitle}</span>
            <span className="video-modal-badge">Demo</span>
          </div>
          <button onClick={handleClose} className="video-modal-close" aria-label="Close demo video" type="button">
            <X size={18} />
          </button>
        </div>
        <div className="video-modal-body">
          <video ref={videoRef} src={activeUrl} className="video-modal-player" controls autoPlay playsInline>
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

export default VideoModal;
