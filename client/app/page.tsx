import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-14 border-b">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center px-4 lg:px-6">
          <Link className="flex items-center gap-2 font-semibold" href="#">
            <Shield className="h-6 w-6" />
            <span>IP Shield</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Protect Your Intellectual Property
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Secure your creative works with blockchain technology. Timestamp and verify ownership of your music,
                  documents, and more.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/dashboard">
                  <Button>Get Started</Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Our platform uses blockchain technology to create immutable proof of your intellectual property.
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
                <div className="grid gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white mx-auto">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Upload Your Work</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Upload your music, documents, images, or any digital content to our secure platform.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white mx-auto">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Generate Hash</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    We create a unique cryptographic hash of your file, which serves as its digital fingerprint.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white mx-auto">
                    3
                  </div>
                  <h3 className="text-xl font-bold">Blockchain Timestamp</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    The hash is stored on the blockchain with a timestamp, creating permanent proof of existence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full shrink-0 border-t py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 sm:flex-row md:px-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">IP Shield.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6"></nav>
        </div>
      </footer>
    </div>
  )
}

