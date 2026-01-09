import {
  Home,
  Search,
  Building2,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/6obf1wetk0iahgcfkuyaa.png';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
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

export function Sidebar({ currentPage, onNavigate, isOpen, onClose, onToggle }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#12121a] border border-[#1e293b] text-[#94a3b8] hover:text-cyan-500 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-[#12121a] border-r border-[#1e293b] flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
      <div className="p-6 border-b border-[#1e293b]">
        <div className="flex items-center justify-between">
          <img
            src={logo}
            alt="ECO-LOCAUX"
            className="h-10 w-auto object-contain"
          />
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-[#94a3b8] hover:text-cyan-500 hover:bg-[#1a1a24] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
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
    </>
  );
}
