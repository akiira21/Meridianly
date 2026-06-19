import {
  Bell,
  Check,
  ChevronRight,
  Clock,
  Droplets,
  Hash,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  Repeat2,
  Search,
  Settings,
  Sun,
  Trash2,
  X,
  Zap,
  Target,
  Calendar,
  FileText,
  Bookmark,
  Star,
  BarChart3,
} from "lucide-react";
import CollapsibleText from "@/components/ui/collapsible-text";
import FaqAccordion from "@/components/ui/faq-accordion";
import ImageCard from "@/components/ui/image-card";
import HeroImage from "@/components/ui/hero-image";
import BentoGrid from "@/components/ui/bento-grid";
import AppleBento from "@/components/ui/apple-bento";
import { ModeToggle } from "@/components/mode-toggle";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-16 border-b border-border last:border-b-0">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-heading text-2xl font-medium tracking-tight mb-10">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function SubSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-12 last:mb-0">
      <span className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-4 block">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function DesignPage() {
  return (
    <main className="min-h-full">
      {/* Page Header */}
      <div className="px-6 pt-16 pb-6 max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight">
              Design System
            </h1>
            <p className="mt-3 text-muted-foreground font-body max-w-lg">
              Universal components and styles for Meridianly. Built with Tailwind CSS,
              Radix UI, and minimal intention.
            </p>
          </div>
          <ModeToggle />
        </div>
      </div>

      {/* Typography */}
      <Section title="Typography">
        <SubSection label="Headings — Sora">
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-5xl md:text-6xl font-medium tracking-tight">
                Heading 1
              </h1>
              <span className="text-xs text-muted-foreground font-body mt-1 block">
                text-5xl / font-medium / tracking-tight
              </span>
            </div>
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-medium tracking-tight">
                Heading 2
              </h2>
              <span className="text-xs text-muted-foreground font-body mt-1 block">
                text-3xl / font-medium / tracking-tight
              </span>
            </div>
            <div>
              <h3 className="font-heading text-2xl font-medium tracking-tight">
                Heading 3
              </h3>
              <span className="text-xs text-muted-foreground font-body mt-1 block">
                text-2xl / font-medium / tracking-tight
              </span>
            </div>
            <div>
              <h4 className="font-heading text-xl font-medium tracking-tight">
                Heading 4
              </h4>
              <span className="text-xs text-muted-foreground font-body mt-1 block">
                text-xl / font-medium / tracking-tight
              </span>
            </div>
            <div>
              <h5 className="font-heading text-lg font-medium tracking-tight">
                Heading 5
              </h5>
              <span className="text-xs text-muted-foreground font-body mt-1 block">
                text-lg / font-medium / tracking-tight
              </span>
            </div>
            <div>
              <h6 className="font-heading text-base font-medium tracking-tight">
                Heading 6
              </h6>
              <span className="text-xs text-muted-foreground font-body mt-1 block">
                text-base / font-medium / tracking-tight
              </span>
            </div>
          </div>
        </SubSection>

        <SubSection label="Body — Plus Jakarta Sans">
          <div className="space-y-6 max-w-xl">
            <p className="font-body text-lg leading-relaxed text-muted-foreground">
              Large body text. Used for introductory paragraphs and important
              descriptions. Line height is relaxed for comfortable reading.
            </p>
            <p className="font-body text-base leading-relaxed text-muted-foreground">
              Base body text. The default for most content, paragraphs, labels,
              and UI copy. Comfortable and readable at 16px with relaxed line
              height.
            </p>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              Small body text. Great for secondary information, metadata,
              captions, and compact UI areas where space is limited.
            </p>
            <p className="font-body text-xs leading-relaxed text-muted-foreground">
              Extra small text. Used for timestamps, fine print, badges, and
              technical details.
            </p>
          </div>
        </SubSection>

        <SubSection label="Weights">
          <div className="space-y-3 font-body">
            <p className="font-normal">Normal (400) — The quick brown fox</p>
            <p className="font-medium">Medium (500) — The quick brown fox</p>
            <p className="font-semibold">Semibold (600) — The quick brown fox</p>
            <p className="font-bold">Bold (700) — The quick brown fox</p>
          </div>
        </SubSection>
      </Section>

      {/* Colors */}
      <Section title="Colors">
        <SubSection label="Foreground">
          <div className="flex flex-wrap gap-6">
            <ColorSwatch
              name="foreground"
              className="bg-foreground text-background"
            />
            <ColorSwatch
              name="muted-foreground"
              className="bg-muted-foreground"
            />
            <ColorSwatch
              name="card-foreground"
              className="bg-card-foreground"
            />
            <ColorSwatch
              name="popover-foreground"
              className="bg-popover-foreground"
            />
          </div>
        </SubSection>

        <SubSection label="Background">
          <div className="flex flex-wrap gap-6">
            <ColorSwatch name="background" className="bg-background border" />
            <ColorSwatch name="card" className="bg-card border" />
            <ColorSwatch name="popover" className="bg-popover border" />
            <ColorSwatch name="muted" className="bg-muted border" />
            <ColorSwatch name="accent" className="bg-accent border" />
            <ColorSwatch name="secondary" className="bg-secondary border" />
          </div>
        </SubSection>

        <SubSection label="Semantic">
          <div className="flex flex-wrap gap-6">
            <ColorSwatch name="primary" className="bg-primary text-primary-foreground" />
            <ColorSwatch name="destructive" className="bg-destructive text-white" />
            <ColorSwatch name="border" className="bg-border" />
            <ColorSwatch name="input" className="bg-input" />
            <ColorSwatch name="ring" className="bg-ring" />
          </div>
        </SubSection>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <SubSection label="Variants">
          <div className="flex flex-wrap items-center gap-4">
            <button className="px-5 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity">
              Primary
            </button>
            <button className="px-5 py-2.5 bg-background text-foreground border border-border rounded-full font-body text-sm font-medium hover:bg-muted transition-colors">
              Secondary
            </button>
            <button className="px-5 py-2.5 bg-muted text-foreground rounded-full font-body text-sm font-medium hover:bg-muted/80 transition-colors">
              Muted
            </button>
            <button className="px-5 py-2.5 bg-destructive text-white rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity">
              Destructive
            </button>
            <button className="px-5 py-2.5 text-foreground rounded-full font-body text-sm font-medium hover:bg-muted transition-colors">
              Ghost
            </button>
          </div>
        </SubSection>

        <SubSection label="Sizes">
          <div className="flex flex-wrap items-center gap-4">
            <button className="px-3 py-1.5 bg-foreground text-background rounded-full font-body text-xs font-medium hover:opacity-80 transition-opacity">
              Small
            </button>
            <button className="px-5 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity">
              Default
            </button>
            <button className="px-7 py-3.5 bg-foreground text-background rounded-full font-body text-base font-medium hover:opacity-80 transition-opacity">
              Large
            </button>
          </div>
        </SubSection>

        <SubSection label="With Icons">
          <div className="flex flex-wrap items-center gap-4">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity">
              <Plus size={16} />
              Add New
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-background text-foreground border border-border rounded-full font-body text-sm font-medium hover:bg-muted transition-colors">
              Settings
              <ChevronRight size={16} />
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-destructive text-white rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity">
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </SubSection>

        <SubSection label="States">
          <div className="flex flex-wrap items-center gap-4">
            <button className="px-5 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium opacity-50 cursor-not-allowed">
              Disabled
            </button>
            <button className="px-5 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium opacity-80 animate-gentle-pulse cursor-wait">
              Loading...
            </button>
            <button className="px-5 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium ring-2 ring-offset-2 ring-ring">
              Focused
            </button>
          </div>
        </SubSection>
      </Section>

      {/* Form Elements */}
      <Section title="Form Elements">
        <SubSection label="Text Inputs">
          <div className="grid gap-4 max-w-md">
            <input
              type="text"
              placeholder="Default input"
              className="w-full px-4 py-2.5 bg-card border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="text"
              placeholder="Disabled input"
              disabled
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl font-body text-sm text-muted-foreground placeholder:text-muted-foreground cursor-not-allowed opacity-60"
            />
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search with icon..."
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </SubSection>

        <SubSection label="Textarea">
          <textarea
            placeholder="Write something thoughtful..."
            rows={4}
            className="w-full max-w-md px-4 py-3 bg-card border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </SubSection>

        <SubSection label="Toggle / Switch">
          <div className="flex items-center gap-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground" />
              <span className="ml-3 font-body text-sm">Notifications</span>
            </label>

            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground" />
              <span className="ml-3 font-body text-sm">Dark Mode</span>
            </label>
          </div>
        </SubSection>

        <SubSection label="Checkbox & Radio">
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="check1"
                defaultChecked
                className="w-4 h-4 rounded border-border text-foreground focus:ring-ring"
              />
              <label htmlFor="check1" className="font-body text-sm">
                Remember me
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="radio1"
                name="radio-group"
                defaultChecked
                className="w-4 h-4 border-border text-foreground focus:ring-ring"
              />
              <label htmlFor="radio1" className="font-body text-sm">
                Option A
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="radio2"
                name="radio-group"
                className="w-4 h-4 border-border text-foreground focus:ring-ring"
              />
              <label htmlFor="radio2" className="font-body text-sm">
                Option B
              </label>
            </div>
          </div>
        </SubSection>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <SubSection label="Variants">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Default Card */}
            <div className="p-6 bg-card border border-border rounded-2xl">
              <h4 className="font-heading text-lg font-medium tracking-tight">
                Default Card
              </h4>
              <p className="mt-2 text-sm text-muted-foreground font-body leading-relaxed">
                A clean container for any content. Uses subtle border and card
                background.
              </p>
            </div>

            {/* Card with Icon */}
            <div className="p-6 bg-card border border-border rounded-2xl">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center mb-4">
                <Droplets size={18} className="text-foreground" />
              </div>
              <h4 className="font-heading text-lg font-medium tracking-tight">
                Water Tracker
              </h4>
              <p className="mt-2 text-sm text-muted-foreground font-body leading-relaxed">
                Track your daily hydration goals with simple check-ins.
              </p>
            </div>

            {/* Stat Card */}
            <div className="p-6 bg-card border border-border rounded-2xl flex flex-col justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                Total Todos
              </span>
              <div className="mt-4">
                <span className="font-heading text-4xl font-medium tracking-tight">
                  24
                </span>
                <span className="ml-2 text-sm text-muted-foreground font-body">
                  pending
                </span>
              </div>
            </div>

            {/* Active/Selected Card */}
            <div className="p-6 bg-foreground text-background rounded-2xl">
              <h4 className="font-heading text-lg font-medium tracking-tight">
                Active Card
              </h4>
              <p className="mt-2 text-sm text-background/70 font-body leading-relaxed">
                Used for selected states, featured items, or primary CTAs with
                high contrast.
              </p>
            </div>

            {/* Minimal Card */}
            <div className="p-6 bg-muted/50 rounded-2xl">
              <h4 className="font-heading text-lg font-medium tracking-tight">
                Minimal Card
              </h4>
              <p className="mt-2 text-sm text-muted-foreground font-body leading-relaxed">
                No border, just subtle background tint. Good for grouping
                related items.
              </p>
            </div>

            {/* Card with Footer */}
            <div className="p-6 bg-card border border-border rounded-2xl flex flex-col">
              <h4 className="font-heading text-lg font-medium tracking-tight">
                Card with Footer
              </h4>
              <p className="mt-2 text-sm text-muted-foreground font-body leading-relaxed flex-1">
                Content area with an action footer below.
              </p>
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-body">
                  Updated 2h ago
                </span>
                <button className="text-xs font-body font-medium hover:underline">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </SubSection>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <SubSection label="Variants">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 bg-foreground text-background rounded-full font-body text-xs font-medium">
              Primary
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 bg-muted text-foreground rounded-full font-body text-xs font-medium">
              Secondary
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 bg-destructive/10 text-destructive rounded-full font-body text-xs font-medium">
              Destructive
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 bg-card border border-border text-foreground rounded-full font-body text-xs font-medium">
              Outline
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-500/10 text-green-600 rounded-full font-body text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Active
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-full font-body text-xs font-medium">
              <Clock size={12} />
              Pending
            </span>
          </div>
        </SubSection>
      </Section>

      {/* Icons */}
      <Section title="Icons">
        <SubSection label="Common Actions">
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-foreground transition-colors">
              <Plus size={20} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="text-xs font-body">Add</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-foreground transition-colors">
              <Trash2 size={20} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="text-xs font-body">Delete</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-foreground transition-colors">
              <Settings size={20} className="transition-transform duration-300 group-hover:rotate-45" />
              <span className="text-xs font-body">Settings</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-foreground transition-colors">
              <Bell size={20} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="text-xs font-body">Notify</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-foreground transition-colors">
              <Search size={20} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="text-xs font-body">Search</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-foreground transition-colors">
              <Check size={20} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="text-xs font-body">Check</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-foreground transition-colors">
              <Sun size={20} className="transition-transform duration-300 group-hover:rotate-45" />
              <span className="text-xs font-body">Theme</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-foreground transition-colors">
              <MapPin size={20} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="text-xs font-body">Location</span>
            </div>
            <div className="flex flex-col items-center gap-2 group cursor-pointer hover:text-foreground transition-colors">
              <Hash size={20} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="text-xs font-body">Tag</span>
            </div>
          </div>
        </SubSection>

        <SubSection label="In Context">
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-muted hover:bg-foreground hover:text-background transition-colors">
              <Bell size={16} />
            </button>
            <button className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-muted hover:bg-foreground hover:text-background transition-colors">
              <Settings size={16} />
            </button>
            <button className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-foreground text-background hover:opacity-80 transition-opacity">
              <Plus size={16} />
            </button>
          </div>
        </SubSection>
      </Section>

      {/* Spacing */}
      <Section title="Spacing">
        <SubSection label="Scale">
          <div className="space-y-4">
            {[1, 2, 3, 4, 6, 8, 10, 12, 16].map((space) => (
              <div key={space} className="flex items-center gap-4">
                <span className="w-12 text-xs text-muted-foreground font-body text-right">
                  {space}
                </span>
                <div
                  className="h-4 bg-foreground/10 rounded"
                  style={{ width: `${space * 4}px` }}
                />
                <span className="text-xs text-muted-foreground font-body">
                  {space * 4}px
                </span>
              </div>
            ))}
          </div>
        </SubSection>
      </Section>

      {/* Collapsible Text */}
      <Section title="Collapsible Text">
        <SubSection label="Expandable Content">
          <div className="grid gap-6 max-w-xl">
            <div className="p-6 bg-card border border-border rounded-2xl">
              <h4 className="font-heading text-base font-medium tracking-tight mb-2">
                Privacy Policy
              </h4>
              <CollapsibleText
                text="We collect minimal data to provide our services. Your personal information is encrypted and never shared with third parties. We use industry-standard security practices to protect your data. You can request a full export or deletion of your data at any time from your account settings."
                maxLength={120}
              />
            </div>
            <div className="p-6 bg-card border border-border rounded-2xl">
              <h4 className="font-heading text-base font-medium tracking-tight mb-2">
                Feature Notes
              </h4>
              <CollapsibleText
                text="Meridianly helps you track water intake, manage todos, set reminders, schedule events, scan food for calories, and jot quick notes. Everything syncs across your devices. Built with privacy in mind — your data stays on your device unless you explicitly enable cloud backup."
                maxLength={100}
              />
            </div>
          </div>
        </SubSection>
      </Section>

      {/* Testimonials */}
      <Section title="Testimonials">
        <SubSection label="Twitter / X Style">
          <div className="grid gap-0 md:grid-cols-2 max-w-4xl">
            <TweetCard
              name="Sarah Chen"
              handle="@sarahbuilds"
              date="Jun 1"
              text="Meridianly completely changed how I organize my day. The water tracker keeps me hydrated and the minimal UI is so calming."
              likes={124}
              replies={18}
              reposts={32}
            />
            <TweetCard
              name="James Park"
              handle="@jparkdesign"
              date="May 28"
              text="Finally a life management app that doesn't overwhelm me. Clean fonts, warm colors, and everything just works."
              likes={89}
              replies={7}
              reposts={14}
            />
            <TweetCard
              name="Aisha Patel"
              handle="@aishatech"
              date="May 25"
              text="I switched from five different apps to just Meridianly. Todos, reminders, events, and notes all in one calm space."
              likes={256}
              replies={42}
              reposts={67}
            />
            <TweetCard
              name="Lucas Rivera"
              handle="@lucascode"
              date="May 22"
              text="The PWA works flawlessly on my phone. Offline support is solid and the design is exactly what I was looking for."
              likes={167}
              replies={23}
              reposts={45}
            />
          </div>
        </SubSection>
      </Section>

      {/* FAQ Accordion */}
      <Section title="FAQ Accordion">
        <SubSection label="Expandable Questions">
          <div className="max-w-2xl">
            <FaqAccordion
              items={[
                {
                  question: "How does Meridianly keep my data private?",
                  answer:
                    "All your data is stored locally on your device by default. We use end-to-end encryption for any cloud backups. You own your data and can export or delete it at any time from your account settings.",
                },
                {
                  question: "Can I use Meridianly offline?",
                  answer:
                    "Yes. As a PWA, Meridianly works fully offline. All your todos, reminders, events, and notes are available even without an internet connection. Changes sync automatically when you're back online.",
                },
                {
                  question: "What platforms does Meridianly support?",
                  answer:
                    "Meridianly runs on any modern browser. Install it as a PWA on iOS, Android, Windows, macOS, and Linux. One app, every device.",
                },
                {
                  question: "How accurate is the food calorie scanner?",
                  answer:
                    "Our AI model (MobileNetV3 trained on Food-101) identifies food items with high accuracy. Calorie data is then pulled from OpenFoodFacts for reliable nutritional information.",
                },
                {
                  question: "Is Meridianly free to use?",
                  answer:
                    "Yes. Meridianly is completely free for personal use. All core features — water tracking, todos, reminders, events, notes, and food scanning — are available at no cost.",
                },
              ]}
            />
          </div>
        </SubSection>
      </Section>

      {/* Image UI */}
      <Section title="Image Components">
        <SubSection label="Image Cards">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl">
            <ImageCard
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop&q=80"
              alt="Abstract fluid art"
              caption="Morning routine tracking"
              aspectRatio="video"
            />
            <ImageCard
              src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=600&fit=crop&q=80"
              alt="Abstract gradient mesh"
              caption="Food scan preview"
              aspectRatio="square"
            />
            <ImageCard
              src="https://images.unsplash.com/photo-1558591710-4b4ac1a06f48?w=600&h=800&fit=crop&q=80"
              alt="Abstract dark waves"
              caption="Quick notes interface"
              aspectRatio="portrait"
            />
          </div>
        </SubSection>
      </Section>

      {/* Bento Grid */}
      <Section title="Bento Grid">
        <SubSection label="3 + 1 Layout">
          <div className="max-w-3xl">
            <BentoGrid
              variant="3-1"
              items={[
                {
                  icon: Droplets,
                  title: "Water",
                  description: "Track daily hydration with simple check-ins and gentle reminders.",
                },
                {
                  icon: Check,
                  title: "Todos",
                  description: "Organize tasks by priority. Done is better than perfect.",
                },
                {
                  icon: Bell,
                  title: "Reminders",
                  description: "Never miss what matters. Time-based and location-based alerts.",
                },
                {
                  icon: Calendar,
                  title: "Events",
                  description: "Plan your week with a clean calendar view that stays out of your way.",
                },
              ]}
            />
          </div>
        </SubSection>

        <SubSection label="1 + 3 Layout">
          <div className="max-w-3xl">
            <BentoGrid
              variant="1-3"
              items={[
                {
                  icon: Star,
                  title: "Notes",
                  description: "Quick thoughts, saved instantly.",
                },
                {
                  icon: Target,
                  title: "Goals",
                  description: "Set weekly targets and watch progress unfold.",
                },
                {
                  icon: Zap,
                  title: "Focus",
                  description: "Pomodoro timer with ambient sounds.",
                },
                {
                  icon: BarChart3,
                  title: "Insights",
                  description: "See patterns in your productivity over time.",
                },
              ]}
            />
          </div>
        </SubSection>

        <SubSection label="2 + 2 Layout">
          <div className="max-w-3xl">
            <BentoGrid
              variant="2-2"
              items={[
                {
                  icon: FileText,
                  title: "Journal",
                  description: "Daily reflections with mood tracking and weather context.",
                },
                {
                  icon: Bookmark,
                  title: "Saved",
                  description: "Links, articles, and inspiration all in one place.",
                },
                {
                  icon: Hash,
                  title: "Tags",
                  description: "Organize everything with flexible tagging across all modules.",
                },
                {
                  icon: MapPin,
                  title: "Locations",
                  description: "Location-aware reminders for context-based productivity.",
                },
              ]}
            />
          </div>
        </SubSection>
      </Section>

      {/* Hero Images */}
      <Section title="Hero Images">
        <SubSection label="Default — Bottom Left Text">
          <div className="max-w-3xl">
            <HeroImage
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop&q=80"
              alt="Abstract fluid art"
              heading="Start your day with intention"
              description="A calm space for your todos, reminders, and mindful moments."
              variant="default"
              aspect="landscape"
            />
          </div>
        </SubSection>

        <SubSection label="Gradient Fade — Bottom Gradient">
          <div className="max-w-3xl">
            <HeroImage
              src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=600&fit=crop&q=80"
              alt="Abstract gradient mesh"
              heading="Build healthy habits"
              description="Track water intake, scan food, and stay on top of your wellness goals."
              variant="gradient"
              aspect="landscape"
            />
          </div>
        </SubSection>

        <SubSection label="With Badge & CTA">
          <div className="max-w-3xl">
            <HeroImage
              src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&h=600&fit=crop&q=80"
              alt="Abstract light trails"
              heading="Focus mode is here"
              description="Block distractions and get into deep work with our new focus timer."
              variant="badge"
              badge="New Feature"
              cta="Try it now"
              aspect="landscape"
            />
          </div>
        </SubSection>

        <SubSection label="Dark Overlay — High Contrast">
          <div className="max-w-3xl">
            <HeroImage
              src="https://images.unsplash.com/photo-1558591710-4b4ac1a06f48?w=1200&h=600&fit=crop&q=80"
              alt="Abstract dark waves"
              heading="Your data, your device"
              description="Everything stays local unless you choose otherwise. Privacy first."
              variant="dark"
              aspect="landscape"
            />
          </div>
        </SubSection>

        <SubSection label="Centered — Text Center">
          <div className="max-w-3xl">
            <HeroImage
              src="https://images.unsplash.com/photo-1541701494587-cb58502866b0?w=1200&h=600&fit=crop&q=80"
              alt="Abstract colorful paint"
              heading="Meridianly"
              description="A personal life manager that respects your attention."
              variant="centered"
              aspect="landscape"
            />
          </div>
        </SubSection>

        <SubSection label="Compact — Small & Dense">
          <div className="max-w-md">
            <HeroImage
              src="https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=600&h=400&fit=crop&q=80"
              alt="Abstract soft curves"
              heading="Daily calm"
              description="Breathe. Track. Reflect."
              variant="compact"
              aspect="landscape"
            />
          </div>
        </SubSection>
      </Section>

      {/* Apple Bento */}
      <Section title="Apple Bento">
        <SubSection label="Image + Glass Layout">
          <AppleBento
            items={[
              {
                size: "large",
                variant: "image",
                image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop&q=80",
                title: "Water Tracker",
                description: "Stay hydrated with gentle reminders and beautiful visualizations.",
                badge: "Popular",
              },
              {
                size: "tall",
                variant: "glass",
                icon: Target,
                title: "Daily Goals",
                description: "Set and achieve your personal targets every single day.",
                badge: "New",
              },
              {
                size: "small",
                variant: "text",
                icon: Zap,
                title: "Focus",
                description: "Deep work timer",
              },
              {
                size: "small",
                variant: "text",
                icon: Star,
                title: "Notes",
                description: "Quick capture",
              },
            ]}
          />
        </SubSection>
      </Section>

      {/* Footer */}
      <footer className="px-6 py-10 max-w-5xl mx-auto border-t border-border">
        <p className="text-xs text-muted-foreground font-body">
          Meridianly Design System — Built with Next.js, Tailwind CSS, and Radix
          UI.
        </p>
      </footer>
    </main>
  );
}

function ColorSwatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-16 h-16 rounded-xl border border-border ${className}`}
      />
      <span className="text-xs text-muted-foreground font-body">{name}</span>
    </div>
  );
}

function TweetCard({
  name,
  handle,
  date,
  text,
  likes,
  replies,
  reposts,
}: {
  name: string;
  handle: string;
  date: string;
  text: string;
  likes: number;
  replies: number;
  reposts: number;
}) {
  return (
    <div className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          <span className="font-heading text-sm font-medium">
            {name.charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-body text-sm font-medium text-foreground truncate">
                {name}
              </span>
              <span className="font-body text-sm text-muted-foreground truncate">
                {handle}
              </span>
              <span className="font-body text-sm text-muted-foreground">·</span>
              <span className="font-body text-sm text-muted-foreground shrink-0">
                {date}
              </span>
            </div>
            <X size={14} className="text-muted-foreground shrink-0 ml-2" />
          </div>
          <p className="mt-0.5 font-body text-sm leading-relaxed text-foreground">
            {text}
          </p>
          <div className="mt-2 flex items-center justify-between max-w-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-body text-sm hover:text-foreground transition-colors">
              <MessageCircle size={16} />
              {replies}
            </span>
            <span className="inline-flex items-center gap-1.5 font-body text-sm hover:text-foreground transition-colors">
              <Repeat2 size={16} />
              {reposts}
            </span>
            <span className="inline-flex items-center gap-1.5 font-body text-sm hover:text-foreground transition-colors">
              <Heart size={16} />
              {likes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
