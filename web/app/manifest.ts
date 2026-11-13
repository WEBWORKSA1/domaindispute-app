import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DomainDispute.com',
    short_name: 'DomainDispute',
    description: 'UDRP case library, live dispute docket and free guidance.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#12233b',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
