// src/main.js
import { createGameState, loadLevelDataIntoState } from './core/state.js';
import { updateGame } from './engine/engine.js';
import { renderGame } from './renderer/renderGame.js';
import { updateHUDDom } from './ui/hudDom.js';
import { tryDash } from './engine/systems/dashSystem.js';

import {
  editorState,
  startNewLevel,
  setActiveTool,
  setLevelName,              // NEW
  buildLevelPayloadForSave,  // NEW
} from './editor/editorState.js';
import { renderEditor } from './editor/editorRenderer.js';
import {
  placeWallAtGrid,
  placeSpawnAtGrid,
  placePortalAtGrid,
  placeTrapAtGrid,
  placePowerupAtGrid,
  placeKeyAtGrid,       // NEW
  placeDoorAtGrid,      // NEW
  placeSwitchAtGrid,    // NEW
  placeEnemyAtGrid,     // NEW
} from './editor/editorTools.js';
import {
  findEntityAtPixel,
  deleteSelectedEntity,
  moveSelectedEntity,
  moveSelectedEntityToGrid,
} from './editor/editorSelection.js';
import {
  canPlaceWallAtGrid,
  canPlaceSpawnAtGrid,
  canPlacePortalAtGrid,
  canPlaceTrapAtGrid,      // NEW
  canPlacePowerupAtGrid,
  canPlaceKeyAtGrid,      // ✅ NEW
  canPlaceDoorAtGrid,     // ✅ NEW
  canPlaceSwitchAtGrid,   // ✅ NEW
  canPlaceEnemyAtGrid,    //   // NEW
} from './editor/editorPlacementValidator.js';

import { GRID_SIZE } from './core/config.js';
import {
  showMainMenu,
  showQuestScreen,
  showLevelSelectScreen,
  showPauseOverlay,
  hidePauseOverlay,
  hideAllOverlays,
  showLevelCompleteOverlay,
  showGameOverOverlay,
  showQuestCompleteOverlay,
  showCreatorScreen,
} from './ui/menuDom.js';

import { QUEST_LEVELS } from './data/questLevels.js';
import {
  startQuest,
  startQuestAtLevel,
  restartQuest,
  restartCurrentLevel,
  advanceQuestLevel,
} from './modes/questMode.js';
import { validateLevel } from './core/levelValidator.js';
import {
  loadAllLevels,
  upsertLevel,
  loadLevelById,
  deleteLevelById,
} from './core/levelStorage.js';

import {
  loadAllPortals,
  upsertPortal,
  loadPortalById,
  deletePortalById,
} from './core/portalStorage.js';

// ===== Canvas Setup =====
const canvas = document.getElementById('game');
const ctx = canvas ? canvas.getContext('2d') : null;

const editorCanvas = document.getElementById('editorCanvas');
const editorCtx = editorCanvas ? editorCanvas.getContext('2d') : null;

const state = createGameState();

// ===== Virtual Joystick DOM =====
const joystickEl = document.getElementById('virtualJoystick');
const joystickThumbEl = document.getElementById('joystickThumb');

const joystickState = {
  active: false,
  centerX: 0,
  centerY: 0,
};

// ===== Buttons (match your HTML) =====
const playQuestBtn = document.getElementById('btnPlayQuest');
const openLevelSelectBtn = document.getElementById('btnLevelSelect');
const levelSelectBackBtn = document.getElementById('btnLevelSelectBack');
const levelSelectList = document.getElementById('levelSelectList');

const creatorBtn = document.getElementById('btnCreator');
const creatorBackBtn = document.getElementById('btnCreatorBack');
const creatorNewBtn = document.getElementById('btnCreatorNew');
const creatorPlaytestBtn = document.getElementById('btnCreatorPlaytest'); // not used yet
const creatorDeleteBtn = document.getElementById('btnCreatorDelete');
const endTestBtn = document.getElementById('btnEndTest');

const myPortalsList = document.getElementById('myPortalsList');
const createPortalBtn = document.getElementById('btnCreatePortal');

// Portal editor DOM
const portalEditorOverlay = document.getElementById('portalEditorOverlay');
const portalEditorNameInput = document.getElementById('portalEditorName');
const portalEditorAvailableList = document.getElementById('portalEditorAvailable');
const portalEditorSelectedList = document.getElementById('portalEditorSelected');
const portalEditorSaveBtn = document.getElementById('portalEditorSave');
const portalEditorCancelBtn = document.getElementById('portalEditorCancel');

const myLevelsBtn      = document.getElementById('btnMyLevels');
const myLevelsBackBtn  = document.getElementById('btnMyLevelsBack');
const myLevelsScreenEl = document.getElementById('myLevelsScreen');

const myPortalsBtn     = document.getElementById('btnMyPortals');      // NEW
const myPortalsBackBtn = document.getElementById('btnMyPortalsBack');  // NEW
const myPortalsScreenEl= document.getElementById('myPortalsScreen');   // NEW

// NEW: Creator meta UI
const levelNameInput = document.getElementById('level-name-input');
const saveLevelBtn = document.getElementById('save-level-btn');
const creatorSaveStatusEl = document.getElementById('creator-save-status');
const creatorLevelNameLabel = document.getElementById('creatorLevelName');

// Placement type UI
const trapPlacementRow = document.getElementById('trap-placement-row');
const trapPlacementSelect = document.getElementById('trap-placement-select');
const powerupPlacementRow = document.getElementById('powerup-placement-row');
const powerupPlacementSelect = document.getElementById('powerup-placement-select');

// Selected entity / type UI
const selectedEntityPanel = document.getElementById('selected-entity-panel');
const selectedEntityKindEl = document.getElementById('selected-entity-kind');
const trapTypeRow = document.getElementById('trap-type-row');
const trapTypeSelect = document.getElementById('trap-type-select');
const powerupTypeRow = document.getElementById('powerup-type-row');
const powerupTypeSelect = document.getElementById('powerup-type-select');


const restartLevelBtn = document.getElementById('btnRestartLevel');
const restartQuestBtn = document.getElementById('btnRestartQuest');
const backToMenuBtn = document.getElementById('btnBackToMenu');

const pauseResumeBtn = document.getElementById('pause-resume-btn');
const pauseRestartLevelBtn = document.getElementById('pause-restart-level-btn');
const pauseRestartQuestBtn = document.getElementById('pause-restart-quest-btn');
const pauseMainMenuBtn = document.getElementById('pause-main-menu-btn');

const levelNextBtn = document.getElementById('level-next-btn');
const levelRestartQuestBtn = document.getElementById('level-restart-quest-btn');
const levelMainMenuBtn = document.getElementById('level-main-menu-btn');

const gameoverRestartQuestBtn = document.getElementById('gameover-restart-quest-btn');
const gameoverMainMenuBtn = document.getElementById('gameover-main-menu-btn');

const questcompleteRestartQuestBtn = document.getElementById('questcomplete-restart-quest-btn');
const questcompleteMainMenuBtn = document.getElementById('questcomplete-main-menu-btn');

const toolSelectBtn = document.getElementById('toolSelect');
const toolWallBtn = document.getElementById('toolWall');
const toolSpawnBtn = document.getElementById('toolSpawn');
const toolPortalBtn = document.getElementById('toolPortal');

const questPortalSelectScreen = document.getElementById("questPortalSelectScreen");
const questPortalList = document.getElementById("questPortalList");
const btnQuestPortalBack = document.getElementById("btnQuestPortalBack");

const toolTrapBtn = document.getElementById('toolTrap');         // NEW
const toolPowerupBtn = document.getElementById('toolPowerup');   // NEW

const toolKeyBtn = document.getElementById('toolKey');         // NEW
const toolDoorBtn = document.getElementById('toolDoor');       // NEW
const toolSwitchBtn = document.getElementById('toolSwitch');   // NEW
const toolEnemyBtn = document.getElementById('toolEnemy');     // NEW

const doorTypeRow = document.getElementById('door-type-row');
const doorTypeSelect = document.getElementById('door-type-select');
const doorIdRow = document.getElementById('door-id-row');
const doorIdInput = document.getElementById('door-id-input');

const keyIdRow = document.getElementById('key-id-row');
const keyIdInput = document.getElementById('key-id-input');

// NEW: Switch ID + Switch Door ID fields
const switchIdRow = document.getElementById('switch-id-row');
const switchIdInput = document.getElementById('switch-id-input');

const switchDoorsRow = document.getElementById('switch-doors-row');
const switchDoorsInput = document.getElementById('switch-doors-input');

const enemyTypeRow = document.getElementById('enemy-type-row');           // NEW
const enemyTypeSelect = document.getElementById('enemy-type-select');     // NEW
const enemyAxisRow = document.getElementById('enemy-axis-row');           // NEW
const enemyAxisSelect = document.getElementById('enemy-axis-select');     // NEW
const enemyDirRow = document.getElementById('enemy-dir-row');             // NEW
const enemyDirSelect = document.getElementById('enemy-dir-select');       // NEW

const rectOrientationRow = document.getElementById('rect-orientation-row');   // NEW
const rectOrientationSelect = document.getElementById('rect-orientation-select'); // NEW
const rectLengthRow = document.getElementById('rect-length-row');             // NEW
const rectLengthInput = document.getElementById('rect-length-input');         // NEW

// Draft portal state for the editor overlay
let portalEditorDraft = {
  id: null,
  name: '',
  levelIds: [],   // ordered array of saved level IDs
};

