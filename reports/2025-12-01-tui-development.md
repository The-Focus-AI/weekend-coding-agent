---
title: "TUI Development: Ink + React"
date: 2025-12-01
topic: tui-development
recommendation: "ink"
version_researched: "ink 5.x"
use_when:
  - Building complex, interactive command-line tools in TypeScript
  - You need React's component model and state management (hooks)
  - You require flexible layouts (Flexbox) and focus management
avoid_when:
  - You need a simple prompt/response script (use `prompts` or `inquirer`)
  - You need extreme performance for raw log streaming (raw stdout is faster)
  - You cannot use Node.js runtime
project_context:
  language: TypeScript
  relevant_dependencies: ["tsx", "react"]
---

## Summary

For building a complex 3-pane TUI (Text User Interface) with focus management and rich interactivity, **Ink** is the clear industry standard in the Node.js ecosystem. It allows you to build terminal UIs using React components, leveraging the same declarative mental model used in web development[1].

We recommend a combination of standard Ink libraries to achieve your specific layout:
*   **Core:** `ink` (for layout, rendering, and hooks)
*   **Input:** `ink-text-input` (for simple inputs) or `ink-text-area` (for multi-line paragraphs)
*   **Rendering:** `ink-markdown` (for rich text/chat messages)
*   **Selection:** `ink-select-input` (for the file list/menus)
*   **Layout:** Native Flexbox via `Box` components

## Philosophy & Mental Model

Ink applies the **React component model** to `stdout`.
1.  **Everything is a Component:** Your TUI is a tree of `<Box>` and `<Text>` elements.
2.  **Flexbox Layout:** Layouts are controlled via flexbox properties (`flexDirection`, `justifyContent`) on `<Box>` components. There is no CSS grid; everything is nested boxes.
3.  **Hooks for Interactive Logic:**
    *   `useInput`: Listens for raw keystrokes (stdin).
    *   `useFocus`: Manages which component receives input.
    *   `useApp`: Accesses app lifecycle methods (exit).

## Setup

Install the core library and recommended components:

```bash
pnpm add ink react ink-markdown ink-text-input ink-select-input
pnpm add -D @types/react
```

*Note: You might need to install `ink-text-area` from a specific maintainer or copy a small implementation if the main package is outdated, but `ink-text-input` is the official standard for single lines.*

## Core Usage Patterns

### Pattern 1: The 3-Pane Layout (Flexbox)

Ink uses Yoga Layout (Flexbox) under the hood. To create a bottom input, top chat, and right sidebar:

```tsx
import React, { useState } from 'react';
import { Box, Text, useInput, useFocusManager } from 'ink';

export const App = () => {
  const { focusNext } = useFocusManager();

  // Global global keyboard shortcut to cycle focus
  useInput((input, key) => {
    if (key.return && key.meta) { // Example: Ctrl/Meta+Enter to submit
       // submit logic
    }
    if (key.tab) {
      focusNext();
    }
  });

  return (
    <Box flexDirection="row" height="100%">
      {/* Left Column (Chat + Input) */}
      <Box flexDirection="column" width="70%">
        
        {/* Top: Chat Window (Grow to fill space) */}
        <Box flexGrow={1} borderStyle="single" borderColor="green">
          <Text>Chat Messages Scroll Area</Text>
        </Box>

        {/* Bottom: Input Area (Fixed height) */}
        <Box height={5} borderStyle="single" borderColor="blue">
           <Text>Input Area</Text>
        </Box>
      
      </Box>

      {/* Right Column: Options/Files */}
      <Box width="30%" borderStyle="single" borderColor="yellow">
        <Text>File List</Text>
      </Box>
    </Box>
  );
};
```

### Pattern 2: Focus Management

To allow the user to "tab" between panels, wrap each interactive section in a component that uses `useFocus`.

```tsx
import { useFocus } from 'ink';

const FocusablePane = ({ label, children }) => {
  const { isFocused } = useFocus();
  
  return (
    <Box 
      borderStyle={isFocused ? "double" : "single"} 
      borderColor={isFocused ? "blue" : "gray"}
      flexDirection="column"
    >
      <Text bold={isFocused}>{label}</Text>
      {children}
    </Box>
  );
};
```

### Pattern 3: Manual Scrolling (Virtualization)

Ink does not have a native `<ScrollView>` that handles overflow automatically like a browser. You must implement "windowing" logic: only render the slice of messages that fit in the viewport.

```tsx
const ScrollableList = ({ items, height = 10 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { isFocused } = useFocus();

  useInput((input, key) => {
    if (!isFocused) return;
    
    if (key.upArrow) {
      setScrollTop(Math.max(0, scrollTop - 1));
    }
    if (key.downArrow) {
      setScrollTop(Math.min(items.length - height, scrollTop + 1));
    }
  });

  // Only render visible slice
  const visibleItems = items.slice(scrollTop, scrollTop + height);

  return (
    <Box flexDirection="column">
      {visibleItems.map(item => <Text key={item.id}>{item.text}</Text>)}
    </Box>
  );
};
```

### Pattern 4: Expandable Tool Calls

For the "expandable tool call" requirement, use simple React state.

```tsx
const ToolCall = ({ toolName, args, result }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box flexDirection="column">
      <Text color="yellow" onClick={() => setExpanded(!expanded)}>
        {expanded ? "▼" : "▶"} Called {toolName}
      </Text>
      
      {expanded && (
        <Box marginLeft={2} flexDirection="column">
          <Text color="gray">Args: {JSON.stringify(args)}</Text>
          <Text color="green">Result: {result}</Text>
        </Box>
      )}
    </Box>
  );
};
```

## Anti-Patterns & Pitfalls

### ❌ Don't: Rely on `console.log`
Logging to `console.log` while Ink is running will break the layout.
**Instead:** Use a specialized logger component that renders log lines into a specific part of your UI, or write logs to a file (`tail -f` in another window).

### ❌ Don't: Render 10,000 components at once
Ink renders to a string. Rendering a massive list without windowing/slicing will cause performance issues and flickering.
**Instead:** Always limit the number of rendered `<Text>` nodes to what fits on the screen (e.g., last 50 messages).

### ❌ Don't: Assume terminal size is static
Terminals can be resized.
**Instead:** Use the `useStdoutDimensions()` hook (from `ink`) to dynamically adjust the number of visible rows in your scrolling logic.

## References

[1] [Ink Repository](https://github.com/vadimdemedes/ink) - Official documentation and examples.
[2] [Ink UI](https://github.com/vadimdemedes/ink-ui) - Collection of reusable UI components.
[3] [Focus Management](https://github.com/vadimdemedes/ink?tab=readme-ov-file#usefocusoptions) - Official focus hook documentation.
