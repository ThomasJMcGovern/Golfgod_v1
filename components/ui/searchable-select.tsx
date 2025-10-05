"use client";

import Select, { StylesConfig } from "react-select";
import { useTheme } from "next-themes";

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

// Custom styles with mobile-first touch optimization and theme support
const getCustomStyles = (isDark: boolean): StylesConfig<Option, false> => ({
  control: (provided) => ({
    ...provided,
    minHeight: "44px", // Increased for touch targets (iOS guideline: 44x44px min)
    fontSize: "14px",
    backgroundColor: isDark ? "hsl(142 35% 12%)" : "white",
    borderColor: isDark ? "hsl(142 20% 20%)" : "#e5e7eb",
    borderRadius: "0.375rem",
    "&:hover": {
      borderColor: "#22c55e",
    },
    "@media (min-width: 640px)": {
      minHeight: "40px",
      fontSize: "14px",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#22c55e"
      : state.isFocused
        ? (isDark ? "hsl(142 30% 18%)" : "#dcfce7")
        : (isDark ? "hsl(142 35% 12%)" : undefined),
    color: state.isSelected ? "white" : (isDark ? "hsl(142 10% 95%)" : "#1f2937"),
    padding: "12px 16px", // Larger touch targets
    cursor: "pointer",
    fontSize: "14px",
    "@media (min-width: 640px)": {
      padding: "8px 12px",
      fontSize: "14px",
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: isDark ? "hsl(142 35% 12%)" : "white",
    zIndex: 100,
    maxHeight: "60vh", // Prevent menu from being too tall on mobile
    "@media (max-width: 640px)": {
      maxHeight: "50vh",
    },
  }),
  menuList: (provided) => ({
    ...provided,
    backgroundColor: isDark ? "hsl(142 35% 12%)" : "white",
    maxHeight: "60vh",
    "@media (max-width: 640px)": {
      maxHeight: "50vh",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: isDark ? "hsl(142 15% 65%)" : undefined,
    fontSize: "14px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: isDark ? "hsl(142 10% 95%)" : undefined,
    fontSize: "14px",
  }),
  input: (provided) => ({
    ...provided,
    color: isDark ? "hsl(142 10% 95%)" : undefined,
    fontSize: "16px", // Prevents iOS zoom on input focus
    "@media (min-width: 640px)": {
      fontSize: "14px",
    },
  }),
});

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Search...",
  isLoading = false,
  showFlags = false,
}: SearchableSelectProps) {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const selectedOption = options.find((opt) => opt.value === value) || null;

  // Custom option component with mobile-optimized layout
  const formatOptionLabel = (option: Option) => (
    <div className="flex items-center gap-2 min-h-[44px] sm:min-h-0">
      {showFlags && option.flag && (
        <span className="text-base sm:text-sm opacity-60 flex-shrink-0">{option.flag}</span>
      )}
      <div className="flex flex-col py-1">
        <span className="text-sm sm:text-base">{option.label}</span>
        {option.subtitle && option.subtitle !== "Unknown" && (
          <span className="text-xs text-muted-foreground mt-0.5">{option.subtitle}</span>
        )}
      </div>
    </div>
  );

  const handleChange = (option: Option | null) => {
    onChange(option ? option.value : "");
  };

  if (isLoading) {
    return <div className="h-11 sm:h-10 bg-secondary animate-pulse rounded-md"></div>;
  }

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
      styles={getCustomStyles(isDark)}
      placeholder={placeholder}
      isClearable
      isSearchable
      formatOptionLabel={formatOptionLabel}
      className="text-sm"
      classNamePrefix="select"
      noOptionsMessage={() => "No options found"}
      // Mobile-optimized settings
      menuPlacement="auto" // Automatically position menu to fit viewport
      menuPosition="fixed" // Better mobile scrolling behavior
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
