import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';

interface NavigationPaneProps {
    isActive: boolean;
}

export const NavigationPane: React.FC<NavigationPaneProps> = ({ isActive }) => {
    const [activeTab, setActiveTab] = useState<'sessions' | 'files'>('sessions');

    useInput((input, key) => {
        if (!isActive) return;

        if (key.leftArrow) setActiveTab('sessions');
        if (key.rightArrow) setActiveTab('files');
    });

    return (
        <Box 
            flexGrow={1} 
            flexBasis="33%" 
            borderStyle={isActive ? 'double' : 'single'} 
            borderColor={isActive ? 'blue' : 'white'}
            flexDirection="column"
            padding={1}
        >
            <Box flexDirection="row" marginBottom={1}>
                <Text bold={activeTab === 'sessions'} color={activeTab === 'sessions' ? 'blue' : 'white'}>
                    Sessions
                </Text>
                <Text> | </Text>
                <Text bold={activeTab === 'files'} color={activeTab === 'files' ? 'blue' : 'white'}>
                    Files
                </Text>
            </Box>

            {activeTab === 'sessions' ? (
                <SelectInput 
                    isFocused={isActive}
                    items={[
                        { label: 'Session 1', value: '1' },
                        { label: 'Session 2', value: '2' },
                    ]}
                    onSelect={(item) => {
                        // Handle load session
                    }}
                />
            ) : (
                 <SelectInput 
                    isFocused={isActive}
                    items={[
                        { label: 'src/index.ts', value: 'src/index.ts' },
                        { label: 'package.json', value: 'package.json' },
                    ]}
                    onSelect={(item) => {
                        // Handle view file
                    }}
                />
            )}
        </Box>
    );
};
