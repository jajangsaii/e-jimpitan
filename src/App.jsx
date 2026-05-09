import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Shield, Trash2, User, LogOut, 
  Check, ChevronRight, AlertCircle, Plus, LayoutDashboard, 
  Users, History, TrendingUp, Wallet, Smartphone, Copy, Info, Search, X, Zap
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, doc, addDoc, setDoc, deleteDoc, onSnapshot, collection 
} from 'firebase/firestore';

// Pastikan konfigurasi ini diisi saat deployment asli
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'jimpitan-digital-v1';

// --- UTILITIES ---
const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
const formatTanggalIndo = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()];
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][date.getMonth()];
  return `${hari}, ${date.getDate()} ${bulan} ${date.getFullYear()}`;
};
const formatJam = (isoString) => isoString ? `${new Date(isoString).getHours().toString().padStart(2, '0')}:${new Date(isoString).getMinutes().toString().padStart(2, '0')} WIB` : "-";

// --- COMPONENTS ---

const Header = ({ title, user, onLogout, role }) => (
  <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex justify-between items-center shadow-lg sticky top-0 z-40">
    <div className="flex items-center gap-3">
      <div className="bg-white/20 p-2 rounded-lg"><Shield size={20} /></div>
      <div>
        <h1 className="font-bold text-sm md:text-base leading-none">{title}</h1>
        <p className="text-[10px] opacity-80 uppercase tracking-wider mt-1">{role}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block"><div className="text-xs font-bold">{user?.nama || 'User'}</div></div>
      <button onClick={onLogout} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all active:scale-95"><LogOut size={18}/></button>
    </div>
  </div>
);

