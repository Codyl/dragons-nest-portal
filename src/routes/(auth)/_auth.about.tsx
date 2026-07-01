import useGoogleSignin from '@/hooks/use-google-signin';
import { useGoogleOneTapLogin } from '@react-oauth/google'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/_auth/about')({
  component: RouteComponent,
})

function RouteComponent() {
  const { signInWithGoogle } = useGoogleSignin();

  useGoogleOneTapLogin({
    onSuccess:(credentialResponse) => {
            if (credentialResponse.credential) {
              signInWithGoogle(credentialResponse.credential);
            }
          }
  })
  
  return (
    <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Hero Section */}
      <section className="px-6 md:px-12 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/40 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              About Our Mission
            </span>

            <h1 className="text-primary text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Empowering the Modern{' '}
              <br className="hidden md:block" />
              <span className="text-[oklch(55%_0.2_25)]">
                Homeschooling Journey
              </span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-[540px]">
              At Dragon's Nest, we believe every child's education should be as
              unique as they are. We provide the structural integrity of a
              traditional academy with the nurturing flexibility of home
              learning.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link
                to="/signup"
                className="bg-[oklch(55%_0.2_25)] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition text-sm"
              >
                Start Your Nest
              </Link>
              <Link
                to="/"
                className="border-2 border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/5 transition text-sm"
              >
                View Curriculum
              </Link>
            </div>
          </div>

          <div className="order-1 md:order-2 flex justify-center">
            <img
              className="w-full max-w-[320px] md:max-w-[400px] drop-shadow-xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRVGmAMK6qOS_SWUc2iYc12fJOZkeV_iIhpLzRSIZ62Fqv7lJfXM_w_Jl38n5Te-SuZKu2yg5AEkHkZLHkKeTj04SpUoM8aR-1b4yGE7RBXadQ9DjuQFinFd56cK2au6PrGuJJ9RHh99lC0S0eLQ1QAZcXIaBsNdCs3FeCzfhDtYW_IL2S2mpI_5XorQtuhd3vUaveFVKD6fB3qAMKUwVmhkRbOJIOdoNckMH1YlW6bZX8eBSKIoCufgTar48v2YSMBUiHxxgq6A"
              alt="Dragon's Nest mascot"
            />
          </div>
        </div>
      </section>

      {/* Five Pillars Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              What We Offer
            </h2>
            <div className="h-1 w-20 bg-[oklch(55%_0.2_25)] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid md:grid-cols-12 gap-5">
            {/* Standards & Tracking - large left */}
            <div className="md:col-span-7 p-8 rounded-2xl bg-card border border-border flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[oklch(55%_0.2_25)]/10 flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-[oklch(55%_0.2_25)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Standards & Tracking
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Never lose sleep over compliance again. Seamlessly manage
                  progress toward Common Core and state standards with our
                  automated tracking engine. We translate your daily activities
                  into the rigorous metrics educational boards require, giving
                  you peace of mind and professional documentation.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[oklch(55%_0.2_25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[oklch(55%_0.2_25)]" />
                  Common Core Ready
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[oklch(55%_0.2_25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[oklch(55%_0.2_25)]" />
                  Auto-Reporting
                </span>
              </div>
            </div>

            {/* Community - small right */}
            <div className="md:col-span-5 p-8 rounded-2xl bg-primary text-primary-foreground flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Community</h3>
                <p className="text-sm leading-relaxed opacity-90">
                  Break the isolation stigma. Find friends to learn with and parents you love with knowledge they want to share. Share resources, host joint
                  labs, and build environments.
                </p>
              </div>
              <div className="mt-6">
                <span className="text-sm font-medium opacity-80 hover:opacity-100 transition cursor-pointer">
                  Find groups →
                </span>
              </div>
            </div>

            {/* Total Flexibility - small left */}
            <div className="md:col-span-5 p-8 rounded-2xl bg-card border border-border flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                Total Flexibility
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Add your own custom assignments and external curriculum. Our
                platform adapts to your teaching style, not the other way around.
              </p>
            </div>

            {/* Portfolio & Time Tracking - large right */}
            <div className="md:col-span-7 p-8 rounded-2xl bg-card border border-border flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="w-10 h-10 rounded-lg bg-[oklch(55%_0.2_25)]/10 flex items-center justify-center mb-4">
                  <svg
                    className="w-5 h-5 text-[oklch(55%_0.2_25)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Portfolio & Time Tracking
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Effortlessly track hours for goals and upload manageduser portfolio
                  projects. Create beautiful, shareable galleries of your
                  manageduser's best work—from science experiments to art
                  projects—all in one secure digital vault.
                </p>
              </div>
              {/* Mini UI preview */}
              <div className="hidden sm:block w-48 shrink-0 space-y-2 rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Monthly Log</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                    On Track
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-[oklch(55%_0.2_25)]" />
                    PortfolioUpload
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Art Projects Log
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Beyond the Classroom */}
      <section className="py-20 md:py-28 px-6 md:px-12 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            Education Beyond the Classroom
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mb-14 max-w-2xl mx-auto leading-relaxed">
            We believe true education encompasses more than textbooks. Dragon's
            Nest provides specialized resources for teaching essential life
            skills that prepare managedusers for the real world.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-card border border-border flex items-center justify-center text-primary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.42 15.17l-5.384-3.19A2.625 2.625 0 014.5 9.845V6.531c0-1.03.599-1.966 1.536-2.394l5.384-3.19a2.625 2.625 0 012.66 0l5.384 3.19A2.625 2.625 0 0121 6.531v3.314c0 1.03-.599 1.966-1.536 2.394l-5.384 3.19a2.625 2.625 0 01-2.66 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground">
                Mechanics
              </span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-card border border-border flex items-center justify-center text-primary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground">
                Computing
              </span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-card border border-border flex items-center justify-center text-primary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground">
                Communication
              </span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-card border border-border flex items-center justify-center text-primary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-foreground">
                Life Skills
              </span>
            </div>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-secondary/20 rounded-full blur-[100px] z-0" />
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 py-12">
        <div className="max-w-5xl mx-auto bg-primary text-primary-foreground rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            Ready to nurture your child's potential?
          </h2>
          <p className="text-sm md:text-base opacity-85 mb-8 max-w-xl mx-auto">
            Join for free to find your dragons family and get your families adventure started.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/signup"
              className="bg-[oklch(55%_0.2_25)] text-white px-8 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition"
            >
              Get Started for Free
            </Link>
            <Link
              to="/"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl text-sm font-medium border border-white/20 transition"
            >
              Schedule a Tour
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 mt-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-semibold text-primary text-base">
              Dragon's Nest
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              © 2024 Dragon's Nest Homeschooling. All rights reserved.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-5 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition">
              Contact Us
            </a>
            <a href="#" className="hover:text-primary transition">
              Resources
            </a>
          </nav>

          <div className="flex gap-3">
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition"
              aria-label="Share"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition"
              aria-label="Email"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
