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

const INTENTS = [
  "Commercial Project",
  "Collaboration",
  "Media / Feature",
  "Something Else",
];

const SHARED_CONTACT_STEPS: StepDefinition[] = [
  {
    id: "name",
    question: "What should I call you?",
    type: "text",
    field: "name",
    required: true,
    section: "contact",
  },
  {
    id: "email",
    question: "Where can I reach you?",
    helperText: "Used only to reply to you.",
    type: "email",
    field: "email",
    required: true,
    section: "contact",
  },
  {
    id: "phone",
    question: "A phone number, if you'd like.",
    helperText: "Optional — skip if you prefer.",
    type: "tel",
    field: "phone",
    required: false,
    section: "contact",
  },
];

const REFERRAL_OPTIONS = [
  "Google Search",
  "Instagram",
  "LinkedIn",
  "Word of mouth",
  "Previous client",
  "Other",
];

const COMMERCIAL_STEPS: StepDefinition[] = [
  {
    id: "projectName",
    question: "What are you working on?",
    helperText: "A working title is fine.",
    type: "text",
    field: "projectName",
    required: true,
    section: "details",
  },
  {
    id: "projectDescription",
    question: "Tell me a little about it.",
    helperText: "One or two sentences is enough.",
    type: "textarea",
    field: "projectDescription",
    required: true,
    section: "details",
  },
  {
    id: "budget",
    question: "Rough budget is perfectly fine.",
    type: "chips",
    field: "budget",
    options: ["Under 2K", "2K – 5K", "5K – 10K", "10K+", "Not sure yet"],
    required: true,
    section: "details",
  },
  {
    id: "timeline",
    question: "Any timeline in mind?",
    type: "chips",
    field: "timeline",
    options: ["ASAP", "2 – 4 weeks", "1 – 2 months", "Flexible"],
    required: true,
    section: "details",
  },
  {
    id: "referralSource",
    question: "How did you find me?",
    type: "select",
    field: "referralSource",
    options: REFERRAL_OPTIONS,
    required: true,
    section: "details",
  },
];

const COLLAB_STEPS: StepDefinition[] = [
  {
    id: "collabType",
    question: "What kind of collaboration interests you?",
    type: "select",
    field: "collabType",
    options: [
      "Creative direction",
      "Photography",
      "Videography",
      "Brand partnership",
      "Event",
      "Other",
    ],
    required: true,
    section: "details",
  },
  {
    id: "portfolioLink",
    question: "Share your work, if you'd like.",
    helperText: "Optional — helps me learn about your work.",
    type: "text",
    field: "portfolioLink",
    required: false,
    section: "details",
  },
  {
    id: "socialHandle",
    question: "Where can I find you online?",
    helperText: "Optional.",
    type: "text",
    field: "socialHandle",
    required: false,
    section: "details",
  },
  {
    id: "collabDescription",
    question: "Tell me about your idea.",
    type: "textarea",
    field: "collabDescription",
    required: true,
    section: "details",
  },
  {
    id: "collabTimeline",
    question: "Any timeline in mind?",
    type: "chips",
    field: "collabTimeline",
    options: ["ASAP", "2 – 4 weeks", "1 – 2 months", "Flexible"],
    required: false,
    section: "details",
  },
  {
    id: "referralSource",
    question: "How did you find me?",
    type: "select",
    field: "referralSource",
    options: REFERRAL_OPTIONS,
    required: true,
    section: "details",
  },
];

const MEDIA_STEPS: StepDefinition[] = [
  {
    id: "mediaOutlet",
    question: "Which outlet or organization?",
    type: "text",
    field: "mediaOutlet",
    required: true,
    section: "details",
  },
  {
    id: "inquiryType",
    question: "What kind of inquiry is this?",
    type: "select",
    field: "inquiryType",
    options: [
      "Interview",
      "Feature article",
      "Podcast",
      "Event coverage",
      "Press release",
      "Other",
    ],
    required: true,
    section: "details",
  },
  {
    id: "deadline",
    question: "Any deadline or event date?",
    helperText: "Optional.",
    type: "date",
    field: "deadline",
    required: false,
    section: "details",
  },
  {
    id: "mediaDescription",
    question: "Tell me more about your request.",
    type: "textarea",
    field: "mediaDescription",
    required: true,
    section: "details",
  },
  {
    id: "referralSource",
    question: "How did you find me?",
    type: "select",
    field: "referralSource",
    options: REFERRAL_OPTIONS,
    required: true,
    section: "details",
  },
];

const OTHER_STEPS: StepDefinition[] = [
  {
    id: "freeformMessage",
    question: "What's on your mind?",
    helperText: "Tell me anything — I'm listening.",
    type: "textarea",
    field: "freeformMessage",
    required: true,
    section: "details",
  },
];

const INTENT_STEP: StepDefinition = {
  id: "intent",
  question: "Tell me what brings you here.",
  type: "intent",
  field: "intent",
  options: INTENTS,
  required: true,
  section: "intent",
};

export function buildSteps(intent: string): StepDefinition[] {
  const base = [INTENT_STEP, ...SHARED_CONTACT_STEPS];

  switch (intent) {
    case "Commercial Project":
      return [...base, ...COMMERCIAL_STEPS];
    case "Collaboration":
      return [...base, ...COLLAB_STEPS];
    case "Media / Feature":
      return [...base, ...MEDIA_STEPS];
    case "Something Else":
      return [...base, ...OTHER_STEPS];
    default:
      return base;
  }
}

export const STORAGE_KEY = "hos-contact-draft";
