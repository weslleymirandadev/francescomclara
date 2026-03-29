export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
      <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2">
        Estamos em Manutenção
      </h1>
      <p className="text-slate-500 max-w-md italic">
        A Clara está ajustando os últimos detalhes para melhorar sua experiência. 
        Por favor, volte mais tarde! Je suis désolé. 🙏
      </p>
      <div className="mt-8 text-sm font-bold uppercase tracking-widest text-clara-rose">
        Francês com Clara
      </div>
    </div>
  )
}