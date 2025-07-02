import React, { useState, useEffect } from "react";
import { 
  Card, 
  Title, 
  Text, 
  Tabs, 
  Button, 
  TextInput, 
  Group, 
  Notification, 
  Divider, 
  PasswordInput, 
  Paper, 
  Container, 
  rem, 
  Alert,
  Stack,
  Avatar,
  Badge,
  ActionIcon,
  Tooltip
} from "@mantine/core";
import { 
  IconUser, 
  IconLock, 
  IconShield, 
  IconEdit,
  IconCheck,
  IconX,
  IconRefresh,
  IconPhone,
  IconMapPin,
  IconHome
} from "@tabler/icons-react";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import supabase from "../utils/supabase";
import { showNotification } from '@mantine/notifications';

export default function Settings() {
  const { currentUser } = useAdminAuth();
  
  // Profile state - enhanced with phone and address fields
  const [profile, setProfile] = useState({
    name: currentUser?.user_metadata?.name || currentUser?.user_metadata?.displayName || "",
    email: currentUser?.email || "",
    phone: "",
    houseNumber: "",
    streetAddress: "",
    suiteUnitFloor: "",
    locality: "",
    area: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    landmark: ""
  });
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Database profile details state
  const [dbProfile, setDbProfile] = useState(null);
  const [dbProfileLoading, setDbProfileLoading] = useState(true);
  
  // Security state
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Update profile when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfile(prev => ({
        ...prev,
        name: currentUser.user_metadata?.name || currentUser.user_metadata?.displayName || "",
        email: currentUser.email || ""
      }));
      
      // Fetch detailed profile from users table
      fetchDbProfile();
    }
  }, [currentUser]);

  // Fetch detailed profile from database
  const fetchDbProfile = async () => {
    if (!currentUser?.id) return;
    
    setDbProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", currentUser.id)
        .single();
        
      if (error) {
        setError('Failed to load profile data');
      } else {
        setDbProfile(data);
        // Update profile state with database values for editing
        setProfile(prev => ({
          ...prev,
          phone: data?.phone || "",
          houseNumber: data?.house_number || "",
          streetAddress: data?.street_address || "",
          suiteUnitFloor: data?.suite_unit_floor || "",
          locality: data?.locality || "",
          area: data?.area || "",
          city: data?.city || "",
          state: data?.state || "",
          postalCode: data?.postal_code || "",
          country: data?.country || "India",
          landmark: data?.landmark || ""
        }));
      }
    } catch (error) {
      setError('Failed to load profile data');
    } finally {
      setDbProfileLoading(false);
    }
  };

  // Profile update handler - update both auth metadata and database profile
  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      // 1. Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          name: profile.name,
          displayName: profile.name
        }
      });
      
      if (authError) {
        showNotification({
          message: authError.message,
          color: 'red'
        });
        return;
      }

      // 2. Update database profile with detailed fields
      const { error: dbError } = await supabase
        .from("users")
        .update({
          name: profile.name,
          phone: profile.phone || null,
          house_number: profile.houseNumber || null,
          street_address: profile.streetAddress || null,
          suite_unit_floor: profile.suiteUnitFloor || null,
          locality: profile.locality || null,
          area: profile.area || null,
          city: profile.city || null,
          state: profile.state || null,
          postal_code: profile.postalCode || null,
          country: profile.country || 'India',
          landmark: profile.landmark || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentUser.id);

      if (dbError) {
        showNotification({
          message: dbError.message,
          color: 'red'
        });
      } else {
        showNotification({
          message: 'Profile updated successfully!',
          color: 'green'
        });
        setProfileEdit(false);
        // Refresh the database profile
        fetchDbProfile();
      }
    } catch (error) {
      showNotification({
        message: 'Failed to update profile.',
        color: 'red'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async () => {
    if (!passwords.new || !passwords.confirm) {
      showNotification({
        message: 'Please fill in all password fields.',
        color: 'red'
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      showNotification({
        message: 'New passwords do not match.',
        color: 'red'
      });
      return;
    }

    if (passwords.new.length < 6) {
      showNotification({
        message: 'Password must be at least 6 characters long.',
        color: 'red'
      });
      return;
    }

    setPasswordLoading(true);
    try {
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) {
        showNotification({
          message: error.message,
          color: 'red'
        });
      } else {
        showNotification({
          message: 'Password updated successfully!',
          color: 'green'
        });
        setPasswords({ current: "", new: "", confirm: "" });
      }
    } catch (error) {
      showNotification({
        message: 'Failed to change password.',
        color: 'red'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const resetProfileChanges = () => {
    if (dbProfile) {
      setProfile({
        name: currentUser?.user_metadata?.name || currentUser?.user_metadata?.displayName || "",
        email: currentUser?.email || "",
        phone: dbProfile?.phone || "",
        houseNumber: dbProfile?.house_number || "",
        streetAddress: dbProfile?.street_address || "",
        suiteUnitFloor: dbProfile?.suite_unit_floor || "",
        locality: dbProfile?.locality || "",
        area: dbProfile?.area || "",
        city: dbProfile?.city || "",
        state: dbProfile?.state || "",
        postalCode: dbProfile?.postal_code || "",
        country: dbProfile?.country || "India",
        landmark: dbProfile?.landmark || ""
      });
    } else {
      setProfile({
        name: currentUser?.user_metadata?.name || currentUser?.user_metadata?.displayName || "",
        email: currentUser?.email || "",
        phone: "",
        houseNumber: "",
        streetAddress: "",
        suiteUnitFloor: "",
        locality: "",
        area: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        landmark: ""
      });
    }
    setProfileEdit(false);
  };

  return (
    <Container size="lg" py={32}>
      <Stack spacing={24}>
        {/* Header */}
        <div className="text-center">
          <Title order={1} className="mb-2">Admin Settings</Title>
          <Text color="dimmed" size="lg">Manage your account preferences and security</Text>
        </div>

        <Tabs defaultValue="profile" variant="outline" radius="md">
          <Tabs.List className="mb-6">
            <Tabs.Tab value="profile" leftSection={<IconUser size={18} />}>
              Profile
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconLock size={18} />}>
              Security
            </Tabs.Tab>
            <Tabs.Tab value="account" leftSection={<IconShield size={18} />}>
              Account Info
            </Tabs.Tab>
          </Tabs.List>

          {/* Profile Tab */}
          <Tabs.Panel value="profile">
            <Stack spacing="lg">
              {/* Basic Profile Information */}
              <Card shadow="sm" radius="md" p="xl" withBorder>
                <Group mb="lg">
                  <IconUser size={24} />
                  <Title order={3}>Basic Information</Title>
                </Group>

                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <Avatar 
                      size={80} 
                      radius="xl"
                      color="blue"
                    >
                      {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
                    </Avatar>
                  </div>

                  <div className="flex-1">
                    <Stack spacing="md">
                      <TextInput 
                        label="Display Name" 
                        value={profile.name} 
                        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} 
                        disabled={!profileEdit}
                        placeholder="Enter your display name"
                        leftSection={<IconUser size={16} />}
                      />
                      
                      <TextInput 
                        label="Email Address" 
                        value={profile.email} 
                        disabled={true}
                        placeholder="Email cannot be changed"
                        leftSection={<IconUser size={16} />}
                        description="Email address cannot be modified for security reasons"
                      />

                      <TextInput 
                        label="Phone Number" 
                        value={profile.phone} 
                        onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} 
                        disabled={!profileEdit}
                        placeholder="Enter your phone number"
                        leftSection={<IconPhone size={16} />}
                      />
                    </Stack>
                  </div>
                </div>
              </Card>

              {/* Address Information */}
              <Card shadow="sm" radius="md" p="xl" withBorder>
                <Group mb="lg">
                  <IconMapPin size={24} />
                  <Title order={3}>Address Information</Title>
                </Group>

                <Stack spacing="md">
                  <Group grow>
                    <TextInput 
                      label="House Number" 
                      value={profile.houseNumber} 
                      onChange={e => setProfile(p => ({ ...p, houseNumber: e.target.value }))} 
                      disabled={!profileEdit}
                      placeholder="House/Building number"
                    />
                    <TextInput 
                      label="Suite/Unit/Floor" 
                      value={profile.suiteUnitFloor} 
                      onChange={e => setProfile(p => ({ ...p, suiteUnitFloor: e.target.value }))} 
                      disabled={!profileEdit}
                      placeholder="Suite, Unit, or Floor"
                    />
                  </Group>

                  <TextInput 
                    label="Street Address" 
                    value={profile.streetAddress} 
                    onChange={e => setProfile(p => ({ ...p, streetAddress: e.target.value }))} 
                    disabled={!profileEdit}
                    placeholder="Street name and number"
                  />

                  <Group grow>
                    <TextInput 
                      label="Locality" 
                      value={profile.locality} 
                      onChange={e => setProfile(p => ({ ...p, locality: e.target.value }))} 
                      disabled={!profileEdit}
                      placeholder="Locality/Neighborhood"
                    />
                    <TextInput 
                      label="Area" 
                      value={profile.area} 
                      onChange={e => setProfile(p => ({ ...p, area: e.target.value }))} 
                      disabled={!profileEdit}
                      placeholder="Area"
                    />
                  </Group>

                  <Group grow>
                    <TextInput 
                      label="City" 
                      value={profile.city} 
                      onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} 
                      disabled={!profileEdit}
                      placeholder="City"
                    />
                    <TextInput 
                      label="State" 
                      value={profile.state} 
                      onChange={e => setProfile(p => ({ ...p, state: e.target.value }))} 
                      disabled={!profileEdit}
                      placeholder="State/Province"
                    />
                  </Group>

                  <Group grow>
                    <TextInput 
                      label="Postal Code" 
                      value={profile.postalCode} 
                      onChange={e => setProfile(p => ({ ...p, postalCode: e.target.value }))} 
                      disabled={!profileEdit}
                      placeholder="PIN/ZIP code"
                    />
                    <TextInput 
                      label="Country" 
                      value={profile.country} 
                      onChange={e => setProfile(p => ({ ...p, country: e.target.value }))} 
                      disabled={!profileEdit}
                      placeholder="Country"
                    />
                  </Group>

                  <TextInput 
                    label="Landmark" 
                    value={profile.landmark} 
                    onChange={e => setProfile(p => ({ ...p, landmark: e.target.value }))} 
                    disabled={!profileEdit}
                    placeholder="Nearby landmark (optional)"
                  />
                </Stack>
              </Card>

              {/* Action Buttons */}
              <Card shadow="sm" radius="md" p="xl" withBorder>
                <Group justify="space-between">
                  <div>
                    {profileEdit && (
                      <Text size="sm" color="blue">
                        <IconEdit size={16} className="inline mr-1" />
                        You are currently editing your profile
                      </Text>
                    )}
                  </div>
                  
                  <Group>
                    {profileEdit ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={resetProfileChanges}
                          leftSection={<IconX size={16} />}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleProfileSave} 
                          loading={profileLoading}
                          leftSection={<IconCheck size={16} />}
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setProfileEdit(true)}
                        leftSection={<IconEdit size={16} />}
                        disabled={dbProfileLoading}
                      >
                        {dbProfileLoading ? 'Loading...' : 'Edit Profile'}
                      </Button>
                    )}
                  </Group>
                </Group>
              </Card>
            </Stack>
          </Tabs.Panel>

          {/* Security Tab */}
          <Tabs.Panel value="security">
            <Card shadow="sm" radius="md" p="xl" withBorder>
              <Group mb="lg">
                <IconLock size={24} />
                <Title order={3}>Security Settings</Title>
              </Group>
              
              <Stack spacing="lg">
                <Divider label="Change Password" labelPosition="center" />
                
                <PasswordInput 
                  label="New Password" 
                  value={passwords.new} 
                  onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                  placeholder="Enter new password"
                  description="Password must be at least 6 characters long"
                  leftSection={<IconLock size={16} />}
                />
                
                <PasswordInput 
                  label="Confirm New Password" 
                  value={passwords.confirm} 
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Confirm your new password"
                  leftSection={<IconLock size={16} />}
                />
                
                <Group justify="flex-end">
                  <Button 
                    onClick={handlePasswordChange}
                    loading={passwordLoading}
                    disabled={!passwords.new || !passwords.confirm}
                    leftSection={<IconRefresh size={16} />}
                  >
                    Update Password
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* Account Info Tab */}
          <Tabs.Panel value="account">
            <Card shadow="sm" radius="md" p="xl" withBorder>
              <Group mb="lg">
                <IconShield size={24} />
                <Title order={3}>Account Information</Title>
              </Group>

              {currentUser && (
                <Stack spacing="md">
                  <Alert color="blue" radius="md">
                    <Stack spacing="sm">
                      <Group justify="space-between">
                        <Text fw={500}>User ID:</Text>
                        <Badge variant="light">{currentUser.id}</Badge>
                      </Group>
                      
                      <Group justify="space-between">
                        <Text fw={500}>Email:</Text>
                        <Text>{currentUser.email}</Text>
                      </Group>
                      
                      <Group justify="space-between">
                        <Text fw={500}>Role:</Text>
                        <Badge color="red" variant="filled">
                          {currentUser.user_metadata?.role || 'Admin'}
                        </Badge>
                      </Group>
                      
                      <Group justify="space-between">
                        <Text fw={500}>Account Created:</Text>
                        <Text>{new Date(currentUser.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</Text>
                      </Group>
                      
                      <Group justify="space-between">
                        <Text fw={500}>Last Login:</Text>
                        <Text>
                          {currentUser.last_sign_in_at 
                            ? new Date(currentUser.last_sign_in_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'
                          }
                        </Text>
                      </Group>
                      
                      <Group justify="space-between">
                        <Text fw={500}>Email Verified:</Text>
                        <Badge color={currentUser.email_confirmed_at ? "green" : "orange"}>
                          {currentUser.email_confirmed_at ? "Verified" : "Pending"}
                        </Badge>
                      </Group>
                    </Stack>
                  </Alert>

                  <Alert color="yellow" title="Security Notice">
                    <Text size="sm">
                      For security reasons, certain account details cannot be modified through this interface. 
                      Contact system administrator for account-level changes.
                    </Text>
                  </Alert>
                </Stack>
              )}
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
