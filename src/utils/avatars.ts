/**
 * Curated Cyberpunk & Futuristic Avatars for NEXORA Operatives
 */
export const CYBER_AVATARS: { id: string; name: string; url: string }[] = [
  {
    id: 'nexora-mascot',
    name: 'NEXORA Prime Mascot',
    url: '/nexora-logo.jpg',
  },
  {
    id: 'cyber-1',
    name: 'Cyber Samurai',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-2',
    name: 'Neon Operative',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-3',
    name: 'Grid Hacker',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-4',
    name: 'Quantum Specialist',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-5',
    name: 'Synth Sentinel',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-6',
    name: 'Cyber Recon',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=256&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-7',
    name: 'Hex Tactician',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-8',
    name: 'Vector Pilot',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-9',
    name: 'Protocol Architect',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-10',
    name: 'Crypto Ghost',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-11',
    name: 'Aether Analyst',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-12',
    name: 'Vanguard Commander',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256&auto=format&fit=crop&q=80',
  },
];

export const getRandomCyberAvatar = (): string => {
  const randomIndex = Math.floor(Math.random() * CYBER_AVATARS.length);
  return CYBER_AVATARS[randomIndex].url;
};

/**
 * Resizes and compresses an image client-side onto an HTML5 Canvas,
 * converting it to a lightweight data URL (~15-30KB).
 * This allows free user avatar storage directly in Firestore without
 * needing paid Google Cloud Storage / Firebase Blaze billing.
 */
export const compressImageFile = (
  file: File,
  maxDimension = 256,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file must be an image format (JPEG, PNG, WebP).'));
      return;
    }

    // Safety check on raw file size (e.g. max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Image file is too large. Please select an image under 10MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for processing.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Compute aspect ratio scaling
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not initialize canvas context.'));
          return;
        }

        // Draw smooth image
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fallback to jpeg
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // WebP not supported by browser canvas, fallback to jpeg
        }

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};

