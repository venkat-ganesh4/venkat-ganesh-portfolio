import { useState } from 'react';
import type { ProfileImageConfig } from '../types/homepage';

interface ProfileImageProps {
  config: ProfileImageConfig;
  className?: string;
}

export default function ProfileImage({ config, className = '' }: ProfileImageProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const shouldRenderImage = config.enabled && Boolean(config.url) && !imageFailed;

  return (
    <div className={`profile-image-container ${className}`}>
      {shouldRenderImage ? (
        <img
          src={config.url!}
          alt={config.alt}
          className="profile-img"
          style={{
            objectPosition: config.objectPosition || 'center 20%',
            transform: config.scale && config.scale !== 1 ? `scale(${config.scale})` : undefined,
          }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="profile-fallback-slot" aria-label={config.alt}>
          <div className="profile-fallback-lens">
            {/* Geometric aperture icon */}
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="aperture-svg"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
            <div className="profile-monogram">{config.monogram || 'VG'}</div>
          </div>
          <span className="profile-fallback-label">
            {config.fallbackText || 'Profile photo slot — configurable via CMS'}
          </span>
          <span className="profile-fallback-status">
            Awaiting portrait upload
          </span>
        </div>
      )}
    </div>
  );
}
