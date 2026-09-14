import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Board,
  generateSudoku,
  solveSudoku,
  findHint,
  findErrors,
  findDeterminableCells,
  isBoardComplete,
} from './utils/sudokuGenerator';
import {
  Language,
  ThemeType,
  languages,
  themes,
  themeSymbols,
  translations,
} from './utils/translations';

function App() {
  const [lang, setLang] = useState<Language>('ru');
  const [theme, setTheme] = useState<ThemeType>('numbers');
  const [difficulty, setDifficulty] = useState<number>(3);
  const [puzzle, setPuzzle] = useState<Board>([]);
  const [currentBoard, setCurrentBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [hintCell, setHintCell] = useState<{ row: number; col: number; value: number } | null>(null);
  const [showHintValue, setShowHintValue] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [showErrors, setShowErrors] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'warning' | 'info'>('info');
  const [determinableCells, setDeterminableCells] = useState<{ row: number; col: number; value: number }[]>([]);
  const [showDeterminable, setShowDeterminable] = useState(false);
  const [animatingCell, setAnimatingCell] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastClickedCell = useRef<string | null>(null);

  const t = translations[lang];

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showMessage = (msg: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  // Generate new game
  const startNewGame = useCallback(() => {
    setIsGenerating(true);
    setMessage('');
    setShowErrors(false);
    setErrors(new Set());
    setHintCell(null);
    setShowHintValue(false);
    setSelectedCell(null);
    lastClickedCell.current = null;
    setIsComplete(false);
    setMoves(0);
    setTime(0);
    setTimerActive(false);
    setShowDeterminable(false);

    setTimeout(() => {
      const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(difficulty);
      setPuzzle(newPuzzle);
      setCurrentBoard(newPuzzle.map(row => [...row]));
      setSolution(newSolution);
      setIsGenerating(false);
      setTimerActive(true);
    }, 50);
  }, [difficulty]);

  // Initial game
  useEffect(() => {
    startNewGame();
  }, []);

  // Get symbol for a number based on theme
  const getSymbol = (num: number | null): string => {
    if (num === null) return '';
    return themeSymbols[theme][num - 1];
  };

  // Handle cell click - select cell or cycle value if already selected
  const handleCellClick = (row: number, col: number) => {
    if (puzzle[row]?.[col] !== null && puzzle[row]?.[col] !== undefined) {
      // Original cell - just select it to show highlighting
      setSelectedCell([row, col]);
      lastClickedCell.current = `${row}-${col}`;
      return;
    }
    if (isComplete) return;

    setHintCell(null);
    setShowHintValue(false);
    setShowDeterminable(false);

    const cellKey = `${row}-${col}`;
    const wasAlreadySelected = lastClickedCell.current === cellKey;

    if (wasAlreadySelected) {
      // Cycle value
      const current = currentBoard[row][col];
      let next: number | null;
      if (current === null) {
        next = 1;
      } else if (current === 9) {
        next = null;
      } else {
        next = current + 1;
      }

      const newBoard = currentBoard.map(r => [...r]);
      newBoard[row][col] = next;
      setCurrentBoard(newBoard);
      setMoves(prev => prev + 1);
      setShowErrors(false);
      setAnimatingCell(cellKey);
      setTimeout(() => setAnimatingCell(null), 200);

      if (next !== null && isBoardComplete(newBoard)) {
        setIsComplete(true);
        setTimerActive(false);
        showMessage(t.congratulations, 'success');
      }
    } else {
      // Just select the cell
      setSelectedCell([row, col]);
      lastClickedCell.current = cellKey;
    }
  };

  // Set specific value
  const setValue = (row: number, col: number, num: number | null) => {
    if (puzzle[row]?.[col] !== null && puzzle[row]?.[col] !== undefined) return;
    
    const newBoard = currentBoard.map(r => [...r]);
    newBoard[row][col] = num;
    setCurrentBoard(newBoard);
    setMoves(prev => prev + 1);
    setShowErrors(false);
    setAnimatingCell(`${row}-${col}`);
    setTimeout(() => setAnimatingCell(null), 200);

    if (num !== null && isBoardComplete(newBoard)) {
      setIsComplete(true);
      setTimerActive(false);
      showMessage(t.congratulations, 'success');
    }
  };

  // Auto-solve with step-by-step animation
  const handleAutoSolve = () => {
    if (solution.length === 0) return;

    // Use the pre-computed solution
    const solved = solution.map(row => [...row]);
    
    // Find cells that need to be filled
    const cellsToFill: [number, number][] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (currentBoard[row][col] === null || currentBoard[row][col] !== solved[row][col]) {
          cellsToFill.push([row, col]);
        }
      }
    }

    // Animate filling cells one by one
    let index = 0;
    const board = currentBoard.map(r => [...r]);

    const animateStep = () => {
      if (index < cellsToFill.length) {
        const [row, col] = cellsToFill[index];
        board[row][col] = solved[row][col];
        setCurrentBoard(board.map(r => [...r]));
        setAnimatingCell(`${row}-${col}`);
        index++;
        setTimeout(animateStep, 50); // 50ms delay between each cell
      } else {
        // All cells filled - show victory after a delay
        setTimeout(() => setAnimatingCell(null), 200);
        setTimeout(() => {
          setIsComplete(true);
          setTimerActive(false);
          showMessage(t.congratulations, 'success');
        }, 500); // Wait 500ms before showing victory screen
      }
    };

    animateStep();
  };

  // Show hint
  const handleHint = () => {
    const hint = findHint(currentBoard, solution);
    if (hint) {
      setHintCell(hint);
      setShowHintValue(false);
      setSelectedCell([hint.row, hint.col]);
      lastClickedCell.current = `${hint.row}-${hint.col}`;

      const determinable = findDeterminableCells(currentBoard);
      setDeterminableCells(determinable);
      setShowDeterminable(true);
      showMessage(t.hintCell, 'info');
    }
  };

  // Apply hint value
  const handleApplyHint = () => {
    if (hintCell) {
      setShowHintValue(true);
      const newBoard = currentBoard.map(r => [...r]);
      newBoard[hintCell.row][hintCell.col] = hintCell.value;
      setCurrentBoard(newBoard);
      setMoves(prev => prev + 1);
      setHintCell(null);
      setShowDeterminable(false);
      setAnimatingCell(`${hintCell.row}-${hintCell.col}`);
      setTimeout(() => setAnimatingCell(null), 200);

      if (isBoardComplete(newBoard)) {
        setIsComplete(true);
        setTimerActive(false);
        showMessage(t.congratulations, 'success');
      }
    }
  };

  // Check errors
  const handleCheck = () => {
    const foundErrors = findErrors(currentBoard);
    setErrors(foundErrors);
    setShowErrors(true);
    if (foundErrors.size === 0) {
      showMessage(t.noErrors, 'success');
    } else {
      showMessage(`${t.errors}: ${foundErrors.size}`, 'warning');
    }
  };

  // Reset to puzzle
  const handleReset = () => {
    setCurrentBoard(puzzle.map(row => [...row]));
    setSelectedCell(null);
    lastClickedCell.current = null;
    setHintCell(null);
    setShowHintValue(false);
    setErrors(new Set());
    setShowErrors(false);
    setIsComplete(false);
    setMoves(0);
    setTime(0);
    setMessage('');
    setShowDeterminable(false);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const [row, col] = selectedCell;

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const num = parseInt(e.key);
        setValue(row, col, num);
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        setValue(row, col, null);
      } else if (e.key === 'ArrowUp' && row > 0) {
        e.preventDefault();
        setSelectedCell([row - 1, col]);
        lastClickedCell.current = `${row - 1}-${col}`;
      } else if (e.key === 'ArrowDown' && row < 8) {
        e.preventDefault();
        setSelectedCell([row + 1, col]);
        lastClickedCell.current = `${row + 1}-${col}`;
      } else if (e.key === 'ArrowLeft' && col > 0) {
        e.preventDefault();
        setSelectedCell([row, col - 1]);
        lastClickedCell.current = `${row}-${col - 1}`;
      } else if (e.key === 'ArrowRight' && col < 8) {
        e.preventDefault();
        setSelectedCell([row, col + 1]);
        lastClickedCell.current = `${row}-${col + 1}`;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, currentBoard]);

  // Check if cell is determinable
  const isDeterminable = (row: number, col: number) => {
    return determinableCells.some(c => c.row === row && c.col === col);
  };

  const getDeterminableValue = (row: number, col: number): number | null => {
    const cell = determinableCells.find(c => c.row === row && c.col === col);
    return cell?.value ?? null;
  };

  // Difficulty names
  const difficultyNames = [t.veryEasy, t.easy, t.medium, t.hard, t.expert];
  const difficultyColors = [
    'from-green-400 to-green-600',
    'from-emerald-400 to-teal-600',
    'from-yellow-400 to-orange-500',
    'from-orange-500 to-red-500',
    'from-red-500 to-purple-600',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex flex-col items-center p-3 md:p-6">
      {/* Header */}
      <div className="w-full max-w-2xl flex flex-wrap items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl md:text-4xl">🧩</span>
          <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
            {t.title}
          </span>
        </h1>

        {/* Language selector */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Language)}
          className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
        >
          {languages.map(l => (
            <option key={l.code} value={l.code} className="bg-gray-800 text-white">
              {l.flag} {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Settings Row */}
      <div className="w-full max-w-2xl flex flex-wrap gap-3 mb-4 justify-center">
        {/* Difficulty */}
        <div className="flex items-center gap-0.5 bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
          {difficultyNames.map((name, idx) => (
            <button
              key={idx}
              onClick={() => setDifficulty(idx + 1)}
              className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                difficulty === idx + 1
                  ? `bg-gradient-to-r ${difficultyColors[idx]} text-white shadow-lg scale-105`
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Theme */}
        <div className="flex items-center gap-0.5 bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
          {themes.map(th => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
                theme === th.id
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg scale-110'
                  : 'hover:bg-white/10 opacity-60 hover:opacity-100'
              }`}
              title={t[th.id as keyof typeof t]}
            >
              {th.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
          <span className="text-lg">⏱️</span>
          <span className="text-white/70 font-mono">{formatTime(time)}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
          <span className="text-lg">🎯</span>
          <span className="text-white/70">{moves}</span>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`mb-4 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          messageType === 'success'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
            : messageType === 'warning'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10'
            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10'
        }`}>
          {messageType === 'success' && '✅ '}{messageType === 'warning' && '⚠️ '}{messageType === 'info' && '💡 '}{message}
        </div>
      )}

      {/* Sudoku Board */}
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center h-80 text-white/60">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🧩</span>
          </div>
          <p className="mt-4 text-lg">{t.generating}</p>
        </div>
      ) : (
        <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-2 md:p-3 border border-white/10 shadow-2xl shadow-purple-500/5">
          <div className="grid grid-cols-9 gap-0 border-2 border-white/50 rounded-xl overflow-hidden">
            {currentBoard.map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                const isOriginal = puzzle[rowIdx]?.[colIdx] !== null && puzzle[rowIdx]?.[colIdx] !== undefined;
                const isSelected = selectedCell?.[0] === rowIdx && selectedCell?.[1] === colIdx;
                const isHinted = hintCell?.row === rowIdx && hintCell?.col === colIdx;
                const hasError = showErrors && errors.has(`${rowIdx}-${colIdx}`);
                const isDet = showDeterminable && isDeterminable(rowIdx, colIdx);
                const isInSameRow = selectedCell?.[0] === rowIdx;
                const isInSameCol = selectedCell?.[1] === colIdx;
                const isInSameBox = selectedCell &&
                  Math.floor(selectedCell[0] / 3) === Math.floor(rowIdx / 3) &&
                  Math.floor(selectedCell[1] / 3) === Math.floor(colIdx / 3);
                const isHighlighted = isInSameRow || isInSameCol || isInSameBox;
                const sameValue = selectedCell && currentBoard[selectedCell[0]][selectedCell[1]] !== null &&
                  cell !== null && cell === currentBoard[selectedCell[0]][selectedCell[1]];
                const isAnimating = animatingCell === `${rowIdx}-${colIdx}`;

                // Borders for 3x3 boxes
                const borderRight = colIdx % 3 === 2 && colIdx !== 8 ? 'border-r-2 border-r-white/50' : 'border-r border-r-white/10';
                const borderBottom = rowIdx % 3 === 2 && rowIdx !== 8 ? 'border-b-2 border-b-white/50' : 'border-b border-b-white/10';

                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    className={`
                      relative w-9 h-9 md:w-[3.2rem] md:h-[3.2rem] flex items-center justify-center
                      cursor-pointer select-none transition-all duration-150
                      ${borderRight} ${borderBottom}
                      ${isSelected ? 'bg-yellow-400/25 ring-2 ring-inset ring-yellow-400 z-10' : ''}
                      ${isHinted && !isSelected ? 'bg-emerald-400/25 ring-2 ring-inset ring-emerald-400' : ''}
                      ${hasError ? 'bg-red-500/25 ring-2 ring-inset ring-red-400' : ''}
                      ${isDet && !isSelected && !isHinted ? 'bg-cyan-400/15' : ''}
                      ${!isSelected && !isHinted && !hasError && isHighlighted && !sameValue ? 'bg-white/[0.07]' : ''}
                      ${sameValue && !isSelected ? 'bg-purple-400/15' : ''}
                      ${!isSelected && !isHinted && !hasError && !isHighlighted && !sameValue ? 'hover:bg-white/[0.04]' : ''}
                      ${isAnimating ? 'scale-110' : ''}
                    `}
                  >
                    {cell !== null ? (
                      <span className={`
                        text-sm md:text-xl font-bold transition-all duration-150
                        ${isOriginal
                          ? 'text-white drop-shadow-sm'
                          : 'text-sky-300'
                        }
                        ${hasError ? '!text-red-300' : ''}
                        ${theme !== 'numbers' ? 'text-base md:text-2xl' : ''}
                        ${isAnimating ? 'scale-125' : ''}
                      `}>
                        {getSymbol(cell)}
                      </span>
                    ) : isDet && showDeterminable ? (
                      <span className="text-[10px] md:text-xs text-cyan-300/50 font-medium animate-pulse">
                        {getSymbol(getDeterminableValue(rowIdx, colIdx))}
                      </span>
                    ) : null}

                    {/* Hint dot indicator */}
                    {isHinted && !showHintValue && (
                      <div className="absolute top-0.5 right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-400 rounded-full animate-bounce shadow-lg shadow-emerald-400/50" />
                    )}

                    {/* Error indicator */}
                    {hasError && (
                      <div className="absolute bottom-0.5 left-0.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-red-400 rounded-full shadow-lg shadow-red-400/50" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Number pad for selected cell */}
      {selectedCell && !isGenerating && !isComplete && (
        <div className="mt-4 flex flex-wrap gap-1.5 justify-center animate-fadeIn">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
            const isActive = currentBoard[selectedCell[0]][selectedCell[1]] === num;
            return (
              <button
                key={num}
                onClick={() => setValue(selectedCell[0], selectedCell[1], num)}
                className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-xl font-bold text-base md:text-xl
                  transition-all duration-150 active:scale-90
                  ${isActive
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 shadow-lg shadow-yellow-500/30 scale-110'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 border border-white/10'
                  }
                  ${theme !== 'numbers' ? 'text-xl md:text-2xl' : ''}
                `}
              >
                {getSymbol(num)}
              </button>
            );
          })}
          <button
            onClick={() => setValue(selectedCell[0], selectedCell[1], null)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 font-bold text-lg transition-all active:scale-90 border border-red-500/20"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 flex flex-wrap gap-2 justify-center">
        <button
          onClick={startNewGame}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 text-sm"
        >
          🎮 {t.newGame}
        </button>
        <button
          onClick={handleAutoSolve}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300 border border-blue-500/30 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 text-sm"
        >
          🤖 {t.solve}
        </button>
        <button
          onClick={handleHint}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 border border-purple-500/30 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 text-sm"
        >
          💡 {t.hint}
        </button>
        {hintCell && !showHintValue && (
          <button
            onClick={handleApplyHint}
            className="px-4 py-2.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30 text-yellow-300 border border-yellow-500/30 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 animate-pulse text-sm"
          >
            ✨ {getSymbol(hintCell.value)}
          </button>
        )}
        <button
          onClick={handleCheck}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-orange-300 border border-orange-500/30 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 text-sm"
        >
          🔍 {t.check}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 text-red-300 border border-red-500/30 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 text-sm"
        >
          🔄 {t.reset}
        </button>
        <button
          onClick={() => setShowHelp(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 hover:from-indigo-500/30 hover:to-violet-500/30 text-indigo-300 border border-indigo-500/30 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 text-sm"
        >
          ❓ {t.help}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-5 text-white/30 text-xs text-center max-w-md space-y-1">
        <p>👆 {t.clickToCycle} (1→2→...→9→∅)</p>
        <p>⌨️ 1-9 | ←→↑↓ | Del/Backspace</p>
      </div>

      {/* Completion overlay */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-3xl p-8 text-center shadow-2xl border border-white/20 max-w-sm mx-4 transform">
            <div className="text-7xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-2">{t.congratulations}</h2>
            <p className="text-white/70 mb-1">{t.puzzleSolved}</p>
            <div className="flex justify-center gap-4 my-4">
              <div className="bg-white/10 rounded-xl px-4 py-2">
                <div className="text-white/50 text-xs">{t.time}</div>
                <div className="text-white font-mono text-lg">{formatTime(time)}</div>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2">
                <div className="text-white/50 text-xs">{t.moves}</div>
                <div className="text-white font-mono text-lg">{moves}</div>
              </div>
            </div>
            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={() => {
                  setIsComplete(false);
                  setMessage('');
                  startNewGame();
                }}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:from-yellow-300 hover:to-orange-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/30"
              >
                🎮 {t.newGame}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">📖</span>
                {t.helpTitle}
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-white/80">
              {/* Rules */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  {t.helpRules}
                </h3>
                <p className="leading-relaxed">{t.helpRulesText}</p>
              </div>

              {/* Controls */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
                  <span className="text-xl">🎮</span>
                  {t.helpControls}
                </h3>
                <p className="leading-relaxed">{t.helpControlsText}</p>
              </div>

              {/* Features */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  {t.helpFeatures}
                </h3>
                <p className="leading-relaxed whitespace-pre-line">{t.helpFeaturesText}</p>
              </div>

              {/* Themes */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="text-lg font-bold text-pink-300 mb-3 flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  {t.helpThemes}
                </h3>
                <p className="leading-relaxed">{t.helpThemesText}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {themes.map(th => (
                    <div key={th.id} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                      <span className="text-2xl">{th.emoji}</span>
                      <span className="text-sm">{t[th.id as keyof typeof t]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <h3 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  {t.helpDifficulty}
                </h3>
                <p className="leading-relaxed whitespace-pre-line">{t.helpDifficultyText}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowHelp(false)}
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:from-yellow-300 hover:to-orange-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/30"
              >
                {t.helpClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
