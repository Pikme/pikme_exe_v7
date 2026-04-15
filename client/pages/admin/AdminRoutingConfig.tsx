import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit2, Eye } from "lucide-react";

export default function AdminRoutingConfig() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("expertise");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showScores, setShowScores] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<number | null>(null);

  // Queries
  const { data: teamMembers } = trpc.teamAssignments.getTeamMembers.useQuery();
  const { data: routingRules } = trpc.routing.listRoutingRules.useQuery();
  const { data: routingStats } = trpc.routing.getRoutingStats.useQuery();
  const { data: expertiseSummary } = trpc.routing.getExpertiseSummary.useQuery(
    { userId: selectedUserId || 0 },
    { enabled: !!selectedUserId }
  );
  const { data: routingScores } = trpc.routing.getRoutingScores.useQuery(
    { enquiryId: selectedEnquiryId || 0 },
    { enabled: !!selectedEnquiryId && showScores }
  );

  // Mutations
  const configureExpertiseMutation = trpc.routing.configureExpertise.useMutation({
    onSuccess: () => {
      toast.success("Expertise configured successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createRuleMutation = trpc.routing.createRoutingRule.useMutation({
    onSuccess: () => {
      toast.success("Routing rule created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateAvailabilityMutation = trpc.routing.updateAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const autoRouteMutation = trpc.routing.autoRouteEnquiry.useMutation({
    onSuccess: (data) => {
      toast.success(`Enquiry routed to ${data.assignedToName}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-center">Access denied</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Enquiry Routing Configuration</h1>
        <p className="text-gray-600 mt-2">
          Configure team member expertise, availability, and routing rules for automatic enquiry assignment
        </p>
      </div>

      {/* Statistics Cards */}
      {routingStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Routed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routingStats.totalRouted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {routingRules?.filter((r) => r.isActive).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="rules">Routing Rules</TabsTrigger>
          <TabsTrigger value="preview">Preview Routing</TabsTrigger>
        </TabsList>

        {/* Expertise Tab */}
        <TabsContent value="expertise" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Member Expertise</CardTitle>
              <CardDescription>
                Configure skills, languages, and specializations for each team member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Team Member Selection */}
              <div className="space-y-2">
                <Label>Select Team Member</Label>
                <Select
                  value={selectedUserId?.toString() || ""}
                  onValueChange={(val) => setSelectedUserId(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers?.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expertise Summary */}
              {expertiseSummary && (
                <div className="bg-red-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold">Expertise Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Areas:</span>
                      <span className="ml-2 font-medium">
                        {expertiseSummary.summary.totalExpertiseAreas}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Experience:</span>
                      <span className="ml-2 font-medium">
                        {expertiseSummary.summary.averageExperience.toFixed(1)} years
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Languages:</span>
                      <span className="ml-2 font-medium">
                        {expertiseSummary.summary.languages.join(", ") || "None"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Destinations:</span>
                      <span className="ml-2 font-medium">
                        {expertiseSummary.summary.destinations.join(", ") || "None"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Expertise Form */}
              {selectedUserId && (
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold">Add Expertise Area</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Destination</Label>
                      <Input
                        id="destination"
                        placeholder="e.g., Goa, Kerala"
                        defaultValue=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Input
                        id="language"
                        placeholder="e.g., en, es, fr"
                        defaultValue=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Proficiency Level</Label>
                      <Select defaultValue="intermediate">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Years of Experience</Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        placeholder="0"
                        defaultValue="0"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      const destination = (
                        document.getElementById("destination") as HTMLInputElement
                      )?.value;
                      const language = (
                        document.getElementById("language") as HTMLInputElement
                      )?.value;
                      const proficiency = (
                        document.querySelector(
                          '[role="combobox"]'
                        ) as HTMLElement
                      )?.textContent;
                      const yearsOfExperience = parseInt(
                        (
                          document.getElementById(
                            "yearsOfExperience"
                          ) as HTMLInputElement
                        )?.value || "0"
                      );

                      configureExpertiseMutation.mutate({
                        userId: selectedUserId,
                        destination: destination || undefined,
                        language: language || undefined,
                        proficiencyLevel: (proficiency as any) || "intermediate",
                        yearsOfExperience,
                      });
                    }}
                    disabled={configureExpertiseMutation.isPending}
                  >
                    {configureExpertiseMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Add Expertise
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Member Availability</CardTitle>
              <CardDescription>
                Manage workload capacity and availability status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Team Member Selection */}
              <div className="space-y-2">
                <Label>Select Team Member</Label>
                <Select
                  value={selectedUserId?.toString() || ""}
                  onValueChange={(val) => setSelectedUserId(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers?.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Availability Settings */}
              {selectedUserId && (
                <div className="space-y-4 border-t pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max Enquiries Per Day</Label>
                      <Input
                        id="maxEnquiries"
                        type="number"
                        placeholder="20"
                        defaultValue="20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Active Enquiries</Label>
                      <Input
                        id="currentEnquiries"
                        type="number"
                        placeholder="0"
                        defaultValue="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Availability Status</Label>
                    <Select defaultValue="true">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Available</SelectItem>
                        <SelectItem value="false">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => {
                      const maxEnquiries = parseInt(
                        (
                          document.getElementById(
                            "maxEnquiries"
                          ) as HTMLInputElement
                        )?.value || "20"
                      );
                      const currentEnquiries = parseInt(
                        (
                          document.getElementById(
                            "currentEnquiries"
                          ) as HTMLInputElement
                        )?.value || "0"
                      );
                      const isAvailable =
                        (
                          document.querySelector(
                            '[role="combobox"]'
                          ) as HTMLElement
                        )?.textContent === "Available";

                      updateAvailabilityMutation.mutate({
                        userId: selectedUserId,
                        isAvailable,
                        maxEnquiriesPerDay: maxEnquiries,
                        currentEnquiriesCount: currentEnquiries,
                      });
                    }}
                    disabled={updateAvailabilityMutation.isPending}
                  >
                    {updateAvailabilityMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Update Availability
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Routing Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Routing Rules</CardTitle>
              <CardDescription>
                Define rules for automatic enquiry assignment based on criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Create New Rule */}
              <div className="border-b pb-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create New Rule
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rule Name</Label>
                    <Input id="ruleName" placeholder="e.g., Goa Specialist" />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input
                      id="rulePriority"
                      type="number"
                      placeholder="0"
                      defaultValue="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Destination Pattern</Label>
                    <Input
                      id="destinationPattern"
                      placeholder="e.g., Goa|Kerala"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Required Language</Label>
                    <Input id="requiredLanguage" placeholder="e.g., es" />
                  </div>
                  <div className="space-y-2">
                    <Label>Assignment Strategy</Label>
                    <Select defaultValue="least_loaded">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round_robin">Round Robin</SelectItem>
                        <SelectItem value="least_loaded">Least Loaded</SelectItem>
                        <SelectItem value="expertise_match">Expertise Match</SelectItem>
                        <SelectItem value="random">Random</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Min Experience (Years)</Label>
                    <Input
                      id="minExperience"
                      type="number"
                      placeholder="0"
                      defaultValue="0"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const name = (
                      document.getElementById("ruleName") as HTMLInputElement
                    )?.value;
                    const priority = parseInt(
                      (
                        document.getElementById("rulePriority") as HTMLInputElement
                      )?.value || "0"
                    );
                    const destinationPattern = (
                      document.getElementById(
                        "destinationPattern"
                      ) as HTMLInputElement
                    )?.value;
                    const requiredLanguage = (
                      document.getElementById(
                        "requiredLanguage"
                      ) as HTMLInputElement
                    )?.value;
                    const minExperience = parseInt(
                      (
                        document.getElementById(
                          "minExperience"
                        ) as HTMLInputElement
                      )?.value || "0"
                    );
                    const strategy = (
                      document.querySelector(
                        '[role="combobox"]'
                      ) as HTMLElement
                    )?.textContent;

                    if (!name) {
                      toast.error("Rule name is required");
                      return;
                    }

                    createRuleMutation.mutate({
                      name,
                      priority,
                      destinationPattern: destinationPattern || undefined,
                      requiredLanguage: requiredLanguage || undefined,
                      minExperienceYears: minExperience,
                      assignmentStrategy: (strategy as any) || "least_loaded",
                    });
                  }}
                  disabled={createRuleMutation.isPending}
                >
                  {createRuleMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Create Rule
                </Button>
              </div>

              {/* Existing Rules */}
              <div className="space-y-4">
                <h3 className="font-semibold">Active Rules</h3>
                {routingRules?.filter((r) => r.isActive).map((rule) => (
                  <div
                    key={rule.id}
                    className="border rounded-lg p-4 flex justify-between items-start"
                  >
                    <div className="space-y-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>
                          Strategy: <span className="font-medium">{rule.assignmentStrategy}</span>
                        </div>
                        {rule.destinationPattern && (
                          <div>
                            Destination: <span className="font-medium">{rule.destinationPattern}</span>
                          </div>
                        )}
                        {rule.requiredLanguage && (
                          <div>
                            Language: <span className="font-medium">{rule.requiredLanguage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Routing Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview Routing Scores</CardTitle>
              <CardDescription>
                See how an enquiry would be routed based on current configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Select Enquiry ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="enquiryId"
                    type="number"
                    placeholder="Enter enquiry ID"
                    onChange={(e) => setSelectedEnquiryId(parseInt(e.target.value))}
                  />
                  <Button
                    onClick={() => setShowScores(!showScores)}
                    variant="outline"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showScores ? "Hide" : "Show"} Scores
                  </Button>
                </div>
              </div>

              {/* Routing Scores Display */}
              {routingScores && showScores && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900">Recommended Assignment</h3>
                    <p className="text-sm text-green-700 mt-2">
                      {routingScores.recommendedUserName}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Score: {routingScores.scores[0]?.totalScore.toFixed(2)}/100
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">All Scores</h3>
                    {routingScores.scores.map((score, idx) => (
                      <div key={idx} className="border rounded p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{score.userName}</span>
                          <span className="text-lg font-bold">
                            {score.totalScore.toFixed(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>Workload: {score.workloadScore.toFixed(0)}</div>
                          <div>Expertise: {score.expertiseScore.toFixed(0)}</div>
                          <div>Availability: {score.availabilityScore.toFixed(0)}</div>
                          <div>Conversion: {score.conversionScore.toFixed(0)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => {
                      if (selectedEnquiryId) {
                        autoRouteMutation.mutate({ enquiryId: selectedEnquiryId });
                      }
                    }}
                    disabled={autoRouteMutation.isPending}
                    className="w-full"
                  >
                    {autoRouteMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Apply Routing
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
