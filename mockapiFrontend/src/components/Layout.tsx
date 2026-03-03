import React from 'react';
import { useGlobalContext } from '../context/GlobalContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedEnvironment, logout, error, setError } = useGlobalContext();

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-[slideIn_0.3s_ease-out]">
          <span className="material-symbols-outlined">error</span>
          <span className="font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 hover:bg-white/20 rounded p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
      <div className="w-full max-w-[1100px] flex flex-col min-h-screen px-4">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-primary/10 py-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined !text-2xl">api</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">MockAPI</h2>
          </div>

          <div className="flex items-center gap-6">
            {selectedEnvironment && (
              <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="material-symbols-outlined text-sm text-slate-500">search</span>
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  className="bg-transparent border-none focus:ring-0 text-sm w-48"
                />
              </div>
            )}

            <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
              <a href="#" className="hover:text-primary transition-colors">Pricing</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </nav>

            <div className="flex items-center gap-4 pl-6 border-l border-primary/10">
              <button className="relative p-2 text-slate-500 hover:bg-primary/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-light"></span>
              </button>
              <button
                onClick={logout}
                className="size-10 rounded-full bg-gradient-to-tr from-primary to-indigo-400 p-0.5 hover:opacity-80 transition-opacity"
              >
                <div
                  className="size-full rounded-full bg-center bg-no-repeat bg-cover"
                  style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/a/default-user=s96-c")' }}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-auto py-10 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm">© 2024 MockAPI Inc. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-primary">Status</a>
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">API Reference</a>
          </div>
        </footer>
      </div>
    </div>
  );
};
