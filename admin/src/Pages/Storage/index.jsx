import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Text, 
  Group, 
  Progress, 
  Button, 
  ActionIcon, 
  Loader, 
  Alert, 
  Badge, 
  Stack, 
  Grid, 
  Divider,
  Table,
  Tooltip,
  RingProgress,
  Center
} from '@mantine/core';
import { 
  FaDatabase, 
  FaSync, 
  FaCloud, 
  FaHdd, 
  FaFolder, 
  FaImage, 
  FaChartPie, 
  FaInfoCircle,
  FaDownload,
  FaTrash,
  FaEye,
  FaClock,
  FaFileAlt
} from 'react-icons/fa';
import { getStorageUsage } from '../../utils/supabaseApi';

const StorageDetailsPage = () => {
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStorageUsage = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const result = await getStorageUsage();
      
      if (result.success) {
        setStorageData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error fetching storage usage:', err);
      setError('Failed to fetch storage usage');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStorageUsage();
  }, []);

  const handleRefresh = () => {
    fetchStorageUsage();
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'green';
    if (percentage < 80) return 'yellow';
    return 'red';
  };

  const getUsageStatus = (percentage) => {
    if (percentage < 50) return 'Healthy';
    if (percentage < 80) return 'Moderate';
    if (percentage < 95) return 'High';
    return 'Critical';
  };

  const getBucketIcon = (bucketName) => {
    switch (bucketName.toLowerCase()) {
      case 'products': return '📦';
      case 'banners': return '🎯';
      case 'categories': return '📂';
      case 'prints': return '🖨️';
      default: return '💾';
    }
  };

  const getBucketDescription = (bucketName) => {
    switch (bucketName.toLowerCase()) {
      case 'products': return 'Product images and media files';
      case 'banners': return 'Homepage and promotional banners';
      case 'categories': return 'Category icons and images';
      case 'prints': return 'Custom print request files';
      default: return 'General storage bucket';
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Title order={2} className="mb-6">Storage Analytics</Title>
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Title order={2} className="mb-6">Storage Analytics</Title>
          <Alert color="red" title="Error loading storage data">
            {error}
            <Button onClick={handleRefresh} leftIcon={<FaSync />} mt="md">
              Retry
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  const totalFiles = Object.values(storageData?.buckets || {}).reduce((sum, bucket) => sum + bucket.files, 0);
  const bucketEntries = Object.entries(storageData?.buckets || {}).sort(([,a], [,b]) => b.size - a.size);
  const usageColor = getUsageColor(storageData?.usagePercentage || 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Title order={2}>Storage Analytics</Title>
          <Group>
            <Text size="sm" color="dimmed">
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
            <ActionIcon onClick={handleRefresh} loading={refreshing} size="lg">
              <FaSync size={16} />
            </ActionIcon>
          </Group>
        </div>

        {/* Overview Cards */}
        <Grid mb="xl">
          <Grid.Col span={12} md={3}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                    Total Storage
                  </Text>
                  <Text size="xl" weight={700}>
                    {storageData?.totalUsageFormatted || '0 B'}
                  </Text>
                  <Text size="sm" color="dimmed">
                    of {storageData?.freeStorageLimitFormatted || '1 GB'}
                  </Text>
                </div>
                <FaHdd size={32} color="#228be6" />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={12} md={3}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                    Total Files
                  </Text>
                  <Text size="xl" weight={700}>
                    {totalFiles.toLocaleString()}
                  </Text>
                  <Text size="sm" color="dimmed">
                    across {storageData?.bucketCount || 0} buckets
                  </Text>
                </div>
                <FaImage size={32} color="#40c057" />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={12} md={3}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                    Usage Status
                  </Text>
                  <Text size="xl" weight={700} color={usageColor}>
                    {(storageData?.usagePercentage || 0).toFixed(1)}%
                  </Text>
                  <Badge color={usageColor} variant="light" size="sm">
                    {getUsageStatus(storageData?.usagePercentage || 0)}
                  </Badge>
                </div>
                <FaChartPie size={32} color="#fd7e14" />
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={12} md={3}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group position="apart">
                <div>
                  <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                    Remaining
                  </Text>
                  <Text size="xl" weight={700} color="green">
                    {formatBytes((storageData?.freeStorageLimit || 0) - (storageData?.totalUsage || 0))}
                  </Text>
                  <Text size="sm" color="dimmed">
                    {(100 - (storageData?.usagePercentage || 0)).toFixed(1)}% free
                  </Text>
                </div>
                <FaCloud size={32} color="#51cf66" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        <Grid>
          {/* Storage Usage Visualization */}
          <Grid.Col span={12} md={4}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="h-full">
              <Title order={4} mb="md">Usage Distribution</Title>
              
              <Center mb="md">
                <RingProgress
                  size={180}
                  thickness={16}
                  sections={[
                    { value: storageData?.usagePercentage || 0, color: usageColor }
                  ]}
                  label={
                    <Text size="xs" align="center">
                      <Text size="lg" weight={700}>
                        {(storageData?.usagePercentage || 0).toFixed(1)}%
                      </Text>
                      <br />
                      Used
                    </Text>
                  }
                />
              </Center>

              <Stack spacing="xs">
                <Group position="apart">
                  <Text size="sm">Used</Text>
                  <Text size="sm" weight={500}>{storageData?.totalUsageFormatted || '0 B'}</Text>
                </Group>
                <Group position="apart">
                  <Text size="sm">Free</Text>
                  <Text size="sm" weight={500} color="green">
                    {formatBytes((storageData?.freeStorageLimit || 0) - (storageData?.totalUsage || 0))}
                  </Text>
                </Group>
                <Group position="apart">
                  <Text size="sm">Total</Text>
                  <Text size="sm" weight={500}>{storageData?.freeStorageLimitFormatted || '1 GB'}</Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Bucket Breakdown */}
          <Grid.Col span={12} md={8}>
            <Card shadow="sm" padding="lg" radius="md" withBorder className="h-full">
              <Title order={4} mb="md">Storage Buckets</Title>
              
              <Stack spacing="md">
                {bucketEntries.map(([bucketName, bucketInfo]) => {
                  const bucketPercentage = storageData.totalUsage > 0 ? (bucketInfo.size / storageData.totalUsage) * 100 : 0;
                  const avgFileSize = bucketInfo.files > 0 ? bucketInfo.size / bucketInfo.files : 0;
                  
                  return (
                    <div key={bucketName}>
                      <Group position="apart" mb="xs">
                        <Group>
                          <span style={{ fontSize: '20px' }}>{getBucketIcon(bucketName)}</span>
                          <div>
                            <Text weight={500}>{bucketName}</Text>
                            <Text size="xs" color="dimmed">{getBucketDescription(bucketName)}</Text>
                          </div>
                          {bucketInfo.public && (
                            <Badge size="xs" color="blue" variant="outline">Public</Badge>
                          )}
                        </Group>
                        <div className="text-right">
                          <Text weight={500}>{formatBytes(bucketInfo.size)}</Text>
                          <Text size="xs" color="dimmed">
                            {bucketInfo.files} files • {formatBytes(avgFileSize)}/file
                          </Text>
                        </div>
                      </Group>
                      
                      <Progress
                        value={bucketPercentage}
                        color={bucketPercentage > 60 ? 'red' : bucketPercentage > 30 ? 'yellow' : 'blue'}
                        size="sm"
                        radius="sm"
                        mb="xs"
                      />
                      
                      <Group position="apart">
                        <Text size="xs" color="dimmed">
                          {bucketPercentage.toFixed(1)}% of total storage
                        </Text>
                        <Text size="xs" color="dimmed">
                          {((bucketInfo.size / (storageData?.freeStorageLimit || 1)) * 100).toFixed(2)}% of free tier
                        </Text>
                      </Group>
                      
                      {bucketName !== bucketEntries[bucketEntries.length - 1][0] && (
                        <Divider my="md" />
                      )}
                    </div>
                  );
                })}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Recommendations */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
          <Title order={4} mb="md">Storage Recommendations</Title>
          
          <Grid>
            <Grid.Col span={12} md={6}>
              <div className="p-4 bg-blue-50 rounded">
                <Group mb="sm">
                  <FaInfoCircle color="#228be6" />
                  <Text weight={500} color="blue">Optimization Tips</Text>
                </Group>
                <Stack spacing="xs">
                  <Text size="sm">• Compress images before uploading</Text>
                  <Text size="sm">• Use WebP format for better compression</Text>
                  <Text size="sm">• Remove unused files regularly</Text>
                  <Text size="sm">• Monitor large file uploads</Text>
                </Stack>
              </div>
            </Grid.Col>
            
            <Grid.Col span={12} md={6}>
              <div className="p-4 bg-green-50 rounded">
                <Group mb="sm">
                  <FaCloud color="#40c057" />
                  <Text weight={500} color="green">Current Plan Benefits</Text>
                </Group>
                <Stack spacing="xs">
                  <Text size="sm">• 1 GB free storage included</Text>
                  <Text size="sm">• Global CDN for fast delivery</Text>
                  <Text size="sm">• Automatic backups and security</Text>
                  <Text size="sm">• 99.9% uptime guarantee</Text>
                </Stack>
              </div>
            </Grid.Col>
          </Grid>
        </Card>
      </div>
    </div>
  );
};

export default StorageDetailsPage;
