/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

// --- TYPE DEFINITIONS ---
type ViewType = 'session' | 'today' | 'alltime';

interface Player {
  id: string;
  name: string;
  score: number; // Represents the score for the current view
  prevScore: number; // Used for session view animations
  rank: number;
  prevRank: number; // Used for session view animations
  history: { score: number; date: Date }[]; // For all-time and today's records
}

// --- INITIAL MOCK DATA ---
const initialPlayers: Player[] = [
  { id: '1', name: 'Kanta', score: 281, prevScore: 281, rank: 1, prevRank: 1, history: [{ score: 281, date: new Date() }] },
  { id: '2', name: 'Camilla', score: 262, prevScore: 262, rank: 2, prevRank: 2, history: [{ score: 262, date: new Date() }] },
  { id: '3', name: 'Malin', score: 260, prevScore: 260, rank: 3, prevRank: 3, history: [{ score: 260, date: new Date() }] },
  { id: '4', name: 'Erik', score: 251, prevScore: 251, rank: 4, prevRank: 4, history: [{ score: 251, date: new Date() }] },
  { id: '5', name: 'Odd Arvid', score: 248, prevScore: 248, rank: 5, prevRank: 5, history: [{ score: 248, date: new Date() }] },
  { id: '6', name: 'Georg', score: 246, prevScore: 246, rank: 6, prevRank: 6, history: [{ score: 246, date: new Date() }] },
  { id: '7', name: 'Roger', score: 244, prevScore: 244, rank: 7, prevRank: 7, history: [{ score: 244, date: new Date() }] },
  { id: '8', name: 'Leif', score: 243, prevScore: 243, rank: 8, prevRank: 8, history: [{ score: 243, date: new Date() }] },
  { id: '9', name: 'Ole Martin', score: 241, prevScore: 241, rank: 9, prevRank: 9, history: [{ score: 241, date: new Date() }] },
  { id: '10', name: 'Eldri', score: 235, prevScore: 235, rank: 10, prevRank: 10, history: [{ score: 235, date: new Date() }] },
  { id: '11', name: 'Jørgen', score: 230, prevScore: 230, rank: 11, prevRank: 11, history: [{ score: 230, date: new Date() }] },
  { id: '12', name: 'Jonas', score: 221, prevScore: 221, rank: 12, prevRank: 12, history: [{ score: 221, date: new Date() }] },
  { id: '13', name: 'Thomas', score: 220, prevScore: 220, rank: 13, prevRank: 13, history: [{ score: 220, date: new Date() }] },
  { id: '14', name: 'Nils Henrik', score: 217, prevScore: 217, rank: 14, prevRank: 14, history: [{ score: 217, date: new Date() }] },
  { id: '15', name: 'Steinar F', score: 216, prevScore: 216, rank: 15, prevRank: 15, history: [{ score: 216, date: new Date() }] },
  { id: '16', name: 'Sidsel', score: 210, prevScore: 210, rank: 16, prevRank: 16, history: [{ score: 210, date: new Date() }] },
  { id: '17', name: 'Izabela', score: 202, prevScore: 202, rank: 17, prevRank: 17, history: [{ score: 202, date: new Date() }] },
  { id: '18', name: 'Elena', score: 135, prevScore: 135, rank: 18, prevRank: 18, history: [{ score: 135, date: new Date() }] },
];