const SafeDeleteButton = ({ onDelete }) => {
  const [asking, setAsking] = useState(false);
  if(asking) return (
    <div className="flex gap-2 items-center bg-red-50 p-1 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-200">
      <button onClick={() => { setAsking(false); onDelete(); }} className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold">Hapus</button>
      <button onClick={() => setAsking(false)} className="text-[10px] bg-gray-200 text-gray-700 px-2 py-1 rounded">Batal</button>
    </div>
  );
  return <button onClick={() => setAsking(true)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>;
};

// --- VIEWS ---

const Login = ({ onLogin, dataWarga, dataPetugas, dataAdmin, showNotif, loading }) => {
  const [tab, setTab] = useState('warga');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [namaWarga, setNamaWarga] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (tab === 'admin') {
      const admin = dataAdmin.find(a => a.username === username && a.password === password);
      if (admin) onLogin('admin', admin); else showNotif('Admin tidak ditemukan!', 'error');
    } else if (tab === 'petugas') {
      const petugas = dataPetugas.find(p => p.username === username && p.password === password);
      if (petugas) onLogin('petugas', petugas); else showNotif('Petugas tidak ditemukan!', 'error');
    } else if (tab === 'warga') {
      const warga = dataWarga.find(w => w.nama.toLowerCase() === namaWarga.trim().toLowerCase());
      if (warga) onLogin('warga', warga); else showNotif('Nama warga tidak terdaftar!', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="bg-emerald-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black">JIMPITAN ONLINE</h1>
          <p className="text-emerald-100 text-xs mt-1 uppercase tracking-widest font-bold">Digital Village Fund</p>
        </div>
        <div className="flex p-2 gap-1 bg-slate-100 m-4 rounded-2xl">
          {['warga', 'petugas', 'admin'].map((t) => (
            <button key={t} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize ${tab === t ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleLogin} className="space-y-4">
            {tab === 'warga' ? (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nama Warga</label>
                <input type="text" value={namaWarga} onChange={e => setNamaWarga(e.target.value)} className="w-full bg-slate-50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Masukkan nama lengkap..." required />
              </div>
            ) : (
              <>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 outline-none" required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 outline-none" required />
              </>
            )}
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-black rounded-2xl py-3.5 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50">
              {loading ? "Menghubungkan..." : "MASUK"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ 
  dataWarga, dataPetugas, dataTransaksi, onLogout, currentUser, showNotif,
  onAddWarga, onDeleteWarga, onAddPetugas, onDeletePetugas, onDeleteTransaksi
}) => {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [newWarga, setNewWarga] = useState({ nama: '', alamat: '' });
  const totalSaldo = dataTransaksi.reduce((acc, curr) => acc + parseInt(curr.nominal), 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header title="Dashboard Admin" user={currentUser} onLogout={onLogout} role="Administrator" />
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Stats' },
            { id: 'warga', icon: Users, label: 'Warga' },
            { id: 'petugas', icon: Shield, label: 'Petugas' },
            { id: 'transaksi', icon: History, label: 'Log' }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeMenu === item.id ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>
              <item.icon size={14} /> {item.label}
            </button>
          ))}
        </div>

        {activeMenu === 'overview' && (
          <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-xl">
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Total Saldo Jimpitan</p>
            <h2 className="text-4xl font-black mt-1">{formatRupiah(totalSaldo)}</h2>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <p className="text-[10px] font-bold opacity-70 uppercase">Warga</p>
                <div className="text-xl font-black">{dataWarga.length}</div>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
                <p className="text-[10px] font-bold opacity-70 uppercase">Petugas</p>
                <div className="text-xl font-black">{dataPetugas.length}</div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'warga' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm mb-4">Registrasi Warga Baru</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input placeholder="Nama Lengkap" value={newWarga.nama} onChange={e => setNewWarga({...newWarga, nama: e.target.value})} className="bg-slate-50 p-3 rounded-xl text-sm" />
                <input placeholder="RT/Alamat" value={newWarga.alamat} onChange={e => setNewWarga({...newWarga, alamat: e.target.value})} className="bg-slate-50 p-3 rounded-xl text-sm" />
                <button onClick={() => { onAddWarga(newWarga); setNewWarga({nama:'', alamat:''}); }} className="sm:col-span-2 bg-emerald-600 text-white font-bold p-3 rounded-xl">Simpan Data</button>
              </div>
            </div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              {dataWarga.map(w => (
                <div key={w.id} className="p-4 flex justify-between items-center border-b border-slate-50 last:border-0">
                  <div><div className="font-bold text-sm text-slate-700">{w.nama}</div><div className="text-[10px] text-slate-400 font-bold uppercase">{w.alamat}</div></div>
                  <SafeDeleteButton onDelete={() => onDeleteWarga(w.id)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeMenu === 'transaksi' && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            {dataTransaksi.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal)).map(t => (
              <div key={t.id} className="p-4 flex justify-between items-center border-b border-slate-50 last:border-0">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Check size={18} /></div>
                  <div><div className="font-bold text-sm text-slate-700">{t.wargaNama}</div><div className="text-[10px] text-slate-400">{formatTanggalIndo(t.tanggal)}</div></div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-600 text-sm">{formatRupiah(t.nominal)}</div>
                  <SafeDeleteButton onDelete={() => onDeleteTransaksi(t.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PetugasDashboard = ({ dataWarga, dataTransaksi, tambahTransaksi, currentUser, onLogout, showNotif }) => {
  const [selectedWarga, setSelectedWarga] = useState(null);
  const [nominal, setNominal] = useState(2000);
  const [search, setSearch] = useState('');
  const filteredWarga = dataWarga.filter(w => w.nama.toLowerCase().includes(search.toLowerCase()));

  const handleSimpan = () => {
    if(!selectedWarga) return;
    tambahTransaksi({ wargaId: selectedWarga.id, wargaNama: selectedWarga.nama, petugasId: currentUser.id, petugasNama: currentUser.nama, nominal });
    setSelectedWarga(null);
    setSearch('');
    showNotif("Data jimpitan tersimpan!", "success");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header title="Petugas Lapangan" user={currentUser} onLogout={onLogout} role="Collector" />
      <div className="p-4 max-w-md mx-auto space-y-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input className="w-full bg-slate-50 rounded-xl py-3 pl-10 pr-4 text-sm" placeholder="Cari nama warga..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="max-h-52 overflow-y-auto space-y-2">
            {filteredWarga.map(w => (
              <button key={w.id} onClick={() => setSelectedWarga(w)} className={`w-full p-3 text-left rounded-xl text-sm font-bold border transition-all ${selectedWarga?.id === w.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 border-slate-50 text-slate-700'}`}>{w.nama}</button>
            ))}
          </div>
          {selectedWarga && (
            <div className="mt-5 pt-5 border-t border-slate-50 space-y-4 animate-in fade-in">
              <div className="grid grid-cols-3 gap-2">
                {[1000, 2000, 5000].map(v => (
                  <button key={v} onClick={() => setNominal(v)} className={`py-3 rounded-xl font-black text-xs ${nominal === v ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{v/1000}K</button>
                ))}
              </div>
              <button onClick={handleSimpan} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-50">
                <CheckCircle size={20} /> SIMPAN JIMPITAN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WargaDashboard = ({ dataTransaksi, currentUser, onLogout }) => {
  const history = dataTransaksi.filter(t => t.wargaId === currentUser.id).sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));
  const total = history.reduce((acc, curr) => acc + parseInt(curr.nominal), 0);
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header title="Info Jimpitan Warga" user={currentUser} onLogout={onLogout} role="Citizen" />
      <div className="p-4 max-w-md mx-auto space-y-6">
        <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl">
           <p className="text-[10px] font-bold uppercase opacity-80">Saldo Anda</p>
           <h2 className="text-4xl font-black mt-1">{formatRupiah(total)}</h2>
           <div className="mt-6 flex items-center gap-2 bg-white/20 p-2 rounded-xl w-fit">
              <CheckCircle size={14} /> <span className="text-xs font-bold">{history.length} Setoran</span>
           </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest px-2">Riwayat Setoran</h4>
          {history.map(t => (
            <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center border border-slate-100">
               <div><div className="font-bold text-sm text-slate-700">{formatTanggalIndo(t.tanggal)}</div><div className="text-[10px] text-slate-400 uppercase font-bold">Oleh: {t.petugasNama}</div></div>
               <div className="font-black text-emerald-600">{formatRupiah(t.nominal)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [appMode, setAppMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [fbUser, setFbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const [dataWarga, setDataWarga] = useState([]);
  const [dataPetugas, setDataPetugas] = useState([]);
  const [dataAdmin, setDataAdmin] = useState([]);
  const [dataTransaksi, setDataTransaksi] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { console.error(e); }
    };
    init();
    const unsub = onAuthStateChanged(auth, setFbUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!fbUser) return;
    const paths = ['warga', 'petugas', 'admin', 'transaksi'];
    const unsubs = paths.map(p => onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', p), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if(p === 'warga') setDataWarga(docs);
      if(p === 'petugas') setDataPetugas(docs);
      if(p === 'admin') setDataAdmin(docs);
      if(p === 'transaksi') setDataTransaksi(docs);
      setLoading(false);
    }));
    return () => unsubs.forEach(u => u());
  }, [fbUser]);

  const showNotif = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const actions = {
    onLogin: (role, user) => { setCurrentUser(user); setAppMode(role); showNotif(`Halo, ${user.nama}`, "success"); },
    onLogout: () => { setCurrentUser(null); setAppMode('login'); },
    addWarga: (d) => addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'warga'), d),
    deleteWarga: (id) => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'warga', id)),
    addPetugas: (d) => addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'petugas'), d),
    deletePetugas: (id) => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'petugas', id)),
    addTransaksi: (d) => addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transaksi'), { ...d, tanggal: new Date().toISOString() }),
    deleteTransaksi: (id) => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transaksi', id)),
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-xs animate-in slide-in-from-top-10">
          <div className={`p-3 rounded-2xl shadow-xl flex items-center gap-2 text-white text-xs font-bold ${notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
             <CheckCircle size={16} /> <p className="flex-1">{notification.message}</p>
          </div>
        </div>
      )}

      {appMode === 'login' && <Login onLogin={actions.onLogin} dataWarga={dataWarga} dataPetugas={dataPetugas} dataAdmin={dataAdmin} showNotif={showNotif} loading={loading} />}
      {appMode === 'admin' && <AdminDashboard dataWarga={dataWarga} onAddWarga={actions.addWarga} onDeleteWarga={actions.deleteWarga} dataPetugas={dataPetugas} onAddPetugas={actions.addPetugas} onDeletePetugas={actions.deletePetugas} dataTransaksi={dataTransaksi} onDeleteTransaksi={actions.deleteTransaksi} currentUser={currentUser} onLogout={actions.onLogout} showNotif={showNotif} />}
      {appMode === 'petugas' && <PetugasDashboard dataWarga={dataWarga} dataTransaksi={dataTransaksi} tambahTransaksi={actions.addTransaksi} currentUser={currentUser} onLogout={actions.onLogout} showNotif={showNotif} />}
      {appMode === 'warga' && <WargaDashboard dataTransaksi={dataTransaksi} currentUser={currentUser} onLogout={actions.onLogout} />}
    </div>
  );
}
