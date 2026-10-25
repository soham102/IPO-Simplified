import type { Metadata } from "next";
import { Mail, Send, User } from "lucide-react";
import { FEEDBACK_MAILTO as MAILTO, OWNER_EMAIL as EMAIL, OWNER_NAME as NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="py-14 sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow !text-series">Contact</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Get in touch</h1>
        <p className="mt-4 text-lg text-ink-2">
          This platform is always evolving. Please feel free to suggest any improvements and write to me on the email
          below. I&apos;d genuinely love to hear your ideas.
        </p>
      </div>

      <section aria-label="Contact details" className="card mx-auto mt-10 max-w-xl p-6 shadow-sm sm:p-8">
        <dl>
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand" aria-hidden>
              <User className="size-5" />
            </span>
            <div className="min-w-0">
              <dt className="eyebrow">Name</dt>
              <dd className="mt-0.5 text-lg font-semibold">{NAME}</dd>
            </div>
          </div>

          <div className="my-6 border-t border-line" />

          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand" aria-hidden>
              <Mail className="size-5" />
            </span>
            <div className="min-w-0">
              <dt className="eyebrow">Contact email</dt>
              <dd className="mt-0.5 text-lg font-semibold">
                <a href={MAILTO} className="break-all text-series hover:underline">
                  {EMAIL}
                </a>
              </dd>
            </div>
          </div>
        </dl>

        <a
          href={MAILTO}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-medium text-on-brand transition-colors hover:bg-ink"
        >
          <Send className="size-4" aria-hidden />
          Send feedback
        </a>
      </section>

      <p className="mx-auto mt-6 max-w-xl text-center text-sm text-ink-3">
        Spotted a wrong figure on an IPO page? The &quot;Report an error&quot; button on that page sends the page details along with
        your note.
      </p>
    </div>
  );
}
