export default function KIITLogo({ size = 60 }) {
  return (
    <img
      src="/kiit-logo.png"
      alt="KIIT University"
      width={size}
      height={size}
      style={{ objectFit:"contain", borderRadius:6 }}
    />
  );
}
