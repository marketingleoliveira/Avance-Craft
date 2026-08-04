import { SHOP_CATEGORIES, type ShopCategoryId } from "@/data/shop";
import { cn } from "@/lib/utils";

type Props = {
  active: ShopCategoryId;
  onChange: (id: ShopCategoryId) => void;
};

/** Navegação de categorias da loja (rolagem horizontal no mobile). */
export function CategoryNav({ active, onChange }: Props) {
  return (
    <nav aria-label="Categorias da loja" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-2">
        {SHOP_CATEGORIES.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              aria-current={active === category.id ? "true" : undefined}
              onClick={() => onChange(category.id)}
              className={cn(
                "font-pixel pixel-border px-4 py-3 text-[10px] uppercase transition-colors",
                active === category.id
                  ? "border-grass-dark bg-grass text-primary-foreground"
                  : "border-wood-dark bg-wood/70 text-secondary-foreground hover:bg-wood",
              )}
            >
              {category.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
