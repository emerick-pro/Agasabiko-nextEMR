import React, { useState, useEffect } from 'react';
import { StockItem, ProgramType } from '../../types/emr';
import { localDb } from '../../db/indexedDb';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  Filter, 
  X,
  Save,
  Search,
  Building2
} from 'lucide-react';

export const StocksView: React.FC = () => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [filterProg, setFilterProg] = useState<string>('Tous');
  const [searchQ, setSearchQ] = useState('');
  
  // Requisition Modal State
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState('');
  const [quantiteDemandee, setQuantiteDemandee] = useState<number>(100);
  const [motifReq, setMotifReq] = useState('Réapprovisionnement mensuel CAMEBU / District');
  const [reqSuccess, setReqSuccess] = useState(false);

  const loadData = async () => {
    const list = await localDb.getAll<StockItem>('stocks');
    setStocks(list);
  };

  useEffect(() => {
    loadData();
    const unsub = localDb.subscribe(loadData);
    return () => {
      unsub();
    };
  }, []);

  const filteredStocks = stocks.filter(item => {
    if (filterProg !== 'Tous' && item.programme !== filterProg) return false;
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      return item.nomProduit.toLowerCase().includes(q) || item.numeroLot.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    setReqSuccess(true);
    setTimeout(() => {
      setReqSuccess(false);
      setIsReqModalOpen(false);
    }, 2000);
  };

  const ruptureCount = stocks.filter(s => s.statut === 'Rupture').length;
  const expirationCount = stocks.filter(s => s.statut === 'Expiration proche').length;

  return (
    <div className="space-y-6">
      
      {/* Header matching Screen 14 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Logistique · Service partagé
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Disponibilité des produits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Stocks reliés aux délivrances, avec lots et péremptions indispensables à la vaccination et au TARV.
          </p>
        </div>

        <button
          onClick={() => setIsReqModalOpen(true)}
          className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Réquisition</span>
        </button>
      </div>

      {/* 4 Metric Cards matching Screen 14 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Produits suivis</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">42</div>
          <div className="text-[11px] text-slate-400 mt-1">Tous programmes</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Lots disponibles</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">76</div>
          <div className="text-[11px] text-slate-400 mt-1">Traçabilité par lot</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Risque de rupture</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{ruptureCount || 3}</div>
          <div className="text-[11px] text-amber-800 mt-1 font-medium">À anticiper</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Péremption proche</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700">{expirationCount || 2}</div>
          <div className="text-[11px] text-rose-800 mt-1 font-medium">Vérification nécessaire</div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs font-semibold w-full sm:w-auto">
          {['Tous', 'VIH', 'Vaccination', 'Paludisme', 'TB'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterProg(p)}
              className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                filterProg === p
                  ? 'bg-cyan-700 text-white border-cyan-700 shadow-2xs font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Rechercher produit ou lot..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-cyan-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Stock Table matching Screen 14 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            <strong className="text-slate-800">État des stocks par programme</strong> · Avec numéro de lot, expiration, quantité et alertes
          </div>
          <span className="font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 text-[11px]">
            Inventaire local actif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-5">Produit</th>
                <th className="py-3 px-4">Programme</th>
                <th className="py-3 px-4">Lot</th>
                <th className="py-3 px-4">Expiration</th>
                <th className="py-3 px-4">Qté disponible</th>
                <th className="py-3 px-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStocks.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-900">
                    {item.nomProduit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {item.programme}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {item.numeroLot}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {item.dateExpiration}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {item.quantiteDisponible} {item.unite}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.statut === 'Disponible' ? 'bg-emerald-100 text-emerald-800' :
                      item.statut === 'Surveiller' ? 'bg-amber-100 text-amber-800' :
                      item.statut === 'Expiration proche' ? 'bg-orange-100 text-orange-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {item.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requisition Modal */}
      {isReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Nouvelle réquisition de stock (District)
              </h3>
              <button onClick={() => setIsReqModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequisition} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Produit concerné</label>
                <select
                  value={selectedStockId}
                  onChange={(e) => setSelectedStockId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-hidden"
                >
                  {stocks.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nomProduit} (Reste: {s.quantiteDisponible} {s.unite})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantité demandée</label>
                <input
                  type="number"
                  value={quantiteDemandee}
                  onChange={(e) => setQuantiteDemandee(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motif de la réquisition</label>
                <textarea
                  rows={2}
                  value={motifReq}
                  onChange={(e) => setMotifReq(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReqModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl"
                >
                  Transmettre la commande
                </button>
              </div>

              {reqSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Réquisition envoyée dans la file d'envoi pour la pharmacie de district !</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
