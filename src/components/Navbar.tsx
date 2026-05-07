import Wordmark from "@/components/Wordmark";

export default function Navbar() {
  return (
    <header
      className="frost-nav sticky top-0 z-50 flex items-center justify-center border-b border-line px-8 py-[18px]"
      data-screen-label="Landing"
    >
      <Wordmark size="large" />
    </header>
  );
}
