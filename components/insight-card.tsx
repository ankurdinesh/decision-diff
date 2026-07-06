import type { InsightItem } from "@/lib/types";

type InsightCardProps = {
  items: InsightItem[];
  title: string;
  tone?: "risk" | "opportunity" | "tradeoff";
};

export function InsightCard({ items, title, tone }: InsightCardProps) {
  return (
    <article className="insight-card">
      <header>
        <h3>{title}</h3>
        <span className="count">{items.length}</span>
      </header>

      {items.length > 0 ? (
        <ul className="insight-list">
          {items.map((item, index) => (
            <li key={`${item.title}-${index}`}>
              <span className={tone ? `tag ${tone}` : "tag"}>{item.significance}</span>
              <span className="insight-title">{item.title}</span>
              <span className="insight-detail">{item.detail}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">No material movement identified in this category.</p>
      )}
    </article>
  );
}
