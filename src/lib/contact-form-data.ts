// Contact form types, step definitions, and branching logic

export interface ContactFormData {
  intent: string;
  name: string;
  email: string;
  phone: string;
  // Commercial
  projectName: string;
  projectDescription: string;
  budget: string;
  timeline: string;
  referralSource: string;
  // Collaboration
  collabType: string;
  portfolioLink: string;
  socialHandle: string;
  collabDescription: string;
  collabTimeline: string;
  // Media
  mediaOutlet: string;
  inquiryType: string;
  deadline: string;
  mediaDescription: string;
  // Something Else
  freeformMessage: string;
}

export const emptyFormData: ContactFormData = {
  intent: "",
  name: "",
  email: "",
  phone: "",
  projectName: "",
  projectDescription: "",
  budget: "",
  timeline: "",
  referralSource: "",
  collabType: "",
  portfolioLink: "",
  socialHandle: "",
  collabDescription: "",
  collabTimeline: "",
  mediaOutlet: "",
  inquiryType: "",
  deadline: "",
  mediaDescription: "",
  freeformMessage: "",
};

export type StepType =
  | "intent"
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "chips"
  | "select"
  | "date";

export interface StepDefinition {
  id: string;
  question: string;
  helperText?: string;
  type: StepType;
  field: keyof ContactFormData;
  options?: string[];
  required: boolean;
  section: "intent" | "contact" | "details";
}

/*
 * The words of the form are editable in Sanity (Contact Page, "Contact
 * form"): every question, helper line, choice and the thank you text.
 * CONTACT_FORM_DEFAULTS is today's wording, used for anything left empty,
 * so nothing changes until it is edited. The steps themselves (their
 * order, which are required, the branching, the fields they fill) stay
 * here in code, so validation, the saved draft and the spam protection
 * behave exactly as before whatever is typed in the Studio.
 */

/** The steps whose words can be edited, in no particular order. */
export const STEP_IDS = [
  "name",
  "email",
  "phone",
  "projectName",
  "projectDescription",
  "budget",
  "timeline",
  "referralSource",
  "collabType",
  "portfolioLink",
  "socialHandle",
  "collabDescription",
  "collabTimeline",
  "mediaOutlet",
  "inquiryType",
  "deadline",
  "mediaDescription",
  "freeformMessage",
] as const;
export type StepId = (typeof STEP_IDS)[number];

export type StepCopy = { question: string; helperText?: string; options?: string[] };

export type ContactFormCopy = {
  intentQuestion: string;
  /** The four intents, in order: commercial project, collaboration, media, something else. */
  intents: [string, string, string, string];
  steps: Record<StepId, StepCopy>;
  thankYouHeading: string;
  thankYouLine: string;
};

const TIMELINES = ["ASAP", "2 – 4 weeks", "1 – 2 months", "Flexible"];

export const CONTACT_FORM_DEFAULTS: ContactFormCopy = {
  intentQuestion: "Tell me what brings you here.",
  intents: ["Commercial Project", "Collaboration", "Media / Feature", "Something Else"],
  steps: {
    name: { question: "What should I call you?" },
    email: { question: "Where can I reach you?", helperText: "Used only to reply to you." },
    phone: { question: "A phone number, if you'd like.", helperText: "Optional — skip if you prefer." },
    projectName: { question: "What are you working on?", helperText: "A working title is fine." },
    projectDescription: { question: "Tell me a little about it.", helperText: "One or two sentences is enough." },
    budget: { question: "Rough budget is perfectly fine.", options: ["Under 2K", "2K – 5K", "5K – 10K", "10K+", "Not sure yet"] },
    timeline: { question: "Any timeline in mind?", options: TIMELINES },
    referralSource: {
      question: "How did you find me?",
      options: ["Google Search", "Instagram", "LinkedIn", "Word of mouth", "Previous client", "Other"],
    },
    collabType: {
      question: "What kind of collaboration interests you?",
      options: ["Creative direction", "Photography", "Videography", "Brand partnership", "Event", "Other"],
    },
    portfolioLink: { question: "Share your work, if you'd like.", helperText: "Optional — helps me learn about your work." },
    socialHandle: { question: "Where can I find you online?", helperText: "Optional." },
    collabDescription: { question: "Tell me about your idea." },
    collabTimeline: { question: "Any timeline in mind?", options: TIMELINES },
    mediaOutlet: { question: "Which outlet or organization?" },
    inquiryType: {
      question: "What kind of inquiry is this?",
      options: ["Interview", "Feature article", "Podcast", "Event coverage", "Press release", "Other"],
    },
    deadline: { question: "Any deadline or event date?", helperText: "Optional." },
    mediaDescription: { question: "Tell me more about your request." },
    freeformMessage: { question: "What's on your mind?", helperText: "Tell me anything — I'm listening." },
  },
  thankYouHeading: "Thank you for reaching out.",
  thankYouLine: "I'll be in touch shortly.",
};

