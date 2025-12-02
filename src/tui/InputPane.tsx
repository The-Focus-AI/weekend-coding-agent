import React, { useState } from 'react';
import { Box } from 'ink';
import { TextArea } from './components/TextArea.js';

interface InputPaneProps {
    isActive: boolean;
    onSubmit?: (text: string) => void;
}

export const InputPane: React.FC<InputPaneProps> = ({ isActive, onSubmit }) => {
    const [value, setValue] = useState('');

    return (
        <Box 
            height={8}
            borderStyle={isActive ? 'double' : 'single'} 
            borderColor={isActive ? 'blue' : 'white'}
            flexDirection="column"
            padding={1}
        >
            <TextArea 
                value={value}
                onChange={setValue}
                onSubmit={(val) => {
                    if (onSubmit) onSubmit(val);
                    setValue('');
                }}
                isActive={isActive}
            />
        </Box>
    );
};
