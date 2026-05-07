export default function Footer() {
  
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-emerald-50 bg-emerald-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-sm font-medium text-emerald-800">
            Aneka Citra Computer
          </p>
          <p className="text-sm text-emerald-700">
            © {year} • Bogor, Indonesia
          </p>
          
        </div>
      </div>
    </footer>
  );
}
