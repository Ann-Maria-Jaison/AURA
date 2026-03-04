'use client';

import { forwardRef } from 'react';

const VideoPreview = forwardRef<HTMLVideoElement>((props, ref) => {
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      className="w-full aspect-video bg-secondary rounded-lg object-cover"
    />
  );
});

VideoPreview.displayName = 'VideoPreview';

export default VideoPreview;
