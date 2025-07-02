import React, { useState } from "react";
import {
  Box,
  TextInput,
  Select,
  Group,
  Button,
  Switch,
  Stack,
  Text,
  Divider,
} from "@mantine/core";

/**
 * Reusable address form component
 * @param {Object} props
 * @param {Object} props.address - Address object to edit (optional, for editing)
 * @param {Function} props.onSubmit - Function to call on submit
 * @param {Function} props.onCancel - Function to call on cancel (optional)
 * @param {Boolean} props.isDefault - Whether this is the default address (optional)
 * @param {Boolean} props.loading - Whether the form is in loading state
 */
const AddressForm = ({
  address = {},
  onSubmit,
  onCancel,
  isEdit = false,
  loading = false,
}) => {
  // Initialize form state
  const [formData, setFormData] = useState({
    address_name: address.address_name || "",
    is_default: address.is_default || false,
    street_address: address.street_address || "",
    suite_unit_floor: address.suite_unit_floor || "",
    house_number: address.house_number || "",
    locality: address.locality || "",
    area: address.area || "",
    city: address.city || "",
    state: address.state || "",
    postal_code: address.postal_code || "",
    country: address.country || "India",
    landmark: address.landmark || "",
  });

  // Handle form input changes
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData({ ...formData, [field]: value });
  };

  // Handle select changes (for dropdowns)
  const handleSelectChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Handle switch changes
  const handleSwitchChange = (field) => (checked) => {
    setFormData({ ...formData, [field]: checked });
  };

  // Indian states list
  const indianStates = [
    { value: "Andhra Pradesh", label: "Andhra Pradesh" },
    { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
    { value: "Assam", label: "Assam" },
    { value: "Bihar", label: "Bihar" },
    { value: "Chhattisgarh", label: "Chhattisgarh" },
    { value: "Goa", label: "Goa" },
    { value: "Gujarat", label: "Gujarat" },
    { value: "Haryana", label: "Haryana" },
    { value: "Himachal Pradesh", label: "Himachal Pradesh" },
    { value: "Jharkhand", label: "Jharkhand" },
    { value: "Karnataka", label: "Karnataka" },
    { value: "Kerala", label: "Kerala" },
    { value: "Madhya Pradesh", label: "Madhya Pradesh" },
    { value: "Maharashtra", label: "Maharashtra" },
    { value: "Manipur", label: "Manipur" },
    { value: "Meghalaya", label: "Meghalaya" },
    { value: "Mizoram", label: "Mizoram" },
    { value: "Nagaland", label: "Nagaland" },
    { value: "Odisha", label: "Odisha" },
    { value: "Punjab", label: "Punjab" },
    { value: "Rajasthan", label: "Rajasthan" },
    { value: "Sikkim", label: "Sikkim" },
    { value: "Tamil Nadu", label: "Tamil Nadu" },
    { value: "Telangana", label: "Telangana" },
    { value: "Tripura", label: "Tripura" },
    { value: "Uttar Pradesh", label: "Uttar Pradesh" },
    { value: "Uttarakhand", label: "Uttarakhand" },
    { value: "West Bengal", label: "West Bengal" },
    { value: "Delhi", label: "Delhi" },
    { value: "Puducherry", label: "Puducherry" },
    { value: "Chandigarh", label: "Chandigarh" },
    {
      value: "Dadra and Nagar Haveli and Daman and Diu",
      label: "Dadra and Nagar Haveli and Daman and Diu",
    },
    { value: "Lakshadweep", label: "Lakshadweep" },
    { value: "Ladakh", label: "Ladakh" },
    { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
    {
      value: "Andaman and Nicobar Islands",
      label: "Andaman and Nicobar Islands",
    },
  ];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("AddressForm: Form submitted with data:", formData);
    console.log("AddressForm: Is edit mode:", isEdit);
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing="md">
        <Group grow align="flex-start">
          <TextInput
            label="Address Name"
            description="E.g. Home, Office, etc."
            required
            value={formData.address_name}
            onChange={handleChange("address_name")}
            placeholder="E.g. Home, Office"
          />
          <Box pt={25}>
            <Switch
              label="Set as default address"
              checked={formData.is_default}
              onChange={(event) =>
                handleSwitchChange("is_default")(event.currentTarget.checked)
              }
            />
          </Box>
        </Group>

        <Divider label="Address Details" labelPosition="center" />

        <Group grow>
          <TextInput
            label="House/Building Number"
            value={formData.house_number}
            onChange={handleChange("house_number")}
            placeholder="House/Building Number"
          />
          <TextInput
            label="Street Address"
            required
            value={formData.street_address}
            onChange={handleChange("street_address")}
            placeholder="Street Address"
          />
        </Group>

        <Group grow>
          <TextInput
            label="Suite/Unit/Floor"
            value={formData.suite_unit_floor}
            onChange={handleChange("suite_unit_floor")}
            placeholder="Apt, Suite, Unit, Floor, etc."
          />
          <TextInput
            label="Locality"
            value={formData.locality}
            onChange={handleChange("locality")}
            placeholder="Locality/Area/Neighborhood"
          />
        </Group>

        <Group grow>
          <TextInput
            label="Area"
            value={formData.area}
            onChange={handleChange("area")}
            placeholder="Area"
          />
          <TextInput
            label="City"
            required
            value={formData.city}
            onChange={handleChange("city")}
            placeholder="City"
          />
        </Group>

        <Group grow>
          <Select
            label="State"
            required
            value={formData.state}
            onChange={handleSelectChange("state")}
            placeholder="Select State"
            data={indianStates}
            searchable
            clearable
          />
          <TextInput
            label="Postal Code"
            value={formData.postal_code}
            onChange={handleChange("postal_code")}
            placeholder="Postal/ZIP Code"
          />
        </Group>

        <Group grow>
          <TextInput
            label="Country"
            required
            value={formData.country}
            onChange={handleChange("country")}
            placeholder="Country"
            defaultValue="India"
          />
          <TextInput
            label="Landmark"
            value={formData.landmark}
            onChange={handleChange("landmark")}
            placeholder="Nearby landmark (optional)"
          />
        </Group>

        <Group position="right" mt="md">
          {onCancel && (
            <Button variant="subtle" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={loading}>
            {isEdit ? "Update Address" : "Add Address"}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
};

export default AddressForm;