// ===== Creator status helper =====
function updateCreatorStatusFromLevel() {
  const statusEl = document.getElementById('creatorStatus');
  if (!statusEl || !editorState.currentLevel) return;
  const issues = validateLevel(editorState.currentLevel);
  if (issues.length === 0) {
    statusEl.textContent = 'Valid ✅';
  } else {
    statusEl.textContent = `${issues.length} issue(s) ⚠️ – ${issues[0]}`;
  }
}

// NEW: Keep the Level Info panel + input in sync with editorState.currentLevel.name
function syncCreatorNameUI() {
  const lvl = editorState.currentLevel;

  // NEW: Only fall back when name is truly missing, not empty string
  const name =
    (lvl && typeof lvl.name === "string")
      ? lvl.name
      : "Untitled";
        
  if (creatorLevelNameLabel) {
    creatorLevelNameLabel.textContent = name;
  }
  if (levelNameInput && levelNameInput.value !== name) {
    levelNameInput.value = name;
  }
}

// ===== Level Select Builder =====
function buildLevelSelectList() {
  if (!levelSelectList) return;

  levelSelectList.innerHTML = '';

  // ─────────────────────────────
  // Portal 1 – play all built-in levels in order
  // ─────────────────────────────
  const portalBtn = document.createElement('button');
  portalBtn.className = 'menu-btn';
  portalBtn.textContent = 'Portal 1 (Play All)';
  portalBtn.addEventListener('click', () => {
    // Normal quest run starting from level 0
    state.customTest = false;
    state.customLevelName = null;
    // you can set a flag later if you want to differentiate portals
    // state.portalName = 'Portal 1';

    // Full quest from the beginning
    startQuest(state);
    showQuestScreen();
  });
  levelSelectList.appendChild(portalBtn);

  // Optional little spacer / label
  const sep = document.createElement('div');
  sep.style.marginTop = '12px';
  sep.style.fontSize = '12px';
  sep.style.opacity = '0.7';
  sep.textContent = 'Play a specific level:';
  levelSelectList.appendChild(sep);

  // ─────────────────────────────
  // Individual built-in levels
  // ─────────────────────────────
  QUEST_LEVELS.forEach((level, index) => {
    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.textContent = `${index + 1}. ${level.name ?? level.id ?? 'Level ' + (index + 1)}`;
    btn.addEventListener('click', () => {
      state.customTest = false;
      state.customLevelName = null;
      startQuestAtLevel(state, index);
      showQuestScreen();
    });
    levelSelectList.appendChild(btn);
  });
}

// Build level list once at boot
buildLevelSelectList();


// ===== My Levels Builder =====
function renderMyLevelsList() {
  if (!myLevelsList) return;

  const levels = loadAllLevels();

  if (!levels.length) {
    myLevelsList.innerHTML = `
      <div style="font-size:13px; opacity:0.8;">
        No saved levels yet. Create one in the Level Creator and hit "Save Level".
      </div>
    `;
    return;
  }

  myLevelsList.innerHTML = '';

  levels.forEach((lvl) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.gap = '8px';

    const label = document.createElement('div');
    label.textContent = lvl.name || 'Untitled Level';
    label.style.fontSize = '14px';

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '6px';

    const editBtn = document.createElement('button');
    editBtn.className = 'menu-btn';
    editBtn.style.padding = '4px 10px';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      openLevelFromMyLevels(lvl.id);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'menu-btn';
    deleteBtn.style.padding = '4px 10px';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      if (!confirm('Delete this level?')) return;
      deleteLevelById(lvl.id);
      renderMyLevelsList();
    });

    const playBtn = document.createElement('button');
playBtn.className = 'menu-btn';
playBtn.style.padding = '4px 10px';
playBtn.textContent = 'Play';
playBtn.addEventListener('click', () => {
  playLevelFromMyLevels(lvl.id);   // NEW
});

    
    actions.appendChild(playBtn);   
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    row.appendChild(label);
    row.appendChild(actions);
    myLevelsList.appendChild(row);
  });
}

function openPortalEditor(portalId = null) {
  // Load levels for sidebar
  const levels = loadAllLevels();

  if (!levels.length) {
    alert('You need at least one saved level to build a portal.');
    return;
  }

  if (portalId) {
    const portal = loadPortalById(portalId);
    if (portal) {
      portalEditorDraft.id = portal.id;
      portalEditorDraft.name = portal.name || '';
      portalEditorDraft.levelIds = Array.isArray(portal.levelIds) ? portal.levelIds.slice() : [];
    } else {
      // Fallback: new portal
      portalEditorDraft.id = null;
      portalEditorDraft.name = '';
      portalEditorDraft.levelIds = [];
    }
  } else {
    // New portal
    portalEditorDraft.id = null;
    portalEditorDraft.name = '';
    portalEditorDraft.levelIds = [];
  }

  // Initialize inputs
  if (portalEditorNameInput) {
    portalEditorNameInput.value = portalEditorDraft.name || '';
  }

  renderPortalEditorLists();

  if (portalEditorOverlay) {
    portalEditorOverlay.classList.remove('hidden');
  }
}

function closePortalEditor() {
  if (portalEditorOverlay) {
    portalEditorOverlay.classList.add('hidden');
  }
}

function renderPortalEditorLists() {
  if (!portalEditorAvailableList || !portalEditorSelectedList) return;

  const levels = loadAllLevels();
  const idSet = new Set(portalEditorDraft.levelIds);

  // Available = all levels, but indicate if already in portal
  portalEditorAvailableList.innerHTML = '';
  levels.forEach((lvl) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.gap = '6px';
    row.style.marginBottom = '4px';
    row.style.fontSize = '13px';

    const label = document.createElement('span');
    label.textContent = lvl.name || 'Untitled Level';

    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.style.padding = '2px 8px';
    btn.style.fontSize = '11px';

    if (idSet.has(lvl.id)) {
      btn.textContent = 'Added';
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'default';
    } else {
      btn.textContent = 'Add';
      btn.addEventListener('click', () => {
        addLevelToPortalDraft(lvl.id);
      });
    }

    row.appendChild(label);
    row.appendChild(btn);
    portalEditorAvailableList.appendChild(row);
  });

  // Selected = only levels whose ids are in draft.levelIds, in order
  portalEditorSelectedList.innerHTML = '';
  if (!portalEditorDraft.levelIds.length) {
    const emptyMsg = document.createElement('div');
    emptyMsg.textContent = 'No levels in this portal yet.';
    emptyMsg.style.fontSize = '13px';
    emptyMsg.style.opacity = '0.8';
    portalEditorSelectedList.appendChild(emptyMsg);
    return;
  }

  portalEditorDraft.levelIds.forEach((id, index) => {
    const lvl = levels.find((l) => l.id === id);
    const name = lvl ? (lvl.name || 'Untitled Level') : '(Missing level)';

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.gap = '6px';
    row.style.marginBottom = '4px';
    row.style.fontSize = '13px';

    const label = document.createElement('span');
    label.textContent = `${index + 1}. ${name}`;

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '4px';

    const upBtn = document.createElement('button');
    upBtn.className = 'menu-btn';
    upBtn.style.padding = '2px 6px';
    upBtn.style.fontSize = '11px';
    upBtn.textContent = '↑';
    upBtn.disabled = index === 0;
    if (!upBtn.disabled) {
      upBtn.addEventListener('click', () => {
        moveLevelInPortalDraft(index, index - 1);
      });
    }

    const downBtn = document.createElement('button');
    downBtn.className = 'menu-btn';
    downBtn.style.padding = '2px 6px';
    downBtn.style.fontSize = '11px';
    downBtn.textContent = '↓';
    downBtn.disabled = index === portalEditorDraft.levelIds.length - 1;
    if (!downBtn.disabled) {
      downBtn.addEventListener('click', () => {
        moveLevelInPortalDraft(index, index + 1);
      });
    }

    const removeBtn = document.createElement('button');
    removeBtn.className = 'menu-btn';
    removeBtn.style.padding = '2px 6px';
    removeBtn.style.fontSize = '11px';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => {
      removeLevelFromPortalDraft(id);
    });

    btnGroup.appendChild(upBtn);
    btnGroup.appendChild(downBtn);
    btnGroup.appendChild(removeBtn);

    row.appendChild(label);
    row.appendChild(btnGroup);

    portalEditorSelectedList.appendChild(row);
  });
}

function addLevelToPortalDraft(levelId) {
  if (!portalEditorDraft.levelIds.includes(levelId)) {
    portalEditorDraft.levelIds.push(levelId);
    renderPortalEditorLists();
  }
}

function removeLevelFromPortalDraft(levelId) {
  portalEditorDraft.levelIds = portalEditorDraft.levelIds.filter((id) => id !== levelId);
  renderPortalEditorLists();
}

function moveLevelInPortalDraft(fromIndex, toIndex) {
  const arr = portalEditorDraft.levelIds;
  if (fromIndex < 0 || fromIndex >= arr.length) return;
  if (toIndex < 0 || toIndex >= arr.length) return;
  const [item] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, item);
  renderPortalEditorLists();
}

