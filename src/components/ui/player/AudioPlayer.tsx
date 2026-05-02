import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaPlay, FaPause } from "react-icons/fa6";
import { MdReplay10, MdForward10 } from "react-icons/md";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { RiCloseLine } from "react-icons/ri";
import "./AudioPlayer.scss";

interface AudioPlayerProps {
  id: string;
  src: string;
  title: string;
  author: string;
  image: string;
  onClose: () => void;
}

const formatTime = (time: number) => {
  if (isNaN(time)) return "00:00:00";
  const MathTrunc = Math.trunc;
  const hours = MathTrunc(time / 3600);
  const minutes = MathTrunc((time % 3600) / 60);
  const seconds = MathTrunc(time % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default function AudioPlayer({ id, src, title, author, image, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      const saved = localStorage.getItem(`audio_pos_${id}`);
      if (saved) {
        const pos = parseFloat(saved);
        audioRef.current.currentTime = pos;
        setCurrentTime(pos);
      }
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [id, src]);

  useEffect(() => {
    if (id && currentTime > 5) {
      localStorage.setItem(`audio_pos_${id}`, currentTime.toString());
    }
  }, [id, currentTime]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const skipTime = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(Math.max(audioRef.current.currentTime + amount, 0), duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const togglePlaybackRate = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  return (
    <div className="custom-audio-player">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        autoPlay
      />

      <div className="progress-container">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="progress-slider"
        />
        <div 
          className="progress-filled" 
          style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
        ></div>
      </div>

      <div className="player-inner">
        <div className="player-left">
          <button className="control-btn" onClick={() => skipTime(-10)}>
            <MdReplay10 />
          </button>
          <button className="control-btn play-btn" onClick={togglePlayPause}>
            {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: "4px" }}/>}
          </button>
          <button className="control-btn" onClick={() => skipTime(10)}>
            <MdForward10 />
          </button>
        </div>

        <div className="player-center">
          <div className="cover-img">
            {image ? (
              <Image src={image.startsWith("http") ? image : `/${image}`} alt={title} fill style={{ objectFit: 'cover' }} />
            ) : (
              <div className="cover-placeholder" />
            )}
          </div>
          <div className="info">
            <h4>{title}</h4>
            <p>{author}</p>
          </div>
        </div>

        <div className="player-right">
          <div className="time-display">
            {formatTime(currentTime)}
            {/* <span className="duration-slash"> / </span>
            {formatTime(duration)} */}
          </div>
          
          <div className="volume-control">
            <button className="volume-btn" onClick={toggleMute}>
              {isMuted || volume === 0 ? <IoVolumeMute /> : <IoVolumeHigh />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={isMuted ? 0 : volume} 
              onChange={handleVolumeChange}
              className="volume-slider" 
            />
          </div>

          <button className="speed-btn" onClick={togglePlaybackRate}>
            {playbackRate}x
          </button>

          <button className="close-btn" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>
      </div>
    </div>
  );
}
