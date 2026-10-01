
import { AlertTriangle } from 'lucide-react';

export function FinancialDisclaimer() {
  return (
    <div className="flex items-center gap-3 bg-warning/10 border border-warning/20 text-warning/90 px-4 py-3 rounded-lg text-sm mt-6">
      <AlertTriangle size={18} className="shrink-0" />
      <p>
        <strong>Educational demonstration only.</strong> This system does not provide financial or investment advice. Predictions are uncertain and may be wrong.
      </p>
    </div>
  );
}
