"use client";

/**
 * Public Link-in-Bio Page
 * Displays the published link-in-bio page with all customizations
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLinkInBio } from "@/app/actions/link-in-bio-actions";
import { getBrandById } from "@/app/actions/actions";
import { Loader2 } from "lucide-react";
import { SocialIcon, AppleAppStoreIcon, GooglePlayStoreIcon, WeiboIcon } from "@/components/dashboard/link-in-bio/social-icons";
import { getPrimaryLogoUrl } from "@/lib/utils/brand-utils";

const SOCIAL_PLATFORMS = [
  { value: 'apple-app-store', label: 'Apple App Store' },
  { value: 'artstation', label: 'ArtStation' },
  { value: 'behance', label: 'Behance' },
  { value: 'discord', label: 'Discord' },
  { value: 'etsy', label: 'Etsy' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'github', label: 'GitHub' },
  { value: 'google-play-store', label: 'Google Play Store' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'medium', label: 'Medium' },
  { value: 'patreon', label: 'Patreon' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'soundcloud', label: 'SoundCloud' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'tumblr', label: 'Tumblr' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'vimeo', label: 'Vimeo' },
  { value: 'weibo', label: 'Weibo' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'x', label: 'X' },
  { value: 'youtube', label: 'YouTube' },
];

export default function PublicLinkInBioPage() {
  const params = useParams();
  const brandId = params.brandId as string;
  const [brand, setBrand] = useState<any>(null);
  const [linkInBioData, setLinkInBioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [brandResult, linkResult] = await Promise.all([
          getBrandById(brandId),
          getLinkInBio(brandId, true), // true = public access
        ]);

        if (brandResult.success) {
          setBrand(brandResult.brand);
        }

        if (linkResult.success && linkResult.data) {
          setLinkInBioData(linkResult.data);
        }
      } catch (error) {
        console.error('Failed to load link-in-bio:', error);
      } finally {
        setLoading(false);
      }
    }

    if (brandId) {
      load();
    }
  }, [brandId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!brand || !linkInBioData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Link-in-bio page not found</p>
      </div>
    );
  }

  // Get brand's primary logo
  const brandLogoUrl = getPrimaryLogoUrl(brand.assets) || '';
  const profileImageUrl = linkInBioData.profileImage || brandLogoUrl;

  const styles = linkInBioData.styles || {};
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

  const metaTitle = linkInBioData.settings?.metaTags?.title || linkInBioData.profileTitle || brand.name;
  const metaDescription = linkInBioData.settings?.metaTags?.description || linkInBioData.description || brand.description;
  const metaImage = linkInBioData.settings?.metaTags?.image || linkInBioData.profileImage;

  // Update document title and meta tags
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = metaTitle || 'Link in Bio';
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (metaDescriptionTag) {
        metaDescriptionTag.setAttribute('content', metaDescription || '');
      }
    }
  }, [metaTitle, metaDescription]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={bgStyle}>
      <div className="w-full max-w-md px-4 py-8">
        <div className="px-6 py-8 space-y-6">
          {/* Profile Section */}
          <div className="text-center space-y-3">
            {profileImageUrl && (
              <div className="flex justify-center">
                <img
                  src={profileImageUrl}
                  alt={linkInBioData.profileTitle || brand.name}
                  className="w-28 h-28 rounded-full object-cover"
                  style={{
                    border: `3px solid ${styles.buttons?.color || '#0F2A35'}20`,
                  }}
                />
              </div>
            )}
            {linkInBioData.profileTitle && (
              <h1
                className="text-2xl font-bold leading-tight"
                style={{
                  color: styles.fonts?.fontColor || '#0F2A35',
                  fontFamily: `${styles.fonts?.fontFamily || 'Inter'}, sans-serif`,
                }}
              >
                {linkInBioData.profileTitle}
              </h1>
            )}
            {linkInBioData.description && (
              <p
                className="text-sm leading-relaxed px-2"
                style={{
                  color: styles.fonts?.fontColor || '#0F2A35',
                  fontFamily: `${styles.fonts?.fontFamily || 'Inter'}, sans-serif`,
                  opacity: 0.8,
                }}
              >
                {linkInBioData.description}
              </p>
            )}
          </div>

          {/* Social Icons - Positioned between profile and links */}
          {linkInBioData.socialIcons && linkInBioData.socialIcons.filter((icon: any) => icon.visible !== false).length > 0 && (
            <div className="flex justify-center gap-2 flex-wrap px-4">
              {linkInBioData.socialIcons.filter((icon: any) => icon.visible !== false).map((icon: any) => {
                const platform = SOCIAL_PLATFORMS.find(p => p.value === icon.platform);
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
                    title={platform?.label || icon.platform}
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
          {linkInBioData.links && linkInBioData.links.filter((link: any) => link.visible !== false).length > 0 && (
            <div className="space-y-3 px-4">
              {linkInBioData.links.filter((link: any) => link.visible !== false).map((link: any) => (
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
          {linkInBioData.contentBlocks && linkInBioData.contentBlocks.filter((block: any) => block.visible !== false).length > 0 && (
            <div className="space-y-4 px-4">
              {linkInBioData.contentBlocks.filter((block: any) => block.visible !== false).map((block: any) => {
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
                        fontFamily: `${styles.fonts?.fontFamily || 'Inter'}, sans-serif`,
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
                        fontFamily: `${styles.fonts?.fontFamily || 'Inter'}, sans-serif`,
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

          {/* Legacy Blocks Support */}
          {!linkInBioData.links && !linkInBioData.contentBlocks && linkInBioData.blocks && linkInBioData.blocks.filter((block: any) => block.visible !== false).length > 0 && (
            <div className="space-y-4 px-4">
              {linkInBioData.blocks.filter((block: any) => block.visible !== false).map((block: any) => {
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
                        fontFamily: `${styles.fonts?.fontFamily || 'Inter'}, sans-serif`,
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
                        fontFamily: `${styles.fonts?.fontFamily || 'Inter'}, sans-serif`,
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
          <div className="text-center text-xs mt-8" style={{ color: styles.fonts?.fontColor || '#0F2A35', opacity: 0.5 }}>
            Create yours for free at hi.link
          </div>
        </div>
      </div>
    </div>
  );
}
