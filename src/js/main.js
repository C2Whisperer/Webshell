// C2Whisperer WebShell Terminal
let config = {};
let isPasswordCorrect = false;
let commandHistory = [];
let historyIndex = -1;

// Load configuration
async function loadConfig() {
  try {
    const response = await fetch('./config.json');
    config = await response.json();
    initializeTerminal();
  } catch (error) {
    console.error('Error loading config:', error);
    // Fallback config
    config = {
      title: "C2Whisperer Terminal",
      username: "operator",
      hostname: "c2whisperer",
      password: "infected",
      ascii: ["C2WHISPERER TERMINAL"],
      aboutGreeting: "Welcome to C2Whisperer Terminal",
      projects: [],
      social: {}
    };
    initializeTerminal();
  }
}

// Initialize terminal
function initializeTerminal() {
  // Set page title
  document.title = config.title || "C2Whisperer Terminal";
  
  // Set prompts
  updatePrompts();
  
  // Setup event listeners
  setupEventListeners();
  
  // Focus on password input
  document.getElementById('user-password').focus();
}

// Update prompt displays
function updatePrompts() {
  const userElements = ['pre-user', 'pre-user-password', 'pre-user-user'];
  const hostElements = ['pre-host', 'pre-host-password', 'pre-host-user'];
  
  userElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = config.username || 'user';
  });
  
  hostElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = config.hostname || 'terminal';
  });
}

// Setup event listeners
function setupEventListeners() {
  const passwordInput = document.getElementById('user-password');
  const userInput = document.getElementById('user-input');
  
  // Password input
  passwordInput.addEventListener('keydown', handlePasswordInput);
  
  // Command input
  userInput.addEventListener('keydown', handleCommandInput);
  
  // Prevent right-click context menu
  document.addEventListener('contextmenu', e => e.preventDefault());
}

// Handle password input
function handlePasswordInput(event) {
  if (event.key === 'Enter') {
    const password = event.target.value;
    if (password === config.password) {
      isPasswordCorrect = true;
      // Hide password input
      event.target.parentElement.classList.add('hidden');
      // Show command input
      document.getElementById('user-input').parentElement.classList.remove('hidden');
      document.getElementById('user-input').focus();
      
      // Show welcome message
      showWelcome();
    } else {
      // Wrong password
      addOutput('Access Denied. Incorrect password.', 'error');
      event.target.value = '';
    }
  }
}

// Handle command input
function handleCommandInput(event) {
  if (!isPasswordCorrect) return;
  
  const input = event.target;
  
  if (event.key === 'Enter') {
    const command = input.value.trim();
    if (command) {
      commandHistory.unshift(command);
      addCommandToHistory(command);
      executeCommand(command);
    }
    input.value = '';
    historyIndex = -1;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[historyIndex];
    }
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[historyIndex];
    } else if (historyIndex === 0) {
      historyIndex = -1;
      input.value = '';
    }
  } else if (event.key === 'Escape') {
    input.value = '';
    historyIndex = -1;
  } else if (event.key === 'Tab') {
    event.preventDefault();
    // Auto-complete
    autoComplete(input);
  }
}

// Auto-complete functionality
function autoComplete(input) {
  const commands = ['help', 'about', 'projects', 'social', 'clear', 'whoami', 'date', 'history', 'banner', 'theme'];
  const currentValue = input.value.toLowerCase();
  const matches = commands.filter(cmd => cmd.startsWith(currentValue));
  
  if (matches.length === 1) {
    input.value = matches[0];
  } else if (matches.length > 1) {
    addOutput(`Available commands: ${matches.join(', ')}`, 'info');
  }
}

// Show welcome message
function showWelcome() {
  if (config.ascii && config.ascii.length > 0) {
    const asciiArt = config.ascii.join('\n');
    addOutput(asciiArt, 'ascii-art');
  }
  
  addOutput('\n' + (config.aboutGreeting || 'Welcome to the terminal!'));
  addOutput('\nType "help" to see available commands.\n');
}

// Add command to history display
function addCommandToHistory(command) {
  const prompt = `${config.username}@${config.hostname}:$ ~ ${command}`;
  addOutput(prompt, 'command-history');
}