function renderMyPortalsList() {
  if (!myPortalsList) return;

  const portals = loadAllPortals();

  if (!portals.length) {
    myPortalsList.innerHTML = `
      <div style="font-size:13px; opacity:0.8;">
        No portals yet. Create one from your saved levels.
      </div>
    `;
    return;
  }

  myPortalsList.innerHTML = '';

  portals.forEach((portal) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.gap = '8px';

    const label = document.createElement('div');
    label.textContent = portal.name || 'Untitled Portal';
    label.style.fontSize = '14px';

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '6px';

const playBtn = document.createElement('button');
playBtn.className = 'menu-btn';
playBtn.style.padding = '4px 10px';
playBtn.textContent = 'Play';
playBtn.addEventListener('click', () => {
  playPortalFromMyLevels(portal.id);
});

const editBtn = document.createElement('button');
editBtn.className = 'menu-btn';
editBtn.style.padding = '4px 10px';
editBtn.textContent = 'Edit';
editBtn.addEventListener('click', () => {
  openPortalEditor(portal.id);
});

const deleteBtn = document.createElement('button');
deleteBtn.className = 'menu-btn';
deleteBtn.style.padding = '4px 10px';
deleteBtn.textContent = 'Delete';
deleteBtn.addEventListener('click', () => {
  if (!confirm('Delete this portal?')) return;
  deletePortalById(portal.id);
  renderMyPortalsList();
});

actions.appendChild(playBtn);
actions.appendChild(editBtn);   // NEW
actions.appendChild(deleteBtn);
    row.appendChild(label);
    row.appendChild(actions);
    myPortalsList.appendChild(row);
  });
}

function openLevelFromMyLevels(levelId) {
  const saved = loadLevelById(levelId);
  if (!saved) return;

  const data = saved.data || {};

  editorState.currentLevel = {
    id: saved.id,
    name: saved.name,
    mode: data.mode ?? 'quest',
    width: data.width ?? 800,
    height: data.height ?? 600,
    start: data.start ?? { x: 100, y: 500 },
    portal: data.portal ?? { x: 700, y: 100, r: 20 },
    obstacles: Array.isArray(data.obstacles) ? data.obstacles : [],
    enemies: Array.isArray(data.enemies) ? data.enemies : [],
    powerups: Array.isArray(data.powerups) ? data.powerups : [],
    traps: Array.isArray(data.traps) ? data.traps : [],
    keys: Array.isArray(data.keys) ? data.keys : [],
    doors: Array.isArray(data.doors) ? data.doors : [],
    switches: Array.isArray(data.switches) ? data.switches : [],
  };

  editorState.selectedEntity = null;
  editorState.hover = null;
  editorState.isTesting = false;
  state.customTest = false;
  state.mode = 'creator';

  updateDeleteButtonState();
  updateCreatorStatusFromLevel();
  syncCreatorNameUI();

  // Hide My Levels screen and open Creator
  const myLevelsScreen = document.getElementById('myLevelsScreen');
  if (myLevelsScreen) {
    myLevelsScreen.classList.add('hidden');
  }
  showCreatorScreen();
}

function playPortalFromMyLevels(portalId) {
  const portal = loadPortalById(portalId);
  if (!portal || !portal.levelIds.length) return;

  const firstId = portal.levelIds[0];
  const firstLevel = loadLevelById(firstId);
  if (!firstLevel || !firstLevel.data) return;

  // Mark this as a CUSTOM PORTAL RUN (My Portals)
  state.portalRun = {
    type: "custom",
    portalId: portal.id,
    name: portal.name,
    levelIds: portal.levelIds.slice(),
    indexInPortal: 0,
  };

  // Store first level data in case you want it later
  state.currentCustomLevelData = firstLevel.data;

  // This is a real quest-style run, not a test
  state.customTest = false;
  state.customLevelName = null;
  state.mode = "quest";
  state.isPaused = false;

  if (!state.quest) state.quest = {};
  state.quest.status = "playing";
  state.quest.lives = 3;                 // ✅ always start portal with 3 lives

  loadLevelDataIntoState(state, firstLevel.data);

  if (myPortalsScreenEl) myPortalsScreenEl.classList.add("hidden");

  hideAllOverlays();
  showQuestScreen();
}

function playLevelFromMyLevels(levelId) {
  const saved = loadLevelById(levelId);
  if (!saved) return;

  const levelData = saved.data || saved;

  // This is a REAL single-level run, not a Creator test
  state.customTest = false;                         // ✅ NOT test mode
  state.portalRun = null;                           // not in a portal
  state.customLevelName = saved.name || 'Custom Level';
  state.lastLoadedCustomLevel = levelData;          // used by restartQuest

  // Put the game into quest mode with 3 lives
  state.mode = 'quest';
  state.isPaused = false;

  if (!state.quest) {
    state.quest = {};
  }
  state.quest.status = 'playing';
  state.quest.lives = 3;                            // ✅ always start with 3

  // Load custom level into engine
  loadLevelDataIntoState(state, levelData);

  if (myLevelsScreenEl) myLevelsScreenEl.classList.add('hidden');

  hideAllOverlays();
  showQuestScreen();
}
// ===== Creator UI helpers =====
function updateDeleteButtonState() {
  if (!creatorDeleteBtn) return;
  const hasSelection = !!editorState.selectedEntity;
  creatorDeleteBtn.disabled = !hasSelection;
  creatorDeleteBtn.classList.toggle('danger-btn-active', hasSelection);
  creatorDeleteBtn.classList.toggle('danger-btn-disabled', !hasSelection);
}

function updatePlacementPanelForTool() {
  const tool = editorState.activeTool;

  if (!trapPlacementRow || !powerupPlacementRow) return;

  // Trap placement controls visible only when Trap tool is active
  if (tool === 'trap') {
    trapPlacementRow.style.display = 'flex';
    if (trapPlacementSelect) {
      trapPlacementSelect.value = editorState.activeTrapType || 'fire';
    }
  } else {
    trapPlacementRow.style.display = 'none';
  }

  // Powerup placement controls visible only when Powerup tool is active
  if (tool === 'powerup') {
    powerupPlacementRow.style.display = 'flex';
    if (powerupPlacementSelect) {
      powerupPlacementSelect.value = editorState.activePowerupType || 'speed';
    }
  } else {
    powerupPlacementRow.style.display = 'none';
  }
}

