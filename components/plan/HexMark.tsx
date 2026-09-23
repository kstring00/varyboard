/**
 * A single hexagon cell. `lit` = mint glow (active, "you"); otherwise gray (dormant).
 * Pointy-top, so it sits on the same grid as HexEdge and the shader.
 */
export function HexMark({ lit = false, size = 40, children, className = "" }: { lit?: boolean; size?: number; children?: React.ReactNode; className?: string }) {
  return (
    <span className={`ix-hex ${lit ? "ix-hex--lit" : ""} ${className}`} style={{ width: size, height: size * 1.1547 }} aria-hidden="true">
      <svg viewBox="0 0 100 115.47" width={size} height={size * 1.1547} focusable="false">
        <polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87" />
      </svg>
      {children !== undefined && <span className="ix-hex__label">{children}</span>}
    </span>
  );
}
