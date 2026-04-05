"use client";

import { useState } from "react";
import { usePlannerStore } from "@/lib/store/usePlannerStore";
import { Trash2, Plus, Receipt, Hotel, Utensils, Bus, Activity, MoreHorizontal, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";

const CATEGORIES = ["Accommodation", "Food", "Transport", "Activities", "Other"] as const;
type Category = typeof CATEGORIES[number];

const ICONS: Record<Category, React.ReactNode> = {
  Accommodation: <Hotel className="h-4 w-4" />,
  Food: <Utensils className="h-4 w-4" />,
  Transport: <Bus className="h-4 w-4" />,
  Activities: <Activity className="h-4 w-4" />,
  Other: <MoreHorizontal className="h-4 w-4" />,
};

export default function BudgetTab({ tripId }: { tripId: string }) {
  const { trips, addBudgetItem, removeBudgetItem } = usePlannerStore();
  const trip = trips[tripId];

  const [desc, setDesc] = useState("");
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState<Category>("Accommodation");

  if (!trip) return null;

  const total = trip.budgetItems.reduce((acc, curr) => acc + curr.cost, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !cost || isNaN(Number(cost))) return;

    addBudgetItem({
      category,
      description: desc,
      cost: Number(cost),
    });

    setDesc("");
    setCost("");
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Total Overview */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
        <h3 className="text-emerald-100 font-bold text-sm uppercase tracking-wider mb-1">Estimated Budget</h3>
        <div className="flex items-baseline mb-2">
          <span className="text-2xl font-bold opacity-80 mr-1">৳</span>
          <span className="text-5xl font-black">{total.toLocaleString()}</span>
        </div>
        <div className="text-emerald-100 text-sm mt-4 flex items-center bg-white/10 w-max px-3 py-1.5 rounded-lg backdrop-blur-sm">
          <Receipt className="h-4 w-4 mr-2" />
          {trip.budgetItems.length} Items Planned
        </div>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAdd} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-black text-lg text-slate-800">Add Expense</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <input
              type="text"
              placeholder="Description (e.g. Bus to Khulna)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              required
            />
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
            <input
              type="number"
              placeholder="Amount"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              required
              min="0"
            />
          </div>
          
          <Select value={category} onValueChange={(val) => setCategory(val as Category)}>
            <SelectTrigger className="w-full h-[42px] bg-slate-50 border-slate-200 focus:ring-emerald-500 text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button 
          type="submit" 
          className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Budget
        </button>
      </form>

      {/* Items List */}
      <div className="space-y-3">
        {trip.budgetItems.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-200 rounded-2xl">
            No expenses added yet.
          </div>
        )}
        {trip.budgetItems.map(item => (
          <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${getCategoryColor(item.category)}`}>
              {ICONS[item.category]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 truncate">{item.description}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
            </div>
            <div className="text-right">
              <div className="font-black text-slate-900">৳{item.cost.toLocaleString()}</div>
            </div>
            <button 
              onClick={() => removeBudgetItem(item.id)}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function getCategoryColor(cat: Category) {
  switch (cat) {
    case "Accommodation": return "bg-blue-100 text-blue-600";
    case "Food": return "bg-orange-100 text-orange-600";
    case "Transport": return "bg-purple-100 text-purple-600";
    case "Activities": return "bg-pink-100 text-pink-600";
    default: return "bg-slate-100 text-slate-600";
  }
}
