import { safeUrl, mailto, telto, prettyUrl, initials } from '@shared/format.js';

/** Link that refuses unsafe schemes (javascript:, data:, …) — renders text instead. */
export function A({ href, className = '', children }) {
  const url = safeUrl(href);
  if (!url) return <span className={className}>{children}</span>;
  const external = /^https?:/i.test(url);
  return (
    <a href={url} className={className} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
      {children}
    </a>
  );
}

/** Photo if one is set, otherwise initials. */
export function Avatar({ basics, className = '', fallbackClass = '' }) {
  const src = safeUrl(basics.photo);
  if (src) return <img src={src} alt={basics.name} className={className + ' object-fit-cover'} />;
  return (
    <div className={className + ' make-flex align-center justify-center ' + fallbackClass} aria-hidden="true">
      {initials(basics.name)}
    </div>
  );
}

/** Contact rows in a consistent order: email, phone, location, website. */
export function contacts(basics) {
  return [
    basics.email && { key: 'email', icon: '✉', label: basics.email, href: mailto(basics.email) },
    basics.phone && { key: 'phone', icon: '☎', label: basics.phone, href: telto(basics.phone) },
    basics.location && { key: 'location', icon: '⌖', label: basics.location, href: '' },
    basics.website && { key: 'website', icon: '↗', label: prettyUrl(basics.website), href: basics.website },
  ].filter(Boolean);
}

export const has = (arr) => Array.isArray(arr) && arr.length > 0;
