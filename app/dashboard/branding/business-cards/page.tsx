import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Business Cards page.</p>
        </CardContent>
      </Card>
    </div>
  );
}
