/* infographic-maker.js — UMD build for Carrd embed
 *
 * OSRS-style infographic creator with:
 * - Layer-based canvas editing
 * - Image upload and positioning
 * - Pre-built OSRS panels and shapes
 * - RuneScape-style fonts
 * - Export to PNG
 *
 * Exposes: `InfographicMaker.mount(selectorOrEl, options)`
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.InfographicMaker = factory();
  }
})(this, function () {
  const CSS_ID = 'infographic-maker-styles';

  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
    
    /* OSRS-style font */
    @font-face {
      font-family: 'RuneScape UF';
      src: url('https://cdn.jsdelivr.net/gh/y-u-m-e/yume-tools@8f91a2e/dist/infographic-maker/assets/fonts/runescape_uf.ttf') format('truetype');
      font-display: swap;
      font-weight: normal;
      font-style: normal;
    }
    
    /* Fallback if font fails */
    .runescape-font {
      font-family: 'RuneScape UF', 'Trebuchet MS', 'Arial Black', sans-serif;
    }

    /* Override Carrd container constraints */
    #infographic-root,
    #infographic-root > *,
    [id*="infographic"] {
      max-width: none !important;
      width: 100% !important;
    }
    
    /* Force parent containers to expand */
    #infographic-root {
      position: relative !important;
      width: calc(100vw - 60px) !important;
      max-width: 1600px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
    }

    #infographic-maker {
      font-family: 'Outfit', sans-serif;
      width: 100%;
      height: calc(100vh - 100px);
      min-height: 500px;
      padding: 20px;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(20, 60, 60, 0.7) 0%, rgba(25, 50, 80, 0.7) 100%);
      backdrop-filter: blur(12px);
      border-radius: 16px;
      border: 1px solid rgba(94, 234, 212, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      color: #eee;
    }
    #infographic-maker * { box-sizing: border-box; }
    
    #infographic-maker h2 {
      margin: 0 0 20px 0;
      color: #5eead4;
      text-align: center;
      font-weight: 600;
    }

    .im-container {
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr) 220px;
      gap: 15px;
      height: calc(100% - 60px);
      min-height: 400px;
    }

    /* Sidebar - Tools & Layers */
    .im-sidebar {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100%;
      overflow-y: auto;
    }

    .im-panel {
      background: rgba(15, 40, 50, 0.6);
      border-radius: 12px;
      border: 1px solid rgba(94, 234, 212, 0.15);
      overflow: hidden;
    }

    .im-panel-header {
      padding: 12px 15px;
      background: rgba(94, 234, 212, 0.1);
      font-weight: 600;
      font-size: 14px;
      color: #5eead4;
      border-bottom: 1px solid rgba(94, 234, 212, 0.1);
    }

    .im-panel-content {
      padding: 12px;
    }

    /* Tool buttons */
    .im-tools {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .im-tool-btn {
      padding: 12px 8px;
      background: rgba(94, 234, 212, 0.1);
      border: 1px solid rgba(94, 234, 212, 0.2);
      border-radius: 8px;
      color: #eee;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-family: inherit;
    }

    .im-tool-btn:hover {
      background: rgba(94, 234, 212, 0.2);
      border-color: rgba(94, 234, 212, 0.4);
    }

    .im-tool-btn.active {
      background: linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%);
      color: #0f2935;
      border-color: transparent;
    }

    .im-tool-btn .icon {
      font-size: 20px;
    }

    /* Preset shapes */
    .im-presets {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .im-preset-btn {
      padding: 10px;
      background: rgba(30, 30, 30, 0.8);
      border: 2px solid #3d3428;
      border-radius: 4px;
      color: #ff981f;
      font-family: 'RuneScape UF', 'Trebuchet MS', sans-serif;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .im-preset-btn:hover {
      border-color: #ff981f;
      transform: scale(1.02);
    }

    /* Layer list */
    .im-layers {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 300px;
      overflow-y: auto;
    }

    .im-layer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: rgba(15, 40, 50, 0.5);
      border-radius: 6px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
    }

    .im-layer:hover {
      background: rgba(94, 234, 212, 0.1);
    }

    .im-layer.selected {
      border-color: #5eead4;
      background: rgba(94, 234, 212, 0.15);
    }

    .im-layer-thumb {
      width: 32px;
      height: 32px;
      background: rgba(0,0,0,0.3);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .im-layer-info {
      flex: 1;
      min-width: 0;
    }

    .im-layer-name {
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .im-layer-type {
      font-size: 10px;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
    }

    .im-layer-actions {
      display: flex;
      gap: 4px;
    }

    .im-layer-btn {
      width: 24px;
      height: 24px;
      background: rgba(255,255,255,0.1);
      border: none;
      border-radius: 4px;
      color: #eee;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }

    .im-layer-btn:hover {
      background: rgba(255,255,255,0.2);
    }

    .im-layer-btn.delete:hover {
      background: rgba(239, 68, 68, 0.5);
    }
    
    .im-layer-btn.active {
      background: rgba(94, 234, 212, 0.3);
      color: #5eead4;
    }
    
    .im-layer.locked {
      opacity: 0.7;
    }
    
    .im-layer.locked .im-layer-thumb {
      background: rgba(94, 234, 212, 0.2);
    }

    /* Canvas area */
    .im-canvas-area {
      display: flex;
      flex-direction: column;
      gap: 10px;
      height: 100%;
      overflow: hidden;
    }

    .im-canvas-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      padding: 10px 15px;
      background: rgba(15, 40, 50, 0.6);
      border-radius: 10px;
      border: 1px solid rgba(94, 234, 212, 0.15);
    }

    .im-canvas-toolbar select,
    .im-canvas-toolbar input {
      padding: 8px 12px;
      background: rgba(15, 40, 50, 0.8);
      border: 1px solid rgba(94, 234, 212, 0.3);
      border-radius: 6px;
      color: #eee;
      font-size: 13px;
      font-family: inherit;
    }

    .im-canvas-toolbar label {
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      white-space: nowrap;
    }

    .im-toolbar-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .im-toolbar-divider {
      width: 1px;
      height: 30px;
      background: rgba(94, 234, 212, 0.2);
      margin: 0 5px;
    }
    
    .im-custom-size-inputs {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
    }
    
    .im-custom-size-inputs input {
      padding: 6px 8px;
      background: rgba(15, 40, 50, 0.8);
      border: 1px solid rgba(94, 234, 212, 0.3);
      border-radius: 6px;
      color: #eee;
      font-size: 12px;
      font-family: inherit;
    }
    
    .im-custom-size-inputs span {
      color: rgba(255,255,255,0.5);
    }
    
    .im-btn-sm {
      padding: 6px 12px !important;
      font-size: 11px !important;
    }
    
    .im-export-btns {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    
    /* Mobile props toggle - hidden by default, styled for when visible */
    .im-mobile-props-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 6px;
      position: absolute;
      bottom: 10px;
      left: 10px;
      z-index: 999;
      padding: 12px 18px;
      background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 50px;
      color: #fff;
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(20, 184, 166, 0.5);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .im-mobile-props-toggle:active {
      transform: scale(0.95);
    }
    
    .im-mobile-props-toggle.open {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5);
    }
    
    /* Mobile props header - hidden by default */
    .im-props-mobile-header {
      display: none;
    }

    .im-canvas-wrap {
      flex: 1;
      background: repeating-conic-gradient(#1a1a1a 0% 25%, #222 0% 50%) 50% / 20px 20px;
      border-radius: 10px;
      overflow: hidden;
      padding: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      height: 100%;
    }

    .im-canvas-container {
      position: relative;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      max-width: 100%;
      max-height: 100%;
    }

    #im-canvas {
      display: block;
      cursor: crosshair;
    }

    /* Properties panel */
    .im-properties {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100%;
      overflow-y: auto;
      min-width: 200px;
    }

    #im-props-panel {
      max-height: 100%;
      overflow: hidden;
    }

    #im-props-content {
      max-height: calc(100vh - 400px);
      overflow-y: auto;
      padding-right: 5px;
    }

    .im-prop-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px;
      background: rgba(15, 40, 50, 0.4);
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .im-prop-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .im-prop-label {
      font-size: 11px;
      color: rgba(255,255,255,0.6);
      width: 50px;
      flex-shrink: 0;
    }
    
    .im-checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 12px;
      color: rgba(255,255,255,0.8);
    }
    
    .im-checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #5eead4;
      cursor: pointer;
    }
    
    .im-slider {
      flex: 1;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(94, 234, 212, 0.2);
      border-radius: 3px;
      outline: none;
      cursor: pointer;
    }
    
    .im-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%);
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .im-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%);
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .im-slider-value {
      min-width: 40px;
      text-align: right;
      font-size: 11px;
      color: #5eead4;
      font-family: monospace;
    }

    .im-prop-input {
      flex: 1;
      min-width: 60px;
      padding: 6px 8px;
      background: rgba(15, 40, 50, 0.8);
      border: 1px solid rgba(94, 234, 212, 0.3);
      border-radius: 6px;
      color: #eee;
      font-size: 12px;
      font-family: inherit;
    }

    .im-prop-input:focus {
      outline: none;
      border-color: #5eead4;
    }

    .im-color-input {
      width: 32px;
      height: 28px;
      padding: 2px;
      border-radius: 6px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .im-btn {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      transition: all 0.2s;
    }

    .im-btn-primary {
      background: linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%);
      color: #0f2935;
    }

    .im-btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(94, 234, 212, 0.3);
    }

    .im-btn-secondary {
      background: rgba(94, 234, 212, 0.15);
      color: #5eead4;
      border: 1px solid rgba(94, 234, 212, 0.3);
    }

    .im-btn-secondary:hover {
      background: rgba(94, 234, 212, 0.25);
    }

    .im-btn-danger {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .im-btn-danger:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .im-btn-block {
      width: 100%;
    }

    /* Text area for multiline */
    .im-prop-textarea {
      width: 100%;
      min-height: 80px;
      padding: 10px;
      background: rgba(15, 40, 50, 0.8);
      border: 1px solid rgba(94, 234, 212, 0.3);
      border-radius: 6px;
      color: #eee;
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
    }

    /* Upload area */
    .im-upload-area {
      border: 2px dashed rgba(94, 234, 212, 0.3);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .im-upload-area:hover {
      border-color: #5eead4;
      background: rgba(94, 234, 212, 0.05);
    }

    .im-upload-area .icon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .im-upload-area p {
      font-size: 12px;
      color: rgba(255,255,255,0.5);
      margin: 0;
    }

    /* Hidden file input */
    .im-file-input {
      display: none;
    }

    /* Selection handles would be drawn on canvas */
    
    /* Export buttons */
    .im-export-btns {
      display: flex;
      gap: 8px;
    }

    /* Responsive - Tablet */
    /* Medium screens - toolbar wraps */
    @media (max-width: 1100px) {
      .im-canvas-toolbar {
        gap: 8px;
        padding: 10px;
      }
      .im-toolbar-divider {
        display: none;
      }
      .im-toolbar-group {
        flex: 0 0 auto;
      }
      .im-export-btns {
        flex: 1 1 100%;
        justify-content: flex-end;
        margin-top: 5px;
      }
    }

    @media (max-width: 1200px) {
      .im-container {
        grid-template-columns: 220px 1fr;
      }
      .im-properties {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 80vh;
        max-height: 80vh;
        background: linear-gradient(135deg, rgba(20, 60, 60, 0.98) 0%, rgba(25, 50, 80, 0.98) 100%);
        backdrop-filter: blur(12px);
        border-top: 1px solid rgba(94, 234, 212, 0.3);
        border-radius: 16px 16px 0 0;
        padding: 0 15px 15px 15px;
        z-index: 1000;
        overflow-y: auto;
        display: none;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
      }
      .im-properties.mobile-open {
        display: flex;
        flex-direction: column;
      }
      .im-mobile-props-toggle {
        display: flex !important;
      }
      
      #infographic-maker {
        position: relative;
      }
      /* Mobile properties header */
      .im-props-mobile-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        margin: 0 -15px 15px -15px;
        background: rgba(15, 40, 50, 0.98);
        border-bottom: 1px solid rgba(94, 234, 212, 0.2);
        position: sticky;
        top: 0;
        z-index: 10;
        flex-shrink: 0;
      }
      .im-props-mobile-header span {
        font-weight: 600;
        color: #5eead4;
        font-size: 14px;
      }
      .im-props-close-btn {
        padding: 8px 16px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        border: none;
        border-radius: 20px;
        color: #fff;
        font-family: 'Outfit', sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .im-props-close-btn:hover {
        transform: scale(1.05);
      }
      .im-properties .im-panel {
        flex-shrink: 0;
      }
      .im-properties #im-props-content {
        max-height: none;
        overflow: visible;
      }
    }

    /* Responsive - Mobile */
    @media (max-width: 768px) {
      #infographic-root {
        width: calc(100vw - 16px) !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      #infographic-maker {
        padding: 10px;
        padding-bottom: 70px; /* Space for floating button */
        height: auto;
        min-height: auto;
        border-radius: 12px;
        position: relative;
      }
      
      #infographic-maker h2 {
        font-size: 16px;
        margin-bottom: 10px;
      }
      
      .im-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: auto;
      }
      
      .im-sidebar {
        order: 2;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .im-canvas-area {
        order: 1;
      }
      
      .im-canvas-wrap {
        min-height: 250px;
        height: 40vh;
        max-height: 350px;
      }
      
      .im-canvas-toolbar {
        flex-wrap: wrap;
        gap: 8px;
        padding: 10px;
      }
      
      .im-toolbar-group {
        flex: 1 1 calc(50% - 8px);
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .im-toolbar-group label {
        flex-shrink: 0;
        font-size: 11px;
      }
      
      .im-toolbar-group select,
      .im-toolbar-group input {
        flex: 1;
        min-width: 0;
        padding: 8px 10px;
        font-size: 12px;
      }
      
      .im-toolbar-group input[type="color"] {
        flex: 1;
        min-width: 60px;
        height: 36px;
        padding: 2px;
      }
      
      .im-toolbar-group input[type="range"] {
        flex: 1;
        min-width: 60px;
      }
      
      /* Export buttons take full width row */
      .im-export-btns {
        flex: 1 1 100%;
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }
      
      .im-export-btns .im-btn {
        flex: 1;
        padding: 10px 12px;
        font-size: 12px;
        text-align: center;
        justify-content: center;
      }
      
      .im-toolbar-divider {
        display: none;
      }
      
      /* Tools: 3 columns on mobile for better touch targets */
      .im-tools {
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }
      
      .im-tool-btn {
        padding: 10px 6px;
        font-size: 11px;
      }
      
      .im-tool-btn .icon {
        font-size: 18px;
      }
      
      /* Presets: 2 columns on mobile */
      .im-presets {
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
      }
      
      .im-preset-btn {
        padding: 8px 6px;
        font-size: 11px;
      }
      
      .im-panel {
        border-radius: 10px;
      }
      
      .im-panel-header {
        padding: 10px 12px;
        font-size: 13px;
      }
      
      .im-panel-content {
        padding: 10px;
      }
      
      /* Layers panel adjustments */
      .im-layers {
        max-height: 150px;
      }
      
      .im-layer {
        padding: 8px 10px;
      }
      
      .im-layer-thumb {
        width: 28px;
        height: 28px;
        font-size: 14px;
      }
      
      .im-layer-name {
        font-size: 12px;
      }
      
      .im-layer-order-btns {
        flex-direction: row;
        gap: 4px;
      }
      
      .im-layer-order-btns .im-btn {
        padding: 6px 10px;
        font-size: 11px;
      }
      
      /* Properties panel - slides up from bottom */
      .im-properties {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 80vh;
        max-height: 80vh;
        background: linear-gradient(135deg, rgba(20, 60, 60, 0.98) 0%, rgba(25, 50, 80, 0.98) 100%);
        backdrop-filter: blur(12px);
        border-top: 2px solid rgba(94, 234, 212, 0.4);
        border-radius: 16px 16px 0 0;
        padding: 0 15px 15px 15px;
        z-index: 1000;
        overflow-y: auto;
        display: none;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
      }
      
      .im-properties.mobile-open {
        display: flex;
        flex-direction: column;
      }
      
      .im-properties .im-panel {
        margin-bottom: 10px;
        flex-shrink: 0;
      }
      
      .im-properties #im-props-content {
        max-height: none;
        overflow: visible;
      }
      
      .im-properties .im-panel-header {
        padding: 10px 12px;
        background: rgba(15, 40, 50, 0.95);
      }
      
      /* Mobile properties toggle button - use absolute since transform breaks fixed */
      #infographic-maker {
        position: relative;
      }
      
      .im-mobile-props-toggle {
        display: flex !important;
        right: 10px;
        left: auto;
      }
      
      /* Export buttons */
      .im-export-btns {
        flex-wrap: wrap;
        gap: 6px;
      }
      
      .im-btn {
        padding: 10px 14px;
        font-size: 12px;
        flex: 1;
        min-width: 100px;
        text-align: center;
      }
      
      #im-props-content {
        max-height: none;
      }
      
      /* Property inputs on mobile */
      .im-prop-row {
        flex-direction: column;
        gap: 4px;
      }
      
      .im-prop-row label {
        font-size: 11px;
      }
      
      .im-prop-row input,
      .im-prop-row select {
        width: 100%;
        padding: 8px 10px;
        font-size: 13px;
      }
    }
    
    /* Desktop: hide mobile toggle and mobile header */
    @media (min-width: 1201px) {
      .im-mobile-props-toggle {
        display: none !important;
      }
      .im-props-mobile-header {
        display: none !important;
      }
    }
    
    /* Skill Icons Modal */
    .im-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 20, 30, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    
    .im-modal {
      background: linear-gradient(135deg, rgba(20, 60, 60, 0.98) 0%, rgba(25, 50, 80, 0.98) 100%);
      border: 1px solid rgba(94, 234, 212, 0.3);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .im-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(94, 234, 212, 0.2);
      background: rgba(15, 40, 50, 0.5);
    }
    
    .im-modal-header h3 {
      margin: 0;
      color: #5eead4;
      font-size: 16px;
      font-weight: 600;
    }
    
    .im-modal-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    }
    
    .im-modal-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    
    .im-modal-content {
      padding: 20px;
      overflow-y: auto;
    }
    
    .im-skill-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
      gap: 10px;
    }
    
    .im-skill-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 6px;
      background: rgba(15, 40, 50, 0.6);
      border: 1px solid rgba(94, 234, 212, 0.15);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .im-skill-item:hover {
      background: rgba(94, 234, 212, 0.15);
      border-color: rgba(94, 234, 212, 0.4);
      transform: translateY(-2px);
    }
    
    .im-skill-item img {
      width: 32px;
      height: 32px;
      image-rendering: pixelated;
      margin-bottom: 6px;
    }
    
    .im-skill-item span {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
      line-height: 1.2;
    }
  `;

  const HTML = `
    <div id="infographic-maker">
      <h2>🎨 Infographic Maker</h2>
      
      <div class="im-container">
        <!-- Left Sidebar - Tools & Layers -->
        <div class="im-sidebar">
          <div class="im-panel">
            <div class="im-panel-header">🛠 Tools</div>
            <div class="im-panel-content">
              <div class="im-tools">
                <button class="im-tool-btn active" data-tool="select">
                  <span class="icon">⬚</span>
                  Select
                </button>
                <button class="im-tool-btn" data-tool="text">
                  <span class="icon">T</span>
                  Text
                </button>
                <button class="im-tool-btn" data-tool="rect">
                  <span class="icon">▢</span>
                  Rectangle
                </button>
                <button class="im-tool-btn" data-tool="image">
                  <span class="icon">🖼</span>
                  Image
                </button>
                <button class="im-tool-btn" data-tool="line">
                  <span class="icon">╱</span>
                  Line
                </button>
                <button class="im-tool-btn" data-tool="circle">
                  <span class="icon">○</span>
                  Circle
                </button>
              </div>
            </div>
          </div>

          <div class="im-panel">
            <div class="im-panel-header">🎮 OSRS Assets</div>
            <div class="im-panel-content">
              <div class="im-presets">
                <button class="im-preset-btn" id="im-skill-icons-btn">⚔️ Skills</button>
                <button class="im-preset-btn" id="im-prayer-icons-btn">🙏 Prayers</button>
                <button class="im-preset-btn" data-preset="osrs-inventory">📊 Poll Backdrop</button>
              </div>
            </div>
          </div>

          <div class="im-panel">
            <div class="im-panel-header">📦 Common Presets</div>
            <div class="im-panel-content">
              <div class="im-presets">
                <button class="im-preset-btn" data-preset="osrs-panel">Dark Panel</button>
                <button class="im-preset-btn" data-preset="osrs-title">Title Box</button>
                <button class="im-preset-btn" data-preset="osrs-bullet">Bullet List</button>
                <button class="im-preset-btn" data-preset="osrs-border-cyan">Cyan Border</button>
                <button class="im-preset-btn" data-preset="osrs-border-pink">Pink Border</button>
              </div>
            </div>
          </div>

          <div class="im-panel" style="flex:1;">
            <div class="im-panel-header">📚 Layers</div>
            <div class="im-panel-content">
              <div class="im-layers" id="im-layers">
                <div class="im-layer selected">
                  <div class="im-layer-thumb">🖼</div>
                  <div class="im-layer-info">
                    <div class="im-layer-name">Background</div>
                    <div class="im-layer-type">Layer</div>
                  </div>
                </div>
              </div>
              <div style="margin-top:10px; display:flex; gap:6px;">
                <button class="im-btn im-btn-secondary" style="flex:1; font-size:11px;" id="im-layer-up">↑ Up</button>
                <button class="im-btn im-btn-secondary" style="flex:1; font-size:11px;" id="im-layer-down">↓ Down</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Center - Canvas -->
        <div class="im-canvas-area">
          <div class="im-canvas-toolbar">
            <div class="im-toolbar-group">
              <label>Size:</label>
              <select id="im-canvas-size">
                <option value="1280x720">1280 × 720 (HD)</option>
                <option value="1920x1080">1920 × 1080 (Full HD)</option>
                <option value="800x600">800 × 600</option>
                <option value="800x320">800 × 320 (Discord Banner)</option>
                <option value="600x400">600 × 400 (Discord Embed)</option>
                <option value="custom">Custom...</option>
              </select>
              <div class="im-custom-size-inputs" id="im-custom-size-inputs" style="display:none;">
                <input type="number" id="im-custom-width" placeholder="Width" min="100" max="4096" style="width:70px;">
                <span>×</span>
                <input type="number" id="im-custom-height" placeholder="Height" min="100" max="4096" style="width:70px;">
                <button class="im-btn im-btn-sm" id="im-apply-custom-size">Apply</button>
              </div>
            </div>
            <div class="im-toolbar-divider"></div>
            <div class="im-toolbar-group">
              <label>Zoom:</label>
              <input type="range" id="im-zoom" min="25" max="200" value="100" style="width:100px;">
              <span id="im-zoom-label">100%</span>
            </div>
            <div class="im-toolbar-divider"></div>
            <div class="im-toolbar-group">
              <label>BG:</label>
              <input type="color" id="im-bg-color" value="#ffffff" class="im-color-input">
              <label class="im-checkbox-label" style="margin-left: 8px;" title="Transparent background">
                <input type="checkbox" id="im-bg-transparent">
                <span style="font-size: 11px;">None</span>
              </label>
            </div>
            <div style="flex:1;"></div>
            <div class="im-export-btns">
              <button class="im-btn im-btn-secondary" id="im-clear-btn">🗑 Clear</button>
              <button class="im-btn im-btn-primary" id="im-export-btn">📥 Export PNG</button>
            </div>
          </div>
          <div class="im-canvas-wrap">
            <div class="im-canvas-container">
              <canvas id="im-canvas" width="1280" height="720"></canvas>
            </div>
          </div>
        </div>

        <!-- Right - Properties -->
        <div class="im-properties">
          <!-- Mobile close header -->
          <div class="im-props-mobile-header">
            <span>⚙️ Properties</span>
            <button class="im-props-close-btn" id="im-props-close-btn">✕ Close</button>
          </div>
          
          <div class="im-panel">
            <div class="im-panel-header">⬆ Upload Image</div>
            <div class="im-panel-content">
              <div class="im-upload-area" id="im-upload-area">
                <div class="icon">📁</div>
                <p>Click or drag image here</p>
              </div>
              <input type="file" accept="image/*" class="im-file-input" id="im-file-input" multiple>
            </div>
          </div>

          <div class="im-panel" id="im-props-panel" style="flex:1;">
            <div class="im-panel-header">⚙ Properties</div>
            <div class="im-panel-content" id="im-props-content">
              <p style="color:rgba(255,255,255,0.4); font-size:12px; text-align:center;">
                Select an element to edit its properties
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile Properties Toggle -->
      <button class="im-mobile-props-toggle" id="im-mobile-props-toggle">⚙️ Properties</button>
      
      <!-- Skill Icons Modal -->
      <div class="im-modal-overlay" id="im-skill-modal" style="display:none;">
        <div class="im-modal">
          <div class="im-modal-header">
            <h3>⚔️ Skill Icons</h3>
            <button class="im-modal-close" id="im-skill-modal-close">✕</button>
          </div>
          <div class="im-modal-content">
            <div class="im-skill-grid" id="im-skill-grid"></div>
          </div>
        </div>
      </div>
      
      <!-- Prayer Icons Modal -->
      <div class="im-modal-overlay" id="im-prayer-modal" style="display:none;">
        <div class="im-modal">
          <div class="im-modal-header">
            <h3>🙏 Prayer Icons</h3>
            <button class="im-modal-close" id="im-prayer-modal-close">✕</button>
          </div>
          <div class="im-modal-content">
            <div class="im-skill-grid" id="im-prayer-grid"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  function injectStyles(doc) {
    if (doc.getElementById(CSS_ID)) return;
    const style = doc.createElement('style');
    style.id = CSS_ID;
    style.textContent = STYLE;
    doc.head.appendChild(style);
  }

  // Canvas state
  let canvas, ctx;
  let layers = [];
  let selectedLayerIdx = -1;
  let currentTool = 'select';
  let isDragging = false;
  let isResizing = false;
  let dragStart = { x: 0, y: 0 };
  let dragOffset = { x: 0, y: 0 };
  let zoom = 1;
  let bgColor = '#ffffff';
  let bgTransparent = false;

  // Layer types
  const LAYER_TYPES = {
    RECT: 'rect',
    TEXT: 'text',
    IMAGE: 'image',
    LINE: 'line',
    CIRCLE: 'circle'
  };

  // OSRS Colors
  const OSRS_COLORS = {
    orange: '#ff981f',
    yellow: '#ffff00',
    cyan: '#00ffff',
    green: '#00ff00',
    pink: '#ff00ff',
    white: '#ffffff',
    dark: '#3d3428',
    panel: 'rgba(30, 30, 30, 0.9)'
  };

  function createLayer(type, props = {}) {
    const base = {
      id: Date.now() + Math.random(),
      type,
      x: props.x || 100,
      y: props.y || 100,
      width: props.width || 200,
      height: props.height || 100,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      name: props.name || `${type} ${layers.length + 1}`
    };

    switch (type) {
      case LAYER_TYPES.RECT:
        return {
          ...base,
          fill: props.fill || OSRS_COLORS.panel,
          stroke: props.stroke || OSRS_COLORS.dark,
          strokeWidth: props.strokeWidth || 3,
          borderRadius: props.borderRadius || 0
        };
      case LAYER_TYPES.TEXT:
        return {
          ...base,
          text: props.text || 'Text',
          fontSize: props.fontSize || 24,
          fontFamily: props.fontFamily || 'RuneScape UF',
          fill: props.fill || OSRS_COLORS.orange,
          align: props.align || 'left',
          width: props.width || 300,
          height: props.height || 40,
          // Shadow options
          shadowEnabled: props.shadowEnabled || false,
          shadowColor: props.shadowColor || '#000000',
          shadowBlur: props.shadowBlur || 4,
          shadowOffsetX: props.shadowOffsetX || 2,
          shadowOffsetY: props.shadowOffsetY || 2,
          // Stroke options
          strokeEnabled: props.strokeEnabled || false,
          strokeColor: props.strokeColor || '#000000',
          strokeWidth: props.strokeWidth || 2
        };
      case LAYER_TYPES.IMAGE:
        return {
          ...base,
          src: props.src || '',
          image: props.image || null,
          width: props.width || 200,
          height: props.height || 200
        };
      case LAYER_TYPES.LINE:
        return {
          ...base,
          x2: props.x2 || base.x + 100,
          y2: props.y2 || base.y,
          stroke: props.stroke || OSRS_COLORS.cyan,
          strokeWidth: props.strokeWidth || 2
        };
      case LAYER_TYPES.CIRCLE:
        return {
          ...base,
          radius: props.radius || 50,
          fill: props.fill || 'transparent',
          stroke: props.stroke || OSRS_COLORS.cyan,
          strokeWidth: props.strokeWidth || 3
        };
      default:
        return base;
    }
  }

  function drawLayer(layer) {
    if (!layer.visible) return;

    ctx.save();
    ctx.globalAlpha = layer.opacity;

    switch (layer.type) {
      case LAYER_TYPES.RECT:
        ctx.fillStyle = layer.fill;
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = layer.strokeWidth;
        
        if (layer.borderRadius > 0) {
          roundRect(ctx, layer.x, layer.y, layer.width, layer.height, layer.borderRadius);
          if (layer.fill && layer.fill !== 'transparent') ctx.fill();
          if (layer.strokeWidth > 0) ctx.stroke();
        } else {
          if (layer.fill && layer.fill !== 'transparent') {
            ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
          }
          if (layer.strokeWidth > 0) {
            ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
          }
        }
        break;

      case LAYER_TYPES.TEXT:
        ctx.font = `${layer.fontSize}px "${layer.fontFamily}"`;
        ctx.fillStyle = layer.fill;
        ctx.textAlign = layer.align;
        ctx.textBaseline = 'top';
        
        const lines = layer.text.split('\n');
        const lineHeight = layer.fontSize * 1.2;
        let textX = layer.x;
        if (layer.align === 'center') textX = layer.x + layer.width / 2;
        else if (layer.align === 'right') textX = layer.x + layer.width;
        
        // Apply shadow if enabled
        if (layer.shadowEnabled) {
          ctx.shadowColor = layer.shadowColor || '#000000';
          ctx.shadowBlur = layer.shadowBlur || 4;
          ctx.shadowOffsetX = layer.shadowOffsetX || 2;
          ctx.shadowOffsetY = layer.shadowOffsetY || 2;
        }
        
        lines.forEach((line, i) => {
          const yPos = layer.y + i * lineHeight;
          
          // Draw stroke first if enabled (behind the fill)
          if (layer.strokeEnabled) {
            ctx.strokeStyle = layer.strokeColor || '#000000';
            ctx.lineWidth = layer.strokeWidth || 2;
            ctx.lineJoin = 'round';
            ctx.strokeText(line, textX, yPos);
          }
          
          // Draw fill
          ctx.fillText(line, textX, yPos);
        });
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        break;

      case LAYER_TYPES.IMAGE:
        if (layer.image) {
          ctx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height);
        }
        break;

      case LAYER_TYPES.LINE:
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = layer.strokeWidth;
        ctx.beginPath();
        ctx.moveTo(layer.x, layer.y);
        ctx.lineTo(layer.x2, layer.y2);
        ctx.stroke();
        break;

      case LAYER_TYPES.CIRCLE:
        ctx.fillStyle = layer.fill;
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = layer.strokeWidth;
        ctx.beginPath();
        ctx.arc(layer.x + layer.radius, layer.y + layer.radius, layer.radius, 0, Math.PI * 2);
        if (layer.fill && layer.fill !== 'transparent') ctx.fill();
        if (layer.strokeWidth > 0) ctx.stroke();
        break;
    }

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawSelectionHandles(layer) {
    if (!layer) return;

    ctx.save();
    ctx.strokeStyle = '#5eead4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const bounds = getLayerBounds(layer);
    ctx.strokeRect(bounds.x - 2, bounds.y - 2, bounds.width + 4, bounds.height + 4);

    // Draw resize handles
    ctx.setLineDash([]);
    ctx.fillStyle = '#5eead4';
    ctx.strokeStyle = '#0f2935';
    ctx.lineWidth = 1;
    const handleSize = 12;
    const handles = [
      { x: bounds.x - handleSize/2, y: bounds.y - handleSize/2 },
      { x: bounds.x + bounds.width/2 - handleSize/2, y: bounds.y - handleSize/2 },
      { x: bounds.x + bounds.width - handleSize/2, y: bounds.y - handleSize/2 },
      { x: bounds.x + bounds.width - handleSize/2, y: bounds.y + bounds.height/2 - handleSize/2 },
      { x: bounds.x + bounds.width - handleSize/2, y: bounds.y + bounds.height - handleSize/2 },
      { x: bounds.x + bounds.width/2 - handleSize/2, y: bounds.y + bounds.height - handleSize/2 },
      { x: bounds.x - handleSize/2, y: bounds.y + bounds.height - handleSize/2 },
      { x: bounds.x - handleSize/2, y: bounds.y + bounds.height/2 - handleSize/2 }
    ];

    handles.forEach(h => {
      ctx.fillRect(h.x, h.y, handleSize, handleSize);
      ctx.strokeRect(h.x, h.y, handleSize, handleSize);
    });

    ctx.restore();
  }

  function getLayerBounds(layer) {
    if (layer.type === LAYER_TYPES.LINE) {
      const minX = Math.min(layer.x, layer.x2);
      const maxX = Math.max(layer.x, layer.x2);
      const minY = Math.min(layer.y, layer.y2);
      const maxY = Math.max(layer.y, layer.y2);
      return { x: minX, y: minY, width: maxX - minX || 10, height: maxY - minY || 10 };
    }
    if (layer.type === LAYER_TYPES.CIRCLE) {
      return { x: layer.x, y: layer.y, width: layer.radius * 2, height: layer.radius * 2 };
    }
    return { x: layer.x, y: layer.y, width: layer.width, height: layer.height };
  }

  function hitTest(layer, x, y) {
    const bounds = getLayerBounds(layer);
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }

  function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!bgTransparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw all layers
    layers.forEach(layer => drawLayer(layer));

    // Draw selection
    if (selectedLayerIdx >= 0 && selectedLayerIdx < layers.length) {
      drawSelectionHandles(layers[selectedLayerIdx]);
    }
  }

  function renderLayersList(rootEl) {
    const container = rootEl.querySelector('#im-layers');
    container.innerHTML = layers.map((layer, idx) => `
      <div class="im-layer ${idx === selectedLayerIdx ? 'selected' : ''} ${layer.locked ? 'locked' : ''}" data-idx="${idx}">
        <div class="im-layer-thumb">${getLayerIcon(layer.type)}</div>
        <div class="im-layer-info">
          <div class="im-layer-name">${escapeHtml(layer.name)}</div>
          <div class="im-layer-type">${layer.type}</div>
        </div>
        <div class="im-layer-actions">
          <button class="im-layer-btn ${layer.locked ? 'active' : ''}" data-action="lock" title="${layer.locked ? 'Unlock' : 'Lock'}">
            ${layer.locked ? '🔒' : '🔓'}
          </button>
          <button class="im-layer-btn" data-action="visible" title="${layer.visible ? 'Hide' : 'Show'}">
            ${layer.visible ? '👁' : '👁‍🗨'}
          </button>
          <button class="im-layer-btn delete" data-action="delete" title="Delete">🗑</button>
        </div>
      </div>
    `).reverse().join('');
  }

  function getLayerIcon(type) {
    switch (type) {
      case LAYER_TYPES.RECT: return '▢';
      case LAYER_TYPES.TEXT: return 'T';
      case LAYER_TYPES.IMAGE: return '🖼';
      case LAYER_TYPES.LINE: return '╱';
      case LAYER_TYPES.CIRCLE: return '○';
      default: return '?';
    }
  }

  function renderProperties(rootEl) {
    const container = rootEl.querySelector('#im-props-content');
    
    if (selectedLayerIdx < 0 || selectedLayerIdx >= layers.length) {
      container.innerHTML = `<p style="color:rgba(255,255,255,0.4); font-size:12px; text-align:center;">
        Select an element to edit its properties
      </p>`;
      return;
    }

    const layer = layers[selectedLayerIdx];
    let html = `
      <div class="im-prop-group">
        <div class="im-prop-row">
          <span class="im-prop-label">Name</span>
          <input type="text" class="im-prop-input" data-prop="name" value="${escapeHtml(layer.name)}">
        </div>
        <div class="im-prop-row">
          <span class="im-prop-label">X</span>
          <input type="number" class="im-prop-input" data-prop="x" value="${Math.round(layer.x)}" style="width:70px;">
          <span class="im-prop-label" style="width:20px;">Y</span>
          <input type="number" class="im-prop-input" data-prop="y" value="${Math.round(layer.y)}" style="width:70px;">
        </div>
    `;

    if (layer.type !== LAYER_TYPES.LINE) {
      html += `
        <div class="im-prop-row">
          <span class="im-prop-label">Width</span>
          <input type="number" class="im-prop-input" data-prop="width" value="${Math.round(layer.width)}" style="width:70px;">
          <span class="im-prop-label" style="width:20px;">H</span>
          <input type="number" class="im-prop-input" data-prop="height" value="${Math.round(layer.height)}" style="width:70px;">
        </div>
      `;
    }

    html += `
        <div class="im-prop-row">
          <span class="im-prop-label">Opacity</span>
          <input type="range" min="0" max="1" step="0.1" data-prop="opacity" value="${layer.opacity}" style="flex:1;">
        </div>
      </div>
    `;

    // Type-specific properties
    if (layer.type === LAYER_TYPES.RECT) {
      html += `
        <div class="im-prop-group">
          <div class="im-prop-row">
            <span class="im-prop-label">Fill</span>
            <input type="color" class="im-color-input" data-prop="fill" value="${layer.fill || '#000000'}">
            <input type="text" class="im-prop-input" data-prop="fill" value="${layer.fill}" style="flex:1;">
          </div>
          <div class="im-prop-row">
            <span class="im-prop-label">Stroke</span>
            <input type="color" class="im-color-input" data-prop="stroke" value="${layer.stroke || '#000000'}">
            <input type="number" class="im-prop-input" data-prop="strokeWidth" value="${layer.strokeWidth}" style="width:50px;" placeholder="Width">
          </div>
          <div class="im-prop-row">
            <span class="im-prop-label">Radius</span>
            <input type="number" class="im-prop-input" data-prop="borderRadius" value="${layer.borderRadius || 0}">
          </div>
        </div>
      `;
    }

    if (layer.type === LAYER_TYPES.TEXT) {
      html += `
        <div class="im-prop-group">
          <textarea class="im-prop-textarea" data-prop="text" placeholder="Enter text...">${escapeHtml(layer.text)}</textarea>
          <div class="im-prop-row">
            <span class="im-prop-label">Font</span>
            <select class="im-prop-input" data-prop="fontFamily">
              <option value="RuneScape UF" ${layer.fontFamily === 'RuneScape UF' || layer.fontFamily === 'RuneScape' ? 'selected' : ''}>RuneScape</option>
              <option value="Outfit" ${layer.fontFamily === 'Outfit' ? 'selected' : ''}>Outfit</option>
              <option value="Arial" ${layer.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
              <option value="Impact" ${layer.fontFamily === 'Impact' ? 'selected' : ''}>Impact</option>
              <option value="Georgia" ${layer.fontFamily === 'Georgia' ? 'selected' : ''}>Georgia</option>
            </select>
          </div>
          <div class="im-prop-row">
            <span class="im-prop-label">Size</span>
            <input type="number" class="im-prop-input" data-prop="fontSize" value="${layer.fontSize}" style="width:60px;">
            <span class="im-prop-label" style="width:auto;">Color</span>
            <input type="color" class="im-color-input" data-prop="fill" value="${layer.fill || '#ffffff'}">
          </div>
          <div class="im-prop-row">
            <span class="im-prop-label">Align</span>
            <select class="im-prop-input" data-prop="align">
              <option value="left" ${layer.align === 'left' ? 'selected' : ''}>Left</option>
              <option value="center" ${layer.align === 'center' ? 'selected' : ''}>Center</option>
              <option value="right" ${layer.align === 'right' ? 'selected' : ''}>Right</option>
            </select>
          </div>
        </div>
        <div class="im-prop-group">
          <div class="im-prop-row">
            <label class="im-checkbox-label">
              <input type="checkbox" data-prop="strokeEnabled" ${layer.strokeEnabled ? 'checked' : ''}>
              <span>Text Stroke</span>
            </label>
          </div>
          <div class="im-prop-row" style="${layer.strokeEnabled ? '' : 'opacity:0.5;'}">
            <span class="im-prop-label">Color</span>
            <input type="color" class="im-color-input" data-prop="strokeColor" value="${layer.strokeColor || '#000000'}">
          </div>
          <div class="im-prop-row" style="${layer.strokeEnabled ? '' : 'opacity:0.5;'}">
            <span class="im-prop-label">Width</span>
            <input type="range" class="im-slider" data-prop="strokeWidth" value="${layer.strokeWidth || 2}" min="1" max="20" step="1">
            <span class="im-slider-value">${layer.strokeWidth || 2}px</span>
          </div>
        </div>
        <div class="im-prop-group">
          <div class="im-prop-row">
            <label class="im-checkbox-label">
              <input type="checkbox" data-prop="shadowEnabled" ${layer.shadowEnabled ? 'checked' : ''}>
              <span>Text Shadow</span>
            </label>
          </div>
          <div class="im-prop-row" style="${layer.shadowEnabled ? '' : 'opacity:0.5;'}">
            <span class="im-prop-label">Color</span>
            <input type="color" class="im-color-input" data-prop="shadowColor" value="${layer.shadowColor || '#000000'}">
          </div>
          <div class="im-prop-row" style="${layer.shadowEnabled ? '' : 'opacity:0.5;'}">
            <span class="im-prop-label">Blur</span>
            <input type="range" class="im-slider" data-prop="shadowBlur" value="${layer.shadowBlur || 4}" min="0" max="30" step="1">
            <span class="im-slider-value">${layer.shadowBlur || 4}px</span>
          </div>
          <div class="im-prop-row" style="${layer.shadowEnabled ? '' : 'opacity:0.5;'}">
            <span class="im-prop-label">Offset X</span>
            <input type="range" class="im-slider" data-prop="shadowOffsetX" value="${layer.shadowOffsetX || 2}" min="-20" max="20" step="1">
            <span class="im-slider-value">${layer.shadowOffsetX || 2}px</span>
          </div>
          <div class="im-prop-row" style="${layer.shadowEnabled ? '' : 'opacity:0.5;'}">
            <span class="im-prop-label">Offset Y</span>
            <input type="range" class="im-slider" data-prop="shadowOffsetY" value="${layer.shadowOffsetY || 2}" min="-20" max="20" step="1">
            <span class="im-slider-value">${layer.shadowOffsetY || 2}px</span>
          </div>
        </div>
      `;
    }

    if (layer.type === LAYER_TYPES.CIRCLE) {
      html += `
        <div class="im-prop-group">
          <div class="im-prop-row">
            <span class="im-prop-label">Radius</span>
            <input type="number" class="im-prop-input" data-prop="radius" value="${layer.radius}">
          </div>
          <div class="im-prop-row">
            <span class="im-prop-label">Fill</span>
            <input type="color" class="im-color-input" data-prop="fill" value="${layer.fill || '#000000'}">
          </div>
          <div class="im-prop-row">
            <span class="im-prop-label">Stroke</span>
            <input type="color" class="im-color-input" data-prop="stroke" value="${layer.stroke || '#00ffff'}">
            <input type="number" class="im-prop-input" data-prop="strokeWidth" value="${layer.strokeWidth}" style="width:50px;">
          </div>
        </div>
      `;
    }

    if (layer.type === LAYER_TYPES.LINE) {
      html += `
        <div class="im-prop-group">
          <div class="im-prop-row">
            <span class="im-prop-label">End X</span>
            <input type="number" class="im-prop-input" data-prop="x2" value="${Math.round(layer.x2)}" style="width:70px;">
            <span class="im-prop-label" style="width:40px;">End Y</span>
            <input type="number" class="im-prop-input" data-prop="y2" value="${Math.round(layer.y2)}" style="width:70px;">
          </div>
          <div class="im-prop-row">
            <span class="im-prop-label">Color</span>
            <input type="color" class="im-color-input" data-prop="stroke" value="${layer.stroke || '#00ffff'}">
            <span class="im-prop-label" style="width:40px;">Width</span>
            <input type="number" class="im-prop-input" data-prop="strokeWidth" value="${layer.strokeWidth}" style="width:50px;">
          </div>
        </div>
      `;
    }

    html += `
      <button class="im-btn im-btn-danger im-btn-block" id="im-delete-layer">🗑 Delete Layer</button>
    `;

    container.innerHTML = html;

    // Wire up property changes
    container.querySelectorAll('[data-prop]').forEach(input => {
      input.addEventListener('input', (e) => {
        const prop = e.target.dataset.prop;
        let value = e.target.value;
        
        // Handle checkbox
        if (e.target.type === 'checkbox') {
          value = e.target.checked;
        }
        // Convert to number for numeric properties
        else if (['x', 'y', 'x2', 'y2', 'width', 'height', 'fontSize', 'strokeWidth', 'borderRadius', 'radius', 'opacity', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'].includes(prop)) {
          value = parseFloat(value);
        }
        
        layers[selectedLayerIdx][prop] = value;
        render();
        
        // Update slider value label if this is a slider
        if (e.target.type === 'range' && e.target.classList.contains('im-slider')) {
          const valueLabel = e.target.nextElementSibling;
          if (valueLabel && valueLabel.classList.contains('im-slider-value')) {
            valueLabel.textContent = value + 'px';
          }
        }
        
        // Update other inputs with same prop (color picker + text)
        if (e.target.type === 'color') {
          const textInput = container.querySelector(`input[type="text"][data-prop="${prop}"]`);
          if (textInput) textInput.value = value;
        }
        
        // Re-render properties if checkbox changed (to update opacity of related rows)
        if (e.target.type === 'checkbox') {
          renderProperties(rootEl.closest('#infographic-maker') || rootEl);
        }
      });
    });

    // Delete button
    const deleteBtn = container.querySelector('#im-delete-layer');
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        layers.splice(selectedLayerIdx, 1);
        selectedLayerIdx = -1;
        render();
        renderLayersList(rootEl.closest('#infographic-maker'));
        renderProperties(rootEl.closest('#infographic-maker'));
      };
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function addPreset(preset, rootEl) {
    let layer;
    switch (preset) {
      case 'osrs-panel':
        layer = createLayer(LAYER_TYPES.RECT, {
          name: 'OSRS Panel',
          width: 400,
          height: 200,
          fill: 'rgba(30, 30, 30, 0.9)',
          stroke: '#3d3428',
          strokeWidth: 3,
          borderRadius: 0
        });
        break;
      case 'osrs-inventory':
        // Load inventory image preset
        try {
          const invImg = await loadImage('https://cdn.jsdelivr.net/gh/y-u-m-e/yume-tools@main/dist/infographic-maker/assets/presets/poll_backdrop.png');
          layer = createLayer(LAYER_TYPES.IMAGE, {
            name: 'Poll Backdrop',
            image: invImg,
            src: 'https://cdn.jsdelivr.net/gh/y-u-m-e/yume-tools@main/dist/infographic-maker/assets/presets/poll_backdrop.png',
            width: invImg.width,
            height: invImg.height
          });
        } catch (err) {
          console.error('Failed to load inventory preset:', err);
          // Fallback to rectangle
          layer = createLayer(LAYER_TYPES.RECT, {
            name: 'Poll Backdrop',
            width: 250,
            height: 300,
            fill: 'rgba(60, 50, 40, 0.8)',
            stroke: '#3d3428',
            strokeWidth: 3
          });
        }
        break;
      case 'osrs-title':
        layer = createLayer(LAYER_TYPES.TEXT, {
          name: 'Title',
          text: 'Title Here',
          fontSize: 36,
          fontFamily: 'RuneScape UF',
          fill: '#ff981f',
          width: 300,
          shadowEnabled: true,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 2,
          shadowOffsetY: 2
        });
        break;
      case 'osrs-bullet':
        layer = createLayer(LAYER_TYPES.TEXT, {
          name: 'Bullet List',
          text: '■ Item one\n■ Item two\n■ Item three',
          fontSize: 20,
          fontFamily: 'RuneScape UF',
          fill: '#00ffff',
          width: 350,
          height: 100
        });
        break;
      case 'osrs-border-cyan':
        layer = createLayer(LAYER_TYPES.RECT, {
          name: 'Cyan Border',
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: '#00ffff',
          strokeWidth: 3
        });
        break;
      case 'osrs-border-pink':
        layer = createLayer(LAYER_TYPES.RECT, {
          name: 'Pink Border',
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: '#ff00ff',
          strokeWidth: 3
        });
        break;
    }

    if (layer) {
      layers.push(layer);
      selectedLayerIdx = layers.length - 1;
      render();
      renderLayersList(rootEl);
      renderProperties(rootEl);
    }
  }

  function wire(rootEl) {
    canvas = rootEl.querySelector('#im-canvas');
    ctx = canvas.getContext('2d');
    const canvasWrap = rootEl.querySelector('.im-canvas-wrap');
    const canvasContainer = rootEl.querySelector('.im-canvas-container');

    // Auto-scale canvas to fit container
    function fitCanvasToContainer() {
      const wrapRect = canvasWrap.getBoundingClientRect();
      const availableWidth = wrapRect.width - 30; // padding
      const availableHeight = wrapRect.height - 30;
      
      const scaleX = availableWidth / canvas.width;
      const scaleY = availableHeight / canvas.height;
      const autoScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      canvas.style.width = (canvas.width * autoScale * zoom) + 'px';
      canvas.style.height = (canvas.height * autoScale * zoom) + 'px';
    }

    // Fit on load and resize
    fitCanvasToContainer();
    window.addEventListener('resize', fitCanvasToContainer);

    // Initial render
    render();
    renderLayersList(rootEl);

    // Tool selection
    rootEl.querySelectorAll('.im-tool-btn').forEach(btn => {
      btn.onclick = () => {
        rootEl.querySelectorAll('.im-tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
      };
    });

    // Preset buttons
    rootEl.querySelectorAll('.im-preset-btn').forEach(btn => {
      btn.onclick = () => addPreset(btn.dataset.preset, rootEl);
    });

    // Skill icons modal
    const skillModal = rootEl.querySelector('#im-skill-modal');
    const skillGrid = rootEl.querySelector('#im-skill-grid');
    const skillIconsBtn = rootEl.querySelector('#im-skill-icons-btn');
    const skillModalClose = rootEl.querySelector('#im-skill-modal-close');
    
    const SKILL_ICONS = [
      { name: 'Attack', file: 'Attack_icon' },
      { name: 'Strength', file: 'Strength_icon' },
      { name: 'Defence', file: 'Defence_icon' },
      { name: 'Ranged', file: 'Ranged_icon' },
      { name: 'Prayer', file: 'Prayer_icon' },
      { name: 'Magic', file: 'Magic_icon' },
      { name: 'Runecraft', file: 'Runecraft_icon' },
      { name: 'Construction', file: 'Construction_icon' },
      { name: 'Hitpoints', file: 'Hitpoints_icon' },
      { name: 'Agility', file: 'Agility_icon' },
      { name: 'Herblore', file: 'Herblore_icon' },
      { name: 'Thieving', file: 'Thieving_icon' },
      { name: 'Crafting', file: 'Crafting_icon' },
      { name: 'Fletching', file: 'Fletching_icon' },
      { name: 'Slayer', file: 'Slayer_icon' },
      { name: 'Hunter', file: 'Hunter_icon' },
      { name: 'Mining', file: 'Mining_icon' },
      { name: 'Smithing', file: 'Smithing_icon' },
      { name: 'Fishing', file: 'Fishing_icon' },
      { name: 'Cooking', file: 'Cooking_icon' },
      { name: 'Firemaking', file: 'Firemaking_icon' },
      { name: 'Woodcutting', file: 'Woodcutting_icon' },
      { name: 'Farming', file: 'Farming_icon' }
    ];
    
    // Populate skill grid
    skillGrid.innerHTML = SKILL_ICONS.map(skill => `
      <div class="im-skill-item" data-skill="${skill.file}">
        <img src="https://cdn.jsdelivr.net/gh/y-u-m-e/yume-tools@main/dist/infographic-maker/assets/presets/Skill_Icons/${skill.file}.png" alt="${skill.name}">
        <span>${skill.name}</span>
      </div>
    `).join('');
    
    // Open modal
    skillIconsBtn.onclick = () => {
      skillModal.style.display = 'flex';
    };
    
    // Close modal
    skillModalClose.onclick = () => {
      skillModal.style.display = 'none';
    };
    
    // Close on overlay click
    skillModal.onclick = (e) => {
      if (e.target === skillModal) {
        skillModal.style.display = 'none';
      }
    };
    
    // Handle skill selection
    skillGrid.onclick = async (e) => {
      const skillItem = e.target.closest('.im-skill-item');
      if (!skillItem) return;
      
      const iconName = skillItem.dataset.skill;
      
      try {
        const iconUrl = `https://cdn.jsdelivr.net/gh/y-u-m-e/yume-tools@main/dist/infographic-maker/assets/presets/Skill_Icons/${iconName}.png`;
        const img = await loadImage(iconUrl);
        const layer = createLayer(LAYER_TYPES.IMAGE, {
          name: iconName.replace('_icon', '').replace('_', ' '),
          image: img,
          src: iconUrl,
          width: img.width,
          height: img.height
        });
        layers.push(layer);
        selectedLayerIdx = layers.length - 1;
        render();
        renderLayersList(rootEl);
        renderProperties(rootEl);
        
        // Close modal after selection
        skillModal.style.display = 'none';
      } catch (err) {
        console.error('Failed to load skill icon:', err);
      }
    };

    // Prayer icons modal
    const prayerModal = rootEl.querySelector('#im-prayer-modal');
    const prayerGrid = rootEl.querySelector('#im-prayer-grid');
    const prayerIconsBtn = rootEl.querySelector('#im-prayer-icons-btn');
    const prayerModalClose = rootEl.querySelector('#im-prayer-modal-close');
    
    const PRAYER_ICONS = [
      { name: 'Thick Skin', file: 'Thick_Skin' },
      { name: 'Steel Skin', file: 'Steel_Skin' },
      { name: 'Ultimate Strength', file: 'Ultimate_Strength' },
      { name: 'Incredible Reflexes', file: 'Incredible_Reflexes' },
      { name: 'Sharp Eye', file: 'Sharp_Eye' },
      { name: 'Eagle Eye', file: 'Eagle_Eye' },
      { name: 'Mystic Lore', file: 'Mystic_Lore' },
      { name: 'Mystic Might', file: 'Mystic_Might' },
      { name: 'Mystic Vigour', file: 'Mystic_Vigour' },
      { name: 'Rapid Heal', file: 'Rapid_Heal' },
      { name: 'Protect Item', file: 'Protect_Item' },
      { name: 'Protect Missiles', file: 'Protect_from_Missiles' },
      { name: 'Protect Magic', file: 'Protect_from_Magic_overhead' },
      { name: 'Protect Melee', file: 'Protect_from_Melee_overhead' },
      { name: 'Retribution', file: 'Retribution' },
      { name: 'Redemption', file: 'Redemption' },
      { name: 'Preserve', file: 'Preserve' },
      { name: 'Chivalry', file: 'Chivalry' },
      { name: 'Piety', file: 'Piety' },
      { name: 'Rigour', file: 'Rigour' },
      { name: 'Augury', file: 'Augury' }
    ];
    
    // Populate prayer grid
    prayerGrid.innerHTML = PRAYER_ICONS.map(prayer => `
      <div class="im-skill-item" data-prayer="${prayer.file}">
        <img src="https://cdn.jsdelivr.net/gh/y-u-m-e/yume-tools@main/dist/infographic-maker/assets/presets/Prayer_Icons/${prayer.file}.png" alt="${prayer.name}">
        <span>${prayer.name}</span>
      </div>
    `).join('');
    
    // Open modal
    prayerIconsBtn.onclick = () => {
      prayerModal.style.display = 'flex';
    };
    
    // Close modal
    prayerModalClose.onclick = () => {
      prayerModal.style.display = 'none';
    };
    
    // Close on overlay click
    prayerModal.onclick = (e) => {
      if (e.target === prayerModal) {
        prayerModal.style.display = 'none';
      }
    };
    
    // Handle prayer selection
    prayerGrid.onclick = async (e) => {
      const prayerItem = e.target.closest('.im-skill-item');
      if (!prayerItem) return;
      
      const iconName = prayerItem.dataset.prayer;
      
      try {
        const iconUrl = `https://cdn.jsdelivr.net/gh/y-u-m-e/yume-tools@main/dist/infographic-maker/assets/presets/Prayer_Icons/${iconName}.png`;
        const img = await loadImage(iconUrl);
        const layer = createLayer(LAYER_TYPES.IMAGE, {
          name: iconName.replace(/_/g, ' '),
          image: img,
          src: iconUrl,
          width: img.width,
          height: img.height
        });
        layers.push(layer);
        selectedLayerIdx = layers.length - 1;
        render();
        renderLayersList(rootEl);
        renderProperties(rootEl);
        
        // Close modal after selection
        prayerModal.style.display = 'none';
      } catch (err) {
        console.error('Failed to load prayer icon:', err);
      }
    };

    // Canvas size
    const sizeSelect = rootEl.querySelector('#im-canvas-size');
    const customSizeInputs = rootEl.querySelector('#im-custom-size-inputs');
    const customWidthInput = rootEl.querySelector('#im-custom-width');
    const customHeightInput = rootEl.querySelector('#im-custom-height');
    const applyCustomSizeBtn = rootEl.querySelector('#im-apply-custom-size');
    
    sizeSelect.onchange = (e) => {
      if (e.target.value === 'custom') {
        // Show custom inputs
        customSizeInputs.style.display = 'flex';
        customWidthInput.value = canvas.width;
        customHeightInput.value = canvas.height;
      } else {
        // Hide custom inputs and apply preset size
        customSizeInputs.style.display = 'none';
        const [w, h] = e.target.value.split('x').map(Number);
        if (w && h) {
          canvas.width = w;
          canvas.height = h;
          render();
          fitCanvasToContainer();
        }
      }
    };
    
    // Apply custom size
    applyCustomSizeBtn.onclick = () => {
      const w = parseInt(customWidthInput.value, 10);
      const h = parseInt(customHeightInput.value, 10);
      if (w >= 100 && w <= 4096 && h >= 100 && h <= 4096) {
        canvas.width = w;
        canvas.height = h;
        render();
        fitCanvasToContainer();
      } else {
        alert('Size must be between 100 and 4096 pixels');
      }
    };
    
    // Allow Enter key to apply custom size
    customWidthInput.onkeydown = customHeightInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        applyCustomSizeBtn.click();
      }
    };

    // Zoom
    const zoomSlider = rootEl.querySelector('#im-zoom');
    const zoomLabel = rootEl.querySelector('#im-zoom-label');
    zoomSlider.oninput = (e) => {
      zoom = parseInt(e.target.value) / 100;
      zoomLabel.textContent = e.target.value + '%';
      fitCanvasToContainer();
    };

    // Background color
    const bgColorInput = rootEl.querySelector('#im-bg-color');
    const bgTransparentCheckbox = rootEl.querySelector('#im-bg-transparent');
    
    bgColorInput.oninput = (e) => {
      bgColor = e.target.value;
      render();
    };
    
    bgTransparentCheckbox.onchange = (e) => {
      bgTransparent = e.target.checked;
      bgColorInput.disabled = bgTransparent;
      bgColorInput.style.opacity = bgTransparent ? '0.5' : '1';
      render();
    };

    // Scroll wheel zoom
    canvasWrap.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      let newZoom = Math.round(zoom * 100) + delta;
      newZoom = Math.max(25, Math.min(200, newZoom));
      zoom = newZoom / 100;
      zoomSlider.value = newZoom;
      zoomLabel.textContent = newZoom + '%';
      fitCanvasToContainer();
    }, { passive: false });

    // Canvas mouse events
    let startLayer = null;
    let resizeHandle = null; // Track which resize handle is being dragged

    // Get mouse coordinates accounting for canvas scaling
    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    // Check if mouse is over a resize handle
    function getResizeHandle(x, y, layer) {
      if (!layer) return null;
      const bounds = getLayerBounds(layer);
      const handleHitSize = 16; // Larger hit area for easier clicking
      const handles = [
        { name: 'nw', x: bounds.x, y: bounds.y },
        { name: 'ne', x: bounds.x + bounds.width, y: bounds.y },
        { name: 'sw', x: bounds.x, y: bounds.y + bounds.height },
        { name: 'se', x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { name: 'n', x: bounds.x + bounds.width/2, y: bounds.y },
        { name: 's', x: bounds.x + bounds.width/2, y: bounds.y + bounds.height },
        { name: 'w', x: bounds.x, y: bounds.y + bounds.height/2 },
        { name: 'e', x: bounds.x + bounds.width, y: bounds.y + bounds.height/2 }
      ];
      
      for (const h of handles) {
        if (Math.abs(x - h.x) <= handleHitSize && Math.abs(y - h.y) <= handleHitSize) {
          return h.name;
        }
      }
      return null;
    }

    canvas.onmousedown = (e) => {
      const { x, y } = getCanvasCoords(e);

      if (currentTool === 'select') {
        // Check for resize handle first (only if layer not locked)
        if (selectedLayerIdx >= 0 && !layers[selectedLayerIdx].locked) {
          const handle = getResizeHandle(x, y, layers[selectedLayerIdx]);
          if (handle) {
            resizeHandle = handle;
            isDragging = true;
            dragStart = { x, y };
            render();
            return;
          }
        }

        // Find clicked layer (top to bottom)
        selectedLayerIdx = -1;
        for (let i = layers.length - 1; i >= 0; i--) {
          if (hitTest(layers[i], x, y)) {
            selectedLayerIdx = i;
            // Only allow dragging if layer is not locked
            if (!layers[i].locked) {
              isDragging = true;
              dragStart = { x, y };
              dragOffset = { x: x - layers[i].x, y: y - layers[i].y };
            }
            break;
          }
        }
        render();
        renderLayersList(rootEl);
        renderProperties(rootEl);
      } else if (currentTool === 'rect') {
        startLayer = createLayer(LAYER_TYPES.RECT, { x, y, width: 0, height: 0 });
        layers.push(startLayer);
        selectedLayerIdx = layers.length - 1;
        isDragging = true;
        dragStart = { x, y };
      } else if (currentTool === 'text') {
        const layer = createLayer(LAYER_TYPES.TEXT, { x, y });
        layers.push(layer);
        selectedLayerIdx = layers.length - 1;
        render();
        renderLayersList(rootEl);
        renderProperties(rootEl);
      } else if (currentTool === 'circle') {
        startLayer = createLayer(LAYER_TYPES.CIRCLE, { x, y, radius: 0 });
        layers.push(startLayer);
        selectedLayerIdx = layers.length - 1;
        isDragging = true;
        dragStart = { x, y };
      } else if (currentTool === 'line') {
        startLayer = createLayer(LAYER_TYPES.LINE, { x, y, x2: x, y2: y });
        layers.push(startLayer);
        selectedLayerIdx = layers.length - 1;
        isDragging = true;
        dragStart = { x, y };
      }
    };

    canvas.onmousemove = (e) => {
      const { x, y } = getCanvasCoords(e);
      
      // Update cursor for resize handles when not dragging
      if (!isDragging && currentTool === 'select' && selectedLayerIdx >= 0) {
        const handle = getResizeHandle(x, y, layers[selectedLayerIdx]);
        if (handle) {
          const cursors = { 'nw': 'nwse-resize', 'se': 'nwse-resize', 'ne': 'nesw-resize', 'sw': 'nesw-resize', 'n': 'ns-resize', 's': 'ns-resize', 'e': 'ew-resize', 'w': 'ew-resize' };
          canvas.style.cursor = cursors[handle];
        } else {
          canvas.style.cursor = 'crosshair';
        }
      }
      
      if (!isDragging) return;

      if (currentTool === 'select' && selectedLayerIdx >= 0) {
        const layer = layers[selectedLayerIdx];
        
        if (resizeHandle) {
          // Resizing
          const bounds = getLayerBounds(layer);
          const dx = x - dragStart.x;
          const dy = y - dragStart.y;
          
          if (layer.type === LAYER_TYPES.IMAGE || layer.type === LAYER_TYPES.RECT || layer.type === LAYER_TYPES.TEXT) {
            // Handle width changes
            if (resizeHandle.includes('e')) layer.width = Math.max(10, bounds.width + dx);
            if (resizeHandle.includes('w')) { layer.x += dx; layer.width = Math.max(10, bounds.width - dx); }
            // Handle height changes
            if (resizeHandle.includes('s')) layer.height = Math.max(10, bounds.height + dy);
            if (resizeHandle.includes('n')) { layer.y += dy; layer.height = Math.max(10, bounds.height - dy); }
          } else if (layer.type === LAYER_TYPES.CIRCLE) {
            layer.radius = Math.max(5, Math.sqrt((x - layer.x) ** 2 + (y - layer.y) ** 2));
          }
          dragStart = { x, y };
        } else {
          // Moving
          layer.x = x - dragOffset.x;
          layer.y = y - dragOffset.y;
        }
      } else if (currentTool === 'rect' && startLayer) {
        startLayer.width = x - dragStart.x;
        startLayer.height = y - dragStart.y;
      } else if (currentTool === 'circle' && startLayer) {
        const dx = x - dragStart.x;
        const dy = y - dragStart.y;
        startLayer.radius = Math.sqrt(dx * dx + dy * dy);
      } else if (currentTool === 'line' && startLayer) {
        startLayer.x2 = x;
        startLayer.y2 = y;
      }

      render();
    };

    canvas.onmouseup = () => {
      isDragging = false;
      startLayer = null;
      resizeHandle = null;
      renderLayersList(rootEl);
      renderProperties(rootEl);
    };

    canvas.onmouseleave = () => {
      isDragging = false;
      startLayer = null;
    };

    // Paste image from clipboard
    document.addEventListener('paste', async (e) => {
      // Only handle paste when infographic maker is in focus/visible
      if (!rootEl.contains(document.activeElement) && document.activeElement !== document.body) {
        return;
      }
      
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (!blob) continue;
          
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const img = await loadImage(event.target.result);
              const layer = createLayer(LAYER_TYPES.IMAGE, {
                name: 'Pasted Image',
                image: img,
                src: event.target.result,
                width: img.width,
                height: img.height
              });
              layers.push(layer);
              selectedLayerIdx = layers.length - 1;
              render();
              renderLayersList(rootEl);
              renderProperties(rootEl);
            } catch (err) {
              console.error('Failed to load pasted image:', err);
            }
          };
          reader.readAsDataURL(blob);
          break; // Only handle first image
        }
      }
    });

    // Layer list clicks
    rootEl.querySelector('#im-layers').onclick = (e) => {
      const layerEl = e.target.closest('.im-layer');
      if (!layerEl) return;

      const idx = parseInt(layerEl.dataset.idx);
      const action = e.target.closest('[data-action]')?.dataset.action;

      if (action === 'delete') {
        layers.splice(idx, 1);
        selectedLayerIdx = -1;
      } else if (action === 'visible') {
        layers[idx].visible = !layers[idx].visible;
      } else if (action === 'lock') {
        layers[idx].locked = !layers[idx].locked;
      } else {
        selectedLayerIdx = idx;
      }

      render();
      renderLayersList(rootEl);
      renderProperties(rootEl);
    };

    // Layer up/down
    rootEl.querySelector('#im-layer-up').onclick = () => {
      if (selectedLayerIdx < layers.length - 1) {
        [layers[selectedLayerIdx], layers[selectedLayerIdx + 1]] = [layers[selectedLayerIdx + 1], layers[selectedLayerIdx]];
        selectedLayerIdx++;
        render();
        renderLayersList(rootEl);
      }
    };

    rootEl.querySelector('#im-layer-down').onclick = () => {
      if (selectedLayerIdx > 0) {
        [layers[selectedLayerIdx], layers[selectedLayerIdx - 1]] = [layers[selectedLayerIdx - 1], layers[selectedLayerIdx]];
        selectedLayerIdx--;
        render();
        renderLayersList(rootEl);
      }
    };

    // Image upload
    const uploadArea = rootEl.querySelector('#im-upload-area');
    const fileInput = rootEl.querySelector('#im-file-input');

    uploadArea.onclick = () => fileInput.click();
    
    uploadArea.ondragover = (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#5eead4';
    };

    uploadArea.ondragleave = () => {
      uploadArea.style.borderColor = '';
    };

    uploadArea.ondrop = (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      handleFiles(e.dataTransfer.files);
    };

    fileInput.onchange = (e) => handleFiles(e.target.files);

    async function handleFiles(files) {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const img = await loadImage(e.target.result);
            const layer = createLayer(LAYER_TYPES.IMAGE, {
              name: file.name,
              image: img,
              src: e.target.result,
              width: Math.min(img.width, canvas.width / 2),
              height: Math.min(img.height, canvas.height / 2) * (Math.min(img.width, canvas.width / 2) / img.width)
            });
            layers.push(layer);
            selectedLayerIdx = layers.length - 1;
            render();
            renderLayersList(rootEl);
            renderProperties(rootEl);
          } catch (err) {
            console.error('Failed to load image:', err);
          }
        };
        reader.readAsDataURL(file);
      }
    }

    // Clear
    rootEl.querySelector('#im-clear-btn').onclick = () => {
      if (confirm('Clear all layers?')) {
        layers = [];
        selectedLayerIdx = -1;
        render();
        renderLayersList(rootEl);
        renderProperties(rootEl);
      }
    };

    // Export
    rootEl.querySelector('#im-export-btn').onclick = () => {
      // Deselect to hide selection handles
      const prevSelected = selectedLayerIdx;
      selectedLayerIdx = -1;
      render();

      // Export
      const link = document.createElement('a');
      link.download = 'infographic.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Restore selection
      selectedLayerIdx = prevSelected;
      render();
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerIdx >= 0) {
          layers.splice(selectedLayerIdx, 1);
          selectedLayerIdx = -1;
          render();
          renderLayersList(rootEl);
          renderProperties(rootEl);
        }
      }

      if (e.key === 'Escape') {
        selectedLayerIdx = -1;
        render();
        renderLayersList(rootEl);
        renderProperties(rootEl);
        // Also close mobile properties panel
        const propsPanel = rootEl.querySelector('.im-properties');
        if (propsPanel) propsPanel.classList.remove('mobile-open');
      }
    });

    // Mobile properties toggle
    const mobileToggle = rootEl.querySelector('#im-mobile-props-toggle');
    const propsPanel = rootEl.querySelector('.im-properties');
    const propsCloseBtn = rootEl.querySelector('#im-props-close-btn');
    
    function closePropsPanel() {
      if (propsPanel) {
        propsPanel.classList.remove('mobile-open');
        if (mobileToggle) {
          mobileToggle.classList.remove('open');
          mobileToggle.innerHTML = '⚙️ Properties';
        }
      }
    }
    
    if (mobileToggle && propsPanel) {
      mobileToggle.onclick = () => {
        const isOpen = propsPanel.classList.toggle('mobile-open');
        mobileToggle.classList.toggle('open', isOpen);
        mobileToggle.innerHTML = isOpen ? '✕ Close' : '⚙️ Properties';
      };
    }
    
    if (propsCloseBtn) {
      propsCloseBtn.onclick = closePropsPanel;
    }
  }

  function mount(selectorOrEl, options = {}) {
    const host = (typeof selectorOrEl === 'string') ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (!host) return;

    injectStyles(document);
    host.innerHTML = HTML;
    wire(host.querySelector('#infographic-maker'));
  }

  return { mount };
});

