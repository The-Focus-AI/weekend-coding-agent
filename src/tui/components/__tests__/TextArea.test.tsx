import React from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';
import { TextArea } from '../TextArea.js';
import { describe, it, expect, vi } from 'vitest';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('TextArea', () => {
    it('handles backspace key (\\x08) correctly', async () => {
        const onChange = vi.fn();
        const { stdin } = render(
            <TextArea 
                value="Hello" 
                onChange={onChange} 
                isActive={true} 
            />
        );
        
        await delay(10);
        // Initial: "Hello" cursor 5.
        stdin.write('\x08'); // Backspace
        await delay(10);

        // Expect "Hell"
        expect(onChange).toHaveBeenCalledWith('Hell');
    });

    it('handles Ctrl+A (Start of Line) correctly', async () => {
        const onChange = vi.fn();
        const { stdin } = render(
            <TextArea 
                value="Hello" 
                onChange={onChange} 
                isActive={true} 
            />
        );
        
        await delay(10);
        // Ctrl+A -> Cursor to 0
        stdin.write('\x01');
        await delay(10);
        
        // Type 'X'
        stdin.write('X');
        await delay(10);
        
        // Should be "XHello"
        expect(onChange).toHaveBeenCalledWith('XHello');
    });

    it('handles Ctrl+E (End of Line) correctly', async () => {
        const onChange = vi.fn();
        const { stdin } = render(
            <TextArea 
                value="Hello" 
                onChange={onChange} 
                isActive={true} 
            />
        );
        
        await delay(10);
        // Ctrl+A -> Cursor to 0
        stdin.write('\x01');
        await delay(10);
        
        // Ctrl+E -> Cursor to end (5)
        stdin.write('\x05');
        await delay(10);

        // Type 'X'
        stdin.write('X');
        await delay(10);
        
        // Should be "HelloX"
        expect(onChange).toHaveBeenCalledWith('HelloX');
    });

    it('handles Ctrl+K (Kill to End) correctly', async () => {
        const onChange = vi.fn();
        const { stdin } = render(
            <TextArea 
                value="Hello" 
                onChange={onChange} 
                isActive={true} 
            />
        );
        
        await delay(10);
        // Move left twice: Hel|lo
        stdin.write('\u001B[D'); 
        await delay(20);
        stdin.write('\u001B[D'); 
        await delay(20);
        
        // Ctrl+K -> Kill "lo"
        stdin.write('\x0B');
        await delay(10);
        
        expect(onChange).toHaveBeenCalledWith('Hel');
    });

    it('handles Ctrl+U (Kill to Start) correctly', async () => {
        const onChange = vi.fn();
        const { stdin } = render(
            <TextArea 
                value="Hello" 
                onChange={onChange} 
                isActive={true} 
            />
        );
        
        await delay(10);
        // Move left twice: Hel|lo
        stdin.write('\u001B[D'); 
        await delay(20);
        stdin.write('\u001B[D'); 
        await delay(20);
        
        // Ctrl+U -> Kill "Hel"
        stdin.write('\x15');
        await delay(10);
        
        expect(onChange).toHaveBeenCalledWith('lo');
    });

    // This test passes now because of the fallback logic for key.delete at end of line
    it('handles delete key (\\x7F) as backspace', async () => {
        const onChange = vi.fn();
        const { stdin } = render(
            <TextArea 
                value="Hello" 
                onChange={onChange} 
                isActive={true} 
            />
        );
        
        await delay(10);
        stdin.write('\x7F'); 
        await delay(10);
        
        // Should behave like backspace: "Hell"
        expect(onChange).toHaveBeenCalledWith('Hell');
    });

    it('handles forward delete key correctly', async () => {
        const onChange = vi.fn();
        const { stdin } = render(
            <TextArea 
                value="Hello" 
                onChange={onChange} 
                isActive={true} 
            />
        );
        
        await delay(10);
        // Move cursor left twice: Hello -> Hell|o -> Hel|lo
        stdin.write('\u001B[D'); 
        await delay(20);
        stdin.write('\u001B[D'); 
        await delay(20);
        
        // Forward Delete (\x1B[3~)
        stdin.write('\u001B[3~'); 
        await delay(10);
        
        // Should delete 'l' at index 3: "Helo"
        expect(onChange).toHaveBeenCalledWith('Helo');
    });
});
