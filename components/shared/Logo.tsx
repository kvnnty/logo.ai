import { Sparkles } from "lucide-react";
import Link from "next/link"

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 group"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
        <Sparkles className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        LogoAI<span className="text-primary">pro</span>
      </span>
    </Link>
  );
}