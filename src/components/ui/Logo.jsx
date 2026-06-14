/**
 * Logo variants:
 *  full  — horizontal "bWinALOTT.com" wordmark
 *  icon  — square ticket icon (collapsed sidebar, small contexts)
 *
 * Both PNGs are 1080×1080 with ~33% transparent padding on all sides.
 * The "full" variant clips the whitespace so the text fills `height`.
 */
export default function Logo({ variant = 'full', className = '', height }) {
  const isIcon = variant === 'icon';
  const src = isIcon
    ? '/bwinalott-icon.png'
    : '/bwinalott-logo.png';

  if (!height) {
    return <img src={src} alt="bWinALOTT" className={className} draggable={false} />;
  }

  if (isIcon) {
    return (
      <img
        src={src}
        alt="bWinALOTT"
        className={className}
        style={{ height, width: 'auto' }}
        draggable={false}
      />
    );
  }

  const scaledH = Math.round(height * 3.1);

  return (
    <div
      className={className}
      style={{
        height,
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <img
        src={src}
        alt="bWinALOTT"
        style={{ height: scaledH, width: 'auto', flexShrink: 0 }}
        draggable={false}
      />
    </div>
  );
}
