"use client";

import React from "react";
import { Lottie } from "lottie-react";

interface LottiePlayerProps {
  animationData: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({
  animationData,
  className = "",
  loop = true,
  autoplay = true,
}) => {
  return <Lottie src={animationData} loop={loop} autoplay={autoplay} className={className} />;
};
