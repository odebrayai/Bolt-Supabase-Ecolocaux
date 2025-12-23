import {
  Home,
  Search,
  Building2,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Store
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'recherche', label: 'Recherche', icon: Search },
  { id: 'commerces', label: 'Commerces', icon: Building2 },
  { id: 'rendez-vous', label: 'Rendez-vous', icon: Calendar },
  { id: 'equipe', label: 'Équipe', icon: Users },
  { id: 'statistiques', label: 'Statistiques', icon: BarChart3 },
  { id: 'parametres', label: 'Paramètres', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#12121a] border-r border-[#1e293b] flex flex-col">
      <div className="p-6 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#f1f5f9] tracking-tight">CRM Eco-Locaux</h1>
            <p className="text-xs text-[#94a3b8]">Prospection commerciale</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-[#1a1a24] text-cyan-500 border-l-2 border-cyan-500'
                  : 'text-[#94a3b8] hover:bg-[#1a1a24] hover:text-[#f1f5f9]'
                }
              `}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1e293b]">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#1a1a24] mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {profile?.prenom?.[0]}{profile?.nom?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#f1f5f9] truncate">
              {profile?.prenom} {profile?.nom}
            </p>
            <p className="text-xs text-[#94a3b8] capitalize">{profile?.role}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[#94a3b8] hover:bg-[#1a1a24] hover:text-red-500 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
