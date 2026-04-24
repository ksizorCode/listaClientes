import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  LayoutList, 
  LayoutGrid, 
  Table, 
  Map as MapIcon, 
  Mail, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Star, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  Settings,
  Moon,
  Sun,
  Navigation,
  Building,
  MapPin,
  Layers
} from 'lucide-react';

const API_URL = 'https://dummyjson.com/users';

const App = () => {
  // --- Estado de la Aplicación ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showSettings, setShowSettings] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [mapLayer, setMapLayer] = useState('mapnik'); 
  const [modalTab, setModalTab] = useState('dept');

  // --- Configuración y Persistencia (Compatible con GitHub Pages) ---
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('gh_pages_app_config');
      return saved ? JSON.parse(saved) : {
        theme: 'light',
        avatarStyle: 'big-smile',
        appTitle: 'Directorio Pro'
      };
    } catch (e) {
      return { theme: 'light', avatarStyle: 'big-smile', appTitle: 'Directorio Pro' };
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('gh_pages_app_favs');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem('gh_pages_app_config', JSON.stringify(config));
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config]);

  useEffect(() => {
    localStorage.setItem('gh_pages_app_favs', JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const categories = ['All', ...new Set(users.map(u => u.company?.department).filter(Boolean))];

  const getAvatarUrl = (seed) => `https://api.dicebear.com/7.x/${config.avatarStyle}/svg?seed=${seed}`;

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) newFavorites.delete(id);
    else newFavorites.add(id);
    setFavorites(newFavorites);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredUsers = useMemo(() => {
    let result = users.filter(user => {
      const fullText = `${user.firstName} ${user.lastName} ${user.email} ${user.company.name}`.toLowerCase();
      const matchesSearch = fullText.includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || user.company?.department === selectedCategory;
      const matchesFavs = !showFavoritesOnly || favorites.has(user.id);
      return matchesSearch && matchesCategory && matchesFavs;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [users, searchTerm, selectedCategory, sortConfig, showFavoritesOnly, favorites]);

  // --- Sub-componente de Botones de Acción ---
  const UserActions = ({ user, light = false }) => (
    <div className="flex gap-2">
      <button className={`p-2 rounded-xl transition-colors ${light ? 'bg-white/10 hover:bg-white/20 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
        <Mail size={18} />
      </button>
      <button className={`p-2 rounded-xl transition-colors ${light ? 'bg-white/10 hover:bg-white/20 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
        <Phone size={18} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); toggleFavorite(user.id); }}
        className={`p-2 rounded-xl transition-colors ${favorites.has(user.id) ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : light ? 'bg-white/10 text-white/50' : 'text-gray-300'}`}
      >
        <Star size={18} fill={favorites.has(user.id) ? "currentColor" : "none"} />
      </button>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-gray-400 animate-pulse uppercase tracking-widest text-xs">Cargando Directorio...</p>
      </div>
    </div>
  );

  const selectedUser = selectedUserIndex !== null ? filteredUsers[selectedUserIndex] : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Building size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight">{config.appTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${showFavoritesOnly ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
              <Star size={16} fill={showFavoritesOnly ? "currentColor" : "none"} />
              <span className="hidden sm:inline">Favoritos</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">{favorites.size}</span>
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero / Filtros */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar contactos..." 
              className="w-full pl-14 pr-6 py-4 bg-transparent outline-none font-medium text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex w-full md:w-auto gap-2 p-1">
            <select 
              className="flex-1 md:w-48 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-xs uppercase tracking-wider appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'Departamentos' : c}</option>)}
            </select>
            <div className="flex bg-slate-50 dark:bg-slate-800 rounded-2xl p-1">
              {[
                { id: 'cards', icon: LayoutGrid },
                { id: 'list', icon: LayoutList },
                { id: 'table', icon: Table },
                { id: 'map', icon: MapIcon }
              ].map(v => (
                <button 
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === v.id ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400'}`}
                >
                  <v.icon size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid Principal */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user, idx) => (
              <div 
                key={user.id} 
                onClick={() => setSelectedUserIndex(idx)}
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UserActions user={user} />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img src={getAvatarUrl(user.username)} className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 p-1" alt="avatar" />
                    {favorites.has(user.id) && <div className="absolute -bottom-1 -right-1 bg-yellow-400 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white dark:border-slate-900"><Star size={10} fill="black"/></div>}
                  </div>
                  <h3 className="font-bold text-lg line-clamp-1">{user.firstName} {user.lastName}</h3>
                  <p className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-1">{user.company.title}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">{user.company.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vista Mapa General */}
        {viewMode === 'map' && (
          <div className="h-[600px] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-xl">
             <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur p-2 rounded-2xl shadow-lg border dark:border-slate-700 flex items-center gap-2">
                  <Layers size={14} />
                  <select 
                    value={mapLayer}
                    onChange={(e) => setMapLayer(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none"
                  >
                    <option value="mapnik">Mapa Estándar</option>
                    <option value="cycle">Vista Ciclismo</option>
                    <option value="transport">Transporte Público</option>
                  </select>
                </div>
             </div>
             <iframe 
                title="Global Map"
                width="100%" height="100%" frameBorder="0" 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=-10,35,5,45&layer=${mapLayer}`}
             ></iframe>
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="bg-slate-900/80 text-white px-6 py-3 rounded-2xl backdrop-blur-sm text-xs font-bold uppercase tracking-widest border border-white/10">
                   Modo Simulación de Ubicaciones
                </div>
             </div>
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="py-40 text-center flex flex-col items-center opacity-40">
            <Search size={64} className="mb-4" />
            <h2 className="text-2xl font-black">No se encontraron resultados</h2>
            <p>Intenta ajustar tus criterios de búsqueda</p>
          </div>
        )}
      </main>

      {/* Modal de Detalle */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedUserIndex(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="absolute top-6 right-6 flex gap-2 z-10">
              <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20">
                 <button 
                  onClick={() => selectedUserIndex > 0 && setSelectedUserIndex(selectedUserIndex - 1)}
                  disabled={selectedUserIndex === 0}
                  className="p-3 hover:bg-white/20 rounded-xl disabled:opacity-20 text-white"
                 >
                   <ChevronLeft size={20}/>
                 </button>
                 <button 
                  onClick={() => selectedUserIndex < filteredUsers.length - 1 && setSelectedUserIndex(selectedUserIndex + 1)}
                  disabled={selectedUserIndex === filteredUsers.length - 1}
                  className="p-3 hover:bg-white/20 rounded-xl disabled:opacity-20 text-white"
                 >
                   <ChevronRight size={20}/>
                 </button>
              </div>
              <button 
                onClick={() => setSelectedUserIndex(null)}
                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-lg shadow-red-500/20 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Banner Superior */}
            <div className="h-48 bg-gradient-to-br from-blue-600 to-indigo-700 relative">
               <div className="absolute -bottom-16 left-12">
                  <img 
                    src={getAvatarUrl(selectedUser.username)} 
                    className="w-40 h-40 bg-white dark:bg-slate-800 p-2 rounded-[2.5rem] shadow-2xl border-4 border-white dark:border-slate-900" 
                    alt="avatar" 
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-20 px-12 pb-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h2 className="text-4xl font-black mb-1">{selectedUser.firstName} {selectedUser.lastName}</h2>
                    <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-sm mb-6">{selectedUser.company.title}</p>
                    
                    <div className="space-y-6">
                       <div className="flex items-center gap-4 group">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Mail size={20}/>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Email Corporativo</p>
                            <p className="font-bold">{selectedUser.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 group">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <Phone size={20}/>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Teléfono Directo</p>
                            <p className="font-bold">{selectedUser.phone}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 group">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <MapPin size={20}/>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Oficina Principal</p>
                            <p className="font-bold">{selectedUser.address.city}, {selectedUser.address.state}</p>
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedUser.address.coordinates.lat},${selectedUser.address.coordinates.lng}`, '_blank')}
                      className="mt-10 w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                      <Navigation size={20}/> CÓMO LLEGAR
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                       <iframe 
                          title="User Map"
                          width="100%" height="100%" frameBorder="0" 
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedUser.address.coordinates.lng-0.01},${selectedUser.address.coordinates.lat-0.01},${selectedUser.address.coordinates.lng+0.01},${selectedUser.address.coordinates.lat+0.01}&layer=${mapLayer}&marker=${selectedUser.address.coordinates.lat},${selectedUser.address.coordinates.lng}`}
                       ></iframe>
                    </div>

                    {/* Tabs de sugerencias */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl">
                       <div className="flex gap-4 mb-4 border-b dark:border-slate-700">
                          <button onClick={() => setModalTab('dept')} className={`pb-2 text-[10px] font-black uppercase tracking-widest ${modalTab === 'dept' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-slate-400'}`}>Mismo Dpto.</button>
                          <button onClick={() => setModalTab('city')} className={`pb-2 text-[10px] font-black uppercase tracking-widest ${modalTab === 'city' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-slate-400'}`}>Misma Ciudad</button>
                       </div>
                       <div className="flex gap-3 overflow-x-auto pb-2">
                          {users
                            .filter(u => modalTab === 'dept' ? u.company.department === selectedUser.company.department : u.address.city === selectedUser.address.city)
                            .filter(u => u.id !== selectedUser.id)
                            .slice(0, 5)
                            .map(u => (
                               <div key={u.id} className="flex-shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-slate-700 p-1 cursor-pointer hover:ring-2 ring-blue-500" onClick={() => setSelectedUserIndex(users.findIndex(x => x.id === u.id))}>
                                  <img src={getAvatarUrl(u.username)} alt="mini" className="w-full h-full rounded-lg" />
                               </div>
                            ))
                          }
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Configuración */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-slate-900 z-[60] shadow-2xl transform transition-transform duration-500 ease-out border-l dark:border-slate-800 ${showSettings ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-black">Ajustes</h2>
            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-transform hover:rotate-90">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-10">
            <section>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Apariencia</label>
              <div className="grid grid-cols-2 gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                <button 
                  onClick={() => setConfig({...config, theme: 'light'})}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${config.theme === 'light' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  <Sun size={18}/> Claro
                </button>
                <button 
                  onClick={() => setConfig({...config, theme: 'dark'})}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${config.theme === 'dark' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'}`}
                >
                  <Moon size={18}/> Oscuro
                </button>
              </div>
            </section>

            <section>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Estilo Global de Avatares</label>
              <div className="grid grid-cols-2 gap-2">
                {['big-smile', 'avataaars', 'bottts', 'pixel-art', 'notionists', 'open-peeps'].map(style => (
                  <button 
                    key={style}
                    onClick={() => setConfig({...config, avatarStyle: style})}
                    className={`px-4 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${config.avatarStyle === style ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
                  >
                    {style.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Título de la Web</label>
              <input 
                type="text" 
                value={config.appTitle}
                onChange={(e) => setConfig({...config, appTitle: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 px-6 py-4 rounded-2xl outline-none font-bold"
                placeholder="Nombre de tu App..."
              />
            </section>
          </div>

          <div className="mt-auto pt-8 border-t dark:border-slate-800 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Optimizado para GitHub Pages</p>
          </div>
        </div>
      </div>

      {showSettings && <div className="fixed inset-0 bg-black/40 z-[55] backdrop-blur-sm" onClick={() => setShowSettings(false)} />}
    </div>
  );
};

export default App;