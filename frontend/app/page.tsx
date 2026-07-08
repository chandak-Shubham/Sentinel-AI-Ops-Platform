import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Activity, ShieldAlert, Cpu, Network, ArrowRight } from "lucide-react";
import { DemoLoginButton } from "@/components/demo-login-button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ShieldAlert className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Sentinel AI</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-40">
          <div className="container max-w-7xl mx-auto px-4 sm:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mb-8">
                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Now with AI-Powered RCA
              </div> */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Intelligent Incident Management & RBAC Platform
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground mb-10">
                Sentinel AI unifies incident tracking, robust role-based access control, and AI-driven root cause analysis into a single, seamless platform for modern engineering teams.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <DemoLoginButton />
                <Link href="https://github.com/chandak-Shubham/sentinel" target="_blank">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                    View on GitHub
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Background decorative gradient */}
          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/50">
          <div className="container max-w-7xl mx-auto px-4 sm:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                A professional grade platform
              </p>
            </div>

            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="flex flex-col">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Cpu className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI-Driven Analysis</h3>
                  <p className="text-muted-foreground flex-auto">
                    Automatically ingest logs and webhooks. Our integrated AI analyzes patterns to generate summaries, root cause analyses, and actionable recommendations.
                  </p>
                </div>
                {/* Feature 2 */}
                <div className="flex flex-col">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Incident Tracking</h3>
                  <p className="text-muted-foreground flex-auto">
                    A comprehensive dashboard to monitor, assign, and resolve incidents in real-time. Keep your entire team aligned during critical outages.
                  </p>
                </div>
                {/* Feature 3 */}
                <div className="flex flex-col">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Network className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Advanced RBAC</h3>
                  <p className="text-muted-foreground flex-auto">
                    Secure your platform with fine-grained Role-Based Access Control. Manage teams, assign custom roles, and strictly enforce permission boundaries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-8 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-lg font-bold">Sentinel AI</span>
          </div>
          <p className="text-center text-sm text-muted-foreground leading-loose md:text-left">
            Built for modern engineering teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
