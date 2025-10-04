"use client";

import Select, { StylesConfig } from "react-select";

interface Option {
  value: string;
  label: string;
  flag?: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  isLoading?: boolean;
  showFlags?: boolean;
}

// Custom styles to match the design
const customStyles: StylesConfig<Option, false> = {
  control: (provided) => ({
    ...provided,
    minHeight: "40px",
    borderColor: "#e5e7eb",
    "&:hover": {
      borderColor: "#22c55e",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#22c55e" : state.isFocused ? "#dcfce7" : undefined,
    color: state.isSelected ? "white" : "#1f2937",
    padding: "8px 12px",
    cursor: "pointer",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 100,
  }),
};

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Search...",
  isLoading = false,
  showFlags = false,
}: SearchableSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value) || null;

  // Custom option component to show flags if enabled
  const formatOptionLabel = (option: Option) => (
    <div className="flex items-center gap-2">
      {showFlags && option.flag && (
        <span className="text-sm opacity-60">{option.flag}</span>
      )}
      <div className="flex flex-col">
        <span>{option.label}</span>
        {option.subtitle && (
          <span className="text-xs text-gray-500">{option.subtitle}</span>
        )}
      </div>
    </div>
  );

  const handleChange = (option: Option | null) => {
    onChange(option ? option.value : "");
  };

  if (isLoading) {
    return <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>;
  }

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
      styles={customStyles}
      placeholder={placeholder}
      isClearable
      isSearchable
      formatOptionLabel={formatOptionLabel}
      className="text-sm"
      classNamePrefix="select"
      noOptionsMessage={() => "No options found"}
      // Optimize filtering for better performance
      filterOption={(option, inputValue) => {
        if (!inputValue) return true;
        const searchTerm = inputValue.toLowerCase();
        const optionData = option.data;
        return (
          optionData.label.toLowerCase().includes(searchTerm) ||
          (optionData.subtitle ? optionData.subtitle.toLowerCase().includes(searchTerm) : false)
        );
      }}
    />
  );
}
