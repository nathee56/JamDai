export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-[960px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg text-gold">จำได้</span>
          <span className="text-text-lo text-xs">
            © {new Date().getFullYear()} JamDai
          </span>
        </div>
        <span className="text-text-lo text-xs font-mono tracking-wide">
          Powered by ThaiLLM + Firebase
        </span>
      </div>
    </footer>
  );
}
