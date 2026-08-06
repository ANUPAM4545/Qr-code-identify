export default function IntegrationsPage() {
  return (
    <div className="max-w-4xl flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-1">Connect Identify with your favorite tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" alt="Salesforce" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Salesforce</h3>
            <p className="text-sm text-gray-400 mt-1">Sync guest data and check-ins to your CRM.</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg mt-2 w-full transition-colors">
            Connect
          </button>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-[#FF7A59] rounded-xl flex items-center justify-center p-3 text-white font-bold text-2xl">
            HS
          </div>
          <div>
            <h3 className="font-semibold text-lg">HubSpot</h3>
            <p className="text-sm text-gray-400 mt-1">Automate marketing flows when guests register.</p>
          </div>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg mt-2 w-full transition-colors">
            Connect
          </button>
        </div>

      </div>
    </div>
  );
}
