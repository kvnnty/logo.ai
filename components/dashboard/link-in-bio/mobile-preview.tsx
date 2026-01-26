"use client";

import Logo from "@/components/shared/Logo";
import { SOCIAL_PLATFORMS } from "./constants";
import { AppleAppStoreIcon, GooglePlayStoreIcon, SocialIcon, WeiboIcon } from "./social-icons";

interface MobilePreviewProps {
  data: {
    profileImage?: string;
    profileTitle?: string;
    description?: string;
    links?: Array<{
      id: string;
      type: 'link';
      linkName: string;
      url: string;
      visible: boolean;
    }>;
    contentBlocks?: Array<{
      id: string;
      type: 'text' | 'image' | 'address' | 'map';
      content?: string;
      style?: 'heading' | 'body' | 'bio' | 'announcement';
      imageUrl?: string;
      imageUrls?: string[];
      caption?: string;
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
      embedUrl?: string;
      visible: boolean;
    }>;
    blocks?: Array<{
      id: string;
      type: 'link' | 'text' | 'image' | 'address' | 'map';
      linkName?: string;
      url?: string;
      content?: string;
      style?: 'heading' | 'body' | 'bio' | 'announcement';
      imageUrl?: string;
      imageUrls?: string[];
      caption?: string;
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
      embedUrl?: string;
      visible: boolean;
    }>;
    socialIcons?: Array<{
      id: string;
      platform: string;
      url: string;
      visible: boolean;
    }>;
    styles?: {
      background?: {
        style?: string;
        color?: string;
        imageUrl?: string;
      };
      buttons?: {
        color?: string;
        textColor?: string;
        iconColor?: string;
        shadowColor?: string;
        style?: string;
        shape?: string;
      };
      socialIcons?: {
        style?: string;
        iconColor?: string;
      };
      fonts?: {
        fontColor?: string;
        fontFamily?: string;
      };
    };
  };
}

