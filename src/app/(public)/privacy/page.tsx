export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: June 2026</p>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-xl font-semibold">Information We Collect</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              We collect information you provide when creating an account, such as your email address
              and billing data. We also collect usage data to improve our service, including which
              features you use and how you interact with the application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">How We Use Information</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              We use your information to provide, maintain, and improve BillFlow. This includes
              processing your bills, sending reminders, and personalizing your experience. We do not
              sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Data Storage</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Your data is stored securely using Supabase infrastructure. All data is encrypted in
              transit and at rest. We retain your data for as long as your account is active and for
              a reasonable period after account deletion to comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Third-Party Services</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              BillFlow integrates with third-party services including Supabase (database and
              authentication), Stripe (payment processing), and Resend (email delivery). Each of
              these services has its own privacy policy governing how they handle your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              If you have questions about this privacy policy or how your data is handled, please
              contact us at privacy@billflow.io.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
