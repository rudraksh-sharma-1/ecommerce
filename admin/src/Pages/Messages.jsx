import React from "react";
import { Card, Title, Text } from "@mantine/core";

export default function Messages() {
  return (
    <div className="flex justify-center items-center h-full">
      <Card shadow="sm" padding="lg" radius="md" className="w-full max-w-md">
        <Title order={2}>Messages</Title>
        <Text color="dimmed" size="sm" className="mt-2">This is a placeholder for the messages page.</Text>
      </Card>
    </div>
  );
}
