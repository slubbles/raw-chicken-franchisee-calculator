"use client"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-800 bg-black">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            <p>🐔 Calamias Fried Chicken Order Calculator</p>
            <p className="text-xs mt-1">Built for efficient franchise management</p>
          </div>
          
          <div className="flex gap-6 text-xs text-gray-500">
            <div>
              <span className="text-gray-400">Press</span>{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-300">?</kbd>{" "}
              <span className="text-gray-400">for shortcuts</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            v1.0.0 • October 2025
          </div>
        </div>
      </div>
    </footer>
  )
}
