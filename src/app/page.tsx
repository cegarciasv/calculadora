import { Calculator } from "@/components/calculator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
            <path d="M9 9.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 14.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <h1 className="text-4xl font-bold text-foreground">
            Calcify
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">A simple, beautiful calculator with AI assistance.</p>
      </div>
      <Calculator />
    </main>
  );
}
