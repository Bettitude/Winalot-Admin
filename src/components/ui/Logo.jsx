export default function Logo({ variant = 'full', className = '', height }) {
  const src   = variant === 'icon' ? '/logo-icon.png' : '/logo-full.png';
  const style = height ? { height, width: 'auto' } : {};
  return (
    <img src={src} alt="bWinALOTT" className={className} style={style} draggable={false} />
  );
}
