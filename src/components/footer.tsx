export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with ❤️ using Next.js 15, TypeScript, and shadcn/ui
        </p>
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
          © {new Date().getFullYear()} Flouci Payment Demo
        </p>
      </div>
    </footer>
  );
}