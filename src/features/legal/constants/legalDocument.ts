export type LegalLink = { label: string; href: string };

export type LegalItem = { label: string; text: string };

export type LegalSectionContent = {
  id: string;
  title: string;
  paragraphs: string[];
  items?: LegalItem[];
  links?: LegalLink[];
};

export type LegalDocumentContent = {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSectionContent[];
};