function updateSelectedEntityPanel() {
  if (!selectedEntityPanel) return;

  const sel   = editorState.selectedEntity;
  const level = editorState.currentLevel;

  if (!sel || !level) {
    selectedEntityPanel.style.display = 'none';
    return;
  }

  selectedEntityPanel.style.display = 'block';

  // Hide everything by default
  if (trapTypeRow)        trapTypeRow.style.display        = 'none';
  if (powerupTypeRow)     powerupTypeRow.style.display     = 'none';
  if (doorTypeRow)        doorTypeRow.style.display        = 'none';
  if (enemyTypeRow)       enemyTypeRow.style.display       = 'none';
  if (enemyAxisRow)       enemyAxisRow.style.display       = 'none';
  if (enemyDirRow)        enemyDirRow.style.display        = 'none';
  if (rectOrientationRow) rectOrientationRow.style.display = 'none';
  if (rectLengthRow)      rectLengthRow.style.display      = 'none';
  if (keyIdRow)           keyIdRow.style.display           = 'none';
  if (switchIdRow)        switchIdRow.style.display        = 'none';
  if (doorIdRow)          doorIdRow.style.display          = 'none';
  if (switchDoorsRow)     switchDoorsRow.style.display     = 'none';

  let label = '';

  let showTrap            = false;
  let showPowerup         = false;
  let showDoor            = false;
  let showEnemy           = false;
  let showEnemyAxis       = false;
  let showEnemyDir        = false;
  let showRectOrientation = false;
  let showRectLength      = false;
  let showKeyId           = false;   // key.keyId
  let showSwitchId        = false;   // switch.switchId
  let showKeyDoorId       = false;   // door.keyDoorId
  let showSwitchDoorId    = false;   // door.switchDoorId

  /* ───────── Traps ───────── */
  if (sel.kind === 'trap') {
    label    = 'Trap';
    showTrap = true;

    const traps = level.traps || [];
    const t     = traps[sel.index];
    if (t && trapTypeSelect) {
      const validTypes = ['glue', 'fire', 'poison', 'spike'];
      const type       = validTypes.includes(t.type) ? t.type : 'spike';
      trapTypeSelect.value = type;
    }

  /* ───────── Powerups ───────── */
  } else if (sel.kind === 'powerup') {
    label       = 'Powerup';
    showPowerup = true;

    const powerups = level.powerups || [];
    const p        = powerups[sel.index];
    if (p && powerupTypeSelect) {
      const validTypes = ['speed', 'shield', 'dash'];
      const type       = validTypes.includes(p.type) ? p.type : 'speed';
      powerupTypeSelect.value = type;
    }

/* ───────── Doors (Key Door ID / Switch Door ID) ───────── */
} else if (sel.kind === 'door') {
  label               = 'Door';
  showDoor            = true;
  showRectOrientation = true;
  showRectLength      = true;

  const doors = level.doors || [];
  const d     = doors[sel.index];

  if (d && doorTypeSelect) {
    const validTypes = ['key', 'switch'];
    const type       = validTypes.includes(d.type) ? d.type : 'key';

    // Normalize
    d.type = type;
    doorTypeSelect.value = type;

    /* ----------------------------
       ⭐ KEY DOOR — Show Key ID
    -----------------------------*/
    if (type === 'key') {
      showKeyDoorId = true;

      if (doorIdInput) {
        // DO NOT overwrite user typing with blank
        const current = doorIdInput.value;
        const actual  = d.keyDoorId ?? "";

        if (current !== actual) {
          doorIdInput.value = actual;  // sync only when different
        }
      }
    }

    /* ----------------------------
       ⭐ SWITCH DOOR — Show Switch ID
    -----------------------------*/
    else if (type === 'switch') {
      showSwitchDoorId = true;

      if (switchDoorsInput) {
        const current = switchDoorsInput.value;
        const actual  = d.switchDoorId ?? "";

        if (current !== actual) {
          switchDoorsInput.value = actual;
        }
      }
    }
  }

  /* ----------------------------
     ⭐ Orientation + Length Sync
  -----------------------------*/
  if (d && rectOrientationSelect && rectLengthInput) {
    const horizontal = d.w >= d.h;
    rectOrientationSelect.value = horizontal ? 'horizontal' : 'vertical';

    const tileSize = GRID_SIZE;
    const tiles = horizontal
      ? Math.round(d.w / tileSize)
      : Math.round(d.h / tileSize);

    rectLengthInput.value = tiles > 0 ? tiles : 1;
  }
}

  /* ───────── Enemies ───────── */
   else if (sel.kind === 'enemy') {
    label     = 'Enemy';
    showEnemy = true;

    const enemies = level.enemies || [];
    const e       = enemies[sel.index];
    if (e && enemyTypeSelect) {
      const validTypes = ['patrol', 'chaser', 'spinner'];
      const type       = validTypes.includes(e.type) ? e.type : 'patrol';
      enemyTypeSelect.value = type;

      if (type === 'patrol') {
        showEnemyAxis = true;
        showEnemyDir  = true;

        const axis = e.axis === 'vertical' ? 'vertical' : 'horizontal';
        if (enemyAxisSelect) {
          enemyAxisSelect.value = axis;
        }

        let dir = 'right';
        const vx = e.vx ?? 1.5;

        if (axis === 'horizontal') {
          dir = vx >= 0 ? 'right' : 'left';
          if (enemyDirSelect) {
            enemyDirSelect.innerHTML = `
              <option value="right">Right</option>
              <option value="left">Left</option>
            `;
          }
        } else {
          dir = vx >= 0 ? 'down' : 'up';
          if (enemyDirSelect) {
            enemyDirSelect.innerHTML = `
              <option value="down">Down</option>
              <option value="up">Up</option>
            `;
          }
        }

        if (enemyDirSelect) {
          enemyDirSelect.value = dir;
        }
      }
    }

  /* ───────── Spawn / Portal / Wall ───────── */
  } else if (sel.kind === 'spawn') {
    label = 'Player Spawn';

  } else if (sel.kind === 'portal') {
    label = 'Portal';

  } else if (sel.kind === 'obstacle') {
    label               = 'Wall';
    showRectOrientation = true;
    showRectLength      = true;

    const obstacles = level.obstacles || [];
    const o         = obstacles[sel.index];
    if (o && rectOrientationSelect && rectLengthInput) {
      const horizontal = o.w >= o.h;
      rectOrientationSelect.value = horizontal ? 'horizontal' : 'vertical';

      const tileSize = GRID_SIZE;
      const tiles    = horizontal
        ? Math.round(o.w / tileSize)
        : Math.round(o.h / tileSize);

      rectLengthInput.value = tiles > 0 ? tiles : 1;
    }

  /* ───────── Keys (Key ID) ───────── */
  } else if (sel.kind === 'key') {
    label    = 'Key';
    showKeyId = true;

    const keys = level.keys || [];
    const k    = keys[sel.index];
    if (k && keyIdInput) {
      keyIdInput.value = k.keyId || '';
    }

  /* ───────── Switches (Switch ID) ───────── */
  } else if (sel.kind === 'switch') {
    label        = 'Switch';
    showSwitchId = true;

    const switches = level.switches || [];
    const sw       = switches[sel.index];
    if (sw && switchIdInput) {
      switchIdInput.value = sw.switchId || '';
    }

  } else {
    label = sel.kind;
  }

  // Label text
  if (selectedEntityKindEl) {
    selectedEntityKindEl.textContent = label;
  }

  // Apply visibility
  if (trapTypeRow)        trapTypeRow.style.display        = showTrap ? 'flex' : 'none';
  if (powerupTypeRow)     powerupTypeRow.style.display     = showPowerup ? 'flex' : 'none';
  if (doorTypeRow)        doorTypeRow.style.display        = showDoor ? 'flex' : 'none';
  if (enemyTypeRow)       enemyTypeRow.style.display       = showEnemy ? 'flex' : 'none';
  if (enemyAxisRow)       enemyAxisRow.style.display       = showEnemyAxis ? 'flex' : 'none';
  if (enemyDirRow)        enemyDirRow.style.display        = showEnemyDir ? 'flex' : 'none';
  if (rectOrientationRow) rectOrientationRow.style.display = showRectOrientation ? 'flex' : 'none';
  if (rectLengthRow)      rectLengthRow.style.display      = showRectLength ? 'flex' : 'none';

  if (keyIdRow)           keyIdRow.style.display           = showKeyId ? 'flex' : 'none';
  if (switchIdRow)        switchIdRow.style.display        = showSwitchId ? 'flex' : 'none';
  if (doorIdRow)          doorIdRow.style.display          = showKeyDoorId ? 'flex' : 'none';
  if (switchDoorsRow)     switchDoorsRow.style.display     = showSwitchDoorId ? 'flex' : 'none';
}

function showEndTestButton(show) {
  if (!endTestBtn) return;
  endTestBtn.classList.toggle('hidden', !show);
}

function updateTestButtonLabel() {
  if (!creatorPlaytestBtn) return;
  if (editorState.isTesting) {
    creatorPlaytestBtn.textContent = 'Restart';
  } else {
    creatorPlaytestBtn.textContent = 'Test Game';
  }
}



// Creator tools: manage active button visual
function setToolButtonActive(activeBtn) {
  [
    toolSelectBtn,
    toolWallBtn,
    toolSpawnBtn,
    toolTrapBtn,
    toolPowerupBtn,
    toolKeyBtn,
    toolDoorBtn,
    toolSwitchBtn,
    toolEnemyBtn,
    toolPortalBtn,
  ].forEach((btn) => {
    if (!btn) return;
    btn.classList.remove('tool-btn-active');
  });
  if (activeBtn) {
    activeBtn.classList.add('tool-btn-active');
  }
}

// ========= Subtype Buttons (Trap, Powerup, Enemy) =========

// Trap subtype buttons
const trapButtons = document.querySelectorAll('[data-group="trap"]');
trapButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    editorState.activeTrapType = type;
    setActiveTool('trap');
    setToolButtonActive(btn);
    updatePlacementPanelForTool();
  });
});

// Powerup subtype buttons
const powerupButtons = document.querySelectorAll('[data-group="powerup"]');
powerupButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    editorState.activePowerupType = type;
    setActiveTool('powerup');
    setToolButtonActive(btn);
    updatePlacementPanelForTool();
  });
});

// Enemy subtype buttons
const enemyButtons = document.querySelectorAll('[data-group="enemy"]');
enemyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    editorState.activeEnemyType = type;
    setActiveTool('enemy');
    setToolButtonActive(btn);
    updatePlacementPanelForTool();
  });
});

// ===== BUILD subtype buttons (Wall, Key Gate, Switch Gate) =====

const buildButtons = document.querySelectorAll('[data-group="build"]');
buildButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;

    // Highlight clicked button
    setToolButtonActive(btn);

    if (type === "wall") {
      setActiveTool("wall");
    }
    else if (type === "key-gate") {
      setActiveTool("door");
      editorState.activeDoorType = "key";   // NEW
    }
    else if (type === "switch-gate") {
      setActiveTool("door");
      editorState.activeDoorType = "switch"; // NEW
    }
  });
});

// ===== Level Name Input Binding =====
if (levelNameInput) {
  levelNameInput.addEventListener('input', (e) => {
    setLevelName(e.target.value || '');
    syncCreatorNameUI();
  });
}

// =========================================================
// NAVIGATION / CLICK HANDLERS (CLEAN + NON-REDUNDANT)
// =========================================================

// ---------- MAIN MENU → QUEST MODE ----------
if (playQuestBtn) {
  playQuestBtn.addEventListener("click", () => {
    // Always reset any test/custom flags
    state.customTest = false;
    state.customLevelName = null;
    state.portalRun = null;
    showEndTestButton(false);

    startQuest(state);
    showQuestScreen();
  });
}

// ---------- MAIN MENU → LEVEL SELECT (BUILT-IN) ----------
if (openLevelSelectBtn) {
  openLevelSelectBtn.addEventListener("click", () => {
    state.customTest = false;
    state.customLevelName = null;
    state.portalRun = null;
    showEndTestButton(false);

    showLevelSelectScreen();
  });
}

// ---------- MAIN MENU → LEVEL CREATOR ----------
if (creatorBtn) {
  creatorBtn.addEventListener("click", () => {
    state.mode = "creator";

    // Auto-create a blank level if none is loaded yet
    if (!editorState.currentLevel) {
      startNewLevel();
      editorState.selectedEntity = null;
      editorState.hover = null;
      updateDeleteButtonState();
      updateCreatorStatusFromLevel();
    }

    syncCreatorNameUI();
    updateSelectedEntityPanel();
    showCreatorScreen();
  });
}

// =========================================================
// MY LEVELS
// =========================================================
if (myLevelsBtn) {
  myLevelsBtn.addEventListener("click", () => {
    renderMyLevelsList();

    showMainMenu();
    document.getElementById("homeScreen")?.classList.add("hidden");

    myLevelsScreenEl?.classList.remove("hidden");
  });
}

if (myLevelsBackBtn) {
  myLevelsBackBtn.addEventListener("click", () => {
    myLevelsScreenEl?.classList.add("hidden");
    showMainMenu();
  });
}

// =========================================================
// MY PORTALS
// =========================================================
if (myPortalsBtn) {
  myPortalsBtn.addEventListener("click", () => {
    renderMyPortalsList();

    showMainMenu();
    document.getElementById("homeScreen")?.classList.add("hidden");

    myPortalsScreenEl?.classList.remove("hidden");
  });
}

