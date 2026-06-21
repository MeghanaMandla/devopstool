// ============================================================
// Lightweight Terminal Widget
// A real interactive terminal UI: history, arrow-key recall,
// scrollback. Built custom (no xterm.js dependency) so it has
// zero CDN risk and matches the site's theme exactly.
// ============================================================
function createTerminalWidget(containerEl, opts) {
  const promptLabel = (opts && opts.prompt) || '$';
  const onCommand = (opts && opts.onCommand) || (() => '');
  const welcome = (opts && opts.welcome) || '';

  containerEl.innerHTML = '';
  containerEl.className = 'fallback-term';
  containerEl.tabIndex = 0;

  const history = [];
  let historyIdx = -1;

  const scrollback = document.createElement('div');
  containerEl.appendChild(scrollback);

  const inputRow = document.createElement('div');
  inputRow.className = 'ft-input-row';
  const promptSpan = document.createElement('span');
  promptSpan.className = 'ft-prompt';
  promptSpan.textContent = promptLabel;
  const input = document.createElement('input');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'false');
  inputRow.appendChild(promptSpan);
  inputRow.appendChild(input);
  containerEl.appendChild(inputRow);

  function appendLine(text, cls) {
    if (text === undefined || text === null) text = '';
    const div = document.createElement('div');
    div.className = 'ft-line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    scrollback.appendChild(div);
  }

  function printPromptedCommand(cmd) {
    const div = document.createElement('div');
    div.className = 'ft-line';
    const p = document.createElement('span');
    p.className = 'ft-prompt';
    p.textContent = promptLabel + ' ';
    div.appendChild(p);
    div.appendChild(document.createTextNode(cmd));
    scrollback.appendChild(div);
  }

  function scrollToBottom() {
    containerEl.scrollTop = containerEl.scrollHeight;
  }

  if (welcome) {
    welcome.split('\n').forEach(l => appendLine(l));
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value;
      printPromptedCommand(cmd);
      if (cmd.trim()) { history.push(cmd); historyIdx = history.length; }
      input.value = '';
      if (cmd.trim().toLowerCase() === 'clear') {
        scrollback.innerHTML = '';
      } else {
        const result = onCommand(cmd);
        if (result !== undefined && result !== '') {
          String(result).split('\n').forEach(l => appendLine(l));
        }
      }
      scrollToBottom();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx > 0) { historyIdx--; input.value = history[historyIdx] || ''; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx < history.length - 1) { historyIdx++; input.value = history[historyIdx] || ''; }
      else { historyIdx = history.length; input.value = ''; }
    }
  });

  containerEl.addEventListener('click', () => input.focus());

  return {
    print: (text, cls) => { appendLine(text, cls); scrollToBottom(); },
    runCommand: (cmd) => {
      printPromptedCommand(cmd);
      const result = onCommand(cmd);
      if (result) String(result).split('\n').forEach(l => appendLine(l));
      scrollToBottom();
    },
    clear: () => { scrollback.innerHTML = ''; },
    focus: () => input.focus(),
    setPrompt: (p) => { promptSpan.textContent = p; },
  };
}
