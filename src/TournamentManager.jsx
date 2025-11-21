import React, { useState } from 'react';
import { Shuffle, Trophy, Users } from 'lucide-react';

export default function TournamentManager() {
  const [view, setView] = useState('config'); // 'config' -> 'setup' -> 'draw' -> 'bracket'
  const [teamCount, setTeamCount] = useState(8); // 4 o 8 squadre
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState({ A: [], B: [] });
  const [matches, setMatches] = useState([]);
  const [bracket, setBracket] = useState(null);

  const initTeams = (count) => {
    setTeamCount(count);
    setTeams(Array(count).fill('').map(() => ({ name: '', players: ['', ''] })));
    setView('setup');
  };

  const handleTeamChange = (index, field, value, playerIndex = null) => {
    const newTeams = [...teams];
    if (playerIndex !== null) {
      newTeams[index].players[playerIndex] = value;
    } else {
      newTeams[index][field] = value;
    }
    setTeams(newTeams);
  };

  const shuffleTeams = () => {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);

    if (teamCount === 4) {
      // 4 squadre: 1 solo girone
      const groupA = shuffled;
      setGroups({ A: groupA, B: [] });

      const matchesA = [
        { id: 1, group: 'A', team1: groupA[0], team2: groupA[1], winner: null },
        { id: 2, group: 'A', team1: groupA[2], team2: groupA[3], winner: null }
      ];

      setMatches(matchesA);
    } else {
      // 8 squadre: 2 gironi
      const groupA = shuffled.slice(0, 4);
      const groupB = shuffled.slice(4, 8);

      setGroups({ A: groupA, B: groupB });

      const matchesA = [
        { id: 1, group: 'A', team1: groupA[0], team2: groupA[1], winner: null },
        { id: 2, group: 'A', team1: groupA[2], team2: groupA[3], winner: null }
      ];

      const matchesB = [
        { id: 3, group: 'B', team1: groupB[0], team2: groupB[1], winner: null },
        { id: 4, group: 'B', team1: groupB[2], team2: groupB[3], winner: null }
      ];

      setMatches([...matchesA, ...matchesB]);
    }

    setBracket({
      semifinals: [
        { id: 'sf1', team1: null, team2: null, winner: null, loser: null },
        { id: 'sf2', team1: null, team2: null, winner: null, loser: null }
      ],
      final: { id: 'f', team1: null, team2: null, winner: null },
      thirdPlace: { id: 'tp', team1: null, team2: null, winner: null }
    });

    setView('draw');
  };

  const goToBracket = () => {
    setView('bracket');
  };

  const selectWinner = (matchId, team) => {
    const newMatches = matches.map(m =>
      m.id === matchId ? { ...m, winner: team } : m
    );
    setMatches(newMatches);

    const groupAWinners = newMatches.filter(m => m.group === 'A' && m.winner).map(m => m.winner);
    const groupBWinners = newMatches.filter(m => m.group === 'B' && m.winner).map(m => m.winner);

    if (teamCount === 4) {
      // 4 squadre: i 2 vincitori del girone vanno direttamente in semifinale
      if (groupAWinners.length === 2) {
        const newBracket = { ...bracket };
        newBracket.semifinals[0].team1 = groupAWinners[0];
        newBracket.semifinals[0].team2 = groupAWinners[1];

        // Imposta subito i perdenti del girone per la finale 3°-4° posto
        const groupALosers = newMatches.filter(m => m.group === 'A').map(m => {
          return m.winner === m.team1 ? m.team2 : m.team1;
        });
        newBracket.thirdPlace.team1 = groupALosers[0];
        newBracket.thirdPlace.team2 = groupALosers[1];

        setBracket(newBracket);
      }
    } else {
      // 8 squadre: logica esistente
      if (groupAWinners.length === 2 && groupBWinners.length === 2) {
        const newBracket = { ...bracket };
        newBracket.semifinals[0].team1 = groupAWinners[0];
        newBracket.semifinals[0].team2 = groupBWinners[1];
        newBracket.semifinals[1].team1 = groupBWinners[0];
        newBracket.semifinals[1].team2 = groupAWinners[1];
        setBracket(newBracket);
      }
    }
  };

  const selectSemifinalWinner = (sfId, team) => {
    const newBracket = { ...bracket };
    const sfIndex = sfId === 'sf1' ? 0 : 1;
    const sf = newBracket.semifinals[sfIndex];
    
    sf.winner = team;
    sf.loser = team === sf.team1 ? sf.team2 : sf.team1;
    
    if (sfIndex === 0) {
      newBracket.final.team1 = team;
    } else {
      newBracket.final.team2 = team;
    }
    
    // Aggiorna la finale per il 3° posto
    if (newBracket.semifinals[0].loser && newBracket.semifinals[1].loser) {
      newBracket.thirdPlace.team1 = newBracket.semifinals[0].loser;
      newBracket.thirdPlace.team2 = newBracket.semifinals[1].loser;
    }
    
    setBracket(newBracket);
  };

  const selectFinalWinner = (team) => {
    const newBracket = { ...bracket };
    newBracket.final.winner = team;
    newBracket.final.loser = team == newBracket.final.team1 ? newBracket.final.team2 : newBracket.final.team1;
    setBracket(newBracket);
  };

  // Per 4 squadre: seleziona vincitore dalla "semifinale" che è in realtà la finale
  const selectFinalWinner4Teams = (team) => {
    const newBracket = { ...bracket };
    const sf = newBracket.semifinals[0];
    newBracket.final.winner = team;
    newBracket.final.loser = team === sf.team1 ? sf.team2 : sf.team1;
    setBracket(newBracket);
  };

  const selectThirdPlaceWinner = (team) => {
    const newBracket = { ...bracket };
    newBracket.thirdPlace.winner = team;
    //newBracket.thirdPlace.loser = team == newBracket.thirdPlace.team1 ? newBracket.thirdPlace.team2 : newBracket.thirdPlace.team1;
    setBracket(newBracket);
  };

  const TeamCard = ({ team, onClick, isWinner, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{backgroundColor: isWinner ? '#16a34a80' : disabled ? '#1b353e80' : '#1b353e'}}
      className={`p-3 rounded-lg border-2 transition-all text-left w-full ${
        isWinner 
          ? 'border-green-400 shadow-md shadow-green-500/50' 
          : disabled
          ? 'border-slate-600 cursor-not-allowed'
          : 'border-slate-500 hover:border-blue-400 hover:shadow hover:shadow-blue-500/50 cursor-pointer'
      }`}
    >
      <div className="font-bold text-sm text-white">{team.name}</div>
      <div className="text-xs text-blue-200">{team.players.join(', ')}</div>
    </button>
  );

  if (view === 'config') {
    return (
      <div className="min-h-screen p-8 relative" style={{backgroundColor: '#1b353e'}}>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-48 bg-contain bg-center bg-no-repeat" style={{backgroundImage: 'url(https://www.dibix.it/wp-content/uploads/2022/09/logo-dibix.png)'}}></div>
          </div>
          <div className="rounded-xl shadow-2xl p-8 border border-slate-700" style={{backgroundColor: '#ffffff14'}}>
            <div style={{marginTop: '100px'}} className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <img src="https://www.dibix.it/wp-content/uploads/2025/10/sfondo_champion.png" alt="Champions League" className="max-w-2xl" />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Configura Torneo</h1>
            </div>

            <p className="text-blue-200 mb-6">Seleziona il numero di squadre partecipanti:</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => initTeams(4)}
                className="p-6 rounded-lg border-2 border-slate-500 hover:border-blue-400 hover:shadow hover:shadow-blue-500/50 transition-all"
                style={{backgroundColor: '#1b353e'}}
              >
                <div className="text-4xl font-bold text-white mb-2">4</div>
                <div className="text-blue-300">Squadre</div>
                <div className="text-sm text-slate-400 mt-2">1 Girone</div>
              </button>

              <button
                onClick={() => initTeams(8)}
                className="p-6 rounded-lg border-2 border-slate-500 hover:border-blue-400 hover:shadow hover:shadow-blue-500/50 transition-all"
                style={{backgroundColor: '#1b353e'}}
              >
                <div className="text-4xl font-bold text-white mb-2">8</div>
                <div className="text-blue-300">Squadre</div>
                <div className="text-sm text-slate-400 mt-2">2 Gironi</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'setup') {
    return (
      <div className="min-h-screen p-8 relative" style={{backgroundColor: '#1b353e'}}>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-48 bg-contain bg-center bg-no-repeat" style={{backgroundImage: 'url(https://www.dibix.it/wp-content/uploads/2022/09/logo-dibix.png)'}}></div>
          </div>
          <div className="rounded-xl shadow-2xl p-8 border border-slate-700" style={{backgroundColor: '#ffffff14'}}>
            {/* <div style={{backgroundColor: 'white'}} className="absolute inset-0 opacity-30">
              <img src="https://www.dibix.it/wp-content/uploads/2025/10/sfondo_dibix.png" alt="Background" className="w-full h-full object-cover" />
            </div> */}
            <div style={{marginTop: '100px'}} className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <img src="https://www.dibix.it/wp-content/uploads/2025/10/sfondo_champion.png" alt="Champions League" className="max-w-2xl" />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Inserisci le Squadre</h1>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {teams.map((team, index) => (
                <div key={index} className="rounded-lg p-4 border-2 border-slate-600" style={{backgroundColor: '#1b353e'}}>
                  <label className="block text-sm font-semibold text-blue-300 mb-2">
                    Squadra {index + 1}
                  </label>
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                    placeholder="Nome squadra"
                    className="w-full p-2 border border-slate-600 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400" style={{backgroundColor: '#1b353e'}}
                  />
                  <input
                    type="text"
                    value={team.players[0]}
                    onChange={(e) => handleTeamChange(index, 'players', e.target.value, 0)}
                    placeholder="Giocatore 1"
                    className="w-full p-2 border border-slate-600 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400" style={{backgroundColor: '#1b353e'}}
                  />
                  <input
                    type="text"
                    value={team.players[1]}
                    onChange={(e) => handleTeamChange(index, 'players', e.target.value, 1)}
                    placeholder="Giocatore 2"
                    className="w-full p-2 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400" style={{backgroundColor: '#1b353e'}}
                  />
                </div>
              ))}
            </div>
            
            <button
              onClick={shuffleTeams}
              disabled={teams.some(t => !t.name || t.players.some(p => !p))}
              className="mt-8 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              <Shuffle className="w-5 h-5" />
              Sorteggia Gironi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'draw') {
    return (
      <div className="min-h-screen p-8 relative" style={{backgroundColor: '#1b353e'}}>
        {/* <div className="absolute inset-0 opacity-30">
          <img src="https://www.dibix.it/wp-content/uploads/2025/10/sfondo_dibix.png" alt="Background" className="w-full h-full object-cover" />
        </div> */}
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-48 bg-contain bg-center bg-no-repeat" style={{backgroundImage: 'url(https://www.dibix.it/wp-content/uploads/2022/09/logo-dibix.png)'}}></div>
          </div>
          <div className="rounded-xl shadow-2xl p-8 border border-slate-700" style={{backgroundColor: '#ffffff14'}}>
            {/* <div style={{backgroundColor: 'white'}} className="absolute inset-0 opacity-30">
              <img src="https://www.dibix.it/wp-content/uploads/2025/10/sfondo_dibix.png" alt="Background" className="w-full h-full object-cover" />
            </div> */}
            <div style={{marginTop: '100px'}} className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <img src="https://www.dibix.it/wp-content/uploads/2025/10/sfondo_champion.png" alt="Champions League" className="max-w-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-8 text-center">
              {teamCount === 4 ? 'Sorteggio Girone' : 'Sorteggio Gironi'}
            </h1>

            <div className={`grid ${teamCount === 8 ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-lg mx-auto'} gap-8 mb-8 relative z-10`}>
              <div>
                <h2 className="text-2xl font-bold text-blue-400 mb-4 text-center">
                  {teamCount === 4 ? 'Girone Unico' : 'Girone A'}
                </h2>
                <div className="space-y-4">
                  {matches.filter(m => m.group === 'A').map(match => (
                    <div key={match.id} className="rounded-lg p-4 border-2 border-slate-600" style={{backgroundColor: '#1b353e'}}>
                      <div className="text-center text-sm font-semibold text-blue-300 mb-3">
                        Partita {match.id}
                      </div>
                      <div className="space-y-2">
                        <TeamCard
                          team={match.team1}
                          onClick={() => selectWinner(match.id, match.team1)}
                          isWinner={match.winner === match.team1}
                        />
                        <div className="text-center text-gray-400 text-sm font-bold">VS</div>
                        <TeamCard
                          team={match.team2}
                          onClick={() => selectWinner(match.id, match.team2)}
                          isWinner={match.winner === match.team2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {teamCount === 8 && (
                <div>
                  <h2 className="text-2xl font-bold text-blue-400 mb-4 text-center">Girone B</h2>
                  <div className="space-y-4">
                    {matches.filter(m => m.group === 'B').map(match => (
                      <div key={match.id} className="bg-slate-700/50 rounded-lg p-4 border-2 border-slate-600">
                        <div className="text-center text-sm font-semibold text-blue-300 mb-3">
                          Partita {match.id}
                        </div>
                        <div className="space-y-2">
                          <TeamCard
                            team={match.team1}
                            onClick={() => selectWinner(match.id, match.team1)}
                            isWinner={match.winner === match.team1}
                          />
                          <div className="text-center text-gray-400 text-sm font-bold">VS</div>
                          <TeamCard
                            team={match.team2}
                            onClick={() => selectWinner(match.id, match.team2)}
                            isWinner={match.winner === match.team2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={goToBracket}
              disabled={matches.some(m => !m.winner)}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              <Trophy className="w-5 h-5" />
              Vai al Tabellone Finale
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 relative" style={{backgroundColor: '#1b353e'}}>
      {/* <div className="absolute inset-0 opacity-30 pointer-events-none">
        <img src="https://www.dibix.it/wp-content/uploads/2025/10/sfondo_dibix.png" alt="Background Dibix" className="w-full h-full object-cover" />
      </div> */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-48 bg-contain bg-center bg-no-repeat" style={{backgroundImage: 'url(https://www.dibix.it/wp-content/uploads/2022/09/logo-dibix.png)'}}></div>
        </div>
        <div className="rounded-xl shadow-2xl p-8 border border-slate-700 relative overflow-hidden" style={{backgroundColor: '#ffffff14'}}>
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <img src="https://www.dibix.it/wp-content/uploads/2025/10/sfondo_champion.png" alt="Champions League" className="max-w-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-8 text-center relative z-10">Tabellone Finale</h1>

          {teamCount === 4 ? (
            // Layout per 4 squadre: solo finale diretta (i vincitori del girone)
            <div className="max-w-lg mx-auto relative z-10 space-y-8">
              <div className="w-full">
                <div className="bg-yellow-600/30 border-4 border-yellow-500 rounded-lg p-6 backdrop-blur-sm">
                  {bracket.final.winner ? (
                    <div className="final-box">
                      <div className="text-center">
                        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                        <div className="text-xl font-bold text-white">{bracket.final.winner.name}</div>
                        <div className="text-sm text-blue-200">{bracket.final.winner.players.join(', ')}</div>
                        <div className="mt-3 text-yellow-400 font-bold text-lg">💪🎊  🥇 1° POSTO   🎊💪</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-blue-300 mb-2 text-center">FINALE 1° - 2° POSTO</div>
                      {bracket.semifinals[0].team1 && (
                        <TeamCard
                          team={bracket.semifinals[0].team1}
                          onClick={() => selectFinalWinner4Teams(bracket.semifinals[0].team1)}
                          isWinner={false}
                        />
                      )}
                      {bracket.semifinals[0].team1 && bracket.semifinals[0].team2 && (
                        <div className="text-center text-gray-400 text-xs font-bold">VS</div>
                      )}
                      {bracket.semifinals[0].team2 && (
                        <TeamCard
                          team={bracket.semifinals[0].team2}
                          onClick={() => selectFinalWinner4Teams(bracket.semifinals[0].team2)}
                          isWinner={false}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {bracket.final.loser && (
                <div className="w-full">
                  <div className="bg-silver-600/30 border-4 border-silver-500 rounded-lg p-6 backdrop-blur-sm">
                    <div className="final-box">
                      <div className="text-center">
                        <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
                        <div className="text-xl font-bold text-white">{bracket.final.loser.name}</div>
                        <div className="text-sm text-blue-200">{bracket.final.loser.players.join(', ')}</div>
                        <div className="mt-3 text-white font-bold text-lg">🥈 2° POSTO</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Finale 3°-4° posto per 4 squadre - visibile subito */}
              {bracket.thirdPlace.team1 && bracket.thirdPlace.team2 && (
                <div className="w-full">
                  <div className="bg-orange-600/30 border-4 border-orange-500 rounded-lg p-6 backdrop-blur-sm">
                    {bracket.thirdPlace.winner ? (
                      <div className="text-center">
                        <Trophy className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                        <div className="text-lg font-bold text-white">{bracket.thirdPlace.winner.name}</div>
                        <div className="text-xs text-blue-200">{bracket.thirdPlace.winner.players.join(', ')}</div>
                        <div className="mt-2 text-orange-400 font-bold">🥉 3° POSTO</div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-blue-300 mb-2 text-center">FINALE 3° - 4° POSTO</div>
                        {bracket.thirdPlace.team1 && (
                          <TeamCard
                            team={bracket.thirdPlace.team1}
                            onClick={() => selectThirdPlaceWinner(bracket.thirdPlace.team1)}
                            isWinner={false}
                            disabled={!bracket.thirdPlace.team2}
                          />
                        )}
                        {bracket.thirdPlace.team1 && bracket.thirdPlace.team2 && (
                          <div className="text-center text-gray-400 text-xs font-bold">VS</div>
                        )}
                        {bracket.thirdPlace.team2 && (
                          <TeamCard
                            team={bracket.thirdPlace.team2}
                            onClick={() => selectThirdPlaceWinner(bracket.thirdPlace.team2)}
                            isWinner={false}
                            disabled={!bracket.thirdPlace.team1}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Layout per 8 squadre: semifinali + finale + 3° posto
            <div className="flex items-center justify-between gap-8 relative z-10">
              <div className="flex-1 space-y-32">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-blue-300 mb-2">SEMIFINALE 1</div>
                  {bracket.semifinals[0].team1 && (
                    <TeamCard
                      team={bracket.semifinals[0].team1}
                      onClick={() => selectSemifinalWinner('sf1', bracket.semifinals[0].team1)}
                      isWinner={bracket.semifinals[0].winner === bracket.semifinals[0].team1}
                    />
                  )}
                  <div className="text-center text-gray-400 text-xs font-bold">VS</div>
                  {bracket.semifinals[0].team2 && (
                    <TeamCard
                      team={bracket.semifinals[0].team2}
                      onClick={() => selectSemifinalWinner('sf1', bracket.semifinals[0].team2)}
                      isWinner={bracket.semifinals[0].winner === bracket.semifinals[0].team2}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-blue-300 mb-2">SEMIFINALE 2</div>
                  {bracket.semifinals[1].team1 && (
                    <TeamCard
                      team={bracket.semifinals[1].team1}
                      onClick={() => selectSemifinalWinner('sf2', bracket.semifinals[1].team1)}
                      isWinner={bracket.semifinals[1].winner === bracket.semifinals[1].team1}
                    />
                  )}
                  <div className="text-center text-gray-400 text-xs font-bold">VS</div>
                  {bracket.semifinals[1].team2 && (
                    <TeamCard
                      team={bracket.semifinals[1].team2}
                      onClick={() => selectSemifinalWinner('sf2', bracket.semifinals[1].team2)}
                      isWinner={bracket.semifinals[1].winner === bracket.semifinals[1].team2}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-24 border-t-2 border-slate-500"></div>
              </div>

              <div className="flex-1 space-y-12">
                <div className="w-full">
                  <div className="bg-yellow-600/30 border-4 border-yellow-500 rounded-lg p-6 backdrop-blur-sm">
                    {bracket.final.winner ? (
                      <div className="final-box">
                        <div className="text-center">
                          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                          <div className="text-xl font-bold text-white">{bracket.final.winner.name}</div>
                          <div className="text-sm text-blue-200">{bracket.final.winner.players.join(', ')}</div>
                          <div className="mt-3 text-yellow-400 font-bold text-lg">💪🎊  🥇 1° POSTO   🎊💪</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-blue-300 mb-2 text-center">FINALE 1° - 2° POSTO</div>
                        {bracket.final.team1 && (
                          <TeamCard
                            team={bracket.final.team1}
                            onClick={() => selectFinalWinner(bracket.final.team1)}
                            isWinner={false}
                            disabled={!bracket.final.team2}
                          />
                        )}
                        {bracket.final.team1 && bracket.final.team2 && (
                          <div className="text-center text-gray-400 text-xs font-bold">VS</div>
                        )}
                        {bracket.final.team2 && (
                          <TeamCard
                            team={bracket.final.team2}
                            onClick={() => selectFinalWinner(bracket.final.team2)}
                            isWinner={false}
                            disabled={!bracket.final.team1}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {bracket.final.loser ? (
                  <div className="w-full">
                    <div className="bg-silver-600/30 border-4 border-silver-500 rounded-lg p-6 backdrop-blur-sm">
                      <div className="final-box">
                        <div className="text-center">
                          <Trophy className="w-12 h-12 text-white mx-auto mb-3" />
                          <div className="text-xl font-bold text-white">{bracket.final.loser.name}</div>
                          <div className="text-sm text-blue-200">{bracket.final.loser.players.join(', ')}</div>
                          <div className="mt-3 text-white font-bold text-lg">🥈 2° POSTO</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span></span>
                )}

                <div className="w-full">
                  <div className="bg-orange-600/30 border-4 border-orange-500 rounded-lg p-6 backdrop-blur-sm">
                    {bracket.thirdPlace.winner ? (
                      <div className="text-center">
                        <Trophy className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                        <div className="text-lg font-bold text-white">{bracket.thirdPlace.winner.name}</div>
                        <div className="text-xs text-blue-200">{bracket.thirdPlace.winner.players.join(', ')}</div>
                        <div className="mt-2 text-orange-400 font-bold">🥉 3° POSTO</div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-blue-300 mb-2 text-center">FINALE 3° - 4° POSTO</div>
                        <div className="space-y-2">
                          {bracket.thirdPlace.team1 && (
                            <TeamCard
                              team={bracket.thirdPlace.team1}
                              onClick={() => selectThirdPlaceWinner(bracket.thirdPlace.team1)}
                              isWinner={false}
                              disabled={!bracket.thirdPlace.team2}
                            />
                          )}
                          {bracket.thirdPlace.team1 && bracket.thirdPlace.team2 && (
                            <div className="text-center text-gray-400 text-xs font-bold">VS</div>
                          )}
                          {bracket.thirdPlace.team2 && (
                            <TeamCard
                              team={bracket.thirdPlace.team2}
                              onClick={() => selectThirdPlaceWinner(bracket.thirdPlace.team2)}
                              isWinner={false}
                              disabled={!bracket.thirdPlace.team1}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}