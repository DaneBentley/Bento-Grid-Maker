document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Setting up Bento Grid Maker script v8.3 (Panel Debug)...");

    // --- Get references to DOM elements ---
    // console.log("Getting element references...");
    const gridContainer = document.getElementById('bentoGridContainer');
    const statusMessage = document.getElementById('statusMessage');
    const globalControlsPanel = document.querySelector('.global-controls');
    const gridGapInput = document.getElementById('gridGapInput');
    const outerPaddingInput = document.getElementById('outerPaddingInput');
    const boxRadiusInput = document.getElementById('boxRadiusInput');
    const containerBgColorInput = document.getElementById('containerBgColorInput');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const addBoxPlaceholder = document.getElementById('add-box-placeholder');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Global Shadow Controls
    const globalShadowHOffsetInput = document.getElementById('global-shadowHOffset');
    const globalShadowVOffsetInput = document.getElementById('global-shadowVOffset');
    const globalShadowBlurInput = document.getElementById('global-shadowBlur');
    const globalShadowSpreadInput = document.getElementById('global-shadowSpread');
    const globalShadowColorInput = document.getElementById('global-shadowColor');
    const globalShadowOpacityInput = document.getElementById('global-shadowOpacity');
    const globalRemoveShadowBtn = document.getElementById('global-removeShadowBtn');
    const globalShadowControlsExist = globalShadowHOffsetInput && globalShadowVOffsetInput && globalShadowBlurInput && globalShadowSpreadInput && globalShadowColorInput && globalShadowOpacityInput && globalRemoveShadowBtn;

    // Panel Elements
    const editPanel = document.getElementById('editPanel');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const panelOverlay = document.getElementById('panelOverlay');
    // Panel Controls (Verify IDs in HTML match!)
    // console.log("Getting panel control references...");
    const panelBoxColorInput = document.getElementById('panel-boxColor');
    const panelDeleteBtn = document.getElementById('panel-deleteBoxBtn');
    const panelImageUrlInput = document.getElementById('panel-imageUrl');
    const panelApplyImageBtn = document.getElementById('panel-applyImageBtn');
    const panelRemoveImageBtn = document.getElementById('panel-removeImageBtn');
    const panelWidthMinusBtn = document.getElementById('panel-widthMinusBtn');
    const panelWidthPlusBtn = document.getElementById('panel-widthPlusBtn');
    const panelHeightMinusBtn = document.getElementById('panel-heightMinusBtn');
    const panelHeightPlusBtn = document.getElementById('panel-heightPlusBtn');
    const panelFontSizeInput = document.getElementById('panel-fontSizeInput');
    const panelTextColorInput = document.getElementById('panel-textColorInput');
    const panelTextBoldBtn = document.getElementById('panel-textBoldBtn');
    const panelTextItalicBtn = document.getElementById('panel-textItalicBtn');
    const panelTextUnderlineBtn = document.getElementById('panel-textUnderlineBtn');
    const panelTextAlignLeftBtn = document.getElementById('panel-textAlignLeftBtn');
    const panelTextAlignCenterBtn = document.getElementById('panel-textAlignCenterBtn');
    const panelTextAlignRightBtn = document.getElementById('panel-textAlignRightBtn');
    const panelBorderWidthInput = document.getElementById('panel-borderWidth');
    const panelBorderStyleSelect = document.getElementById('panel-borderStyle');
    const panelBorderColorInput = document.getElementById('panel-borderColor');

    // --- Initialization Check ---
    let initializationError = false;
    const essentialElements = { gridContainer, editPanel, closePanelBtn, addBoxPlaceholder, globalControlsPanel, saveBtn, loadBtn };
    for (const key in essentialElements) { if (!essentialElements[key]) { console.error(`INIT ERROR: Essential element missing - ${key}!`); initializationError = true; } }
    if (!globalShadowControlsExist) console.warn("Global shadow controls missing/incomplete.");
    if (!darkModeToggle) console.warn("Dark mode toggle missing.");
    if (!panelBoxColorInput || !panelDeleteBtn || !panelFontSizeInput || !panelWidthMinusBtn) console.warn("One or more essential PANEL control elements missing!");
    if(initializationError) { if(statusMessage) { statusMessage.textContent = "Init Error! Check Console."; statusMessage.style.color = 'red'; } return; }
    // console.log("Element references checked.");

    // --- State Variables ---
    let editingBox = null; // Box currently being edited in the modal
    let sortableInstance = null;
    const LOCAL_STORAGE_KEY = 'bentoGridDesign_v8'; // Keep consistent version

    // --- Initialization Functions ---
    function updateGlobalStyles() { try { const r=document.documentElement; if(gridGapInput) r.style.setProperty('--grid-padding',`${gridGapInput.value||0}px`); if(outerPaddingInput) r.style.setProperty('--grid-outer-padding',`${outerPaddingInput.value||0}px`); if(boxRadiusInput) r.style.setProperty('--box-border-radius',`${boxRadiusInput.value||0}px`); } catch(e){console.error(e)} }
    function updateContainerBg() { try { if(containerBgColorInput) document.documentElement.style.setProperty('--grid-background-color', containerBgColorInput.value); } catch(e){console.error(e)} }
    function applyGlobalShadowStyle() { if (!globalShadowControlsExist) return; try { const p = { hO: globalShadowHOffsetInput.value||0, vO: globalShadowVOffsetInput.value||0, b: Math.max(0,parseInt(globalShadowBlurInput.value)||0), s: globalShadowSpreadInput.value||0, c: globalShadowColorInput.value||'#000000', op: parseFloat(globalShadowOpacityInput.value)||0 }; let str = 'none'; if (p.op > 0) { const rgba = hexToRgba(p.c, p.op); str = `${p.hO}px ${p.vO}px ${p.b}px ${p.s}px ${rgba}`; } /*console.log("Applying global shadow:", str);*/ document.documentElement.style.setProperty('--box-shadow-global', str); } catch (error) { console.error("Error applying global shadow style:", error); } }
    function initializeSortable() { if(!gridContainer)return; if(sortableInstance)sortableInstance.destroy(); try{sortableInstance=new Sortable(gridContainer,{animation:150,ghostClass:'sortable-ghost',dragClass:'sortable-drag',filter:'#add-box-placeholder',onEnd:()=>{}}); console.log("SortableJS Initialized/Re-initialized.");} catch(e){console.error(e)} }
    function applyTheme(theme) { if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode'); if (darkModeToggle) darkModeToggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode'; /*console.log(`Applied ${theme} mode`);*/ }
    function toggleDarkMode() { let current = localStorage.getItem('theme')||'light'; let next = current==='light'?'dark':'light'; localStorage.setItem('theme', next); applyTheme(next); }
    function applyInitialTheme() { applyTheme(localStorage.getItem('theme')||'light'); }

    // --- Initial Setup Calls ---
    // console.log("Performing initial setup calls...");
    try { applyInitialTheme(); updateGlobalStyles(); updateContainerBg(); applyGlobalShadowStyle(); initializeSortable(); console.log("Initial setup complete."); }
    catch (error) { console.error("Error during initial setup calls:", error); if(statusMessage){ statusMessage.textContent = "Init Error! Check Console."; statusMessage.style.color = 'red'; } return; }

    // --- Event Listeners ---
    // console.log("Attaching event listeners...");
    try {
        // Global Controls
        if(gridGapInput) gridGapInput.addEventListener('input', updateGlobalStyles);
        if(outerPaddingInput) outerPaddingInput.addEventListener('input', updateGlobalStyles);
        if(boxRadiusInput) boxRadiusInput.addEventListener('input', updateGlobalStyles);
        if(containerBgColorInput) containerBgColorInput.addEventListener('input', updateContainerBg);
        if(saveBtn) saveBtn.addEventListener('click', saveDesign);
        if(loadBtn) loadBtn.addEventListener('click', loadDesign);

        // Global Shadow
        if (globalShadowControlsExist) { globalShadowHOffsetInput.addEventListener('input', applyGlobalShadowStyle); globalShadowVOffsetInput.addEventListener('input', applyGlobalShadowStyle); globalShadowBlurInput.addEventListener('input', applyGlobalShadowStyle); globalShadowSpreadInput.addEventListener('input', applyGlobalShadowStyle); globalShadowColorInput.addEventListener('input', applyGlobalShadowStyle); globalShadowOpacityInput.addEventListener('input', applyGlobalShadowStyle); globalRemoveShadowBtn.addEventListener('click', () => { globalShadowHOffsetInput.value=0; globalShadowVOffsetInput.value=0; globalShadowBlurInput.value=0; globalShadowSpreadInput.value=0; globalShadowColorInput.value='#000000'; globalShadowOpacityInput.value=0; applyGlobalShadowStyle(); }); }
        // Dark Mode
        if (darkModeToggle) { darkModeToggle.addEventListener('click', toggleDarkMode); }

        // Add Box Placeholder
        if (addBoxPlaceholder) {
            addBoxPlaceholder.addEventListener('click', () => {
                // console.log("Add Box Placeholder CLICKED!");
                try { const newBox = createNewBoxElement(); if (newBox && gridContainer && addBoxPlaceholder) { gridContainer.insertBefore(newBox, addBoxPlaceholder); } else { console.error("Failed to insert new box."); } } catch (error) { console.error("Error adding box:", error); }
            });
            // console.log("Add box listener attached.");
        } else { console.error("Add box listener NOT attached - placeholder not found earlier."); }

        // Panel Close Listeners
        if(closePanelBtn) closePanelBtn.addEventListener('click', closeEditPanel);
        if(panelOverlay) panelOverlay.addEventListener('click', closeEditPanel);
        if(editPanel) editPanel.addEventListener('click', (event) => { if (event.target !== editPanel) event.stopPropagation(); });

        // Setup Panel Control Listeners
        setupPanelControlListeners(); // Function defined below

        // console.log("Event listeners attached successfully."); // Keep this? Maybe remove if setupPanelControlListeners logs success.
    } catch (error) { console.error("Error attaching listeners:", error); if(statusMessage){ statusMessage.textContent = "Listener Setup Error!"; statusMessage.style.color = 'red'; } }

    // --- Core Functions ---
    function createNewBoxElement() {
        // console.log("Executing createNewBoxElement...");
        let newBox;
        try {
            newBox = document.createElement('div'); newBox.classList.add('bento-box');
            const contentWrapper = document.createElement('div'); contentWrapper.classList.add('content-wrapper'); contentWrapper.innerHTML = ''; contentWrapper.setAttribute('contenteditable', 'true'); contentWrapper.style.textAlign = 'left'; contentWrapper.style.fontSize = '16px'; contentWrapper.style.color = '#333333'; newBox.appendChild(contentWrapper);
            newBox.addEventListener('dblclick', () => { openEditPanel(newBox); });
            contentWrapper.addEventListener('focus', () => { newBox.classList.add('editing-text'); }); contentWrapper.addEventListener('blur', () => { newBox.classList.remove('editing-text'); });
            newBox.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--box-default-bg').trim() || '#eeeeee'; newBox.style.border = '1px solid transparent'; newBox.style.gridColumnEnd = 'span 1'; newBox.style.gridRowEnd = 'span 1';
        } catch(error) { console.error("Error inside createNewBoxElement:", error); return null; }
        return newBox;
    }

    function openEditPanel(boxElement) {
        if (!boxElement || boxElement.id === 'add-box-placeholder' || !editPanel) return;
        console.log(`Opening panel for box:`, boxElement); // Keep this log
        editingBox = boxElement; // Set state FIRST

        try { // Populate controls
            const computedStyle = getComputedStyle(editingBox);
            const contentWrapper = editingBox.querySelector('.content-wrapper');
            const computedContentStyle = contentWrapper ? getComputedStyle(contentWrapper) : null;

            if (panelBoxColorInput) panelBoxColorInput.value = rgbToHex(editingBox.style.backgroundColor || computedStyle.backgroundColor);
            if (panelBorderColorInput) panelBorderColorInput.value = rgbToHex(editingBox.style.borderColor || computedStyle.borderColor);
            if (panelTextColorInput && computedContentStyle) panelTextColorInput.value = rgbToHex(contentWrapper.style.color || computedContentStyle.color);
            if (panelImageUrlInput) { const img = editingBox.querySelector('img'); panelImageUrlInput.value = img ? img.src : ''; }
            if (panelFontSizeInput && computedContentStyle) panelFontSizeInput.value = parseInt(contentWrapper.style.fontSize || computedContentStyle.fontSize) || 16;
            if (panelBorderWidthInput) panelBorderWidthInput.value = parseInt(editingBox.style.borderWidth || computedStyle.borderWidth) || 0;
            if (panelBorderStyleSelect) panelBorderStyleSelect.value = editingBox.style.borderStyle || computedStyle.borderStyle || 'none';
            updateResizeButtonStates(); // Update based on editingBox

            editPanel.classList.add('is-open'); // Show panel
            if (panelOverlay) panelOverlay.classList.add('is-open'); // Show overlay
            console.log("Edit panel opened and populated."); // Keep this log

        } catch(error) { console.error("Error populating edit panel:", error); showStatus("Error opening edit options.", true); closeEditPanel(); }
    }

    function closeEditPanel() {
        if (editPanel) editPanel.classList.remove('is-open');
        if (panelOverlay) panelOverlay.classList.remove('is-open');
        if (editingBox) { const cw = editingBox.querySelector('.content-wrapper'); if (cw && document.activeElement === cw) { cw.blur(); } }
        // console.log("Clearing editingBox reference."); // Optional log
        editingBox = null; // Clear editing state
    }

    function setupPanelControlListeners() {
         const controlsMap = {
             'panel-boxColor': handleColorChange, 'panel-deleteBoxBtn': handleDeleteBox,
             'panel-applyImageBtn': handleApplyImage, 'panel-removeImageBtn': handleRemoveImage,
             'panel-widthMinusBtn': () => handleResize('width', -1), 'panel-widthPlusBtn': () => handleResize('width', 1),
             'panel-heightMinusBtn': () => handleResize('height', -1), 'panel-heightPlusBtn': () => handleResize('height', 1),
             'panel-textBoldBtn': () => formatText('bold'), 'panel-textItalicBtn': () => formatText('italic'),
             'panel-textUnderlineBtn': () => formatText('underline'), 'panel-textAlignLeftBtn': () => alignText('left'),
             'panel-textAlignCenterBtn': () => alignText('center'), 'panel-textAlignRightBtn': () => alignText('right'),
             'panel-fontSizeInput': handleFontSizeChange, 'panel-textColorInput': handleTextColorChange,
             'panel-borderWidth': handleBorderChange, 'panel-borderStyle': handleBorderChange, 'panel-borderColor': handleBorderChange,
         };
         const eventType = (el) => { if (!el) return 'click'; const tag = el.tagName; const type = el.type; if ((tag === 'INPUT' && (type === 'number' || type === 'color' || type === 'range' || type === 'url' || type === 'text')) || tag === 'SELECT') { return 'input'; } return 'click'; };

         let listenerCount = 0;
         let missingControls = []; // Keep track of missing controls
         // console.log("Attaching panel control listeners...");
         for (const id in controlsMap) {
             const element = document.getElementById(id);
             const handler = controlsMap[id];
             if (element && typeof handler === 'function') {
                 element.addEventListener(eventType(element), (event) => {
                     // Log when handler is triggered AND if editingBox is valid
                     console.log(`Panel Control Action: ${id}. editingBox is valid: ${!!editingBox}`); // DIAGNOSTIC
                     if (!editingBox) {
                         console.warn(`Action "${id}" triggered but NO BOX IS BEING EDITED!`);
                         // Maybe close the panel if this happens?
                         // closeEditPanel();
                         return;
                     }
                     try {
                        handler(event); // Call the actual handler
                        // Optional: Log success? console.log(`Handler for ${id} executed.`);
                     } catch (error) { console.error(`Error in panel handler for "${id}":`, error); }
                 });
                 listenerCount++;
             } else {
                 if (!element) missingControls.push(id); // Track missing elements
                 if (typeof handler !== 'function') console.error(`Handler is not a function for panel ID: ${id}`);
             }
         }
         if (missingControls.length > 0) {
             console.error(`Failed to attach listeners: Panel control elements missing for IDs: ${missingControls.join(', ')}`);
         }
         console.log(`Attached ${listenerCount} panel control listeners.`); // Keep confirmation log
    }


    // --- Event Handler Functions (Add logging, check editingBox) ---
    function handleColorChange() { console.log("handleColorChange Fired."); try { if (!editingBox || !panelBoxColorInput) return; editingBox.style.backgroundColor = panelBoxColorInput.value; console.log("Applied BG Color:", panelBoxColorInput.value); handleRemoveImage(false); } catch(e){console.error(e)} }
    function handleDeleteBox() { console.log("handleDeleteBox Fired."); try { if (!editingBox) return; editingBox.remove(); closeEditPanel(); console.log("Deleted box."); } catch(e){console.error(e)} }
    function handleApplyImage() { console.log("handleApplyImage Fired."); try { if (!editingBox || !panelImageUrlInput || !panelImageUrlInput.value.trim()) return; const url = panelImageUrlInput.value.trim(); handleRemoveImage(false); const img = document.createElement('img'); img.src = url; img.alt = 'User provided image'; img.onerror = () => { img.remove(); showStatus("Error loading image.", true); }; editingBox.insertBefore(img, editingBox.firstChild); editingBox.style.backgroundColor = 'transparent'; console.log("Applied image:", url); } catch(e){console.error(e)} }
    function handleRemoveImage(restoreColor = true) { console.log("handleRemoveImage Fired."); try { if (!editingBox) return; const img = editingBox.querySelector('img'); if (img) { img.remove(); if(panelImageUrlInput) panelImageUrlInput.value = ''; if (restoreColor && panelBoxColorInput) { editingBox.style.backgroundColor = panelBoxColorInput.value; } console.log("Removed image."); } } catch(e){console.error(e)} }
    function handleResize(dimension, delta) { console.log(`handleResize ${dimension} by ${delta}.`); try { if (!editingBox) return; const property = dimension === 'width' ? 'gridColumnEnd' : 'gridRowEnd'; let currentSpan = getSpanValue(editingBox, property); let newSpan = Math.max(1, currentSpan + delta); editingBox.style[property] = `span ${newSpan}`; console.log(`Applied style: ${property} = span ${newSpan}`); updateResizeButtonStates(); } catch(e){console.error("handleResize error:",e)} }
    function handleFontSizeChange() { console.log("handleFontSizeChange Fired."); try { if (!editingBox || !panelFontSizeInput) return; const cw = editingBox.querySelector('.content-wrapper'); if (cw) { const size = Math.max(8, parseInt(panelFontSizeInput.value) || 16); cw.style.fontSize = `${size}px`; panelFontSizeInput.value = size; console.log("Applied font size:", size); } } catch(e){console.error(e)} }
    function formatText(command, value = null) { console.log(`formatText '${command}' Fired.`); try { if (!editingBox) return; const cw = editingBox.querySelector('.content-wrapper'); if (cw) { cw.focus(); setTimeout(() => { if (document.activeElement === cw) { try{ document.execCommand(command, false, value); console.log(`execCommand '${command}' attempted.`); } catch(e){console.warn("execCommand failed:", e)} } }, 0); } } catch(e){console.error(e)} }
    function alignText(alignment) { console.log(`alignText '${alignment}' Fired.`); try { if (!editingBox) return; const cw = editingBox.querySelector('.content-wrapper'); if (cw) { cw.style.textAlign = alignment; cw.focus(); console.log(`Text align set to ${alignment}`); } } catch(e){console.error(e)} }
    function handleBorderChange() { console.log("handleBorderChange Fired."); try { if (!editingBox || !panelBorderWidthInput || !panelBorderStyleSelect || !panelBorderColorInput) return; const width = Math.max(0, parseInt(panelBorderWidthInput.value) || 0); const style = panelBorderStyleSelect.value; const color = panelBorderColorInput.value; if (style === 'none' || width === 0) { editingBox.style.border = '1px solid transparent'; } else { editingBox.style.border = `${width}px ${style} ${color}`; } console.log("Border applied:", editingBox.style.border); } catch(e){console.error(e)} }
    function handleTextColorChange() { console.log("handleTextColorChange Fired."); try { if (!editingBox || !panelTextColorInput) return; const cw = editingBox.querySelector('.content-wrapper'); if (cw) { cw.style.color = panelTextColorInput.value; console.log("Text color applied:", panelTextColorInput.value); } } catch(e){console.error(e)} }


    // --- Save & Load Functions ---
    function saveDesign() { /* ... (Ensure full version included) ... */ }
    function loadDesign() { /* ... (Ensure full version included, calls initializeSortable) ... */ }

    // --- Helper Functions ---
    function showStatus(message, isError = false) { /* ... */ }
    function getSpanValue(element, property) { /* ... */ }
    function updateResizeButtonStates() { /* ... (Uses panel button refs) ... */ }
    function rgbToHex(colorString) { /* ... (Robust version) ... */ }
    function hexToRgba(hex, alpha = 1) { /* ... (Robust version) ... */ }

    // --- Final Log ---
    if (!initializationError) console.log(`Bento Grid Maker script v${LOCAL_STORAGE_KEY.split('_v')[1]} initialized successfully.`);

    // === PASTE FULL Function Definitions Here ===
    // (Make sure the bodies for functions marked /* ... */ are complete)
    function updateGlobalStyles() { try { const r=document.documentElement; if(gridGapInput) r.style.setProperty('--grid-padding',`${gridGapInput.value||0}px`); if(outerPaddingInput) r.style.setProperty('--grid-outer-padding',`${outerPaddingInput.value||0}px`); if(boxRadiusInput) r.style.setProperty('--box-border-radius',`${boxRadiusInput.value||0}px`); } catch(e){console.error(e)} }
    function updateContainerBg() { try { if(containerBgColorInput) document.documentElement.style.setProperty('--grid-background-color', containerBgColorInput.value); } catch(e){console.error(e)} }
    function applyGlobalShadowStyle() { if (!globalShadowControlsExist) return; try { const p = { hO: globalShadowHOffsetInput.value||0, vO: globalShadowVOffsetInput.value||0, b: Math.max(0,parseInt(globalShadowBlurInput.value)||0), s: globalShadowSpreadInput.value||0, c: globalShadowColorInput.value||'#000000', op: parseFloat(globalShadowOpacityInput.value)||0 }; let str = 'none'; if (p.op > 0) { const rgba = hexToRgba(p.c, p.op); str = `${p.hO}px ${p.vO}px ${p.b}px ${p.s}px ${rgba}`; } console.log("Applying global shadow:", str); document.documentElement.style.setProperty('--box-shadow-global', str); } catch (error) { console.error("Error applying global shadow style:", error); } }
    function initializeSortable() { if (!gridContainer) { console.error("Cannot initialize Sortable: gridContainer not found."); return; } if (sortableInstance) sortableInstance.destroy(); try { sortableInstance = new Sortable(gridContainer, { animation: 150, ghostClass: 'sortable-ghost', dragClass: 'sortable-drag', filter: '#add-box-placeholder', onEnd: ()=>{ saveDesign(); /* Optional: Autosave after drag */ }, }); console.log("SortableJS Initialized/Re-initialized."); } catch(e){console.error("Error initializing SortableJS:",e)} }
    function applyTheme(theme) { if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode'); if (darkModeToggle) darkModeToggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode'; /*console.log(`Applied ${theme} mode`);*/ }
    function toggleDarkMode() { let current = localStorage.getItem('theme')||'light'; let next = current==='light'?'dark':'light'; localStorage.setItem('theme', next); applyTheme(next); }
    function applyInitialTheme() { applyTheme(localStorage.getItem('theme')||'light'); }
    function saveDesign() { console.log("Saving design..."); const boxesData = []; if (gridContainer) { gridContainer.querySelectorAll('.bento-box:not(#add-box-placeholder)').forEach(box => { try { const contentWrapper = box.querySelector('.content-wrapper'); const img = box.querySelector('img'); const styles = box.style; const computedContentStyle = contentWrapper ? getComputedStyle(contentWrapper) : null; boxesData.push({ htmlContent: contentWrapper?.innerHTML || '', textAlign: contentWrapper?.style.textAlign || 'left', fontSize: contentWrapper?.style.fontSize || '16px', textColor: contentWrapper?.style.color || computedContentStyle?.color || '#333333', backgroundColor: styles.backgroundColor, backgroundImage: img?.src || null, gridColumnEnd: styles.gridColumnEnd || 'span 1', gridRowEnd: styles.gridRowEnd || 'span 1', borderWidth: styles.borderWidth || '0px', borderStyle: styles.borderStyle || 'none', borderColor: styles.borderColor || '#000000' }); } catch (e) { console.error("Error processing box for save:", box, e); } }); } let globalShadowParams = { opacity: 0 }; if(globalShadowControlsExist) { globalShadowParams = { hOffset: globalShadowHOffsetInput.value||0, vOffset: globalShadowVOffsetInput.value||0, blur: globalShadowBlurInput.value||0, spread: globalShadowSpreadInput.value||0, color: globalShadowColorInput.value||'#000000', opacity: globalShadowOpacityInput.value||0 }; } const globalSettings = { gap: gridGapInput?.value ?? 10, outerPadding: outerPaddingInput?.value ?? 10, radius: boxRadiusInput?.value ?? 8, containerBgColor: containerBgColorInput?.value ?? '#e8edf0', shadowParams: globalShadowParams }; const saveData = { boxes: boxesData, settings: globalSettings }; try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData)); showStatus('Design saved successfully!'); } catch (error) { console.error("Error saving:", error); showStatus(`Error saving: ${error.message}`, true); } }
    function loadDesign() { console.log("Loading design..."); const savedDataJSON = localStorage.getItem(LOCAL_STORAGE_KEY); if (!savedDataJSON) { showStatus('No saved design found.', true); return; } try { const savedData = JSON.parse(savedDataJSON); if(gridContainer) gridContainer.querySelectorAll('.bento-box:not(#add-box-placeholder)').forEach(box => box.remove()); closeEditPanel(); if(gridGapInput) gridGapInput.value = savedData.settings?.gap ?? 10; if(outerPaddingInput) outerPaddingInput.value = savedData.settings?.outerPadding ?? 10; if(boxRadiusInput) boxRadiusInput.value = savedData.settings?.radius ?? 8; if(containerBgColorInput) containerBgColorInput.value = savedData.settings?.containerBgColor ?? '#e8edf0'; updateGlobalStyles(); updateContainerBg(); const loadedShadowParams = savedData.settings?.shadowParams || { opacity: 0 }; if(globalShadowControlsExist) { globalShadowHOffsetInput.value = loadedShadowParams.hOffset ?? 0; globalShadowVOffsetInput.value = loadedShadowParams.vOffset ?? 0; globalShadowBlurInput.value = loadedShadowParams.blur ?? 0; globalShadowSpreadInput.value = loadedShadowParams.spread ?? 0; globalShadowColorInput.value = loadedShadowParams.color ?? '#000000'; globalShadowOpacityInput.value = loadedShadowParams.opacity ?? 0; } applyGlobalShadowStyle(); if (savedData.boxes && Array.isArray(savedData.boxes) && gridContainer) { savedData.boxes.forEach(boxData => { try { const newBox = createNewBoxElement(); const contentWrapper = newBox.querySelector('.content-wrapper'); if (contentWrapper) { contentWrapper.innerHTML = boxData.htmlContent || ''; contentWrapper.style.textAlign = boxData.textAlign || 'left'; contentWrapper.style.fontSize = boxData.fontSize || '16px'; contentWrapper.style.color = boxData.textColor || '#333333'; } newBox.style.gridColumnEnd = boxData.gridColumnEnd || 'span 1'; newBox.style.gridRowEnd = boxData.gridRowEnd || 'span 1'; if (boxData.backgroundImage) { const img = document.createElement('img'); img.src = boxData.backgroundImage; img.alt = 'Saved image'; img.onerror = () => img.remove(); newBox.insertBefore(img, newBox.firstChild); newBox.style.backgroundColor = 'transparent'; } else { newBox.style.backgroundColor = boxData.backgroundColor || 'var(--box-default-bg)'; } const bw = boxData.borderWidth || '0px'; const bs = boxData.borderStyle || 'none'; if (bs !== 'none' && parseInt(bw) > 0) { newBox.style.border = `${bw} ${bs} ${boxData.borderColor || '#000000'}`; } else { newBox.style.border = '1px solid transparent'; } if(addBoxPlaceholder) gridContainer.insertBefore(newBox, addBoxPlaceholder); } catch(e) { console.error("Error recreating box during load:", boxData, e); } }); } initializeSortable(); /* Ensure Sortable re-init after load */ showStatus('Design loaded successfully!'); } catch (error) { console.error("Error loading design:", error); showStatus(`Error loading design: ${error.message}`, true); localStorage.removeItem(LOCAL_STORAGE_KEY); } }
    function showStatus(message, isError = false) { if(statusMessage) { statusMessage.textContent = message; statusMessage.style.color = isError ? '#dc2626' : '#16a34a'; setTimeout(() => { if(statusMessage) statusMessage.textContent = ''; }, 3000); } }
    function getSpanValue(element, property) { const styleValue = element?.style[property]; if (styleValue && styleValue.includes('span')) { try { return parseInt(styleValue.split(' ')[1]) || 1; } catch { return 1; } } return 1; }
    function updateResizeButtonStates() { if (!editingBox || !panelWidthMinusBtn || !panelHeightMinusBtn) return; try{ panelWidthMinusBtn.disabled = getSpanValue(editingBox, 'gridColumnEnd') <= 1; panelHeightMinusBtn.disabled = getSpanValue(editingBox, 'gridRowEnd') <= 1; } catch(e){console.error(e)} }
    function rgbToHex(colorString) { const DEFAULT = '#eeeeee'; if (!colorString || typeof colorString !== 'string') { return DEFAULT; } const trimmed = colorString.trim().toLowerCase(); if (trimmed === 'transparent') { return '#ffffff'; } const match = trimmed.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:,\s*[\d.]+)?\)/); if (match) { try { let r = parseInt(match[1]).toString(16).padStart(2, '0'); let g = parseInt(match[2]).toString(16).padStart(2, '0'); let b = parseInt(match[3]).toString(16).padStart(2, '0'); return `#${r}${g}${b}`; } catch (e) { /* console.error("rgbToHex Error:", e); */ return DEFAULT; } } if (/^#[0-9a-f]{3,6}$/i.test(trimmed)) { if(trimmed.length === 4) { return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`; } return trimmed; } const names={'white':'#ffffff','black':'#000000','red':'#ff0000','green':'#008000','blue':'#0000ff',}; if (names[trimmed]) return names[trimmed]; return DEFAULT; }
    function hexToRgba(hex, alpha = 1) { if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) { return `rgba(0, 0, 0, ${alpha})`; } let r=0,g=0,b=0; try { if (hex.length===4) { r=parseInt(hex[1]+hex[1],16); g=parseInt(hex[2]+hex[2],16); b=parseInt(hex[3]+hex[3],16); } else if (hex.length===7) { r=parseInt(hex.substring(1,3),16); g=parseInt(hex.substring(3,5),16); b=parseInt(hex.substring(5,7),16); } else { throw new Error("Invalid hex"); } return `rgba(${r},${g},${b},${alpha})`; } catch (e) { console.error("Invalid hex for RGBA:", hex, e); return `rgba(0,0,0,${alpha})`; } }

}); // End of DOMContentLoaded