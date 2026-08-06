export default function BillingPage() {
  return (
    <div className="max-w-4xl flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Manage your plan, payment methods, and usage.</p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Enterprise Plan</h2>
            <p className="text-gray-400 mt-1">You are currently on the highest tier.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">$499<span className="text-sm text-gray-500 font-normal">/mo</span></div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Current Usage</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Events (Unlimited)</span>
                <span className="text-white">12</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Guests per month (100,000 limit)</span>
                <span className="text-white">45,231 / 100,000</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">API Requests (1,000,000 limit)</span>
                <span className="text-white">890,123 / 1,000,000</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
