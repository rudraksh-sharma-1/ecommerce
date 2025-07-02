import React, { useState } from "react";
import { Card, Title, Text, Avatar, TextInput, Button, FileInput, Group, Loader, Notification } from "@mantine/core";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { updateUser } from "../utils/supabaseApi";

export default function Profile() {
  const { currentUser } = useAdminAuth();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(currentUser?.user_metadata?.name || currentUser?.displayName || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [avatar, setAvatar] = useState(currentUser?.user_metadata?.avatar_url || currentUser?.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: "", color: "blue" });

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatePayload = { name, email, avatar_url: avatar };
      const result = await updateUser(currentUser.id, updatePayload, avatarFile);
      if (result.success) {
        setNotification({ visible: true, message: "Profile updated successfully!", color: "green" });
        setEditMode(false);
      } else {
        setNotification({ visible: true, message: result.error, color: "red" });
      }
    } catch (error) {
      setNotification({ visible: true, message: "Failed to update profile.", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card shadow="sm" padding="lg" radius="md" className="w-full max-w-md">
        <div className="flex flex-col items-center">
          <Avatar src={avatar} size={80} radius="xl" />
          {editMode ? (
            <>
              <FileInput label="Avatar" accept="image/*" onChange={setAvatarFile} className="w-full mt-2" />
              <TextInput label="Name" value={name} onChange={e => setName(e.target.value)} className="w-full mt-2" />
              <TextInput label="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-2" />
            </>
          ) : (
            <>
              <Title order={2} className="mt-4">{name || "Admin User"}</Title>
              <Text color="dimmed" size="sm" className="mb-2">{email}</Text>
            </>
          )}
        </div>
        <div className="mt-6">
          <Text size="sm"><b>UID:</b> {currentUser?.id || currentUser?.uid}</Text>
        </div>
        <Group mt="md" position="right">
          {editMode ? (
            <>
              <Button onClick={handleSave} color="blue" loading={loading}>Save</Button>
              <Button onClick={() => setEditMode(false)} variant="outline" color="gray">Cancel</Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)} color="blue">Edit Profile</Button>
          )}
        </Group>
        {notification.visible && (
          <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })} mt="md">
            {notification.message}
          </Notification>
        )}
      </Card>
    </div>
  );
}
