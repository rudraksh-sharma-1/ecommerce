import React from 'react';
import { useMantineColorScheme, SegmentedControl, Group, Center, Box } from '@mantine/core';
import { IconSun, IconMoon, IconDevices } from '@tabler/icons-react';

export default function ColorModeSelect(props) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  
  if (!colorScheme) {
    return null;
  }
  
  const data = [
    {
      value: 'light',
      label: (
        <Center>
          <IconSun size="1rem" stroke={1.5} />
          <Box ml={10}>Light</Box>
        </Center>
      ),
    },
    {
      value: 'dark',
      label: (
        <Center>
          <IconMoon size="1rem" stroke={1.5} />
          <Box ml={10}>Dark</Box>
        </Center>
      ),
    },
    {
      value: 'auto',
      label: (
        <Center>
          <IconDevices size="1rem" stroke={1.5} />
          <Box ml={10}>System</Box>
        </Center>
      ),
    },
  ];

  return (
    <Group position="center" my="md">
      <SegmentedControl
        value={colorScheme}
        onChange={setColorScheme}
        data={data}
        {...props}
      />
    </Group>
  );
}
