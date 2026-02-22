import { useState } from 'react';
import { getSunoEmbedUrl } from '../../lib/suno';

interface Props {
  sunoUrl: string;
  title?: string;
}

export default function SunoEmbed({ sunoUrl, title = '' }: Props) {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'rgba(255, 255, 255, 0.6)',
        }}
        onClick={() => setLoaded(true)}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>
          음원 재생
        </span>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 64,
            height: 64,
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <iframe
        src={getSunoEmbedUrl(sunoUrl)}
        title={title || '노래 재생'}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="autoplay"
      />
    </div>
  );
}
