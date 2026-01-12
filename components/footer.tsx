import {
  IconBrandDribbble,
  IconBrandLinkedin,
  IconBrandYoutube,
} from "@tabler/icons-react";
import Link from "next/link";


export const Footer = () => (
  <div className="flex justify-between items-center mt-4 px-4 max-sm:flex-col">
    <div className="px-4 py-2 text-sm max-sm:hidden">
      <span className="text-muted-foreground">AI-powered logo generation</span>
    </div>

    <div className="px-4 py-2 text-sm">
      Made with ❤️ by{" "}
      <Link
        href="https://www.webbuddy.agency"
        target="_blank"
        className="text-foreground hover:text-primary transition-colors"
      >
        Webbuddy
      </Link>
    </div>

    <div className="flex gap-4 items-center max-sm:hidden">
      {[
        { href: "https://dribbble.com/webbuddy", Icon: IconBrandDribbble },
        { href: "https://www.linkedin.com/company/webbuddy-agency/posts/?feedView=all", Icon: IconBrandLinkedin },
        { href: "https://www.youtube.com/@WebBuddyAgency", Icon: IconBrandYoutube }
      ].map(({ href, Icon }) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          className="hover:text-primary transition-colors"
        >
          <Icon className="size-5" />
        </Link>
      ))}
    </div>
  </div>
);
