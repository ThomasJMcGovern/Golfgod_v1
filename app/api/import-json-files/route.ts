import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { directory, batchSize = 5 } = await request.json();

    if (!directory) {
      return NextResponse.json(
        { error: "Directory path is required" },
        { status: 400 }
      );
    }

    // Check if directory exists
    try {
      await fs.access(directory);
    } catch {
      return NextResponse.json(
        { error: `Directory not found: ${directory}` },
        { status: 404 }
      );
    }

    // Read all JSON files from the directory
    const files = await fs.readdir(directory);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    console.log(`Found ${jsonFiles.length} JSON files in ${directory}`);

    // Parse each JSON file
    const players = [];

    for (const file of jsonFiles) {
      const filePath = path.join(directory, file);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);

        // Extract player name from filename (format: player_{id}_{firstName}_{lastName}_2015_2025.json)
        // Example: player_9478_Scottie_Scheffler_2015_2025.json
        const fileNameParts = file.replace('.json', '').replace('_2015_2025', '').split('_');

        // Remove 'player' prefix and extract ID
        const playerId = fileNameParts[1];

        // Extract and format player name
        const nameWords = fileNameParts.slice(2);
        const playerName = nameWords.map(word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');

        // Transform the data and handle null values
        const transformedData = {
          player_id: data.player_id || playerId,
          playerName: playerName,
          years: []
        };

        // Process years and filter out null earnings
        if (data.years && Array.isArray(data.years)) {
          transformedData.years = data.years.map((yearData: any) => ({
            year: yearData.year,
            tournaments: (yearData.tournaments || []).map((tournament: any) => {
              // Create tournament object without earnings if it's null
              const tournamentData: any = {
                date: tournament.date || "",
                tournament_name: tournament.tournament_name || "",
                position: tournament.position || "",
              };

              // Only add optional fields if they have non-null values
              if (tournament.course) tournamentData.course = tournament.course;
              if (tournament.scores && Array.isArray(tournament.scores)) {
                tournamentData.scores = tournament.scores;
              }
              if (tournament.total_score !== null && tournament.total_score !== undefined) {
                tournamentData.total_score = tournament.total_score;
              }
              if (tournament.to_par !== null && tournament.to_par !== undefined && tournament.to_par !== -78) {
                tournamentData.to_par = tournament.to_par;
              }
              // Only include earnings if it's not null
              if (tournament.earnings !== null && tournament.earnings !== undefined) {
                tournamentData.earnings = tournament.earnings;
              }

              return tournamentData;
            })
          }));
        }

        // Sort years in ascending order
        transformedData.years.sort((a: any, b: any) => a.year - b.year);

        players.push(transformedData);

      } catch (error) {
        console.error(`Error parsing ${file}:`, error);
        // Continue with other files even if one fails
      }
    }

    console.log(`Successfully parsed ${players.length} player files`);

    // Sort players alphabetically by name
    players.sort((a, b) => a.playerName.localeCompare(b.playerName));

    return NextResponse.json({
      success: true,
      players,
      totalFiles: jsonFiles.length,
      parsedFiles: players.length,
      batchSize
    });

  } catch (error) {
    console.error('Error in import-json-files API:', error);
    return NextResponse.json(
      {
        error: 'Failed to process JSON files',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}