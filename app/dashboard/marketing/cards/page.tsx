import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Cards page.</p>
        </CardContent>
      </Card>
    </div>
  );
}
