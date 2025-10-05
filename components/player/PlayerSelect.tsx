"use client";

import { useState, useEffect } from "react";
import Select, { StylesConfig } from "react-select";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface PlayerSelectProps {
  onSelectPlayer: (playerId: Id<"players"> | null) => void;
  selectedPlayerId: Id<"players"> | null;
}

interface PlayerOption {
  value: Id<"players">;
  label: string;
  country: string;
  countryCode: string;
}

// Custom styles to match the design
const customStyles: StylesConfig<PlayerOption, false> = {
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

export default function PlayerSelect({ onSelectPlayer, selectedPlayerId }: PlayerSelectProps) {
  // Load all players once - no search parameter needed
  const players = useQuery(api.players.getAllPlayers, {});
  const [selectedOption, setSelectedOption] = useState<PlayerOption | null>(null);

  // Convert players to options for react-select
  const options: PlayerOption[] = players?.map((player) => ({
    value: player._id,
    label: player.name,
    country: player.country,
    countryCode: player.countryCode,
  })) || [];

  // Update selected option when selectedPlayerId changes
  useEffect(() => {
    if (selectedPlayerId && players) {
      const player = players.find((p) => p._id === selectedPlayerId);
      if (player) {
        setSelectedOption({
          value: player._id,
          label: player.name,
          country: player.country,
          countryCode: player.countryCode,
        });
      }
    } else {
      setSelectedOption(null);
    }
  }, [selectedPlayerId, players]);

  // Custom option component to show country flag
  const formatOptionLabel = (option: PlayerOption) => (
    <div className="flex items-center gap-2">
      {option.countryCode && (
        <span className="text-sm opacity-60">
          {getFlagEmoji(option.countryCode)}
        </span>
      )}
      <span>{option.label}</span>
    </div>
  );

  const handleChange = (option: PlayerOption | null) => {
    setSelectedOption(option);
    onSelectPlayer(option ? option.value : null);
  };

  if (!players) {
    return (
      <div className="h-10 bg-secondary animate-pulse rounded-md"></div>
    );
  }

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
      styles={customStyles}
      placeholder="Search for a player..."
      isClearable
      isSearchable
      formatOptionLabel={formatOptionLabel}
      className="text-sm"
      classNamePrefix="select"
      noOptionsMessage={() => "No players found"}
      // Optimize filtering for better performance
      filterOption={(option, inputValue) => {
        if (!inputValue) return true;
        const searchTerm = inputValue.toLowerCase();
        const playerOption = option.data;
        return (
          playerOption.label.toLowerCase().includes(searchTerm) ||
          (playerOption.country ? playerOption.country.toLowerCase().includes(searchTerm) : false)
        );
      }}
    />
  );
}

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  // Handle special cases for UK subdivisions - use UK flag for all
  if (countryCode === "GB-ENG" || countryCode === "GB-SCT" ||
      countryCode === "GB-NIR" || countryCode === "GB-WLS") {
    return "🇬🇧"; // UK flag for all British subdivisions
  }

  // Handle invalid or empty country codes
  if (!countryCode || countryCode.length !== 2) {
    return "🏳️"; // Default flag
  }

  try {
    // Convert country code to flag emoji
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🏳️"; // Default flag on error
  }
}