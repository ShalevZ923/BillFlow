export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground">Last updated: June 2026</p>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-xl font-semibold">Acceptance</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              By accessing or using BillFlow, you agree to be bound by these Terms of Service. If
              you do not agree, please do not use our service. We reserve the right to update these
              terms at any time, and continued use constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Account Terms</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              You are responsible for maintaining the security of your account credentials. You must
              provide accurate and complete information when creating an account. You may not use
              BillFlow for any illegal or unauthorized purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Payments</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Paid plans are billed monthly or annually through Stripe. You may cancel at any time;
              cancellation takes effect at the end of your current billing period. Refunds are
              handled on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Limitations</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              BillFlow is provided &quot;as is&quot; without warranties of any kind. We are not
              liable for any damages arising from your use of the service. We do not guarantee that
              the service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              For questions about these terms, please contact us at support@billflow.io.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