/** What the Contact Page holds in Sanity (any of it may be empty). */
export type ContactFormCopyInput = {
  intentQuestion?: string | null;
  intents?: { commercial?: string | null; collaboration?: string | null; media?: string | null; other?: string | null } | null;
  steps?: Partial<Record<StepId, { question?: string | null; helperText?: string | null; options?: (string | null)[] | null } | null>> | null;
  thankYouHeading?: string | null;
  thankYouLine?: string | null;
} | null;

const text = (value: string | null | undefined, fallback: string) => value?.trim() || fallback;

/** Sanity's wording where it is filled in, today's wording everywhere else. */
export function resolveContactFormCopy(input?: ContactFormCopyInput): ContactFormCopy {
  const d = CONTACT_FORM_DEFAULTS;
  const i = input?.intents;
  const steps = {} as Record<StepId, StepCopy>;
  for (const id of STEP_IDS) {
    const base = d.steps[id];
    const edit = input?.steps?.[id];
    const options = (edit?.options ?? []).map((o) => o?.trim() ?? "").filter(Boolean);
    steps[id] = {
      question: text(edit?.question, base.question),
      ...(base.helperText !== undefined || edit?.helperText?.trim() ? { helperText: text(edit?.helperText, base.helperText ?? "") || undefined } : {}),
      ...(base.options ? { options: options.length ? options : base.options } : {}),
    };
  }
  return {
    intentQuestion: text(input?.intentQuestion, d.intentQuestion),
    intents: [text(i?.commercial, d.intents[0]), text(i?.collaboration, d.intents[1]), text(i?.media, d.intents[2]), text(i?.other, d.intents[3])],
    steps,
    thankYouHeading: text(input?.thankYouHeading, d.thankYouHeading),
    thankYouLine: text(input?.thankYouLine, d.thankYouLine),
  };
}

/** One step: its words from the copy, everything else fixed here. */
function step(copy: ContactFormCopy, id: StepId, type: StepType, required: boolean): StepDefinition {
  const c = copy.steps[id];
  return {
    id,
    question: c.question,
    ...(c.helperText ? { helperText: c.helperText } : {}),
    type,
    field: id,
    ...(c.options ? { options: c.options } : {}),
    required,
    section: id === "name" || id === "email" || id === "phone" ? "contact" : "details",
  };
}

/** Which branch an intent opens: by its place among the four (0 to 3), or -1. */
function branchOf(intent: string, copy: ContactFormCopy): number {
  const at = copy.intents.indexOf(intent);
  // A draft saved before a choice was renamed still finds its branch.
  return at >= 0 ? at : CONTACT_FORM_DEFAULTS.intents.indexOf(intent);
}

export function buildSteps(intent: string, copy: ContactFormCopy = CONTACT_FORM_DEFAULTS): StepDefinition[] {
  const base: StepDefinition[] = [
    {
      id: "intent",
      question: copy.intentQuestion,
      type: "intent",
      field: "intent",
      options: [...copy.intents],
      required: true,
      section: "intent",
    },
    step(copy, "name", "text", true),
    step(copy, "email", "email", true),
    step(copy, "phone", "tel", false),
  ];
  switch (branchOf(intent, copy)) {
    case 0:
      return [
        ...base,
        step(copy, "projectName", "text", true),
        step(copy, "projectDescription", "textarea", true),
        step(copy, "budget", "chips", true),
        step(copy, "timeline", "chips", true),
        step(copy, "referralSource", "select", true),
      ];
    case 1:
      return [
        ...base,
        step(copy, "collabType", "select", true),
        step(copy, "portfolioLink", "text", false),
        step(copy, "socialHandle", "text", false),
        step(copy, "collabDescription", "textarea", true),
        step(copy, "collabTimeline", "chips", false),
        step(copy, "referralSource", "select", true),
      ];
    case 2:
      return [
        ...base,
        step(copy, "mediaOutlet", "text", true),
        step(copy, "inquiryType", "select", true),
        step(copy, "deadline", "date", false),
        step(copy, "mediaDescription", "textarea", true),
        step(copy, "referralSource", "select", true),
      ];
    case 3:
      return [...base, step(copy, "freeformMessage", "textarea", true)];
    default:
      return base;
  }
}

export const STORAGE_KEY = "hos-contact-draft";
