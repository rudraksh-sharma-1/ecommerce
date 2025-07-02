import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Title, TextInput, Button, Group, LoadingOverlay, Select, Switch } from '@mantine/core';
import { addCategory } from '../../utils/supabaseApi';

const commonEmojis = [
  { value: "📱", label: "📱 Electronics" },
  { value: "👕", label: "👕 Clothing" },
  { value: "👟", label: "👟 Footwear" },
  { value: "👜", label: "👜 Accessories" },
  { value: "🏠", label: "🏠 Home" },
  { value: "💄", label: "💄 Beauty" },
  { value: "🏀", label: "🏀 Sports" },
  { value: "📚", label: "📚 Books" },
  { value: "🍔", label: "🍔 Food" },
  { value: "🧸", label: "🧸 Toys" },
  { value: "💻", label: "💻 Computers" },
  { value: "🎮", label: "🎮 Gaming" }
];

const AddCategory = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '',
    featured: false,
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingCategories, setExistingCategories] = useState([]);

  useEffect(() => {
    // Redirect to categories page if accessed directly
    navigate('/categories', { replace: true });
  }, [navigate]);

  useEffect(() => {
    async function fetchCategories() {
      const result = await getAllCategories();
      if (result.success && result.categories) {
        setExistingCategories(result.categories.map(cat => cat.name.toLowerCase()));
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name) {
      setError('Please fill in the category name.');
      return;
    }
    // Prevent duplicate category names (case-insensitive)
    if (existingCategories.includes(form.name.trim().toLowerCase())) {
      setError('A category with this name already exists.');
      return;
    }
    setLoading(true);
    const result = await addCategory(form);
    setLoading(false);
    if (result.success) {
      navigate('/categories');
    } else {
      setError(result.error || 'Failed to add category');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card shadow="sm" p="lg" radius="md" className="max-w-xl mx-auto">
        <Title order={2} className="mb-6">Add New Category</Title>
        <form onSubmit={handleSubmit}>
          <LoadingOverlay visible={loading} />
          <TextInput
            label="Category Name"
            placeholder="Enter category name"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mb-4"
          />
          <TextInput
            label="Description"
            placeholder="Enter category description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="mb-4"
          />
          <Select
            label="Icon"
            placeholder="Select an emoji icon"
            data={commonEmojis}
            value={form.icon}
            onChange={(value) => handleChange('icon', value)}
            className="mb-4"
            clearable
          />
          <Group position="apart" className="mb-4">
            <Switch
              label="Featured"
              checked={form.featured}
              onChange={(e) => handleChange('featured', e.currentTarget.checked)}
              color="yellow"
            />
            <Switch
              label="Active"
              checked={form.active}
              onChange={(e) => handleChange('active', e.currentTarget.checked)}
              color="green"
            />
          </Group>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <Group position="right">
            <Button variant="default" onClick={() => navigate('/categories')}>Cancel</Button>
            <Button color="blue" type="submit">Add Category</Button>
          </Group>
        </form>
      </Card>
    </div>
  );
};

export default AddCategory;
