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

        // Extract player name from filename (format: {id}_{firstName}_{lastName}.json)
        // Example: 10140_Xander_Schauffele.json
        const fileNameParts = file.replace('.json', '').split('_');

        // First part is the player ID
        const playerId = fileNameParts[0];

        // Extract and format player name
        const nameWords = fileNameParts.slice(1);
        const playerName = nameWords.map(word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');

        // Transform the data - new format has flat tournament array
        const transformedData = {
          player_id: data.player_id || playerId,
          playerName: data.player_name || playerName,
          years: []
        };

        // Group tournaments by year (new format has flat array)
        if (data.tournaments && Array.isArray(data.tournaments)) {
          const tournamentsByYear: { [year: number]: any[] } = {};

          data.tournaments.forEach((tournament: any) => {
            const year = tournament.year || 2024;
            if (!tournamentsByYear[year]) {
              tournamentsByYear[year] = [];
            }

            // Create tournament object
            const tournamentData: any = {
              date: tournament.date || "",
              tournament_name: tournament.tournament || tournament.tournament_name || "",
              position: tournament.position || "",
            };

            // Only add optional fields if they have non-null values
            if (tournament.course) tournamentData.course = tournament.course;
            if (tournament.scores && Array.isArray(tournament.scores)) {
              tournamentData.scores = tournament.scores;
            }
            if (tournament.overall_score !== null && tournament.overall_score !== undefined) {
              tournamentData.total_score = tournament.overall_score;
            }
            if (tournament.to_par !== null && tournament.to_par !== undefined && tournament.to_par !== -78) {
              tournamentData.to_par = tournament.to_par;
            }
            // Only include earnings if it's not null
            if (tournament.earnings !== null && tournament.earnings !== undefined) {
              tournamentData.earnings = tournament.earnings;
            }

            tournamentsByYear[year].push(tournamentData);
          });

          // Convert to years array format
          transformedData.years = Object.keys(tournamentsByYear)
            .map(year => ({
              year: parseInt(year),
              tournaments: tournamentsByYear[parseInt(year)]
            }))
            .sort((a, b) => a.year - b.year);
        }

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