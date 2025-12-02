# TUI Specification

## Overview
This document describes the specifications for the Text User Interface (TUI) of the Code Editing Agent. The TUI will be built using **Ink** and **React**, replacing the current simple CLI prompt with a rich, interactive 3-pane interface.

## Tech Stack
- **Framework:** React
- **Renderer:** Ink (v5.x)
- **Key Libraries:**
  - `ink-text-input` / `ink-text-area` (Input handling)
  - `ink-markdown` (Rendering chat messages)
  - `ink-select-input` (Lists and menus)
  - `ink-spinner` (Loading states)

## Layout Structure
The application uses a full-screen Flexbox layout divided into three main areas:

```
+---------------------------------------+------------------+
|                                       |                  |
|  Top Left: Chat & Results             |  Right: Nav      |
|  (2/3 Width, Flexible Height)         |  (1/3 Width)     |
|                                       |                  |
|  [Scrollable Chat History]            |  [Sessions/Files]|
|                                       |                  |
|                                       |                  |
+---------------------------------------+------------------+
|  Bottom: Input & Status                                  |
|  (Fixed Height, e.g., 5-8 lines)                         |
|                                       |                  |
|  [Rich Multi-line Input]                                 |
|  [Status Bar: Msgs | Context | Model]                  |
+---------------------------------------+------------------+
```

### 1. Chat Pane (Top Left)
- **Dimensions:** Flex grow, 66% (2/3) width.
- **Content:**
  - Streaming chat messages from the user and agent.
  - Markdown rendering for code blocks and rich text.
  - **Tool Results:** Collapsible/Summary views for tool outputs (e.g., "Read file x.ts" instead of dumping 100 lines, expandable on click/enter).
- **Behavior:**
  - Auto-scroll to bottom on new messages.
  - Support manual scrolling when focused.

### 2. Navigation Pane (Right)
- **Dimensions:** Flex grow, 33% (1/3) width, full height of top section.
- **Content:** Two selectable tabs/views:
  - **Previous Sessions:** List of past interaction logs.
  - **Updated Files:** List of files modified in the current or selected session.
- **Interaction:**
  - **Left/Right Arrows:** Toggle between "Sessions" view and "Files" view.
  - **Up/Down Arrows:** Navigate the list items.
  - **Enter:** Select a session to load or a file to view context.

### 3. Input Pane (Bottom)
- **Dimensions:** Fixed height (initially 1 line + status bar, expands to max ~5 lines).
- **Content:**
  - **Rich Text Area:** Multi-line editing capabilities.
  - **Status Bar:** Footer row displaying:
    - Message Count
    - Context Usage (Tokens)
    - Current Model
    - Spinner (when Agent is thinking)
- **Keybindings (Emacs Style):**
  - `Ctrl+A` / `Ctrl+E`: Start/End of line.
  - `Ctrl+P` / `Ctrl+N`: Previous/Next line (in multi-line input).
  - `Ctrl+K`: Cut to end of line.
  - `Arrow Keys`: Cursor movement.
  - `Paste`: Support standard terminal paste events.

## Navigation & Focus Management

### Global Navigation
- **`Tab`**: Cycles focus forward between the three panes:
  1. Chat Pane
  2. Navigation Pane
  3. Input Pane
- **`Shift+Tab`**: Cycles focus backward.

### Pane-Specific Controls

#### Chat Pane (When Focused)
- `Up/Down` or `PgUp/PgDn`: Scroll history.
- `Enter`: Expand/Collapse selected tool result (if a list item is selected).

#### Navigation Pane (When Focused)
- `Left Arrow`: Switch to "Sessions" tab.
- `Right Arrow`: Switch to "Updated Files" tab.
- `Up/Down`: Highlight list items.
- `Enter`: Action (Load session / Diff file).

#### Input Pane (When Focused)
- Captures all text input.
- `Enter`: Submit message (unless Shift+Enter for new line, if supported, otherwise auto-submit on Enter).
- `Ctrl+C`: Exit application (global override).

## Component Hierarchy (Draft)

```tsx
<App>
  <FullScreen>
    <Box flexDirection="column"> <!-- Main Layout -->
      
      {/* Top Section */}
      <Box flexDirection="row" flexGrow={1}>
        <ChatPane />      {/* Focusable */}
        <NavigationPane /> {/* Focusable */}
      </Box>

      {/* Bottom Section */}
      <InputPane />       {/* Focusable (Default) */}
      
    </Box>
  </FullScreen>
</App>
```

## State Management
- **Focus State:** Managed by `ink`'s `useFocusManager` or local state to track active pane.
- **Input State:** Local state in `InputPane`.
- **Chat State:** Lifted to `App` or a dedicated Context/Store (messages array).
- **Navigation State:**
  - `activeTab`: 'sessions' | 'files'
  - `selection`: currently highlighted item.

## Implementation Steps
1.  **Setup:** Install `ink`, `react`, `ink-text-input`, `ink-select-input`, `ink-markdown`.
2.  **Scaffold:** Create the 3 `Box` layout.
3.  **Input:** Implement the `InputPane` with multi-line support.
4.  **Nav:** Implement the `NavigationPane` with the toggle logic.
5.  **Chat:** Connect the `ChatPane` to the existing `Agent` message stream.
6.  **Polish:** Add the status bar and refine keybindings.
