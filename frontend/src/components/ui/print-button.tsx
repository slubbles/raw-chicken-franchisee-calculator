import { Button } from './button';

interface PrintButtonProps {
  title?: string;
  className?: string;
}

export function PrintButton({ title = 'Print', className = '' }: PrintButtonProps) {
  const handlePrint = () => {
    // Add print header with current date
    const printDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Create print header
    const existingHeader = document.querySelector('.print-header');
    if (!existingHeader) {
      const header = document.createElement('div');
      header.className = 'print-header no-print';
      header.innerHTML = `
        <h1>Calamias Fried Chicken</h1>
        <div class="print-date">Printed on: ${printDate}</div>
      `;
      header.style.display = 'none';
      document.body.insertBefore(header, document.body.firstChild);
    }

    // Trigger print
    window.print();
  };

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      size="sm"
      className={`no-print border-gray-700 text-white hover:bg-gray-800 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2"
      >
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      {title}
    </Button>
  );
}