if (myPortalsBackBtn) {
  myPortalsBackBtn.addEventListener("click", () => {
    myPortalsScreenEl?.classList.add("hidden");
    showMainMenu();
  });
}

// =========================================================
// CREATOR MODE BUTTONS
// =========================================================

// Back to main menu
if (creatorBackBtn) {
  creatorBackBtn.addEventListener("click", () => {
    state.mode = "menu";
    showMainMenu();
    hideAllOverlays();
  });
}

// New Level
if (creatorNewBtn) {
  creatorNewBtn.addEventListener("click", () => {
    startNewLevel();

    // Always reset tool back to Select
    setActiveTool("select");
    toolSelectBtn && setToolButtonActive(toolSelectBtn);

    editorState.selectedEntity = null;
    editorState.hover = null;

    updateDeleteButtonState();
    updateCreatorStatusFromLevel();
    updateSelectedEntityPanel();
    updatePlacementPanelForTool();
    syncCreatorNameUI();
  });
}

// Delete Selected Entity
if (creatorDeleteBtn) {
  creatorDeleteBtn.addEventListener("click", () => {
    if (!editorState.selectedEntity) return;

    deleteSelectedEntity();

    updateDeleteButtonState();
    updateCreatorStatusFromLevel();
    updateSelectedEntityPanel();
  });
}

// =========================================================
// CREATOR TOOL BUTTONS
// =========================================================

// Select Tool
toolSelectBtn?.addEventListener("click", () => {
  setActiveTool("select");
  setToolButtonActive(toolSelectBtn);
  editorState.hover = null;
  updatePlacementPanelForTool();
});

// Wall Tool
toolWallBtn?.addEventListener("click", () => {
  setActiveTool("wall");
  setToolButtonActive(toolWallBtn);
  updatePlacementPanelForTool();
});

// Spawn Tool
toolSpawnBtn?.addEventListener("click", () => {
  setActiveTool("spawn");
  setToolButtonActive(toolSpawnBtn);
  updatePlacementPanelForTool();
});

// Trap Tool
toolTrapBtn?.addEventListener("click", () => {
  setActiveTool("trap");
  setToolButtonActive(toolTrapBtn);
  updatePlacementPanelForTool();
});

// Powerup Tool
toolPowerupBtn?.addEventListener("click", () => {
  setActiveTool("powerup");
  setToolButtonActive(toolPowerupBtn);
  updatePlacementPanelForTool();
});

// Door Tool (Key or Switch)
toolDoorBtn?.addEventListener("click", () => {
  setActiveTool("door");
  setToolButtonActive(toolDoorBtn);
  updatePlacementPanelForTool();
});

// Key Tool
toolKeyBtn?.addEventListener("click", () => {
  setActiveTool("key");
  setToolButtonActive(toolKeyBtn);
  updatePlacementPanelForTool();
});

// Switch Tool
toolSwitchBtn?.addEventListener("click", () => {
  setActiveTool("switch");
  setToolButtonActive(toolSwitchBtn);
  updatePlacementPanelForTool();
});

// Enemy Tool
toolEnemyBtn?.addEventListener("click", () => {
  setActiveTool("enemy");
  setToolButtonActive(toolEnemyBtn);
  updatePlacementPanelForTool();
});

// Portal Tool
toolPortalBtn?.addEventListener("click", () => {
  setActiveTool("portal");
  setToolButtonActive(toolPortalBtn);
  updatePlacementPanelForTool();
});

// =========================================================
// DOOR, KEY, SWITCH EDITORS
// =========================================================

// Door type (key/switch)
doorTypeSelect?.addEventListener("change", (e) => {
  const sel = editorState.selectedEntity;
  const level = editorState.currentLevel;
  if (!sel || sel.kind !== "door") return;

  const d = level.doors[sel.index];
  if (!d) return;

  const t = e.target.value;
  d.type = t;

  if (t === "key") {
    d.keyDoorId = d.keyDoorId || "";
    d.switchDoorId = null;
  } else {
    d.switchDoorId = d.switchDoorId || "";
    d.keyDoorId = null;
  }

  updateCreatorStatusFromLevel();
  updateSelectedEntityPanel();
});

// Key ID
keyIdInput?.addEventListener("input", (e) => {
  const sel = editorState.selectedEntity;
  if (!sel || sel.kind !== "key") return;

  const lvl = editorState.currentLevel;
  lvl.keys[sel.index].keyId = e.target.value.trim() || null;

  updateCreatorStatusFromLevel();
});

// Switch ID
switchIdInput?.addEventListener("input", (e) => {
  const sel = editorState.selectedEntity;
  if (!sel || sel.kind !== "switch") return;

  const lvl = editorState.currentLevel;
  lvl.switches[sel.index].switchId = e.target.value.trim() || null;

  updateCreatorStatusFromLevel();
});

// Door -> switch-controlled ID
switchDoorsInput?.addEventListener("input", (e) => {
  const sel = editorState.selectedEntity;
  if (!sel || sel.kind !== "door") return;

  const lvl = editorState.currentLevel;
  const d = lvl.doors[sel.index];
  if (!d || d.type !== "switch") return;

  d.switchDoorId = e.target.value.trim() || null;

  updateCreatorStatusFromLevel();
});

// ⭐ KEY DOOR ID (door.keyDoorId)
doorIdInput?.addEventListener("input", (e) => {
  const sel = editorState.selectedEntity;
  if (!sel || sel.kind !== "door") return;

  const lvl = editorState.currentLevel;
  const d = lvl.doors?.[sel.index];
  if (!d || d.type !== "key") return;

  d.keyDoorId = e.target.value.trim() || "";
  updateCreatorStatusFromLevel();
});

// ===== Rect orientation + length (walls / doors) =====
if (rectOrientationSelect) {
  rectOrientationSelect.addEventListener('change', (e) => {
    const sel = editorState.selectedEntity;
    const level = editorState.currentLevel;
    if (!sel || !level) return;

    const isObstacle = sel.kind === 'obstacle';
    const isDoor = sel.kind === 'door';
    if (!isObstacle && !isDoor) return;

    const tileSize = GRID_SIZE;
    const orientation = e.target.value === 'vertical' ? 'vertical' : 'horizontal';

    if (isObstacle) {
      const obstacles = level.obstacles || [];
      const o = obstacles[sel.index];
      if (!o) return;

      const tiles = Math.max(1, parseInt(rectLengthInput?.value || '1', 10) || 1);

      if (orientation === 'horizontal') {
        o.w = tiles * tileSize;
        o.h = tileSize;
      } else {
        o.w = tileSize;
        o.h = tiles * tileSize;
      }
    } else if (isDoor) {
      const doors = level.doors || [];
      const d = doors[sel.index];
      if (!d) return;

      const tiles = Math.max(1, parseInt(rectLengthInput?.value || '1', 10) || 1);

      if (orientation === 'horizontal') {
        d.w = tiles * tileSize;
        d.h = tileSize;
      } else {
        d.w = tileSize;
        d.h = tiles * tileSize;
      }
    }

    updateCreatorStatusFromLevel();
    updateSelectedEntityPanel();
  });
}

if (rectLengthInput) {
  rectLengthInput.addEventListener('change', (e) => {
    const sel = editorState.selectedEntity;
    const level = editorState.currentLevel;
    if (!sel || !level) return;

    const isObstacle = sel.kind === 'obstacle';
    const isDoor = sel.kind === 'door';
    if (!isObstacle && !isDoor) return;

    const tileSize = GRID_SIZE;
    let tiles = parseInt(e.target.value || '1', 10);
    if (!Number.isFinite(tiles) || tiles < 1) tiles = 1;

    if (isObstacle) {
      const obstacles = level.obstacles || [];
      const o = obstacles[sel.index];
      if (!o) return;

      const horizontal = o.w >= o.h;
      if (horizontal) {
        o.w = tiles * tileSize;
        o.h = tileSize;
      } else {
        o.w = tileSize;
        o.h = tiles * tileSize;
      }
    } else if (isDoor) {
      const doors = level.doors || [];
      const d = doors[sel.index];
      if (!d) return;

      const horizontal = d.w >= d.h;
      if (horizontal) {
        d.w = tiles * tileSize;
        d.h = tileSize;
      } else {
        d.w = tileSize;
        d.h = tiles * tileSize;
      }
    }

    updateCreatorStatusFromLevel();
    updateSelectedEntityPanel();
  });
}

