"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Mail, FileText, Monitor, Link as LinkIcon } from "lucide-react";
import {
  DomainPreview,
  BusinessEmailPreview,
  EmailSignaturePreview,
} from "./template-cards";

export interface GetStartedItem {
  id: string;
  title: string;
  description?: string;
  tag?: "Popular" | "New";
  icon: React.ReactNode;
  preview: React.ReactNode;
  primaryAction: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

interface GetStartedScrollProps {
  items: GetStartedItem[];
}

function GetStartedCard({ item }: { item: GetStartedItem }) {
  return (
    <Card className="flex-shrink-0 w-[400px] overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">{item.icon}</div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              {item.title}
              {item.tag && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                  {item.tag}
                </span>
              )}
            </CardTitle>
          </div>
        </div>
        {item.description && (
          <CardDescription className="text-xs">{item.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 pt-0">
        <div className="rounded-lg border bg-muted/30 p-3 min-h-[120px] flex items-center justify-center">
          {item.preview}
        </div>
        <div className="flex gap-2 mt-auto">
          <Button size="sm" onClick={item.primaryAction.onClick} className="flex-1">
            {item.primaryAction.label}
          </Button>
          {item.secondaryAction && (
            <Button size="sm" variant="outline" onClick={item.secondaryAction.onClick}>
              {item.secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function GetStartedScroll({ items }: GetStartedScrollProps) {
  return (
    <div className="relative -mx-6 px-6">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        {items.map((item) => (
          <GetStartedCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

interface GetStartedScrollWithBrandProps {
  logoUrl?: string | null;
  brandName?: string;
  email?: string;
  domainName?: string;
  primaryColor?: string;
  onDomainClick?: () => void;
  onEmailClick?: () => void;
  onSignatureClick?: () => void;
  onWebsiteClick?: () => void;
  onLinkInBioClick?: () => void;
}

export function GetStartedScrollWithBrand({
  logoUrl,
  brandName = "Brand",
  email,
  domainName,
  primaryColor = "#2563eb",
  onDomainClick,
  onEmailClick,
  onSignatureClick,
  onWebsiteClick,
  onLinkInBioClick,
}: GetStartedScrollWithBrandProps) {
  const displayDomain = domainName || `${brandName.toLowerCase().replace(/\s+/g, "")}.com`;
  const displayEmail = email || `hello@${displayDomain}`;

  const items: GetStartedItem[] = [
    ...(onLinkInBioClick
      ? [
        {
          id: "link-in-bio",
          title: "Link in Bio",
          description: "bio/ops_zPh980d",
          icon: <LinkIcon className="h-5 w-5" />,
          preview: (
            <div className="w-24 h-40 rounded-lg border-2 border-border bg-background flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Link in Bio</span>
            </div>
          ),
          primaryAction: { label: "Connect domain", onClick: onLinkInBioClick },
        } as GetStartedItem,
      ]
      : []),
    {
      id: "website",
      title: "Website",
      tag: "Popular" as const,
      description: `${brandName} · Plan: Free Plan · Domain: Not Connected`,
      icon: <Monitor className="h-5 w-5" />,
      preview: (
        <div className="w-full max-w-[200px] rounded border bg-white p-3 shadow-sm">
          <div className="text-[10px] text-muted-foreground mb-2">Strategy, Design and Marketing</div>
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-6 w-auto object-contain" />
          ) : (
            <div className="h-6 w-16 bg-muted rounded" />
          )}
        </div>
      ),
      primaryAction: { label: "Manage", onClick: onWebsiteClick || (() => { }) },
      secondaryAction: { label: "Upgrade", onClick: () => { } },
    },
    {
      id: "domains",
      title: "Domains",
      description: "A great domain is the best marketing tool.",
      icon: <Globe className="h-5 w-5" />,
      preview: <DomainPreview logoUrl={logoUrl} domainName={displayDomain} />,
      primaryAction: { label: "Get started", onClick: onDomainClick || (() => { }) },
    },
    {
      id: "business-email",
      title: "Business Email",
      description: "Highest rated email platform for small businesses.",
      icon: <Mail className="h-5 w-5" />,
      preview: (
        <BusinessEmailPreview
          logoUrl={logoUrl}
          email={displayEmail}
          name={brandName}
          title="ceo"
        />
      ),
      primaryAction: { label: "Get started", onClick: onEmailClick || (() => { }) },
    },
    {
      id: "email-signature",
      title: "Email Signature",
      description: "Sign off emails professionally.",
      icon: <FileText className="h-5 w-5" />,
      preview: <EmailSignaturePreview logoUrl={logoUrl} brandName={brandName} />,
      primaryAction: { label: "Get started", onClick: onSignatureClick || (() => { }) },
    },
  ];

  return <GetStartedScroll items={items} />;
}
