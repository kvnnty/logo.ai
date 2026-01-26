"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Mail, FileText } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getTemplates } from "@/app/actions/template-actions";

interface TemplateCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
  onGetStarted: () => void;
}

function TemplateCard({ title, description, icon, preview, onGetStarted }: TemplateCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border">
          {preview}
        </div>
        <Button onClick={onGetStarted} className="w-full">
          Get started
        </Button>
      </CardContent>
    </Card>
  );
}

interface DomainPreviewProps {
  logoUrl?: string | null;
  domainName?: string;
}

export function DomainPreview({ logoUrl, domainName = "greptile.com" }: DomainPreviewProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
      {/* Browser Bar */}
      <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600 border border-gray-300">
          www.{domainName}
        </div>
      </div>
      {/* Browser Content */}
      <div className="p-6 bg-white">
        {logoUrl ? (
          <div className="flex items-center justify-center mb-4">
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
        ) : (
          <div className="h-8 w-24 bg-gray-200 rounded mx-auto mb-4"></div>
        )}
        <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
          <div className="text-center text-gray-400 text-xs">
            <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-2"></div>
            <p>Website Preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BusinessEmailPreviewProps {
  logoUrl?: string | null;
  email?: string;
  name?: string;
  title?: string;
}

export function BusinessEmailPreview({ 
  logoUrl, 
  email = "hello@greptile.com",
  name = "Ann Smith",
  title = "ceo"
}: BusinessEmailPreviewProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      {/* Email Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">From:</span>
          <span className="font-medium">{email}</span>
          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">To:</span>
          <span className="text-gray-400">client@example.com</span>
        </div>
      </div>
      
      {/* Profile Section */}
      <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
        {logoUrl ? (
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
            <img 
              src={logoUrl} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
        )}
        <div className="flex-1">
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-gray-500 uppercase">{title}</div>
          <div className="flex gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-gray-200"></div>
            <div className="w-6 h-6 rounded-full bg-gray-200"></div>
            <div className="w-6 h-6 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
      
      {/* Send Button */}
      <div className="flex justify-end pt-2">
        <button className="px-4 py-1.5 bg-gray-800 text-white text-xs rounded">
          Send email
        </button>
      </div>
    </div>
  );
}

interface EmailSignaturePreviewProps {
  logoUrl?: string | null;
  brandName?: string;
}

export function EmailSignaturePreview({ 
  logoUrl, 
  brandName = "Greptile" 
}: EmailSignaturePreviewProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start gap-4">
        {logoUrl ? (
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="w-14 h-14 rounded-full object-cover"
              />
            </div>
            <div className="text-xs font-medium text-center mt-1">{brandName}</div>
          </div>
        ) : (
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200"></div>
            <div className="text-xs font-medium text-center mt-1">{brandName}</div>
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="flex gap-3 pt-2">
            <div className="w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-400">in</span>
            </div>
            <div className="w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center">
              <span className="text-xs">📷</span>
            </div>
            <div className="w-6 h-6 rounded border-2 border-gray-300 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-400">f</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TemplatePreviewImageProps {
  previewImageUrl?: string | null;
  primaryColor?: string;
  fallback?: React.ReactNode;
}

function TemplatePreviewImage({ previewImageUrl, primaryColor = "#2563eb", fallback }: TemplatePreviewImageProps) {
  if (previewImageUrl) {
    return (
      <div 
        className="w-full rounded-lg overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: primaryColor, minHeight: '200px' }}
      >
        <img 
          src={previewImageUrl} 
          alt="Template Preview" 
          className="w-full h-auto object-contain"
          style={{ mixBlendMode: 'normal' }}
        />
      </div>
    );
  }
  
  return fallback || (
    <div 
      className="w-full rounded-lg h-48 flex items-center justify-center"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="text-white/50 text-sm">Template Preview</div>
    </div>
  );
}

interface TemplateCardsProps {
  logoUrl?: string | null;
  brandName?: string;
  email?: string;
  domainName?: string;
  primaryColor?: string;
  onDomainClick?: () => void;
  onEmailClick?: () => void;
  onSignatureClick?: () => void;
}

export function TemplateCards({
  logoUrl,
  brandName = "Brand",
  email,
  domainName,
  primaryColor = "#2563eb",
  onDomainClick,
  onEmailClick,
  onSignatureClick,
}: TemplateCardsProps) {
  const [emailSignatureTemplate, setEmailSignatureTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const result = await getTemplates('email_signature');
        if (result.success && result.templates && result.templates.length > 0) {
          setEmailSignatureTemplate(result.templates[0]);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const displayDomain = domainName || `${brandName.toLowerCase().replace(/\s+/g, '')}.com`;
  const displayEmail = email || `hello@${displayDomain}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TemplateCard
        title="Domains"
        description="A great domain is the best marketing tool."
        icon={<Globe className="h-5 w-5" />}
        preview={<DomainPreview logoUrl={logoUrl} domainName={displayDomain} />}
        onGetStarted={onDomainClick || (() => {})}
      />
      <TemplateCard
        title="Business Email"
        description="Highest rated email platform for small businesses."
        icon={<Mail className="h-5 w-5" />}
        preview={<BusinessEmailPreview logoUrl={logoUrl} email={displayEmail} name={brandName} />}
        onGetStarted={onEmailClick || (() => {})}
      />
      <TemplateCard
        title="Email Signature"
        description="Sign off emails professionally."
        icon={<FileText className="h-5 w-5" />}
        preview={
          emailSignatureTemplate?.previewImageUrl ? (
            <TemplatePreviewImage 
              previewImageUrl={emailSignatureTemplate.previewImageUrl} 
              primaryColor={primaryColor}
              fallback={<EmailSignaturePreview logoUrl={logoUrl} brandName={brandName} />}
            />
          ) : (
            <EmailSignaturePreview logoUrl={logoUrl} brandName={brandName} />
          )
        }
        onGetStarted={onSignatureClick || (() => {})}
      />
    </div>
  );
}
