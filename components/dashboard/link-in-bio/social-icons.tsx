"use client";

import {
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaGithub,
  FaSpotify,
  FaTwitch,
  FaTiktok,
  FaPinterest,
  FaSnapchat,
  FaDiscord,
  FaReddit,
  FaTelegram,
  FaWhatsapp,
  FaVimeo,
  FaMedium,
  FaPatreon,
  FaBehance,
  FaTumblr,
  FaSoundcloud,
  FaEtsy,
  FaArtstation,
  FaApple,
  FaGooglePlay,
  FaWeibo,
} from "react-icons/fa";
import { SiX } from "react-icons/si";

interface SocialIconProps {
  platform: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function SocialIcon({ platform, className = "", size = 20, style }: SocialIconProps) {
  const iconProps = {
    className,
    size,
    style,
  };

  switch (platform.toLowerCase()) {
    case 'instagram':
      return <FaInstagram {...iconProps} />;
    case 'facebook':
      return <FaFacebook {...iconProps} />;
    case 'twitter':
      return <FaTwitter {...iconProps} />;
    case 'x':
      return <SiX {...iconProps} />;
    case 'youtube':
      return <FaYoutube {...iconProps} />;
    case 'linkedin':
      return <FaLinkedin {...iconProps} />;
    case 'github':
      return <FaGithub {...iconProps} />;
    case 'spotify':
      return <FaSpotify {...iconProps} />;
    case 'twitch':
      return <FaTwitch {...iconProps} />;
    case 'tiktok':
      return <FaTiktok {...iconProps} />;
    case 'pinterest':
      return <FaPinterest {...iconProps} />;
    case 'snapchat':
      return <FaSnapchat {...iconProps} />;
    case 'discord':
      return <FaDiscord {...iconProps} />;
    case 'reddit':
      return <FaReddit {...iconProps} />;
    case 'telegram':
      return <FaTelegram {...iconProps} />;
    case 'whatsapp':
      return <FaWhatsapp {...iconProps} />;
    case 'vimeo':
      return <FaVimeo {...iconProps} />;
    case 'medium':
      return <FaMedium {...iconProps} />;
    case 'patreon':
      return <FaPatreon {...iconProps} />;
    case 'behance':
      return <FaBehance {...iconProps} />;
    case 'tumblr':
      return <FaTumblr {...iconProps} />;
    case 'soundcloud':
      return <FaSoundcloud {...iconProps} />;
    case 'etsy':
      return <FaEtsy {...iconProps} />;
    case 'artstation':
      return <FaArtstation {...iconProps} />;
    case 'apple-app-store':
      return <FaApple {...iconProps} />;
    case 'google-play-store':
      return <FaGooglePlay {...iconProps} />;
    case 'weibo':
      return <FaWeibo {...iconProps} />;
    default:
      // For platforms without specific icons, show a generic link icon
      return (
        <div
          className={className}
          style={{ width: size, height: size, ...style }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '100%', height: '100%' }}
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
      );
  }
}

// Keep these for backward compatibility, but they're now handled by SocialIcon
export function AppleAppStoreIcon({ className = "", size = 20, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return <FaApple className={className} size={size} style={style} />;
}

export function GooglePlayStoreIcon({ className = "", size = 20, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return <FaGooglePlay className={className} size={size} style={style} />;
}

export function WeiboIcon({ className = "", size = 20, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return <FaWeibo className={className} size={size} style={style} />;
}
