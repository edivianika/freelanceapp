'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function SetupWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check if environment variables are properly set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl.includes('your-project-id') || 
        supabaseAnonKey.includes('your-anon-key')) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Setup Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Please configure your environment variables to use the application:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Set up your Supabase project</li>
              <li>Update <code className="bg-yellow-100 px-1 rounded">.env.local</code> with your Supabase credentials</li>
              <li>Update <code className="bg-yellow-100 px-1 rounded">backend/.env</code> with your backend configuration</li>
              <li>Run the SQL schema in your Supabase project</li>
            </ul>
            <p className="mt-2">
              See the README.md for detailed setup instructions.
            </p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-400 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


