import React from 'react';

const VideoPlayer = ({ url }) => {
  // Helper to get the ID from any YouTube URL
  const getVideoId = (link) => {
    if (!link) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = link.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(url);

  if (!videoId) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 text-white">
        <p>Video not found</p>
      </div>
    );
  }

  return (
    <div className="relative w-full pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;