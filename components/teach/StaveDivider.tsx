import { Stave } from "@/components/ui/Stave";
import { cn } from "@/lib/utils";

type Bg = "paper" | "white" | "ink";

const bgClass: Record<Bg, string> = {
  paper: "bg-paper",
  white: "bg-white",
  ink: "bg-ink",
};

/** The signature gold stave hairline that separates sections. */
export function StaveDivider({ background = "paper" }: { background?: Bg }) {
  return (
    <div className={cn(bgClass[background])}>
      <div className="container-mp flex items-center gap-5 py-2">
        <span className="h-px flex-1 bg-gold/25" />
        <Stave className="w-16 opacity-60" />
        <span className="h-px flex-1 bg-gold/25" />
      </div>
    </div>
  );
}
