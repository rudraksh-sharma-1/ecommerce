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
  Center,
  Modal,
  TextInput,
  Select,
  Tabs,
  Avatar,
  ScrollArea,
  Notification
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
  FaFileAlt,
  FaFile,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaSearch,
  FaSort,
  FaFilter,
  FaExclamationTriangle
} from 'react-icons/fa';
import { MdAnalytics, MdInsights } from 'react-icons/md';
import { getStorageAnalytics, listBucketFiles, deleteStorageFile, getFileInfo } from '../../utils/supabaseApi';

const EnhancedStoragePage = () => {
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [bucketFiles, setBucketFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [fileSearch, setFileSearch] = useState('');
  const [sortBy, setSortBy] = useState('size');
  const [filterType, setFilterType] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchStorageAnalytics = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const result = await getStorageAnalytics();
      
      if (result.success) {
        setStorageData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error fetching storage analytics:', err);
      setError('Failed to fetch storage analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBucketFiles = async (bucketName) => {
    try {
      setFilesLoading(true);
      const result = await listBucketFiles(bucketName);
      
      if (result.success) {
        setBucketFiles(result.data);
      } else {
        setNotification({ type: 'error', message: `Failed to load files: ${result.error}` });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to load bucket files' });
    } finally {
      setFilesLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;
    
    try {
      const result = await deleteStorageFile(selectedFile.bucket, selectedFile.path);
      
      if (result.success) {
        setNotification({ type: 'success', message: 'File deleted successfully' });
        setBucketFiles(files => files.filter(f => f.path !== selectedFile.path));
        fetchStorageAnalytics(); // Refresh storage data
      } else {
        setNotification({ type: 'error', message: `Failed to delete file: ${result.error}` });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete file' });
    } finally {
      setDeleteModalOpen(false);
      setSelectedFile(null);
    }
  };

  useEffect(() => {
    fetchStorageAnalytics();
  }, []);

  useEffect(() => {
    if (selectedBucket) {
      fetchBucketFiles(selectedBucket);
    }
  }, [selectedBucket]);

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleRefresh = () => {
    fetchStorageAnalytics();
    if (selectedBucket) {
      fetchBucketFiles(selectedBucket);
    }
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

  const getFileIcon = (file) => {
    if (file.isImage) return <FaFileImage color="#40c057" />;
    if (file.contentType.includes('pdf')) return <FaFilePdf color="#fd7e14" />;
    if (file.contentType.includes('video')) return <FaFileVideo color="#da77f2" />;
    return <FaFile color="#868e96" />;
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const filteredFiles = bucketFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(fileSearch.toLowerCase());
    const matchesType = filterType === 'all' || 
      (filterType === 'images' && file.isImage) ||
      (filterType === 'large' && file.size > 1024 * 1024); // 1MB+
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'size': return b.size - a.size;
      case 'date': return new Date(b.lastModified) - new Date(a.lastModified);
      default: return 0;
    }
  });

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Title order={2} className="mb-6">Enhanced Storage Analytics</Title>
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Title order={2} className="mb-6">Enhanced Storage Analytics</Title>
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Title order={2} className="text-gray-900 dark:text-gray-100">Enhanced Storage Analytics</Title>
          <Group>
            <Text size="sm" color="dimmed" className="dark:text-gray-300">
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
            <ActionIcon onClick={handleRefresh} loading={refreshing} size="lg">
              <FaSync size={16} />
            </ActionIcon>
          </Group>
        </div>

        {/* Notification */}
        {notification && (
          <div className="mb-4">
            <Alert 
              color={notification.type === 'success' ? 'green' : 'red'}
              onClose={() => setNotification(null)}
              withCloseButton
              className="dark:bg-gray-800 dark:text-gray-100"
            >
              {notification.message}
            </Alert>
          </div>
        )}

        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" icon={<FaChartPie />} className="dark:text-gray-200">Overview</Tabs.Tab>
            {/* <Tabs.Tab value="files" icon={<FaFolder />} className="dark:text-gray-200">File Management</Tabs.Tab>
            <Tabs.Tab value="insights" icon={<MdInsights />} className="dark:text-gray-200">Insights</Tabs.Tab> */}
          </Tabs.List>

          {/* Overview Tab */}
          <Tabs.Panel value="overview" pt="md">
            {/* Overview Cards */}
            <Grid mb="xl">
              <Grid.Col span={12} md={3}>
                <Card shadow="sm" padding="lg" radius="md" withBorder className="dark:bg-gray-800 dark:text-gray-100">
                  <Group position="apart">
                    <div>
                      <Text size="xs" color="dimmed" transform="uppercase" weight={700} className="dark:text-gray-400">
                        Total Storage
                      </Text>
                      <Text size="xl" weight={700} className="dark:text-gray-100">
                        {storageData?.totalUsageFormatted || '0 B'}
                      </Text>
                      <Text size="sm" color="dimmed" className="dark:text-gray-400">
                        of {storageData?.freeStorageLimitFormatted || '1 GB'}
                      </Text>
                    </div>
                    <FaHdd size={32} color="#228be6" />
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={12} md={3}>
                <Card shadow="sm" padding="lg" radius="md" withBorder className="dark:bg-gray-800 dark:text-gray-100">
                  <Group position="apart">
                    <div>
                      <Text size="xs" color="dimmed" transform="uppercase" weight={700} className="dark:text-gray-400">
                        Total Files
                      </Text>
                      <Text size="xl" weight={700} className="dark:text-gray-100">
                        {totalFiles.toLocaleString()}
                      </Text>
                      <Text size="sm" color="dimmed" className="dark:text-gray-400">
                        across {storageData?.bucketCount || 0} buckets
                      </Text>
                    </div>
                    <FaImage size={32} color="#40c057" />
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={12} md={3}>
                <Card shadow="sm" padding="lg" radius="md" withBorder className="dark:bg-gray-800 dark:text-gray-100">
                  <Group position="apart">
                    <div>
                      <Text size="xs" color="dimmed" transform="uppercase" weight={700} className="dark:text-gray-400">
                        Usage Status
                      </Text>
                      <Text size="xl" weight={700} color={usageColor} className="dark:text-gray-100">
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
                <Card shadow="sm" padding="lg" radius="md" withBorder className="dark:bg-gray-800 dark:text-gray-100">
                  <Group position="apart">
                    <div>
                      <Text size="xs" color="dimmed" transform="uppercase" weight={700} className="dark:text-gray-400">
                        Remaining
                      </Text>
                      <Text size="xl" weight={700} color="green" className="dark:text-gray-100">
                        {formatBytes((storageData?.freeStorageLimit || 0) - (storageData?.totalUsage || 0))}
                      </Text>
                      <Text size="sm" color="dimmed" className="dark:text-gray-400">
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
                <Card shadow="sm" padding="lg" radius="md" withBorder className="h-full dark:bg-gray-800 dark:text-gray-100">
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
                <Card shadow="sm" padding="lg" radius="md" withBorder className="h-full dark:bg-gray-800 dark:text-gray-100">
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
                                <Group spacing="xs">
                                  <Text weight={500}>{bucketName}</Text>
                                  <Button 
                                    variant="subtle" 
                                    size="xs" 
                                    onClick={() => {
                                      setSelectedBucket(bucketName);
                                      setActiveTab('files');
                                    }}
                                  >
                                    View Files
                                  </Button>
                                </Group>
                                <Text size="xs" color="dimmed">
                                  {bucketInfo.files} files • {formatBytes(avgFileSize)}/file avg
                                </Text>
                              </div>
                              {bucketInfo.public && (
                                <Badge size="xs" color="blue" variant="outline">Public</Badge>
                              )}
                            </Group>
                            <div className="text-right">
                              <Text weight={500}>{formatBytes(bucketInfo.size)}</Text>
                              <Text size="xs" color="dimmed">
                                {bucketPercentage.toFixed(1)}% of total
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
          </Tabs.Panel>

          {/* File Management Tab */}
          <Tabs.Panel value="files" pt="md">
            <Grid>
              <Grid.Col span={12} md={3}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Title order={5} mb="md">Select Bucket</Title>
                  <Stack spacing="xs">
                    {bucketEntries.map(([bucketName, bucketInfo]) => (
                      <Button
                        key={bucketName}
                        variant={selectedBucket === bucketName ? "filled" : "light"}
                        fullWidth
                        leftIcon={<span style={{ fontSize: '16px' }}>{getBucketIcon(bucketName)}</span>}
                        onClick={() => setSelectedBucket(bucketName)}
                        size="sm"
                      >
                        <div className="text-left">
                          <div>{bucketName}</div>
                          <Text size="xs" color="dimmed">
                            {bucketInfo.files} files • {formatBytes(bucketInfo.size)}
                          </Text>
                        </div>
                      </Button>
                    ))}
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={12} md={9}>
                {selectedBucket ? (
                  <Card shadow="sm" padding="md" radius="md" withBorder>
                    <Group position="apart" mb="md">
                      <Title order={5}>Files in {selectedBucket}</Title>
                      <Button onClick={() => fetchBucketFiles(selectedBucket)} loading={filesLoading}>
                        <FaSync size={14} />
                      </Button>
                    </Group>

                    {/* File Filters */}
                    <Group mb="md">
                      <TextInput
                        placeholder="Search files..."
                        icon={<FaSearch />}
                        value={fileSearch}
                        onChange={(e) => setFileSearch(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <Select
                        placeholder="Sort by"
                        icon={<FaSort />}
                        data={[
                          { value: 'size', label: 'Size (largest first)' },
                          { value: 'name', label: 'Name (A-Z)' },
                          { value: 'date', label: 'Date (newest first)' }
                        ]}
                        value={sortBy}
                        onChange={setSortBy}
                      />
                      <Select
                        placeholder="Filter"
                        icon={<FaFilter />}
                        data={[
                          { value: 'all', label: 'All files' },
                          { value: 'images', label: 'Images only' },
                          { value: 'large', label: 'Large files (1MB+)' }
                        ]}
                        value={filterType}
                        onChange={setFilterType}
                      />
                    </Group>

                    {/* Files Table */}
                    {filesLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader />
                      </div>
                    ) : (
                      <ScrollArea style={{ height: 400 }}>
                        <Table striped highlightOnHover>
                          <thead>
                            <tr>
                              <th>File</th>
                              <th>Size</th>
                              <th>Type</th>
                              <th>Modified</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredFiles.map((file) => (
                              <tr key={file.path}>
                                <td>
                                  <Group>
                                    {getFileIcon(file)}
                                    <div>
                                      <Text size="sm" weight={500}>{file.name}</Text>
                                      <Text size="xs" color="dimmed">{file.folder || '/'}</Text>
                                    </div>
                                  </Group>
                                </td>
                                <td>
                                  <Text size="sm">{file.sizeFormatted}</Text>
                                </td>
                                <td>
                                  <Badge size="xs" variant="outline">
                                    {file.contentType.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
                                  </Badge>
                                </td>
                                <td>
                                  <Text size="xs" color="dimmed">
                                    {new Date(file.lastModified).toLocaleDateString()}
                                  </Text>
                                </td>
                                <td>
                                  <Group spacing="xs">
                                    {file.isImage && (
                                      <Tooltip label="Preview">
                                        <ActionIcon
                                          size="sm"
                                          onClick={() => {
                                            setSelectedFile({ ...file, bucket: selectedBucket });
                                            setFileModalOpen(true);
                                          }}
                                        >
                                          <FaEye />
                                        </ActionIcon>
                                      </Tooltip>
                                    )}
                                    <Tooltip label="Download">
                                      <ActionIcon
                                        size="sm"
                                        onClick={() => window.open(file.url, '_blank')}
                                      >
                                        <FaDownload />
                                      </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Delete">
                                      <ActionIcon
                                        size="sm"
                                        color="red"
                                        onClick={() => {
                                          setSelectedFile({ ...file, bucket: selectedBucket });
                                          setDeleteModalOpen(true);
                                        }}
                                      >
                                        <FaTrash />
                                      </ActionIcon>
                                    </Tooltip>
                                  </Group>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        {filteredFiles.length === 0 && (
                          <div className="text-center py-8">
                            <Text color="dimmed">No files found matching your criteria.</Text>
                          </div>
                        )}
                      </ScrollArea>
                    )}
                  </Card>
                ) : (
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <div className="text-center py-16">
                      <FaFolder size={48} className="mx-auto mb-4 text-gray-400" />
                      <Text color="dimmed">Select a bucket to view its files</Text>
                    </div>
                  </Card>
                )}
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* Insights Tab */}
          <Tabs.Panel value="insights" pt="md">
            <Grid>
              {/* Largest Files */}
              <Grid.Col span={12} md={6}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Title order={4} mb="md">Largest Files</Title>
                  <ScrollArea style={{ height: 300 }}>
                    <Stack spacing="xs">
                      {storageData?.insights?.largestFiles?.slice(0, 10).map((file, index) => (
                        <Group key={file.path} position="apart">
                          <Group>
                            <Badge size="xs" color="gray">{index + 1}</Badge>
                            <div>
                              <Text size="sm" weight={500}>{file.name}</Text>
                              <Text size="xs" color="dimmed">{file.bucket}</Text>
                            </div>
                          </Group>
                          <Text size="sm" weight={500}>{file.sizeFormatted}</Text>
                        </Group>
                      )) || (
                        <Text color="dimmed" size="sm">No large files found</Text>
                      )}
                    </Stack>
                  </ScrollArea>
                </Card>
              </Grid.Col>

              {/* File Type Breakdown */}
              <Grid.Col span={12} md={6}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Title order={4} mb="md">File Types</Title>
                  <ScrollArea style={{ height: 300 }}>
                    <Stack spacing="xs">
                      {Object.entries(storageData?.insights?.fileTypeBreakdown || {})
                        .sort(([,a], [,b]) => b.size - a.size)
                        .map(([ext, data]) => (
                          <Group key={ext} position="apart">
                            <Group>
                              <Badge size="xs" variant="outline">{ext.toUpperCase()}</Badge>
                              <Text size="sm">{data.count} files</Text>
                            </Group>
                            <Text size="sm" weight={500}>{data.sizeFormatted}</Text>
                          </Group>
                        ))}
                    </Stack>
                  </ScrollArea>
                </Card>
              </Grid.Col>

              {/* Recommendations */}
              <Grid.Col span={12}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Title order={4} mb="md">Recommendations</Title>
                  <Stack spacing="md">
                    {storageData?.insights?.recommendations?.map((rec, index) => (
                      <Alert
                        key={index}
                        icon={rec.type === 'critical' ? <FaExclamationTriangle /> : <FaInfoCircle />}
                        color={rec.type === 'critical' ? 'red' : rec.type === 'warning' ? 'yellow' : 'blue'}
                        title={rec.title}
                      >
                        {rec.message}
                      </Alert>
                    )) || (
                      <Text color="dimmed">No specific recommendations at this time.</Text>
                    )}
                    
                    {/* General recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                    </div>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
        </Tabs>

        {/* File Preview Modal */}
        <Modal
          opened={fileModalOpen}
          onClose={() => setFileModalOpen(false)}
          title={selectedFile?.name || 'File Preview'}
          size="lg"
        >
          {selectedFile && selectedFile.isImage && (
            <div>
              <img 
                src={selectedFile.url} 
                alt={selectedFile.name}
                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
              />
              <Stack spacing="xs" mt="md">
                <Group position="apart">
                  <Text size="sm">Size</Text>
                  <Text size="sm" weight={500}>{selectedFile.sizeFormatted}</Text>
                </Group>
                <Group position="apart">
                  <Text size="sm">Type</Text>
                  <Text size="sm" weight={500}>{selectedFile.contentType}</Text>
                </Group>
                <Group position="apart">
                  <Text size="sm">Modified</Text>
                  <Text size="sm" weight={500}>
                    {new Date(selectedFile.lastModified).toLocaleString()}
                  </Text>
                </Group>
              </Stack>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          opened={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Deletion"
          size="sm"
        >
          <Text>Are you sure you want to delete this file? This action cannot be undone.</Text>
          <Text size="sm" weight={500} mt="sm">{selectedFile?.name}</Text>
          <Group position="right" mt="md">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteFile}>
              Delete
            </Button>
          </Group>
        </Modal>
      </div>
    </div>
  );
};

export default EnhancedStoragePage;
