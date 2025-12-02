import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

interface TextAreaProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (value: string) => void;
    isActive: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({ value, onChange, onSubmit, isActive }) => {
    const [cursor, setCursor] = useState(value.length);

    // Sync cursor if value changes externally (e.g. cleared)
    useEffect(() => {
        if (value.length < cursor) {
            setCursor(value.length);
        }
    }, [value, cursor]);

    useInput((input, key) => {
        if (!isActive) return;

        if (key.return) {
            if (key.shift) {
                // Insert newline
                const nextValue = value.slice(0, cursor) + '\n' + value.slice(cursor);
                onChange(nextValue);
                setCursor(cursor + 1);
            } else {
                // Submit
                if (onSubmit) onSubmit(value);
            }
            return;
        }

        const isBackspace = key.backspace || (input.length === 1 && (input.charCodeAt(0) === 127 || input.charCodeAt(0) === 8));

        if (isBackspace) {
            if (cursor > 0) {
                const nextValue = value.slice(0, cursor - 1) + value.slice(cursor);
                onChange(nextValue);
                setCursor(cursor - 1);
            }
            return;
        }

        if (key.delete) {
            if (cursor < value.length) {
                const nextValue = value.slice(0, cursor) + value.slice(cursor + 1);
                onChange(nextValue);
                // cursor stays same
            } else {
                // Fallback: At end of line, 'delete' is useless as forward delete.
                // Treat it as backspace to help users with misconfigured terminals/Macs
                // where backspace sends delete code but input was stripped.
                if (cursor > 0) {
                    const nextValue = value.slice(0, cursor - 1) + value.slice(cursor);
                    onChange(nextValue);
                    setCursor(cursor - 1);
                }
            }
            return;
        }

        if (key.leftArrow) {
            if (cursor > 0) setCursor(cursor - 1);
            return;
        }

        if (key.rightArrow) {
            if (cursor < value.length) setCursor(cursor + 1);
            return;
        }

        // Ctrl+A (Home)
        if (key.ctrl && (input === 'a' || input === '\u0001')) {
            setCursor(0);
            return;
        }

        // Ctrl+E (End)
        if (key.ctrl && (input === 'e' || input === '\u0005')) {
            setCursor(value.length);
            return;
        }

        // Ctrl+B (Back)
        if (key.ctrl && (input === 'b' || input === '\u0002')) {
            if (cursor > 0) setCursor(cursor - 1);
            return;
        }

        // Ctrl+F (Forward)
        if (key.ctrl && (input === 'f' || input === '\u0006')) {
            if (cursor < value.length) setCursor(cursor + 1);
            return;
        }

        // Ctrl+K (Kill to end)
        if (key.ctrl && (input === 'k' || input === '\u000B')) {
            const nextValue = value.slice(0, cursor);
            onChange(nextValue);
            return;
        }

        // Ctrl+U (Kill to start)
        if (key.ctrl && (input === 'u' || input === '\u0015')) {
            const nextValue = value.slice(cursor);
            onChange(nextValue);
            setCursor(0);
            return;
        }

        // Simple text insertion
        // Filter out control keys to avoid inserting weird chars
        if (!key.ctrl && !key.meta && input.length === 1) {
             const nextValue = value.slice(0, cursor) + input + value.slice(cursor);
             onChange(nextValue);
             setCursor(cursor + input.length);
        }
    });

    // Render with cursor
    const beforeCursor = value.slice(0, cursor);
    const atCursor = value[cursor] || ' '; // Space if at end or empty
    const afterCursor = value.slice(cursor + 1);

    return (
        <Box flexDirection="row">
            <Text>{beforeCursor}</Text>
            <Text inverse color="cyan">{atCursor}</Text>
            <Text>{afterCursor}</Text>
        </Box>
    );
};
