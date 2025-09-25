"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, ChevronLeft, Trophy, User, Globe } from "lucide-react";

interface TournamentResult {
  name: string;
  year: number;
  date: string;
  tournament: string;
  position: string;
  score: string;
  overall: string;
  earnings: number;
}

interface PlayerBio {
  name: string;
  country: string;
  birthdate?: string;
  age?: number;
  birthplace?: string;
  college?: string;
  swing?: string;
  turned_pro?: number;
  height?: string;
  weight?: string;
  url?: string;
}

interface WorldRanking {
  rank: number;
  name: string;
  country: string;
  avg_points?: number;
  total_points?: number;
  events?: number;
  points_lost?: number;
  points_gained?: number;
}

export default function ImportCSVPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tournament");
  const [tournamentCsvData, setTournamentCsvData] = useState<string>("");
  const [bioCsvData, setBioCsvData] = useState<string>("");
  const [rankingsCsvData, setRankingsCsvData] = useState<string>("");
  const [parsedTournamentData, setParsedTournamentData] = useState<TournamentResult[]>([]);
  const [parsedBioData, setParsedBioData] = useState<PlayerBio[]>([]);
  const [parsedRankingsData, setParsedRankingsData] = useState<WorldRanking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const importTournamentResults = useMutation(api.tournamentResults.importTournamentResults);
  const importPlayerBios = useMutation(api.playerBios.importPlayerBios);
  const importWorldRankings = useMutation(api.worldRankings.importWorldRankings);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "tournament" | "bio" | "rankings") => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (type === "tournament") {
        setTournamentCsvData(text);
        parseTournamentCSV(text);
      } else if (type === "bio") {
        setBioCsvData(text);
        parseBioCSV(text);
      } else if (type === "rankings") {
        setRankingsCsvData(text);
        parseRankingsCSV(text);
      }
    };
    reader.readAsText(file);
  };

  const parseTournamentCSV = (text: string) => {
    setParseError(null);
    setParsedTournamentData([]);
    setImportResult(null);

    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processed = results.data.map((row: any) => {
            const earningsStr = row.earnings || "0";
            const earnings = parseFloat(
              earningsStr.toString().replace(/[$,]/g, "") || "0"
            );

            return {
              name: row.name?.trim() || "",
              year: parseInt(row.year) || new Date().getFullYear(),
              date: row.date?.trim() || "",
              tournament: row.tournament?.trim() || "",
              position: row.position?.trim() || "",
              score: row.score?.trim() || "",
              overall: row.overall?.trim() || "",
              earnings: isNaN(earnings) ? 0 : earnings,
            };
          }).filter((row: TournamentResult) =>
            row.name && row.tournament
          );

          setParsedTournamentData(processed);
          if (processed.length === 0) {
            setParseError("No valid tournament data found in CSV.");
          }
        } catch (error) {
          setParseError(`Error processing CSV: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      },
      error: (error) => {
        setParseError(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const parseBioCSV = (text: string) => {
    setParseError(null);
    setParsedBioData([]);
    setImportResult(null);

    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processed = results.data.map((row: any) => {
            return {
              name: row.name?.trim() || "",
              country: row.country?.trim() || "",
              birthdate: row.birthdate?.trim() || undefined,
              age: row.age ? parseInt(row.age) : undefined,
              birthplace: row.birthplace?.trim() || undefined,
              college: row.college?.trim() || undefined,
              swing: row.swing?.trim() || undefined,
              turned_pro: row.turned_pro ? parseInt(row.turned_pro) : undefined,
              height: row.height?.trim() || undefined,
              weight: row.weight?.trim() || undefined,
              url: row.url?.trim() || undefined,
            };
          }).filter((row: PlayerBio) =>
            row.name
          );

          setParsedBioData(processed);
          if (processed.length === 0) {
            setParseError("No valid player bio data found in CSV.");
          }
        } catch (error) {
          setParseError(`Error processing CSV: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      },
      error: (error) => {
        setParseError(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const handleImportTournaments = async () => {
    if (parsedTournamentData.length === 0) {
      setParseError("No tournament data to import.");
      return;
    }

    setIsLoading(true);
    setImportResult(null);
    setParseError(null);

    try {
      const result = await importTournamentResults({ results: parsedTournamentData });
      setImportResult(result);

      if (result.success > 0) {
        setTimeout(() => {
          setTournamentCsvData("");
          setParsedTournamentData([]);
        }, 3000);
      }
    } catch (error) {
      setParseError(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const parseRankingsCSV = (text: string) => {
    setParseError(null);
    setParsedRankingsData([]);
    setImportResult(null);

    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processed = results.data.map((row: any) => {
            return {
              rank: parseInt(row.rank) || 0,
              name: row.name?.trim() || "",
              country: row.country?.trim() || "",
              avg_points: row.avg_points ? parseFloat(row.avg_points) : undefined,
              total_points: row.total_points ? parseFloat(row.total_points) : undefined,
              events: row.events ? parseInt(row.events) : undefined,
              points_lost: row.points_lost ? parseFloat(row.points_lost) : undefined,
              points_gained: row.points_gained ? parseFloat(row.points_gained) : undefined,
            };
          }).filter((row: WorldRanking) =>
            row.name && row.rank > 0
          );

          setParsedRankingsData(processed);
          if (processed.length === 0) {
            setParseError("No valid ranking data found in CSV.");
          }
        } catch (error) {
          setParseError(`Error processing CSV: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      },
      error: (error) => {
        setParseError(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const handleImportRankings = async () => {
    if (parsedRankingsData.length === 0) {
      setParseError("No ranking data to import.");
      return;
    }

    setIsLoading(true);
    setImportResult(null);
    setParseError(null);

    try {
      let totalSuccess = 0;
      let totalFailed = 0;
      let allErrors: string[] = [];
      let remaining = [...parsedRankingsData];
      const BATCH_SIZE = 50;

      // Process in batches
      while (remaining.length > 0) {
        const batch = remaining.slice(0, BATCH_SIZE);
        const result = await importWorldRankings({ rankings: batch });

        totalSuccess += result.success;
        totalFailed += result.failed;
        allErrors = [...allErrors, ...result.errors];

        remaining = remaining.slice(BATCH_SIZE);

        // Update UI with progress
        setImportResult({
          success: totalSuccess,
          failed: totalFailed,
          errors: allErrors,
        });

        // Small delay between batches to avoid rate limiting
        if (remaining.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Final result
      setImportResult({
        success: totalSuccess,
        failed: totalFailed,
        errors: allErrors,
      });

      if (totalSuccess > 0) {
        setTimeout(() => {
          setRankingsCsvData("");
          setParsedRankingsData([]);
        }, 3000);
      }
    } catch (error) {
      setParseError(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportBios = async () => {
    if (parsedBioData.length === 0) {
      setParseError("No bio data to import.");
      return;
    }

    setIsLoading(true);
    setImportResult(null);
    setParseError(null);

    try {
      const result = await importPlayerBios({ bios: parsedBioData });
      setImportResult(result);

      if (result.success > 0) {
        setTimeout(() => {
          setBioCsvData("");
          setParsedBioData([]);
        }, 3000);
      }
    } catch (error) {
      setParseError(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
                className="mr-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Import CSV Data</h1>
                <span className="text-sm text-muted-foreground">Import Tournament Results or Player Bios</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="tournament" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tournament" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Tournament Results
            </TabsTrigger>
            <TabsTrigger value="bio" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Player Bios
            </TabsTrigger>
            <TabsTrigger value="rankings" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              World Rankings
            </TabsTrigger>
          </TabsList>

          {/* Tournament Results Tab */}
          <TabsContent value="tournament">
            <Card>
              <CardHeader>
                <CardTitle>Import Tournament Results</CardTitle>
                <CardDescription>
                  Upload a CSV file with columns: name, year, date, tournament, position, score, overall, earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="tournament-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">CSV file only</p>
                      </div>
                      <input
                        id="tournament-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "tournament")}
                      />
                    </label>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or paste CSV data</span>
                    </div>
                  </div>

                  <Textarea
                    placeholder="name,year,date,tournament,position,score,overall,earnings
Scottie Scheffler,2024,1/4 - 1/7,Sentry Tournament of Champions,T5,66-67-72-67,272 (-16),318000"
                    value={tournamentCsvData}
                    onChange={(e) => {
                      setTournamentCsvData(e.target.value);
                      if (e.target.value) parseTournamentCSV(e.target.value);
                    }}
                    className="min-h-[150px] font-mono text-sm"
                  />
                </div>

                {/* Preview */}
                {parsedTournamentData.length > 0 && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Preview</AlertTitle>
                    <AlertDescription>
                      Found {parsedTournamentData.length} tournament records ready to import
                      <div className="mt-2 text-xs">
                        First record: {parsedTournamentData[0].name} - {parsedTournamentData[0].tournament} ({parsedTournamentData[0].year})
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Import Button */}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTournamentCsvData("");
                      setParsedTournamentData([]);
                      setImportResult(null);
                      setParseError(null);
                    }}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleImportTournaments}
                    disabled={parsedTournamentData.length === 0 || isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "Importing..." : `Import ${parsedTournamentData.length} Records`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Player Bios Tab */}
          <TabsContent value="bio">
            <Card>
              <CardHeader>
                <CardTitle>Import Player Bios</CardTitle>
                <CardDescription>
                  Upload a CSV file with columns: name, country, birthdate, age, birthplace, college, swing, turned_pro, height, weight
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="bio-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">CSV file only</p>
                      </div>
                      <input
                        id="bio-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "bio")}
                      />
                    </label>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or paste CSV data</span>
                    </div>
                  </div>

                  <Textarea
                    placeholder={`name,country,birthdate,age,birthplace,college,swing,turned_pro,height,weight
SCOTTIE SCHEFFLER,United States,6/21/1996,29,Dallas Texas,Texas,Right,2018,6' 3",200 lbs`}
                    value={bioCsvData}
                    onChange={(e) => {
                      setBioCsvData(e.target.value);
                      if (e.target.value) parseBioCSV(e.target.value);
                    }}
                    className="min-h-[150px] font-mono text-sm"
                  />
                </div>

                {/* Preview */}
                {parsedBioData.length > 0 && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Preview</AlertTitle>
                    <AlertDescription>
                      Found {parsedBioData.length} player bio records ready to import
                      <div className="mt-2 text-xs">
                        First record: {parsedBioData[0].name} - {parsedBioData[0].country}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Import Button */}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBioCsvData("");
                      setParsedBioData([]);
                      setImportResult(null);
                      setParseError(null);
                    }}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleImportBios}
                    disabled={parsedBioData.length === 0 || isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "Importing..." : `Import ${parsedBioData.length} Bios`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* World Rankings Tab */}
          <TabsContent value="rankings">
            <Card>
              <CardHeader>
                <CardTitle>Import World Rankings</CardTitle>
                <CardDescription>
                  Upload a CSV file with columns: rank, name, country, avg_points, total_points, events, points_lost, points_gained
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="rankings-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">CSV file only</p>
                      </div>
                      <input
                        id="rankings-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "rankings")}
                      />
                    </label>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or paste CSV data</span>
                    </div>
                  </div>

                  <Textarea
                    placeholder={`rank,name,country,avg_points,total_points,events,points_lost,points_gained
1,Scottie Scheffler,UNI,20.75,871.4,42,-418.74,634.94
2,Rory McIlroy,NOR,11.42,514.09,45,-268.98,422.37`}
                    value={rankingsCsvData}
                    onChange={(e) => {
                      setRankingsCsvData(e.target.value);
                      if (e.target.value) parseRankingsCSV(e.target.value);
                    }}
                    className="min-h-[150px] font-mono text-sm"
                  />
                </div>

                {/* Preview */}
                {parsedRankingsData.length > 0 && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Preview</AlertTitle>
                    <AlertDescription>
                      Found {parsedRankingsData.length} ranking records ready to import
                      <div className="mt-2 text-xs">
                        First record: #{parsedRankingsData[0].rank} - {parsedRankingsData[0].name} ({parsedRankingsData[0].country})
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Import Button */}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRankingsCsvData("");
                      setParsedRankingsData([]);
                      setImportResult(null);
                      setParseError(null);
                    }}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleImportRankings}
                    disabled={parsedRankingsData.length === 0 || isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "Importing..." : `Import ${parsedRankingsData.length} Rankings`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error Alert */}
        {parseError && (
          <Alert variant="destructive" className="mt-4">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        {/* Import Result */}
        {importResult && (
          <Alert className="mt-4" variant={importResult.failed > 0 ? "destructive" : "default"}>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Import Complete</AlertTitle>
            <AlertDescription>
              <div className="space-y-1">
                <p>Successfully imported: {importResult.success} records</p>
                {importResult.failed > 0 && (
                  <p>Failed: {importResult.failed} records</p>
                )}
                {importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Errors:</p>
                    <ul className="list-disc list-inside text-xs mt-1">
                      {importResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}