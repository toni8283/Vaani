export function MeshGradient() {
  const blob = "absolute rounded-full animate-blob will-change-transform";
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-cream">
      <div className={`${blob} -top-40 -left-32 size-[640px] bg-[#FFC99A] blur-[110px] opacity-80`} />
      <div className={`${blob} -top-24 -right-24 size-[560px] bg-[#F7A5A0] blur-[120px] opacity-60 [animation-delay:-6s]`} />
      <div className={`${blob} top-1/3 left-1/3 size-[520px] bg-[#FFE7A6] blur-[110px] opacity-70 [animation-delay:-12s]`} />
      <div className={`${blob} -bottom-40 right-1/4 size-[520px] bg-[#F3C4E0] blur-[120px] opacity-50 [animation-delay:-3s]`} />
      <div className={`${blob} -bottom-48 -left-24 size-[480px] bg-[#BFD9F5] blur-[120px] opacity-45 [animation-delay:-9s]`} />
      <div className="absolute inset-0 opacity-100 [background-image:radial-gradient(rgba(43,33,28,0.14)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />
    </div>
  );
}