// Execute command
function executeCommand(command) {
  const args = command.toLowerCase().split(' ');
  const cmd = args[0];
  
  switch (cmd) {
    case 'help':
      showHelp();
      break;
    case 'about':
      showAbout();
      break;
    case 'projects':
      showProjects();
      break;
    case 'social':
      showSocial();
      break;
    case 'clear':
      clearTerminal();
      break;
    case 'whoami':
      addOutput(config.username || 'operator');
      break;
    case 'date':
      addOutput(new Date().toString());
      break;
    case 'history':
      showHistory();
      break;
    case 'banner':
      showBanner();
      break;
    case 'theme':
      showTheme();
      break;
    case 'ls':
      addOutput('Projects  Social  About  Config');
      break;
    case 'pwd':
      addOutput('/home/' + (config.username || 'operator'));
      break;
    case 'exit':
    case 'quit':
      addOutput('Session terminated.', 'error');
      setTimeout(() => window.close(), 1000);
      break;
    default:
      addOutput(`Command not found: ${command}. Type "help" for available commands.`, 'error');
  }
}

// Show help
function showHelp() {
  const helpText = `
Available Commands:
  help      - Show this help message
  about     - About information
  projects  - Show projects
  social    - Show social links
  banner    - Show ASCII banner
  clear     - Clear terminal
  whoami    - Show current user
  date      - Show current date
  history   - Show command history
  theme     - Show color theme
  ls        - List contents
  pwd       - Print working directory
  exit      - Close terminal
  
Navigation:
  [↑][↓]    - Browse command history
  [Tab]     - Auto-complete commands
  [Esc]     - Clear input line
`;
  addOutput(helpText);
}

// Show about
function showAbout() {
  addOutput(config.aboutGreeting || 'No about information available.');
  if (config.repoLink) {
    addOutput(`\nRepository: ${config.repoLink}`);
  }
}

// Show projects
function showProjects() {
  if (config.projects && config.projects.length > 0) {
    addOutput('\nProjects:');
    config.projects.forEach((project, index) => {
      const [name, description, link] = project;
      const projectHtml = `  ${index + 1}. ${name}
     ${description}
     Link: ${link}`;
      addOutput(projectHtml, 'project-item');
    });
  } else {
    addOutput('No projects available.');
  }
}

// Show social
function showSocial() {
  if (config.social && Object.keys(config.social).length > 0) {
    addOutput('\nSocial Links:');
    Object.entries(config.social).forEach(([platform, handle]) => {
      if (handle) {
        const url = getSocialUrl(platform, handle);
        addOutput(`  ${platform}: ${handle} (${url})`, 'project-item');
      }
    });
  } else {
    addOutput('No social links available.');
  }
}

// Get social URL
function getSocialUrl(platform, handle) {
  const urls = {
    github: `https://github.com/${handle}`,
    linkedin: `https://linkedin.com/in/${handle}`,
    twitter: `https://twitter.com/${handle}`,
    email: `mailto:${handle}`
  };
  return urls[platform] || handle;
}

// Show banner
function showBanner() {
  if (config.ascii && config.ascii.length > 0) {
    const asciiArt = config.ascii.join('\n');
    addOutput(asciiArt, 'ascii-art');
  }
}

// Show theme
function showTheme() {
  if (config.colors) {
    addOutput('\nCurrent Theme Colors:');
    Object.entries(config.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        addOutput(`  ${key}: ${value}`);
      }
    });
  } else {
    addOutput('Theme information not available.');
  }
}

// Show command history
function showHistory() {
  if (commandHistory.length > 0) {
    addOutput('\nCommand History:');
    commandHistory.slice().reverse().forEach((cmd, index) => {
      addOutput(`  ${index + 1}. ${cmd}`);
    });
  } else {
    addOutput('No command history.');
  }
}

// Clear terminal
function clearTerminal() {
  const terminal = document.getElementById('terminal');
  terminal.innerHTML = '<div><span id="prompt"><span id="pre-user"></span>@<span id="pre-host"></span>:$ ~ </span></div><a id="write-lines"></a>';
  updatePrompts();
}

// Add output to terminal
function addOutput(text, className = '') {
  const terminal = document.getElementById('terminal');
  const writeLines = document.getElementById('write-lines');
  
  const output = document.createElement('div');
  output.className = `command-output ${className}`;
  output.textContent = text;
  
  terminal.insertBefore(output, writeLines);
  
  // Scroll to bottom
  setTimeout(() => {
    writeLines.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadConfig);

// Initial setup - hide command input
document.addEventListener('DOMContentLoaded', () => {
  const commandInput = document.getElementById('user-input').parentElement;
  if (commandInput) {
    commandInput.classList.add('hidden');
  }
});
