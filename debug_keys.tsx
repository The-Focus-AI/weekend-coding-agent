import React from 'react';
import { render, useInput, Text, Box } from 'ink';

const KeyDebugger = () => {
    const [lastLog, setLastLog] = React.useState('');

    useInput((input, key) => {
        const charCode = input.length > 0 ? input.charCodeAt(0) : 'empty';
        setLastLog(JSON.stringify(key) + ` input_code=${charCode}`);
        if (input === 'q') process.exit(0);
    });

    return (
        <Box flexDirection="column">
            <Text>Press keys to debug. Press 'q' to exit.</Text>
            <Text>{lastLog}</Text>
        </Box>
    );
};

render(<KeyDebugger />);
