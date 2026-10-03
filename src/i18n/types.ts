export type Locale = 'en' | 'ja' | 'es' | 'fr' | 'de' | 'it' | 'ko' | 'pt-br' | 'ru' | 'zh-tw';
export type PageId = 'home' | 'about' | 'privacy' | 'terms' | 'notFound';
export interface DocumentContent {
  title: string; description: string; eyebrow: string; h1: string; lead: string;
  sections: { heading: string; paragraphs: string[]; link?: { label: string; url: string } }[];
  updated?: string;
}
export interface ClientMessages {
  invalidInput: string; loading: string; checking: string; timeout: string; noResults: string;
  networkError: string; previewAlt: string; selected: string; selectedFallback: string;
  found: string; foundFallback: string; copied: string; copySuccess: string; copyFailed: string; reset: string;
  qualities: Record<'maxres' | 'standard' | 'high' | 'medium', string>;
}
export interface LocaleContent {
  seo: { title: string; description: string };
  nav: { skip: string; home: string; how: string; faq: string; about: string; privacy: string; terms: string;
    mainLabel: string; footerLabel: string; language: string; footerTagline: string; disclaimer: string; back: string };
  home: {
    eyebrow: string; h1: string; subtitle: string; description: string;
    toolTitle: string; toolDescription: string; inputLabel: string; inputPlaceholder: string;
    submit: string; inputHelp: string; example: string; noscript: string; trust: [string, string, string];
    resultsEyebrow: string; resultsTitle: string; clear: string; previewAlt: string; fileType: string;
    chooseSize: string; download: string; open: string; copy: string; saveHint: string; copyLabel: string;
    howEyebrow: string; howTitle: string; howIntro: string; steps: { title: string; body: string }[];
    sizesEyebrow: string; sizesTitle: string; sizesIntro: string; tableCaption: string;
    qualityColumn: string; sizeColumn: string; sizesNote: string; sizesFootnote: string;
    faqEyebrow: string; faqTitle: string; faqIntro: string;
    faqs: { question: string; answer: string; privacyLink?: boolean }[]; privacyLink: string; closing: string;
  };
  client: ClientMessages & { download: string; openToSave: string };
  documents: Record<'about' | 'privacy' | 'terms', DocumentContent>;
  notFound: { title: string; description: string; eyebrow: string; h1: string; lead: string };
}