if (enemyTypeSelect) {
  enemyTypeSelect.addEventListener('change', (e) => {
    const level = editorState.currentLevel;
    const sel = editorState.selectedEntity;
    if (!level || !sel || sel.kind !== 'enemy') return;

    const enemies = level.enemies || [];
    const idx = sel.index;
    const current = enemies[idx];
    if (!current) return;

    const newType = e.target.value;

    // Get center & size
    const cx = current.x + current.w / 2;
    const cy = current.y + current.h / 2;
    const w = current.w || GRID_SIZE * 0.8;
    const h = current.h || GRID_SIZE * 0.8;

    if (newType === 'patrol') {
      enemies[idx] = {
        type: 'patrol',
        x: cx - w / 2,
        y: cy - h / 2,
        w,
        h,
        axis: 'horizontal',
        vx: 1.5,
      };
    } else if (newType === 'chaser') {
      enemies[idx] = {
        type: 'chaser',
        x: cx - w / 2,
        y: cy - h / 2,
        w,
        h,
        speed: 1.2,
      };
    } else if (newType === 'spinner') {
      const radius = GRID_SIZE * 1.2;
      enemies[idx] = {
        type: 'spinner',
        cx,
        cy,
        radius,
        angle: 0,
        angularSpeed: 1.8,
        w,
        h,
        x: cx - w / 2,
        y: cy - h / 2,
      };
    }

    updateCreatorStatusFromLevel();
    updateSelectedEntityPanel();
  });
}
if (enemyAxisSelect) {
  enemyAxisSelect.addEventListener('change', (e) => {
    const level = editorState.currentLevel;
    const sel = editorState.selectedEntity;
    if (!level || !sel || sel.kind !== 'enemy') return;

    const enemies = level.enemies || [];
    const idx = sel.index;
    const enemy = enemies[idx];
    if (!enemy || enemy.type !== 'patrol') return;

    const axis = e.target.value === 'vertical' ? 'vertical' : 'horizontal';
    enemy.axis = axis;

    // Adjust direction options
    if (enemyDirSelect) {
      if (axis === 'horizontal') {
        enemyDirSelect.innerHTML = `
          <option value="right">Right</option>
          <option value="left">Left</option>
        `;
      } else {
        enemyDirSelect.innerHTML = `
          <option value="down">Down</option>
          <option value="up">Up</option>
        `;
      }
    }

    // Keep vx magnitude, fix sign via direction handler
    const vx = enemy.vx ?? 1.5;
    enemy.vx = vx >= 0 ? 1.5 : -1.5;

    updateCreatorStatusFromLevel();
    updateSelectedEntityPanel();
  });
}

if (enemyDirSelect) {
  enemyDirSelect.addEventListener('change', (e) => {
    const level = editorState.currentLevel;
    const sel = editorState.selectedEntity;
    if (!level || !sel || sel.kind !== 'enemy') return;

    const enemies = level.enemies || [];
    const idx = sel.index;
    const enemy = enemies[idx];
    if (!enemy || enemy.type !== 'patrol') return;

    const axis = enemy.axis === 'vertical' ? 'vertical' : 'horizontal';
    const dir = e.target.value;

    const speedMag = Math.abs(enemy.vx ?? 1.5) || 1.5;

    if (axis === 'horizontal') {
      enemy.vx = (dir === 'left') ? -speedMag : speedMag;
    } else {
      // For vertical patrols, we still use vx as the "step" value (enemySystem uses e.vx along y)
      enemy.vx = (dir === 'up') ? -speedMag : speedMag;
    }

    updateCreatorStatusFromLevel();
  });
}

if (toolPortalBtn) {
  toolPortalBtn.addEventListener('click', () => {
    setActiveTool('portal');
    setToolButtonActive(toolPortalBtn);
    updatePlacementPanelForTool();      // NEW
  });
}

if (toolKeyBtn) {
  toolKeyBtn.addEventListener('click', () => {
    setActiveTool('key');
    setToolButtonActive(toolKeyBtn);
    updatePlacementPanelForTool();
  });
}

if (toolDoorBtn) {
  toolDoorBtn.addEventListener('click', () => {
    setActiveTool('door');
    setToolButtonActive(toolDoorBtn);
    updatePlacementPanelForTool();
  });
}

if (toolSwitchBtn) {
  toolSwitchBtn.addEventListener('click', () => {
    setActiveTool('switch');
    setToolButtonActive(toolSwitchBtn);
    updatePlacementPanelForTool();
  });
}

if (toolEnemyBtn) {
  toolEnemyBtn.addEventListener('click', () => {
    setActiveTool('enemy');
    setToolButtonActive(toolEnemyBtn);
    updatePlacementPanelForTool();
  });
}

// Creator → Test Game / Restart (in-editor)
if (creatorPlaytestBtn) {
  // enable button visually (it was disabled in HTML)
  creatorPlaytestBtn.disabled = false;
  creatorPlaytestBtn.style.opacity = '1';
  creatorPlaytestBtn.style.cursor = 'pointer';

  creatorPlaytestBtn.addEventListener('click', () => {
    if (!editorState.currentLevel) return;

    const issues = validateLevel(editorState.currentLevel);
    if (issues.length > 0) {
      // Show issues, don't start test
      updateCreatorStatusFromLevel();
      return;
    }

    // If already testing → this click means RESTART
  state.customTest = true;
  state.mode = 'creator';
  state.isPaused = false;
  state.quest.status = 'playing';
  state.quest.lives = 3;

  state.lastTestLevelData = editorState.currentLevel;   // NEW
  loadLevelDataIntoState(state, editorState.currentLevel);

    editorState.isTesting = true;
    editorState.selectedEntity = null;
    editorState.hover = null;
    updateDeleteButtonState();
    showEndTestButton(true);
    updateTestButtonLabel(); // label becomes "Restart"

    const statusEl = document.getElementById('creatorStatus');
    if (statusEl) {
      statusEl.textContent = 'Testing level… (click End Test to return)';
    }
  });
}

if (createPortalBtn) {
  createPortalBtn.addEventListener('click', () => {
    openPortalEditor(null); // new blank portal
  });
}

if (portalEditorCancelBtn) {
  portalEditorCancelBtn.addEventListener('click', () => {
    closePortalEditor();
  });
}

if (portalEditorSaveBtn) {
  portalEditorSaveBtn.addEventListener('click', () => {
    const name = portalEditorNameInput ? portalEditorNameInput.value.trim() : '';
    if (!name) {
      alert('Portal name cannot be empty.');
      return;
    }
    if (!portalEditorDraft.levelIds.length) {
      alert('Portal must contain at least one level.');
      return;
    }

    upsertPortal({
      id: portalEditorDraft.id,
      name,
      levelIds: portalEditorDraft.levelIds,
    });

    closePortalEditor();
    renderMyPortalsList();
  });
}


// Level Select → Back to menu
if (levelSelectBackBtn) {
  levelSelectBackBtn.addEventListener('click', () => {
    showMainMenu();
    state.mode = 'menu';
    state.isPaused = false;
    hideAllOverlays();
  });
}

// Quest sidebar buttons
if (restartLevelBtn) {
  restartLevelBtn.addEventListener('click', () => {
    restartCurrentLevel(state);
    showQuestScreen();
    hideAllOverlays();
  });
}

if (restartQuestBtn) {
  restartQuestBtn.addEventListener('click', () => {
    restartQuest(state);
    showQuestScreen();
    hideAllOverlays();
  });
}

// Play Quest button
if (playQuestBtn) {
  playQuestBtn.addEventListener('click', () => {
    state.customTest = false;
    state.customLevelName = null;
    state.portalRun = null;           // NEW
    showEndTestButton(false);
    startQuest(state);
    showQuestScreen();
  });
}

// Back to Main Menu button (quest sidebar)
if (backToMenuBtn) {
  backToMenuBtn.addEventListener('click', () => {
    state.customTest = false;
    state.customLevelName = null;
    state.portalRun = null;           // NEW
    showEndTestButton(false);

    showMainMenu();
    state.mode = 'menu';
    state.isPaused = false;
    hideAllOverlays();
  });
}

// Creator → End Test (back to edit mode)
if (endTestBtn) {
  endTestBtn.addEventListener('click', () => {
    if (!state.customTest || !editorState.isTesting) return;

    state.customTest = false;
    state.isPaused = false;
    state.quest.status = 'idle';
    editorState.isTesting = false;

    showEndTestButton(false);
    updateTestButtonLabel();      // label back to "Test Game"
    updateCreatorStatusFromLevel();
  });
}


// Pause menu buttons
if (pauseResumeBtn) {
  pauseResumeBtn.addEventListener('click', () => {
    state.isPaused = false;
    hidePauseOverlay();
  });
}

if (pauseRestartLevelBtn) {
  pauseRestartLevelBtn.addEventListener('click', () => {
    restartCurrentLevel(state);
    hideAllOverlays();
  });
}

if (pauseRestartQuestBtn) {
  pauseRestartQuestBtn.addEventListener('click', () => {
    restartQuest(state);
    hideAllOverlays();
  });
}

if (pauseMainMenuBtn) {
  pauseMainMenuBtn.addEventListener('click', () => {
    showMainMenu();
    state.mode = 'menu';
    state.isPaused = false;
    hideAllOverlays();
  });
}

// ----- Level Complete → Next Level -----
if (levelNextBtn) {
  levelNextBtn.addEventListener("click", () => {

if (state.portalRun && state.portalRun.type === "custom") {
  const run = state.portalRun;
  const nextIdx = (run.indexInPortal ?? 0) + 1;

  if (nextIdx < run.levelIds.length) {
    // Save health before loading next level
    const prevHealth = state.player.health;

    run.indexInPortal = nextIdx;
    const nextId = run.levelIds[nextIdx];
    const saved = loadLevelById(nextId);
    const data  = saved?.data || saved;

    if (data) {
      loadLevelDataIntoState(state, data);

      // Restore health (capped), so My Portals also carry health across levels
      state.player.health = Math.min(prevHealth, state.player.maxHealth);

      state.quest.status = "playing";
      state.isPaused = false;
      hideAllOverlays();
    } else {
      console.warn("[NextLevel] Missing portal level:", nextId);
    }
  } else {
    // Finished the whole custom portal
    state.quest.status = "questComplete";
    state.isPaused = true;
    hideAllOverlays();
    showQuestCompleteOverlay();
  }
  return;
}
    // 2️⃣ SINGLE CUSTOM LEVEL RUN (My Levels)
    if (!state.portalRun && state.customLevelName && state.lastLoadedCustomLevel) {
      // For now, treat "Next Level" as "Play Again" on this single level
      loadLevelDataIntoState(state, state.lastLoadedCustomLevel);
      state.quest.status = "playing";
      state.isPaused = false;
      hideAllOverlays();
      return;
    }

    // 3️⃣ BUILT-IN QUEST MODE (QUEST_LEVELS)
    if (!state.portalRun && !state.customLevelName) {
      advanceQuestLevel(state);
      hideAllOverlays();
    }
  });
}

