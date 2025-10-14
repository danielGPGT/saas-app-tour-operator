export function Footer() {
  return (
    <footer className="border-t bg-background px-6 py-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          © 2024 Acme Tours. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span>Version 1.0.0</span>
          <span>•</span>
          <span>Built with Next.js</span>
        </div>
      </div>
    </footer>
  )
}