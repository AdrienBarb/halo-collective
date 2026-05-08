export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-cream-2">
      <div className="mx-auto max-w-[1180px] px-8 pb-[30px] pt-[38px] text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
          © {year} · All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