// --- HELPER COMPONENTS ---
const UpArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const DownArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const PasswordModal = ({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void; }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    passwordInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'king') {
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
      passwordInputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-sm relative animate-fade-in-up" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-slate-700">Admin Access</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-500">Password</label>
            <input
              ref={passwordInputRef}
              type="password"
              id="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md ${error ? 'border-red-500 ring-red-500' : ''}`}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600 -mt-2">{error}</p>}
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminModal = ({ players, onAddScore, onAddPlayer, onDeletePlayer, onResetSession, onClose }: {
  players: Player[];
  onAddScore: (playerId: string, score: number) => void;
  onAddPlayer: (name: string) => void;
  onDeletePlayer: (playerId: string) => void;
  onResetSession: () => void;
  onClose: () => void;
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id || '');
  const [newScore, setNewScore] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [playerToDelete, setPlayerToDelete] = useState(players[0]?.id || '');

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlayer && newScore) {
      onAddScore(selectedPlayer, parseInt(newScore, 10));
      setNewScore('');
    }
  };

  const handlePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerToDelete) {
        alert("Please select a player to delete.");
        return;
    }
    if (window.confirm(`Are you sure you want to delete ${players.find(p=>p.id === playerToDelete)?.name}? This action cannot be undone.`)) {
        onDeletePlayer(playerToDelete);
        const remainingPlayers = players.filter(p => p.id !== playerToDelete);
        setPlayerToDelete(remainingPlayers.length > 0 ? remainingPlayers[0].id : '');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative animate-fade-in-up" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-slate-700">Admin Panel</h2>

        <form onSubmit={handleScoreSubmit} className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-slate-600 border-b pb-2">Log Score</h3>
          <div>
            <label htmlFor="player" className="block text-sm font-medium text-slate-500">Player</label>
            <select id="player" value={selectedPlayer} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPlayer(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-slate-500">New Score</label>
            <input type="number" id="score" value={newScore} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewScore(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" placeholder="e.g., 275" required />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">Update Score</button>
        </form>

        <form onSubmit={handlePlayerSubmit} className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-slate-600 border-b pb-2">Add Player</h3>
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-slate-500">Player Name</label>
            <input type="text" id="playerName" value={newPlayerName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlayerName(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md" placeholder="e.g., Maria" required />
          </div>
          <button type="submit" className="w-full bg-slate-600 text-white py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">Add Player</button>
        </form>

        <form onSubmit={handleDeleteSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-red-600 border-b border-red-200 pb-2">Delete Player</h3>
            <div>
                <label htmlFor="delete-player" className="block text-sm font-medium text-slate-500">Player to Delete</label>
                <select 
                    id="delete-player" 
                    value={playerToDelete} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPlayerToDelete(e.target.value)} 
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                    disabled={players.length === 0}
                >
                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <button 
                type="submit" 
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:bg-red-300"
                disabled={players.length === 0}
            >
                Delete Player
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center">This action is permanent.</p>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-600 mb-4">Session Controls</h3>
          <button
            type="button"
            onClick={onResetSession}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Reset Current Session
          </button>
          <p className="text-xs text-slate-500 mt-2 text-center">This will set all session scores to 0. Historical data will not be affected.</p>
        </div>
      </div>
    </div>
  );
};

// --- LEADERBOARD ROW COMPONENT ---
const LeaderboardRow: React.FC<{ player: Player; view: ViewType }> = ({ player, view }) => {
  const scoreDelta = player.score - player.prevScore;
  const rankDelta = player.prevRank - player.rank;

  const rankEmoji = { 1: '🥇', 2: '🥈', 3: '🥉' }[player.rank] || '';
  const rankBgClass = { 1: 'bg-green-50', 2: 'bg-sky-50', 3: 'bg-yellow-50' }[player.rank] || 'bg-white';
  const rankFontClass = player.rank === 1 ? 'font-bold' : 'font-medium';

  let highlightClass = '';
  // Only highlight score changes in the session view for better UX
  if (view === 'session' && player.prevScore !== player.score && player.prevRank !== 0) {
    if (scoreDelta > 0) highlightClass = 'highlight-green';
    if (scoreDelta < 0) highlightClass = 'highlight-red';
  }

  return (
    <div className={`flex items-center p-4 transition-colors duration-500 ${rankBgClass} ${highlightClass}`}>
      <div className="w-12 text-center text-xl font-bold text-slate-500">{player.rank}</div>
      <div className={`flex-grow text-lg text-slate-800 ${rankFontClass}`}>
        <span className="mr-2 min-w-[24px] inline-block text-center">{rankEmoji}</span>
        {player.name}
      </div>
      <div className="w-24 text-right text-lg font-semibold text-slate-700">{player.score.toLocaleString()}</div>
      
      <div className="w-24 text-right">
        {view === 'session' && scoreDelta !== 0 && player.prevRank > 0 ? (
          <p className={`font-semibold ${scoreDelta > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {scoreDelta > 0 ? '+' : ''}{scoreDelta.toLocaleString()}
          </p>
        ) : (
          view === 'session' && player.prevRank > 0 && <p className="text-slate-400">---</p>
        )}
      </div>
      <div className="w-16 text-right">
        {view === 'session' && rankDelta !== 0 && player.prevRank > 0 ? (
          <p className={`flex items-center justify-end font-semibold ${rankDelta > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {rankDelta > 0 ? <UpArrow /> : <DownArrow />} {Math.abs(rankDelta)}
          </p>
        ) : (
          view === 'session' && player.prevRank > 0 && <p className="text-slate-400 font-medium">---</p>
        )}
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---
function App() {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('today');

  const handlePasswordSuccess = () => {
    setIsPasswordPromptOpen(false);
    setIsAdminOpen(true);
  };

  const handleAddScore = useCallback((playerId: string, newScore: number) => {
    setPlayers(currentPlayers => {
      const playerToUpdate = currentPlayers.find(p => p.id === playerId);
      if (!playerToUpdate) return currentPlayers;
  
      const oldSessionRanks = new Map(
        [...currentPlayers]
          .sort((a, b) => b.score - a.score)
          .map((p, i) => [p.id, i + 1])
      );
  
      const updatedPlayers = currentPlayers.map(p =>
        p.id === playerId
          ? {
              ...p,
              prevScore: p.score, 
              score: newScore,     
              history: [...p.history, { score: newScore, date: new Date() }],
            }
          : p
      );
  
      updatedPlayers.sort((a, b) => b.score - a.score);
  
      return updatedPlayers.map((p, index) => ({
        ...p,
        rank: index + 1,
        prevRank: oldSessionRanks.get(p.id) || index + 1,
      }));
    });
  }, []);

  const handleAddPlayer = useCallback((name: string) => {
    setPlayers(currentPlayers => {
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name,
        score: 0,
        prevScore: 0,
        rank: 0,
        prevRank: 0,
        history: [],
      };

      const newList = [...currentPlayers, newPlayer];
      newList.sort((a, b) => b.score - a.score);

      return newList.map((p, index) => ({
        ...p,
        rank: index + 1,
        prevRank: p.prevRank || index + 1,
      }));
    });
    setIsAdminOpen(false);
  }, []);

  const handleDeletePlayer = useCallback((playerId: string) => {
    setPlayers(currentPlayers => {
        const updatedList = currentPlayers.filter(p => p.id !== playerId);
        updatedList.sort((a, b) => b.score - a.score);
        return updatedList.map((p, index) => ({
            ...p,
            rank: index + 1,
            // prevRank will be recalculated on next score update
        }));
    });
  }, []);

  const handleResetSession = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the current session? This will set all scores to zero.')) {
        setPlayers(currentPlayers => {
            const updatedPlayers = currentPlayers.map(p => ({
                ...p,
                score: 0,
                prevScore: 0,
                rank: 0,     
                prevRank: 0, 
            }));
            
            updatedPlayers.sort((a, b) => b.score - a.score);
            return updatedPlayers.map((p, index) => ({
                ...p,
                rank: index + 1,
                prevRank: index + 1
            }));
        });
        setIsAdminOpen(false);
    }
  }, []);

  const displayedPlayers = useMemo(() => {
    let processedPlayers;

    switch (activeView) {
      case 'today':
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        processedPlayers = players
          .map(p => {
            const todayScores = p.history.filter(h => h.date >= todayStart).map(h => h.score);
            const bestToday = todayScores.length > 0 ? Math.max(...todayScores) : 0;
            return { ...p, score: bestToday, prevScore: 0, prevRank: 0 };
          })
          .filter(p => p.score > 0);
        break;

      case 'alltime':
        processedPlayers = players
          .map(p => {
            const allScores = p.history.map(h => h.score);
            const bestAllTime = allScores.length > 0 ? Math.max(...allScores) : 0;
            return { ...p, score: bestAllTime, prevScore: 0, prevRank: 0 };
          })
          .filter(p => p.history.length > 0);
        break;

      case 'session':
      default:
        processedPlayers = [...players];
        processedPlayers.sort((a, b) => b.score - a.score);
        return processedPlayers.map((p, index) => ({
          ...p,
          rank: index + 1, 
        }));
    }

    processedPlayers.sort((a, b) => b.score - a.score);
    return processedPlayers.map((p, index) => ({
      ...p,
      rank: index + 1,
    }));
  }, [players, activeView]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-yellow-400 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z"></path>
          </svg>
          <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight mt-2">Click King</h1>
          <p className="mt-2 text-lg text-slate-500">Live Leaderboard</p>
        </header>

        <div className="mb-6">
          <div className="border-b border-slate-300">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
               <button onClick={() => setActiveView('today')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeView === 'today' ? 'text-indigo-600 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'}`} aria-current={activeView === 'today' ? 'page' : undefined}>
                Today's Records
              </button>
              <button onClick={() => setActiveView('session')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeView === 'session' ? 'text-indigo-600 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'}`} aria-current={activeView === 'session' ? 'page' : undefined}>
                Current Session
              </button>
              <button onClick={() => setActiveView('alltime')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeView === 'alltime' ? 'text-indigo-600 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'}`} aria-current={activeView === 'alltime' ? 'page' : undefined}>
                All-Time
              </button>
            </nav>
          </div>
        </div>

        <main>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center text-sm font-semibold text-slate-500 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="w-12 text-center">Rank</div>
              <div className="flex-grow">Player</div>
              <div className="w-24 text-right">Score</div>
              <div className={`w-24 text-right ${activeView !== 'session' ? 'invisible' : ''}`}>Δ Clicks</div>
              <div className={`w-16 text-right ${activeView !== 'session' ? 'invisible' : ''}`}>Δ Pos</div>
            </div>

            <div className="divide-y divide-slate-100">
              {displayedPlayers.map(player => <LeaderboardRow key={player.id} player={player} view={activeView} />)}
            </div>
          </div>
        </main>

        <footer className="mt-8 text-center">
          <button
            onClick={() => setIsPasswordPromptOpen(true)}
            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-indigo-500 shadow-lg transition-transform hover:scale-105"
            aria-haspopup="dialog"
          >
            Admin Panel
          </button>
        </footer>
      </div>
      
      {isPasswordPromptOpen && <PasswordModal onSuccess={handlePasswordSuccess} onClose={() => setIsPasswordPromptOpen(false)} />}
      {isAdminOpen && <AdminModal players={players} onAddScore={handleAddScore} onAddPlayer={handleAddPlayer} onDeletePlayer={handleDeletePlayer} onResetSession={handleResetSession} onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);