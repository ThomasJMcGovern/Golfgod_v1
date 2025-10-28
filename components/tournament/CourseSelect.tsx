"use client";

import { useState, useEffect } from "react";
import Select, { StylesConfig } from "react-select";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface CourseSelectProps {
  onSelectCourse: (courseId: Id<"courses"> | null) => void;
  selectedCourseId: Id<"courses"> | null;
}

interface CourseOption {
  value: Id<"courses">;
  label: string;
  location: string;
}

// Custom styles to match the design
const customStyles: StylesConfig<CourseOption, false> = {
  control: (provided) => ({
    ...provided,
    minHeight: "44px", // Mobile-first ≥44px touch target
    borderColor: "hsl(var(--border))",
    backgroundColor: "hsl(var(--background))",
    "&:hover": {
      borderColor: "hsl(142, 76%, 36%)", // Golf green
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "hsl(142, 76%, 36%)" // Golf green
      : state.isFocused
      ? "hsl(142, 76%, 90%)" // Light green
      : "transparent",
    color: state.isSelected ? "white" : "hsl(var(--foreground))",
    padding: "12px", // ≥44px touch target
    cursor: "pointer",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 100,
    backgroundColor: "hsl(var(--background))",
  }),
  input: (provided) => ({
    ...provided,
    color: "hsl(var(--foreground))",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "hsl(var(--foreground))",
  }),
};

export default function CourseSelect({
  onSelectCourse,
  selectedCourseId,
}: CourseSelectProps) {
  // Load all courses (safe: ~54 courses, small table)
  const courses = useQuery(api.courses.getAllCourses, {});
  const [selectedOption, setSelectedOption] = useState<CourseOption | null>(null);

  // Convert courses to options for react-select
  const options: CourseOption[] =
    courses?.map((course) => ({
      value: course._id,
      label: course.name,
      location: course.location,
    })) || [];

  // Update selected option when selectedCourseId changes
  useEffect(() => {
    if (selectedCourseId && courses) {
      const course = courses.find((c) => c._id === selectedCourseId);
      if (course) {
        setSelectedOption({
          value: course._id,
          label: course.name,
          location: course.location,
        });
      }
    } else {
      setSelectedOption(null);
    }
  }, [selectedCourseId, courses]);

  // Custom option component to show location
  const formatOptionLabel = (option: CourseOption) => (
    <div className="flex flex-col">
      <span className="font-medium">{option.label}</span>
      <span className="text-xs text-muted-foreground">{option.location}</span>
    </div>
  );

  const handleChange = (option: CourseOption | null) => {
    setSelectedOption(option);
    onSelectCourse(option ? option.value : null);
  };

  if (!courses) {
    return (
      <div className="h-11 bg-secondary animate-pulse rounded-md"></div>
    );
  }

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
      styles={customStyles}
      formatOptionLabel={formatOptionLabel}
      placeholder="Select a course..."
      isClearable
      isSearchable
      className="w-full"
      classNamePrefix="react-select"
    />
  );
}