if (levelRestartQuestBtn) {
  levelRestartQuestBtn.addEventListener('click', () => {
    restartQuest(state);
    hideAllOverlays();
  });
}

if (levelMainMenuBtn) {
  levelMainMenuBtn.addEventListener('click', () => {
    showMainMenu();
    state.mode = 'menu';
    hideAllOverlays();
  });
}

// Game over buttons
if (gameoverRestartQuestBtn) {
  gameoverRestartQuestBtn.addEventListener('click', () => {
    restartQuest(state);
    hideAllOverlays();
  });
}

if (gameoverMainMenuBtn) {
  gameoverMainMenuBtn.addEventListener('click', () => {
    showMainMenu();
    state.mode = 'menu';
    hideAllOverlays();
  });
}

// Quest complete buttons
if (questcompleteRestartQuestBtn) {
  questcompleteRestartQuestBtn.addEventListener('click', () => {
    restartQuest(state);
    hideAllOverlays();
  });
}

if (questcompleteMainMenuBtn) {
  questcompleteMainMenuBtn.addEventListener('click', () => {
    showMainMenu();
    state.mode = 'menu';
    hideAllOverlays();
  });
}

// ===== Keyboard: Movement + Pause + Dash =====
window.addEventListener('keydown', (e) => {
  // NEW: If the user is typing in an input/textarea/contentEditable, don't hijack keys
  const target = e.target;
  const isTypingTarget =
    target &&
    (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    );

  if (isTypingTarget) {
    // Let the browser handle arrows, space, etc. for text editing
    return;
  }

  const movementKeys = [
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
    ' ', 'Spacebar',
  ];

  if (movementKeys.includes(e.key)) {
    e.preventDefault();
  }

  // ===== Creator mode =====
  if (state.mode === 'creator') {
    // TEST MODE: use quest controls
    if (state.customTest && editorState.isTesting) {
      state.keysDown[e.key] = true;

      if (e.key === ' ' || e.code === 'Space') {
        tryDash(state);
      }

      // Optional: ESC ends test
      if (e.key === 'Escape') {
        state.customTest = false;
        state.quest.status = 'idle';
        editorState.isTesting = false;
        showEndTestButton(false);
        updateTestButtonLabel();
        updateCreatorStatusFromLevel();
      }

      return;
    }

    // EDIT MODE controls (only when not testing)
    if (e.key === 'Delete' || e.key === 'Backspace') {
      deleteSelectedEntity();
      updateDeleteButtonState();
      updateCreatorStatusFromLevel();
      updateSelectedEntityPanel(); // NEW
      return;
    }

    const sel = editorState.selectedEntity;
    if (sel && editorState.activeTool === 'select') {
      if (e.key === 'ArrowLeft') {
        moveSelectedEntity(-GRID_SIZE, 0);
      } else if (e.key === 'ArrowRight') {
        moveSelectedEntity(GRID_SIZE, 0);
      } else if (e.key === 'ArrowUp') {
        moveSelectedEntity(0, -GRID_SIZE);
      } else if (e.key === 'ArrowDown') {
        moveSelectedEntity(0, GRID_SIZE);
      }
      updateCreatorStatusFromLevel();
    }

    return;
  }

  // ===== Quest controls (unchanged) =====
  if (state.mode === 'quest' && state.quest && state.quest.status === 'playing') {
    state.keysDown[e.key] = true;

    if (e.key === ' ' || e.code === 'Space') {
      tryDash(state);
    }
  }

  if (e.key === 'Escape') {
    if (state.mode === 'quest' && state.quest && state.quest.status === 'playing') {
      state.isPaused = !state.isPaused;
      if (state.isPaused) {
        showPauseOverlay();
      } else {
        hidePauseOverlay();
      }
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (state.keysDown && state.keysDown[e.key]) {
    state.keysDown[e.key] = false;
  }
});

// ===== Editor Mouse Hover: set preview =====
if (editorCanvas) {
  editorCanvas.addEventListener('mousemove', (e) => {
    if (state.mode !== 'creator') return;
    if (!editorState.currentLevel) return;
     if (editorState.isTesting) return; // NEW: no hover during test

    const rect = editorCanvas.getBoundingClientRect();
    const scaleX = editorCanvas.width / rect.width;
    const scaleY = editorCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const tool = editorState.activeTool;
    if (tool === 'select') {
      editorState.hover = null;
      return;
    }

    const gridX = Math.floor(x / GRID_SIZE);
    const gridY = Math.floor(y / GRID_SIZE);
    const level = editorState.currentLevel;
    let isValid = false;

    if (tool === 'wall') {
      isValid = canPlaceWallAtGrid(level, gridX, gridY);
    } else if (tool === 'spawn') {
      isValid = canPlaceSpawnAtGrid(level, gridX, gridY);
    } else if (tool === 'portal') {
      isValid = canPlacePortalAtGrid(level, gridX, gridY);
    } else if (tool === 'trap') {
      isValid = canPlaceTrapAtGrid(level, gridX, gridY);
    } else if (tool === 'powerup') {
      isValid = canPlacePowerupAtGrid(level, gridX, gridY);
    } else if (tool === 'key') {
      isValid = canPlaceKeyAtGrid(level, gridX, gridY);
    } else if (tool === 'door') {
      isValid = canPlaceDoorAtGrid(level, gridX, gridY);
    } else if (tool === 'switch') {
      isValid = canPlaceSwitchAtGrid(level, gridX, gridY);
    } else if (tool === 'enemy') {
      isValid = canPlaceEnemyAtGrid(level, gridX, gridY);
    }

    editorState.hover = { tool, gridX, gridY, isValid };
        });

  editorCanvas.addEventListener('mouseleave', () => {
    editorState.hover = null;
  });
}

function returnToSelectTool() {
  setActiveTool('select');
  if (toolSelectBtn) setToolButtonActive(toolSelectBtn);
  editorState.hover = null;
  updatePlacementPanelForTool();
}

// ===== Editor Mouse Input: click to place or select+move =====
if (editorCanvas) {
  editorCanvas.addEventListener('mousedown', (e) => {
    if (state.mode !== 'creator') return;
    if (!editorState.currentLevel) return;
    if (editorState.isTesting) return; // NEW: no editing during test

    const rect = editorCanvas.getBoundingClientRect();
    const scaleX = editorCanvas.width / rect.width;
    const scaleY = editorCanvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const tool = editorState.activeTool;
    const level = editorState.currentLevel;

    if (tool === 'wall') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlaceWallAtGrid(level, gridX, gridY)) return;
      placeWallAtGrid(gridX, gridY);
      updateCreatorStatusFromLevel();
      returnToSelectTool();

    } else if (tool === 'spawn') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlaceSpawnAtGrid(level, gridX, gridY)) return;
      placeSpawnAtGrid(gridX, gridY);
      updateCreatorStatusFromLevel();
      returnToSelectTool();

    } else if (tool === 'portal') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlacePortalAtGrid(level, gridX, gridY)) return;
      placePortalAtGrid(gridX, gridY);
      updateCreatorStatusFromLevel();
      returnToSelectTool();

    } else if (tool === 'trap') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlaceTrapAtGrid(level, gridX, gridY)) return;
      const trapType = editorState.activeTrapType || 'fire';
      placeTrapAtGrid(gridX, gridY, trapType);
      updateCreatorStatusFromLevel();
      returnToSelectTool();

    } else if (tool === 'powerup') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlacePowerupAtGrid(level, gridX, gridY)) return;
      const powerType = editorState.activePowerupType || 'speed';
      placePowerupAtGrid(gridX, gridY, powerType);
      updateCreatorStatusFromLevel();
      returnToSelectTool();

    } else if (tool === 'key') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlaceKeyAtGrid(level, gridX, gridY)) return;
      placeKeyAtGrid(gridX, gridY);
      updateCreatorStatusFromLevel();
      returnToSelectTool();

    } else if (tool === 'door') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlaceDoorAtGrid(level, gridX, gridY)) return;
      placeDoorAtGrid(gridX, gridY, 'key');
      updateCreatorStatusFromLevel();
      returnToSelectTool();

    } else if (tool === 'switch') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlaceSwitchAtGrid(level, gridX, gridY)) return;
      placeSwitchAtGrid(gridX, gridY);
      updateCreatorStatusFromLevel();
      returnToSelectTool();

    } else if (tool === 'enemy') {
      const gridX = Math.floor(x / GRID_SIZE);
      const gridY = Math.floor(y / GRID_SIZE);
      if (!canPlaceEnemyAtGrid(level, gridX, gridY)) return;
      placeEnemyAtGrid(gridX, gridY, 'patrol');
      updateCreatorStatusFromLevel();
      returnToSelectTool();

    } else if (tool === 'select') {
      const hit = findEntityAtPixel(x, y);
      const currentSel = editorState.selectedEntity;

      if (!currentSel) {
        editorState.selectedEntity = hit;
        updateDeleteButtonState();
        updateSelectedEntityPanel();            // NEW
      } else {
        if (hit) {
          editorState.selectedEntity = hit;
          updateDeleteButtonState();
          updateSelectedEntityPanel();          // NEW
        } else {
          const gridX = Math.floor(x / GRID_SIZE);
          const gridY = Math.floor(y / GRID_SIZE);
          moveSelectedEntityToGrid(gridX, gridY);
          editorState.selectedEntity = null;
          updateDeleteButtonState();
          updateCreatorStatusFromLevel();
          updateSelectedEntityPanel();          // NEW
        }
      }
    }
  });
}

