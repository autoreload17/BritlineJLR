import Link from "next/link";

export default async function ModelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brand: string; model: string }>;
}) {
  const { brand, model } = await params;
  const base = `/vehicles/${brand}/${model}`;
  const tabs = [
    { href: `${base}/features-activation`, label: "FEATURES ACTIVATION" },
    { href: `${base}/retrofits`, label: "RETROFITS" },
    { href: `${base}/power-upgrade`, label: "POWER UPGRADE" },
    { href: `${base}/accessories`, label: "ACCESSORIES" },
  ];

  return (
    <section className="container-padded mx-auto max-w-6xl py-10">
      <div className="text-xs uppercase text-zinc-500">{brand.replace(/-/g, " ")} / {model.replace(/-/g, " ")}</div>
      <div className="mt-6 flex flex-wrap gap-3">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className="text-xs px-4 py-2 rounded-full border border-[var(--border-color)] hover:bg-white/5">
            {t.label}
          </Link>
        ))}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}




