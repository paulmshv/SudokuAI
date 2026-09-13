# 🧩 Sudoku Puzzle Game

A modern, feature-rich Sudoku web application built with React, TypeScript, and Tailwind CSS.

![Sudoku Game](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-purple)

## ✨ Features

### 🎮 Core Gameplay
- **Sudoku Generation**: Algorithmically generated puzzles with unique solutions
- **5 Difficulty Levels**: From Very Easy (30 empty cells) to Expert (56 empty cells)
- **Interactive Board**: Click cells to cycle through values (1→2→3→...→9→empty)
- **Keyboard Support**: Full keyboard navigation with arrow keys and number input

### 🤖 Smart Assistance
- **Auto-Solve**: Instantly solve the entire puzzle
- **Hints**: 
  - Highlights cells that can be determined
  - Shows possible next moves
  - Reveals the correct value for highlighted cells
- **Error Detection**: Check your board for conflicts and mistakes
- **Reset**: Return to the original puzzle state

### 🎨 Visual Themes
Choose from 5 different visual themes to make the game more engaging:
- 🔢 **Numbers**: Classic numeric display
- 🎨 **Colors**: Colorful circle indicators
- 🐾 **Animals**: Cute animal emojis
- 🔷 **Shapes**: Geometric shape symbols
- 🍎 **Fruits**: Fruit emoji collection

### 🌍 Multi-Language Support
Available in 5 languages:
- 🇷🇺 Russian (Русский)
- 🇬🇧 English
- 🇪🇸 Spanish (Español)
- 🇩🇪 German (Deutsch)
- 🇨🇳 Chinese (中文)

### 📊 Game Statistics
- Real-time timer
- Move counter
- Completion tracking
- Victory celebration screen

### 🎯 User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Visual Feedback**: 
  - Highlighted rows, columns, and boxes for selected cell
  - Same-value highlighting across the board
  - Animated cell transitions
  - Error indicators with red highlights
  - Hint indicators with green pulsing dots
- **Number Pad**: Quick value selection for mobile users
- **Dark Theme**: Beautiful gradient background with glassmorphism effects

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sudoku-game.git
cd sudoku-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🌐 Deploy to GitHub Pages

This project includes automatic deployment to GitHub Pages using GitHub Actions.

### Quick Setup (Automated)

Run the setup script to automatically configure everything:

```bash
# Make the script executable
chmod +x setup-gh-pages.sh

# Run the setup script
./setup-gh-pages.sh
```

The script will:
- Detect your GitHub repository name
- Configure the base URL for GitHub Pages
- Update Vite configuration

### Manual Setup

If you prefer to set up manually:

1. **Update `.env.production`** with your repository info:
```bash
VITE_BASE_URL=/your-username/your-repo-name/
```

2. **Commit and push** to GitHub:
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

3. **Enable GitHub Pages** in your repository:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically deploy on every push to `main`

4. **Access your site** at:
```
https://your-username.github.io/your-repo-name/
```

### How It Works

The deployment workflow (`.github/workflows/deploy.yml`) automatically:
- Builds the project on every push to `main`
- Uploads the build artifacts
- Deploys to GitHub Pages

You can also manually trigger deployments from the **Actions** tab in your repository.

### Troubleshooting

**Blank page after deployment?**
- Make sure `VITE_BASE_URL` in `.env.production` matches your repository name exactly
- Check that the workflow completed successfully in the Actions tab

**Assets not loading?**
- Verify the base URL format: `/<username>/<repo-name>/`
- Rebuild and push: `npm run build && git add dist && git commit -m "rebuild" && git push`

**Workflow not running?**
- Ensure GitHub Actions are enabled in your repository settings
- Check that you're pushing to the `main` branch

## 🎮 How to Play

### Basic Rules
Fill the 9×9 grid so that each row, each column, and each 3×3 box contains all digits from 1 to 9 exactly once.

### Controls

#### Mouse/Touch
- **Click on a cell**: Select it and cycle to the next value
- **Number pad**: Click numbers 1-9 to set a value, or ✕ to clear

#### Keyboard
- **1-9**: Set the selected cell to that number
- **Arrow keys**: Navigate between cells
- **Delete/Backspace**: Clear the selected cell
- **0**: Clear the selected cell

### Game Features

#### 💡 Hint System
1. Click the **Hint** button
2. The game highlights a cell that can be determined
3. Blue glow indicates cells with only one possible value
4. Click **Apply Hint** (✨) to fill in the highlighted cell

#### 🔍 Check Errors
1. Click the **Check** button
2. Cells with conflicts are highlighted in red
3. A message shows how many errors were found

#### 🤖 Auto-Solve
1. Click the **Solve** button
2. The entire puzzle is filled with the correct solution
3. Victory screen appears

#### 🔄 Reset
1. Click the **Reset** button
2. The board returns to its original puzzle state
3. Timer and move counter are reset

## 🛠️ Technical Details

### Project Structure
```
sudoku-game/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Application entry point
│   ├── index.css              # Global styles
│   └── utils/
│       ├── sudokuGenerator.ts # Sudoku generation and solving algorithms
│       └── translations.ts    # Multi-language support
├── public/                    # Static assets
├── index.html                 # HTML template
├── package.json              # Dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

### Technologies Used
- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Algorithm**: Backtracking with constraint propagation for puzzle generation

### Sudoku Algorithm

The puzzle generation uses a sophisticated algorithm:

1. **Board Generation**: Creates a complete valid Sudoku solution using randomized backtracking
2. **Puzzle Creation**: Removes cells while ensuring the puzzle has a unique solution
3. **Difficulty Scaling**: Adjusts the number of removed cells based on difficulty level
4. **Solution Verification**: Uses backtracking to verify uniqueness for easier difficulties

### Performance Optimizations
- Lazy evaluation for hint calculations
- Efficient error detection with single-pass algorithms
- Optimized solution counting with early termination
- Debounced UI updates for smooth animations

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Customization

### Adding New Themes
Edit `src/utils/translations.ts` and add new entries to the `themes` array and `themeSymbols` object:

```typescript
export const themes: { id: ThemeType; emoji: string }[] = [
  // ... existing themes
  { id: 'custom', emoji: '🎭' },
];

export const themeSymbols: Record<ThemeType, string[]> = {
  // ... existing symbols
  custom: ['🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺'],
};
```

### Adding New Languages
Add translations to the `translations` object in `src/utils/translations.ts`:

```typescript
export const translations: Record<Language, Record<string, string>> = {
  // ... existing languages
  fr: {
    title: 'Sudoku',
    newGame: 'Nouveau jeu',
    // ... all translation keys
  },
};
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve translations

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Sudoku algorithm inspired by Peter Norvig's approach
- UI design inspired by modern mobile puzzle games
- Emoji icons from various open-source emoji sets

## 📧 Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

---

**Enjoy playing Sudoku! 🎉**