if (trapTypeSelect) {
  trapTypeSelect.addEventListener('change', (e) => {
    const level = editorState.currentLevel;
    const sel = editorState.selectedEntity;
    if (!level || !sel || sel.kind !== 'trap') return;

    const traps = level.traps || [];
    const t = traps[sel.index];
    if (!t) return;

    t.type = e.target.value || 'spike';
    updateCreatorStatusFromLevel();
  });
}

if (powerupTypeSelect) {
  powerupTypeSelect.addEventListener('change', (e) => {
    const level = editorState.currentLevel;
    const sel = editorState.selectedEntity;
    if (!level || !sel || sel.kind !== 'powerup') return;

    const powerups = level.powerups || [];
    const p = powerups[sel.index];
    if (!p) return;

    p.type = e.target.value || 'speed';
    updateCreatorStatusFromLevel();
  });
}

if (trapPlacementSelect) {
  trapPlacementSelect.addEventListener('change', (e) => {
    const val = e.target.value || 'fire';
    editorState.activeTrapType = val;

    // Optional: if a trap is selected, also change its type
    const sel = editorState.selectedEntity;
    const level = editorState.currentLevel;
    if (sel && level && sel.kind === 'trap') {
      const traps = level.traps || [];
      const t = traps[sel.index];
      if (t) {
        t.type = val;
        updateCreatorStatusFromLevel();
      }
    }
  });
}

if (powerupPlacementSelect) {
  powerupPlacementSelect.addEventListener('change', (e) => {
    const val = e.target.value || 'speed';
    editorState.activePowerupType = val;

    // Optional: if a powerup is selected, also change its type
    const sel = editorState.selectedEntity;
    const level = editorState.currentLevel;
    if (sel && level && sel.kind === 'powerup') {
      const powerups = level.powerups || [];
      const p = powerups[sel.index];
      if (p) {
        p.type = val;
        updateCreatorStatusFromLevel();
      }
    }
  });
}

// ===== Save Level Button =====
if (saveLevelBtn) {
  saveLevelBtn.addEventListener('click', () => {
    if (!editorState.currentLevel) {
      showSaveStatus('No level to save.', true);
      return;
    }

    const issues = validateLevel(editorState.currentLevel);
    if (issues.length > 0) {
      updateCreatorStatusFromLevel();
      showSaveStatus(`Fix ${issues.length} issue(s) before saving.`, true);
      return;
    }

    const payload = buildLevelPayloadForSave();
    if (!payload) {
      showSaveStatus('Unable to build level payload.', true);
      return;
    }

    const saved = upsertLevel(payload);
    if (!saved) {
      showSaveStatus('Save failed.', true);
      return;
    }

    // Ensure currentLevel reflects whatever storage returns
    if (editorState.currentLevel) {
      editorState.currentLevel.id = saved.id;
      editorState.currentLevel.name = saved.name;
    }
    syncCreatorNameUI();
    showSaveStatus('Level saved ✔', false);
  });
}

// NEW: helper for the little status line under Save Level
function showSaveStatus(message, isError = false) {
  if (!creatorSaveStatusEl) return;
  creatorSaveStatusEl.textContent = message;
  creatorSaveStatusEl.style.color = isError ? '#ef4444' : '#4ade80';

  clearTimeout(creatorSaveStatusEl._timeoutId);
  creatorSaveStatusEl._timeoutId = setTimeout(() => {
    creatorSaveStatusEl.textContent = '';
  }, 2500);
}

// ===== Virtual Joystick (touch) → 360° analog movement =====
function clearJoystickKeys() {
  state.keysDown['ArrowUp'] = false;
  state.keysDown['ArrowDown'] = false;
  state.keysDown['ArrowLeft'] = false;
  state.keysDown['ArrowRight'] = false;
  state.keysDown['w'] = false;
  state.keysDown['a'] = false;
  state.keysDown['s'] = false;
  state.keysDown['d'] = false;
}

// dx, dy are from joystick center → touch position
function applyJoystickDirection(dx, dy) {
  // Only respond while a quest is actively playing
  if (state.mode !== 'quest' || !state.quest || state.quest.status !== 'playing') {
    clearJoystickKeys();
    return;
  }

  const mag = Math.sqrt(dx * dx + dy * dy);

  // Dead zone: thumb near center = no movement
  if (mag < 10) {
    clearJoystickKeys();
    return;
  }

  const nx = dx / mag;
  const ny = dy / mag;

  // Reset keys then set 8-way based on angle
  clearJoystickKeys();

  const THRESH = 0.3; // lower → easier diagonals

  // Horizontal component
  if (nx > THRESH) {
    state.keysDown["ArrowRight"] = true;
    state.keysDown["d"] = true;
  } else if (nx < -THRESH) {
    state.keysDown["ArrowLeft"] = true;
    state.keysDown["a"] = true;
  }

  // Vertical component (note: screen Y grows downward, but engine treats
  // "ArrowUp" as up, so we keep ny sign consistent with your earlier logic)
  if (ny > THRESH) {
    state.keysDown["ArrowDown"] = true;
    state.keysDown["s"] = true;
  } else if (ny < -THRESH) {
    state.keysDown["ArrowUp"] = true;
    state.keysDown["w"] = true;
  }
}

if (joystickEl && joystickThumbEl) {
  console.log('[Joystick] found elements, setting up listeners');
  const maxRadius = 40; // how far the thumb can move from center

  joystickEl.addEventListener(
    'touchstart',
    (e) => {
      const t = e.touches[0];
      const rect = joystickEl.getBoundingClientRect();
      joystickState.active = true;
      joystickState.centerX = rect.left + rect.width / 2;
      joystickState.centerY = rect.top + rect.height / 2;
      console.log('[Joystick] touchstart');
      e.preventDefault();
    },
    { passive: false }
  );

  joystickEl.addEventListener(
    'touchmove',
    (e) => {
      if (!joystickState.active) return;
      const t = e.touches[0];

      const dx = t.clientX - joystickState.centerX;
      const dy = t.clientY - joystickState.centerY;

      // Clamp thumb movement visually
      const mag = Math.sqrt(dx * dx + dy * dy) || 1;
      const clampedMag = Math.min(mag, maxRadius);
      const cx = (dx / mag) * clampedMag;
      const cy = (dy / mag) * clampedMag;

      joystickThumbEl.style.transform = `translate(${cx}px, ${cy}px)`;

      applyJoystickDirection(dx, dy);
      e.preventDefault();
    },
    { passive: false }
  );

const endJoystick = () => {
  if (!joystickState.active) return;
  joystickState.active = false;
  joystickThumbEl.style.transform = 'translate(0, 0)';

  clearJoystickKeys();
  console.log('[Joystick] end');
};
  joystickEl.addEventListener('touchend', endJoystick, { passive: false });
  joystickEl.addEventListener('touchcancel', endJoystick, { passive: false });
} else {
  console.warn('[Joystick] elements NOT found:', joystickEl, joystickThumbEl);
}

// ===== Game Loop =====
let lastTime = 0;
let lastQuestStatus = null;

function gameLoop(timestamp) {
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (state.mode === 'quest' && ctx) {
    updateGame(state, delta);
    renderGame(ctx, state);
    updateHUDDom(state);
    handleQuestStatusForUI(state);
} else if (state.mode === 'creator' && editorCtx) {
  if (state.customTest && editorState.isTesting) {
    // In-editor test
    updateGame(state, delta);
    renderGame(editorCtx, state);

    // 🔁 Also handle quest/test status (death → auto-restart)
    handleQuestStatusForUI(state);      // ✅ NEW
  } else {
    // Normal editor view
    renderEditor(editorCtx);
  }
}

  requestAnimationFrame(gameLoop);
}

function handleQuestStatusForUI(state) {
  if (!state.quest) return;

  const status       = state.quest.status;
  const inCreatorTest = state.mode === 'creator' && state.customTest;

  // 🔁 In CREATOR TEST MODE:
  // If you "die" (gameOver), automatically restart the last tested level
  // instead of showing the Game Over screen or jumping into the real quest.
  if (inCreatorTest && status === 'gameOver') {
    if (state.lastTestLevelData) {
      // Reload exactly the level you were testing
      loadLevelDataIntoState(state, state.lastTestLevelData);
    }

    // Reset basic state for a fresh run
    state.quest.status = 'playing';
    state.quest.lives  = 3;          // or keep whatever you want for test
    state.isPaused     = false;
    state.gameOver     = false;
    state.gameWon      = false;

    // Make sure no overlays are shown
    lastQuestStatus = 'playing';
    hideAllOverlays();

    return; // ✅ stop here, nothing else to do
  }

  // Normal quest flow (non-test)
  if (status === lastQuestStatus) return;
  lastQuestStatus = status;

  if (status === 'levelComplete') {
    state.isPaused = true;
    showLevelCompleteOverlay();
  } else if (status === 'gameOver') {
    state.isPaused = true;
    showGameOverOverlay();
  } else if (status === 'questComplete') {
    state.isPaused = true;
    showQuestCompleteOverlay();
  } else if (status === 'playing') {
    hideAllOverlays();
  }
}

// ===== Boot =====
showMainMenu();
requestAnimationFrame(gameLoop);
