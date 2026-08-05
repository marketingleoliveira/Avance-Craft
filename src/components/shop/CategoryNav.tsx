import { cn } from "@/lib/utils";

type Props = {
  categories: { id: string; label: string; description: string }[];
  activeId?: string;
  onSelect: (id: string) => void;
};

/** Navegação de categorias da loja (rolagem horizontal no mobile). */
export function CategoryNav({ categories, activeId, onSelect }: Props) {

  return (
    <nav aria-label="Categorias da loja" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-2">
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              aria-current={activeId === category.id ? "true" : undefined}
              onClick={() => onSelect(category.id)}
              className={cn(
                "font-pixel pixel-border px-4 py-3 text-[10px] uppercase transition-colors text-left",
                activeId === category.id
                  ? "border-grass-dark bg-grass text-primary-foreground"
                  : "border-wood-dark bg-wood/70 text-secondary-foreground hover:bg-wood",
              )}
            >
              <div className="flex flex-col">
                <span>{category.label}</span>
                {category.description && (
                  <span className="text-[7px] normal-case opacity-80 font-sans mt-0.5 line-clamp-1">
                    {category.description}
                  </span>
                )}
              </div>
            </button>
          </li>
        ))}

      </ul>
    </nav>
  );
}