export function MobilePreview({ data }: MobilePreviewProps) {
  const styles = data.styles || {};
  const bgStyle = styles.background?.style === 'image' && styles.background?.imageUrl
    ? {
      backgroundImage: `url(${styles.background.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
    : { backgroundColor: styles.background?.color || '#FFFFFF' };

  const buttonStyle = styles.buttons?.style || 'filled';
  const buttonShape = styles.buttons?.shape || 'rounded';
  const shapeClasses = {
    'rounded-none': 'rounded-none',
    'rounded': 'rounded-lg',
    'rounded-lg': 'rounded-xl',
    'rounded-full': 'rounded-full',
  };

  const getButtonClasses = () => {
    const base = `w-full p-4 font-semibold transition-all ${shapeClasses[buttonShape as keyof typeof shapeClasses] || 'rounded-lg'}`;
    if (buttonStyle === 'filled') {
      return `${base} text-white`;
    } else if (buttonStyle === 'outline') {
      return `${base} border-2 bg-transparent`;
    } else if (buttonStyle === 'drop-shadow-hard') {
      return `${base} text-white shadow-lg`;
    } else if (buttonStyle === 'drop-shadow-soft') {
      return `${base} text-white shadow-md`;
    } else if (buttonStyle === 'glow-soft') {
      return `${base} text-white shadow-lg`;
    }
    return base;
  };

  const getButtonStyles = () => {
    const base: any = {};
    if (buttonStyle === 'filled') {
      base.backgroundColor = styles.buttons?.color || '#0F2A35';
      base.color = styles.buttons?.textColor || '#FFFFFF';
    } else if (buttonStyle === 'outline') {
      base.borderColor = styles.buttons?.color || '#0F2A35';
      base.color = styles.buttons?.color || '#0F2A35';
      base.backgroundColor = 'transparent';
    } else {
      base.backgroundColor = styles.buttons?.color || '#0F2A35';
      base.color = styles.buttons?.textColor || '#FFFFFF';
      if (buttonStyle.includes('drop-shadow') || buttonStyle.includes('glow')) {
        base.boxShadow = `0 4px 6px -1px ${styles.buttons?.shadowColor || '#000000'}40`;
      }
    }
    return base;
  };

  return (
    <div className="sticky top-4">
      <div className="bg-gray-400 rounded-3xl p-4">
        <div className="bg-white rounded-2xl overflow-hidden" style={bgStyle}>
          <div className="px-6 py-8 space-y-6 min-h-[600px]">
            {/* Profile Section */}
            <div className="text-center space-y-3">
              {data.profileImage && (
                <div className="flex justify-center">
                  <img
                    src={data.profileImage}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover"
                    style={{
                      border: `3px solid ${styles.buttons?.color || '#0F2A35'}20`,
                    }}
                  />
                </div>
              )}
              {data.profileTitle && (
                <h1
                  className="text-2xl font-bold leading-tight"
                  style={{
                    color: styles.fonts?.fontColor || '#0F2A35',
                    fontFamily: styles.fonts?.fontFamily || 'Inter, sans-serif',
                  }}
                >
                  {data.profileTitle}
                </h1>
              )}
              {data.description && (
                <p
                  className="text-sm leading-relaxed px-2"
                  style={{
                    color: styles.fonts?.fontColor || '#0F2A35',
                    fontFamily: styles.fonts?.fontFamily || 'Inter, sans-serif',
                    opacity: 0.8,
                  }}
                >
                  {data.description}
                </p>
              )}
            </div>

            {/* Social Icons - Positioned between profile and links */}
            {data.socialIcons && data.socialIcons.filter(icon => icon.visible !== false).length > 0 && (
              <div className="flex justify-center gap-2 flex-wrap px-4">
                {data.socialIcons.filter(icon => icon.visible !== false).map((icon) => {
                  const iconColor = styles.socialIcons?.style === 'filled'
                    ? '#FFFFFF'
                    : (styles.socialIcons?.iconColor || '#0F2A35');

                  const bgColor = styles.socialIcons?.style === 'filled'
                    ? (styles.socialIcons?.iconColor || '#0F2A35')
                    : 'transparent';

                  return (
                    <a
                      key={icon.id}
                      href={icon.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:opacity-80"
                      style={{
                        backgroundColor: bgColor,
                        border: styles.socialIcons?.style === 'filled'
                          ? 'none'
                          : `2px solid ${styles.socialIcons?.iconColor || '#0F2A35'}`,
                      }}
                      title={SOCIAL_PLATFORMS.find(p => p.value === icon.platform)?.label || icon.platform}
                    >
                      {icon.platform === 'apple-app-store' ? (
                        <AppleAppStoreIcon size={18} style={{ color: iconColor }} />
                      ) : icon.platform === 'google-play-store' ? (
                        <GooglePlayStoreIcon size={18} style={{ color: iconColor }} />
                      ) : icon.platform === 'weibo' ? (
                        <WeiboIcon size={18} style={{ color: iconColor }} />
                      ) : (
                        <SocialIcon platform={icon.platform} size={18} style={{ color: iconColor }} />
                      )}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Links */}
            {data.links && data.links.filter(link => link.visible !== false).length > 0 && (
              <div className="space-y-3 px-4">
                {data.links.filter(link => link.visible !== false).map((link) => (
                  <a
                    key={link.id}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${getButtonClasses()} flex items-center justify-center gap-2`}
                    style={getButtonStyles()}
                  >
                    {link.linkName || 'Link'}
                  </a>
                ))}
              </div>
            )}

            {/* Content Blocks */}
            {data.contentBlocks && data.contentBlocks.filter(block => block.visible !== false).length > 0 && (
              <div className="space-y-4 px-4">
                {data.contentBlocks.filter(block => block.visible !== false).map((block) => {
                  // Text Block
                  if (block.type === 'text') {
                    const textStyles = {
                      heading: 'text-xl font-bold',
                      body: 'text-sm',
                      bio: 'text-sm italic',
                      announcement: 'text-sm font-semibold',
                    };
                    return (
                      <div
                        key={block.id}
                        className={textStyles[block.style || 'body']}
                        style={{
                          color: styles.fonts?.fontColor || '#0F2A35',
                          fontFamily: styles.fonts?.fontFamily || 'Inter, sans-serif',
                        }}
                      >
                        {block.content}
                      </div>
                    );
                  }

                  // Image Block
                  if (block.type === 'image' && block.imageUrl) {
                    return (
                      <div key={block.id} className="space-y-2">
                        {block.imageUrls && block.imageUrls.length > 1 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {block.imageUrls.map((url: string, idx: number) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`${block.caption || 'Image'} ${idx + 1}`}
                                className="w-full rounded-lg h-32 object-cover"
                              />
                            ))}
                          </div>
                        ) : (
                          <img
                            src={block.imageUrl}
                            alt={block.caption || 'Image'}
                            className="w-full rounded-lg"
                          />
                        )}
                        {block.caption && (
                          <p
                            className="text-xs text-center"
                            style={{
                              color: styles.fonts?.fontColor || '#0F2A35',
                              opacity: 0.7,
                            }}
                          >
                            {block.caption}
                          </p>
                        )}
                      </div>
                    );
                  }

                  // Address Block
                  if (block.type === 'address') {
                    const addressParts = [
                      block.address,
                      block.city,
                      block.state,
                      block.zip,
                      block.country,
                    ].filter(Boolean);
                    return (
                      <div
                        key={block.id}
                        className="text-sm space-y-1"
                        style={{
                          color: styles.fonts?.fontColor || '#0F2A35',
                          fontFamily: styles.fonts?.fontFamily || 'Inter, sans-serif',
                        }}
                      >
                        {addressParts.map((part, idx) => (
                          <div key={idx}>{part}</div>
                        ))}
                      </div>
                    );
                  }

                  // Map Block
                  if (block.type === 'map' && block.embedUrl) {
                    return (
                      <div key={block.id} className="rounded-lg overflow-hidden border-2" style={{ borderColor: styles.buttons?.color || '#0F2A35' }}>
                        <iframe
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={block.embedUrl}
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {/* Legacy Blocks Support */}
            {!data.links && !data.contentBlocks && data.blocks && data.blocks.filter(block => block.visible !== false).length > 0 && (
              <div className="space-y-4 px-4">
                {data.blocks.filter(block => block.visible !== false).map((block) => {
                  // Link Block
                  if (block.type === 'link') {
                    return (
                      <a
                        key={block.id}
                        href={block.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${getButtonClasses()} flex items-center justify-center gap-2`}
                        style={getButtonStyles()}
                      >
                        {block.linkName || 'Link'}
                      </a>
                    );
                  }

                  // Text Block
                  if (block.type === 'text') {
                    const textStyles = {
                      heading: 'text-xl font-bold',
                      body: 'text-sm',
                      bio: 'text-sm italic',
                      announcement: 'text-sm font-semibold',
                    };
                    return (
                      <div
                        key={block.id}
                        className={textStyles[block.style || 'body']}
                        style={{
                          color: styles.fonts?.fontColor || '#0F2A35',
                          fontFamily: styles.fonts?.fontFamily || 'Inter, sans-serif',
                        }}
                      >
                        {block.content}
                      </div>
                    );
                  }

                  // Image Block
                  if (block.type === 'image' && block.imageUrl) {
                    return (
                      <div key={block.id} className="space-y-2">
                        {block.imageUrls && block.imageUrls.length > 1 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {block.imageUrls.map((url: string, idx: number) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`${block.caption || 'Image'} ${idx + 1}`}
                                className="w-full rounded-lg h-32 object-cover"
                              />
                            ))}
                          </div>
                        ) : (
                          <img
                            src={block.imageUrl}
                            alt={block.caption || 'Image'}
                            className="w-full rounded-lg"
                          />
                        )}
                        {block.caption && (
                          <p
                            className="text-xs text-center"
                            style={{
                              color: styles.fonts?.fontColor || '#0F2A35',
                              opacity: 0.7,
                            }}
                          >
                            {block.caption}
                          </p>
                        )}
                      </div>
                    );
                  }

                  // Address Block
                  if (block.type === 'address') {
                    const addressParts = [
                      block.address,
                      block.city,
                      block.state,
                      block.zip,
                      block.country,
                    ].filter((part): part is string => Boolean(part));
                    return (
                      <div
                        key={block.id}
                        className="text-sm space-y-1"
                        style={{
                          color: styles.fonts?.fontColor || '#0F2A35',
                          fontFamily: styles.fonts?.fontFamily || 'Inter, sans-serif',
                        }}
                      >
                        {addressParts.map((part: string, idx: number) => (
                          <div key={idx}>{part}</div>
                        ))}
                      </div>
                    );
                  }

                  // Map Block
                  if (block.type === 'map' && block.embedUrl) {
                    return (
                      <div key={block.id} className="rounded-lg overflow-hidden border-2" style={{ borderColor: styles.buttons?.color || '#0F2A35' }}>
                        <iframe
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={block.embedUrl}
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col justify-center items-center gap-2 mt-8 text-sm" style={{ color: styles.fonts?.fontColor || '#0F2A35' }}>
              <p>Powered by</p>
              <Logo />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
