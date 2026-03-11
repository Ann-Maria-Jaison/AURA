'use client';

import { forwardRef } from 'react';

const VideoPreview = forwardRef<HTMLVideoElement, React.VideoHTMLAttributes<HTMLVideoElement>>((props, ref) => {
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      {...props}
      className={`w-full aspect-video bg-black rounded-2xl object-cover shadow-2xl ${props.className || ''}`}
    />
  );
});

VideoPreview.displayName = 'VideoPreview';

export default VideoPreview;
