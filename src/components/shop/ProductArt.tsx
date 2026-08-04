import chests from "@/assets/vip-chests.png";
import { cn } from "@/lib/utils";

/** Recorta um dos três baús do sprite sheet como arte do produto. */
export function ProductArt({
  index,
  name,
  className,
}: {
  index: number;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pixel-border border-dirt-dark bg-sky-block/15 relative h-28 overflow-hidden",
        className,
      )}
    >
      <img
        src={chests}
        alt={`Arte ilustrativa do produto ${name}`}
        width={1536}
        height={640}
        loading="lazy"
        className="absolute left-0 top-0 h-full w-[300%] max-w-none object-cover"
        style={{ transform: `translateX(-${index * 33.3333}%)` }}
      />
    </div>
  );
}
