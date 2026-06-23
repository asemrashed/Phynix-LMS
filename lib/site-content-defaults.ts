import type {
  ContactFaqItem,
  ContactPageContent,
  FooterContent,
  FooterSocialLink,
  HomepageSectionItem,
  OfficeAddress,
  PublicHomepageSection,
  PublicSitePage,
  PublicSiteSettings,
  SiteCtaLink,
} from "@fxprime/types"
import { CONTACT_FAQ, OFFICE_ADDRESS, OFFICE_HOURS, SUPPORT_EMAIL } from "@/lib/contact-info"

export const DEFAULT_CONTACT_PAGE: ContactPageContent = {
  eyebrow: "Contact",
  title: "Get in touch",
  description:
    "Questions about courses, payments, or live sessions? Our team supports students in Bangladesh and worldwide.",
  formTitle: "Send us a message",
  formSubtitle: "Fill out the form and we'll get back to you within 24–48 hours.",
}

function buildDefaultSocialLinks(): FooterSocialLink[] {
  const links: FooterSocialLink[] = []
  const entries: [FooterSocialLink["platform"], string | undefined][] = [
    ["facebook", process.env.NEXT_PUBLIC_FACEBOOK_URL],
    ["instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL],
    ["youtube", process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com"],
    ["linkedin", process.env.NEXT_PUBLIC_LINKEDIN_URL],
    ["twitter", process.env.NEXT_PUBLIC_TWITTER_URL],
  ]
  for (const [platform, href] of entries) {
    if (href?.trim()) links.push({ platform, href: href.trim() })
  }
  return links
}

export const DEFAULT_FOOTER: FooterContent = {
  brandName: "IELTS LMS",
  brandTagline:
    "Premium IELTS preparation platform for students in Bangladesh and worldwide. Learn with structured courses, live classes, and verified certificates.",
  quickLinksTitle: "Quick Links",
  companyLinksTitle: "Company",
  contactTitle: "Contact",
  socialTitle: "Connect With Us",
  quickLinks: [
    { href: "/courses", label: "All Courses" },
    { href: "/courses?free=true", label: "Free Courses" },
    { href: "/live", label: "Live Sessions" },
    { href: "/blog", label: "Blog" },
  ],
  companyLinks: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
    { href: "/refund-policy", label: "Refund Policy" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
  ],
  bottomLinks: [
    { href: "/privacy-policy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/cookies", label: "Cookies" },
  ],
  socialLinks: buildDefaultSocialLinks(),
  copyrightText: "IELTS LMS. All rights reserved.",
}

export const DEFAULT_SITE_SETTINGS: PublicSiteSettings = {
  supportEmail: SUPPORT_EMAIL,
  officeAddress: OFFICE_ADDRESS,
  officeHours: OFFICE_HOURS,
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? null,
  contactFaq: CONTACT_FAQ as ContactFaqItem[],
  contactPage: DEFAULT_CONTACT_PAGE,
  footer: DEFAULT_FOOTER,
}

export const DEFAULT_HOMEPAGE_SECTIONS: Record<string, PublicHomepageSection> = {
  hero: {
    key: "hero",
    eyebrow: "Professional IELTS Preparation",
    title: "Master IELTS with Expert-Led Preparation",
    description:
      "Build Listening, Reading, Writing, and Speaking skills through structured courses, live classes, and mock tests designed for serious test-takers.",
    items: [],
    ctaPrimary: { label: "Join Course", href: "/courses" },
    ctaSecondary: { label: "View Pricing", href: "/pricing" },
    metadata: null,
  },
  risk_disclaimer: {
    key: "risk_disclaimer",
    eyebrow: null,
    title: null,
    description:
      "IELTS scores depend on individual effort and preparation. Content is for educational purposes only. IELTS LMS does not guarantee specific band scores or exam outcomes.",
    items: [],
    ctaPrimary: null,
    ctaSecondary: null,
    metadata: { label: "Important Notice:" },
  },
  trust_bar: {
    key: "trust_bar",
    eyebrow: null,
    title: null,
    description: null,
    items: [
      { icon: "Building2", title: "UK Registered Company", description: "" },
      { icon: "Users", title: "1000+ Students", description: "", statKey: "students" },
      { icon: "LineChart", title: "Live Practice Sessions", description: "" },
      { icon: "UserCheck", title: "Expert Instruction", description: "" },
    ],
    ctaPrimary: null,
    ctaSecondary: null,
    metadata: null,
  },
  free_learning_hub: {
    key: "free_learning_hub",
    eyebrow: "Free Resources",
    title: "Free Learning Hub",
    description:
      "Everything you need to start — courses, videos, ebooks, and IELTS tips at no cost",
    items: [
      {
        icon: "BookOpen",
        title: "Free Course",
        description: "Start learning IELTS fundamentals at zero cost",
        href: "/courses?free=true",
      },
      {
        icon: "Youtube",
        title: "YouTube Channel",
        description: "Free IELTS lessons, tips, and speaking practice",
        href: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com",
        external: true,
      },
      {
        icon: "FileText",
        title: "Free Ebooks",
        description: "Download study guides, vocabulary lists & practice materials",
        href: "/marketplace?type=digital&free=true",
      },
      {
        icon: "TrendingUp",
        title: "IELTS Tips & Strategies",
        description: "Writing templates, speaking topics & exam strategies explained",
        href: "/blog/category/ielts-tips",
      },
    ],
    ctaPrimary: null,
    ctaSecondary: null,
    metadata: null,
  },
  pricing: {
    key: "pricing",
    eyebrow: "Live sessions",
    title: "Free webinars or PRO live sessions",
    description:
      "Start with free public webinars, or upgrade to PRO for exclusive Q&A, mock tests, and live coaching sessions.",
    items: [],
    ctaPrimary: { label: "View full pricing details", href: "/pricing" },
    ctaSecondary: null,
    metadata: {
      footnote: "Payment method is selected on the checkout step after you choose to upgrade.",
    },
  },
  why_choose: {
    key: "why_choose",
    eyebrow: "Why IELTS LMS",
    title: "Why Choose Us",
    description: "Everything you need to become a confident, well-prepared IELTS candidate",
    items: [
      {
        icon: "Video",
        title: "Live Classes",
        description: "Interactive sessions with speaking practice, writing feedback, and Q&A",
      },
      {
        icon: "Infinity",
        title: "Lifetime Access",
        description: "Revisit course materials and updates whenever you need them",
      },
      {
        icon: "Users",
        title: "Study Community",
        description: "Connect with fellow students, share tips, and grow together",
      },
      {
        icon: "Bot",
        title: "AI Learning Tools",
        description: "Smart quizzes, progress tracking, and AI-powered study aids",
      },
      {
        icon: "ClipboardCheck",
        title: "Practical Assignments",
        description: "Apply what you learn with mock tests and graded writing tasks",
      },
    ],
    ctaPrimary: null,
    ctaSecondary: null,
    metadata: null,
  },
  final_cta: {
    key: "final_cta",
    eyebrow: null,
    title: "Start Your IELTS Journey Today",
    description:
      "Join thousands of students preparing for IELTS with live classes and a thriving study community.",
    items: [],
    ctaPrimary: { label: "Join Course", href: "/courses" },
    ctaSecondary: { label: "View Pricing", href: "/pricing" },
    metadata: null,
  },
  featured_courses: {
    key: "featured_courses",
    eyebrow: "Featured Courses",
    title: "Start Your IELTS Journey",
    description: "English courses from beginner basics to advanced band 7+ preparation",
    items: [],
    ctaPrimary: { label: "View All Courses", href: "/courses" },
    ctaSecondary: null,
    metadata: { eyebrowVariant: "destructive" },
  },
  latest_insights: {
    key: "latest_insights",
    eyebrow: "IELTS Insights",
    title: "Latest Insights & Blog",
    description: "Speaking topics, writing templates, vocabulary tips, and exam strategies",
    items: [],
    ctaPrimary: { label: "View All Insights", href: "/blog" },
    ctaSecondary: null,
    metadata: {
      emptyMessage:
        "New IELTS tips coming soon. Check back for speaking topics, writing strategies, and study guides.",
    },
  },
  testimonials: {
    key: "testimonials",
    eyebrow: "Student Success",
    title: "Student Success & Reviews",
    description:
      "Video reviews, screenshot testimonials, and Trustpilot ratings from our community",
    items: [],
    ctaPrimary: null,
    ctaSecondary: null,
    metadata: { emptyMessage: "Student reviews coming soon." },
  },
}

const DEFAULT_PAGES: Record<string, Omit<PublicSitePage, "updatedAt">> = {
  about: {
    slug: "about",
    title: "About IELTS LMS",
    description: "Professional IELTS preparation for students in Bangladesh and worldwide.",
    contentHtml: `<p>IELTS LMS is a dedicated IELTS preparation platform helping students achieve their target band scores through structured courses, live classes, mock tests, and mentor support.</p>`,
    seoTitle: "About Us — IELTS LMS",
    seoDescription: "Learn about IELTS LMS — professional IELTS preparation platform.",
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    description: null,
    contentHtml: `<p>Last updated: June 2026</p><h2>Acceptance of Terms</h2><p>By accessing IELTS LMS, you agree to these terms.</p>`,
    seoTitle: "Terms & Conditions — IELTS LMS",
    seoDescription: null,
  },
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: null,
    contentHtml: `<p>Last updated: June 2026</p><h2>Information We Collect</h2><p>We collect information you provide when registering or enrolling.</p>`,
    seoTitle: "Privacy Policy — IELTS LMS",
    seoDescription: null,
  },
  "refund-policy": {
    slug: "refund-policy",
    title: "Refund Policy",
    description: null,
    contentHtml: `<p>Last updated: June 2026</p><h2>Digital Courses &amp; Products</h2><p>Refund requests may be submitted within 7 days of purchase.</p>`,
    seoTitle: "Refund Policy — IELTS LMS",
    seoDescription: null,
  },
  cookies: {
    slug: "cookies",
    title: "Cookie Policy",
    description: null,
    contentHtml: `<p>Last updated: June 2026</p><h2>What Are Cookies</h2><p>Cookies are small text files stored on your device.</p>`,
    seoTitle: "Cookie Policy — IELTS LMS",
    seoDescription: null,
  },
}

export function mergeFooter(data: FooterContent | null | undefined): FooterContent {
  if (!data) return DEFAULT_FOOTER
  return {
    brandName: data.brandName?.trim() || DEFAULT_FOOTER.brandName,
    brandTagline: data.brandTagline?.trim() || DEFAULT_FOOTER.brandTagline,
    quickLinksTitle: data.quickLinksTitle?.trim() || DEFAULT_FOOTER.quickLinksTitle,
    companyLinksTitle: data.companyLinksTitle?.trim() || DEFAULT_FOOTER.companyLinksTitle,
    contactTitle: data.contactTitle?.trim() || DEFAULT_FOOTER.contactTitle,
    socialTitle: data.socialTitle?.trim() || DEFAULT_FOOTER.socialTitle,
    quickLinks: data.quickLinks?.length ? data.quickLinks : DEFAULT_FOOTER.quickLinks,
    companyLinks: data.companyLinks?.length ? data.companyLinks : DEFAULT_FOOTER.companyLinks,
    bottomLinks: data.bottomLinks?.length ? data.bottomLinks : DEFAULT_FOOTER.bottomLinks,
    socialLinks: data.socialLinks?.length ? data.socialLinks : DEFAULT_FOOTER.socialLinks,
    copyrightText: data.copyrightText?.trim() || DEFAULT_FOOTER.copyrightText,
  }
}

export function mergeSiteSettings(data: PublicSiteSettings | null | undefined): PublicSiteSettings {
  if (!data) return DEFAULT_SITE_SETTINGS
  return {
    supportEmail: data.supportEmail || DEFAULT_SITE_SETTINGS.supportEmail,
    officeAddress: {
      line1: data.officeAddress?.line1 || DEFAULT_SITE_SETTINGS.officeAddress.line1,
      line2: data.officeAddress?.line2 || DEFAULT_SITE_SETTINGS.officeAddress.line2,
    },
    officeHours: data.officeHours || DEFAULT_SITE_SETTINGS.officeHours,
    whatsappNumber: data.whatsappNumber ?? DEFAULT_SITE_SETTINGS.whatsappNumber,
    contactFaq: data.contactFaq?.length ? data.contactFaq : DEFAULT_SITE_SETTINGS.contactFaq,
    contactPage: {
      eyebrow: data.contactPage?.eyebrow || DEFAULT_SITE_SETTINGS.contactPage.eyebrow,
      title: data.contactPage?.title || DEFAULT_SITE_SETTINGS.contactPage.title,
      description: data.contactPage?.description || DEFAULT_SITE_SETTINGS.contactPage.description,
      formTitle: data.contactPage?.formTitle || DEFAULT_SITE_SETTINGS.contactPage.formTitle,
      formSubtitle:
        data.contactPage?.formSubtitle || DEFAULT_SITE_SETTINGS.contactPage.formSubtitle,
    },
    footer: mergeFooter(data.footer),
  }
}

export function mergeHomepageSection(
  key: string,
  section: PublicHomepageSection | null | undefined
): PublicHomepageSection {
  const fallback = DEFAULT_HOMEPAGE_SECTIONS[key]
  if (!section && !fallback) {
    return {
      key,
      eyebrow: null,
      title: null,
      description: null,
      items: [],
      ctaPrimary: null,
      ctaSecondary: null,
      metadata: null,
    }
  }
  if (!section) return fallback
  if (!fallback) return section
  return {
    key,
    eyebrow: section.eyebrow ?? fallback.eyebrow,
    title: section.title ?? fallback.title,
    description: section.description ?? fallback.description,
    items: section.items?.length ? section.items : fallback.items,
    ctaPrimary: section.ctaPrimary ?? fallback.ctaPrimary,
    ctaSecondary: section.ctaSecondary ?? fallback.ctaSecondary,
    metadata: section.metadata ?? fallback.metadata,
  }
}

export function mergeSitePage(
  slug: string,
  page: PublicSitePage | null | undefined
): PublicSitePage | null {
  const fallback = DEFAULT_PAGES[slug]
  if (!page && !fallback) return null
  if (!page) {
    return { ...fallback!, updatedAt: new Date(0).toISOString() }
  }
  return page
}

export type { OfficeAddress, ContactFaqItem, ContactPageContent, SiteCtaLink, FooterContent, FooterSocialLink, HomepageSectionItem }
