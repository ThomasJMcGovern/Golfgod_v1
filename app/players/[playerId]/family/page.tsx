/**
 * Family Page
 *
 * Displays player's personal family information.
 * Uses placeholder data - backend integration coming in future phase.
 */


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderFamily } from "@/lib/placeholder-data";
import { Users, Heart, Baby } from "lucide-react";

interface FamilyPageProps {
  params: Promise<{
    playerId: string;
  }>;
}

export default async function FamilyPage({ params }: FamilyPageProps) {
  const { playerId } = await params;
  const family = getPlaceholderFamily(playerId);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Data Notice */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Preview Mode</h3>
              <p className="text-sm text-muted-foreground">
                This page displays placeholder data. Real family information will be integrated
                in a future update.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marital Status */}
      <Card>
        <CardHeader>
          <CardTitle>Marital Status</CardTitle>
          <CardDescription>Current relationship status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <Badge variant="secondary" className="text-base">
              {family.maritalStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Spouse */}
      {family.spouse && (
        <Card>
          <CardHeader>
            <CardTitle>Spouse</CardTitle>
            <CardDescription>Partner information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{family.spouse.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Married Since</p>
              <p className="text-sm text-muted-foreground">{family.spouse.since}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Children */}
      {family.children && family.children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Children</CardTitle>
            <CardDescription>
              {family.children.length} {family.children.length === 1 ? "child" : "children"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {family.children.map((child, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Baby className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{child.name}</p>
                    <p className="text-sm text-muted-foreground">Age: {child.age}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!family.spouse && (!family.children || family.children.length === 0) && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No family information available
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
