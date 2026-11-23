"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-3">
      {items.map((item) => (
        <Accordion.Item
          key={item.id}
          value={item.id}
          className="overflow-hidden rounded-2xl border border-line bg-surface transition-colors data-[state=open]:border-brand/50 data-[state=open]:shadow-card"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 px-6 py-5 text-left font-heading text-base font-semibold text-navy transition-colors hover:text-brand sm:text-lg">
              <span className="break-words">{item.question}</span>
              <ChevronDown
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-ink-subtle transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-brand"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm leading-relaxed text-ink-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="border-t border-line-subtle px-6 pb-5 pt-3.5 max-w-[72ch] break-words">
              {item.answer}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
