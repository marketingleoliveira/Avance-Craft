import { StonePanel } from "@/components/ui-kit/StonePanel";
import { SHOP_FAQ } from "@/data/shop";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ShopFaq() {
  return (
    <StonePanel title="Perguntas frequentes">
      <Accordion type="single" collapsible className="w-full">
        {SHOP_FAQ.map((item, index) => (
          <AccordionItem key={item.q} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-sm font-bold">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </StonePanel>
  );
}

export function ShopTerms() {
  return (
    <StonePanel title="Termos de compra">
      <ul className="grid gap-2 text-sm">
        <li>
          Todos os produtos são itens virtuais entregues dentro do servidor Habblet Mine e
          não têm valor fora dele.
        </li>
        <li>
          A entrega é feita para o nick informado no momento da compra. Nicks incorretos
          precisam ser corrigidos pelo suporte.
        </li>
        <li>
          Vantagens são de conveniência e cosméticas; não vendemos poder que quebre o
          equilíbrio do servidor.
        </li>
        <li>
          Reembolso em até 7 dias da compra, conforme o Código de Defesa do Consumidor,
          desde que os benefícios não tenham sido consumidos.
        </li>
        <li>
          Benefícios podem ser suspensos sem reembolso em caso de punição por quebra das
          regras.
        </li>
        <li>
          Projeto independente, sem vínculo com a Mojang ou a Microsoft. Nesta versão do
          site nenhuma cobrança é processada.
        </li>
      </ul>
    </StonePanel>
  );
}
