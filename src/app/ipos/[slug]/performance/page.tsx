import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getIpo, listIpos } from "@/lib/data";
import { ListingPerformance } from "@/components/detail/listing-performance";
import { EmptyState } from "@/components/ui/empty-state";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await listIpos()).filter((i) => i.listing).map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ipos/[slug]/performance">): Promise<Metadata> {
  const { slug } = await params;
  const ipo = await getIpo(slug);
  return { title: ipo ? `${ipo.company.name}: performance since listing` : "Not found" };
}

export default async function PerformancePage({ params }: PageProps<"/ipos/[slug]/performance">) {
  const { slug } = await params;
  const ipo = await getIpo(slug);
  if (!ipo) notFound();

  return (
    <div className="py-8">
      <Link href={`/ipos/${ipo.slug}`} className="inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden /> Back to {ipo.company.name} analysis
      </Link>
      <p className="eyebrow mt-6">Post-listing performance</p>
      <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{ipo.company.name}</h1>
      <div className="mt-8">
        {ipo.listing ? (
          <ListingPerformance ipo={ipo} />
        ) : (
          <EmptyState title="Not listed yet">
            Performance data appears here once the shares start trading and a verified price source is available.
          </EmptyState>
        )}
      </div>
    </div>
  );
}
