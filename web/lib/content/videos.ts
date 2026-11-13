/**
 * Curated, publicly embeddable YouTube videos. Rights remain with the creators;
 * every card credits the channel and links back to the source.
 */

export interface Video {
  id: string;
  title: string;
  summary: string;
  creator: string;
  source: string;
  topic: 'Basics' | 'The three elements' | 'Procedure' | 'Policy & reform';
}

const GIGALAW = 'GigaLaw - Domain Name Disputes: A Masterclass by Doug Isenberg';
const GIGALAW_URL = 'https://giga.law/masterclass';

export const VIDEOS: Video[] = [
  { id: 'zNDLNIQrY8M', title: 'What is a domain name dispute?', summary: 'The kinds of conflicts that end up in a domain dispute and why they arise.', creator: GIGALAW, source: GIGALAW_URL, topic: 'Basics' },
  { id: 'XL1Da82l9ow', title: 'What is the UDRP?', summary: 'How ICANN\'s Uniform Domain Name Dispute Resolution Policy works and who it binds.', creator: GIGALAW, source: GIGALAW_URL, topic: 'Basics' },
  { id: 'N0fUgRfqmLA', title: 'How long does the UDRP take?', summary: 'The stages of a case and a realistic timeline from filing to decision.', creator: GIGALAW, source: GIGALAW_URL, topic: 'Procedure' },
  { id: 'r4wkcTvKjE4', title: 'How much does the UDRP cost?', summary: 'Provider fees, panel size and the other costs of a case.', creator: GIGALAW, source: GIGALAW_URL, topic: 'Procedure' },
  { id: 'OfgGOACCYO0', title: 'What type of trademark is required?', summary: 'Registered and unregistered rights, and what gives a complainant standing.', creator: GIGALAW, source: GIGALAW_URL, topic: 'The three elements' },
  { id: '0yPh6oYhoV4', title: 'When is a domain confusingly similar?', summary: 'How panels compare a domain with a trademark under the first element.', creator: GIGALAW, source: GIGALAW_URL, topic: 'The three elements' },
  { id: '1MWOpS5VlPE', title: 'What are rights or legitimate interests?', summary: 'The second element and the defences respondents rely on.', creator: GIGALAW, source: GIGALAW_URL, topic: 'The three elements' },
  { id: 'fveRstNxAAU', title: 'What is bad faith under the UDRP?', summary: 'The third element and the evidence panels look for.', creator: GIGALAW, source: GIGALAW_URL, topic: 'The three elements' },
  { id: 'Uj4w9GkcDpg', title: 'Large UDRP complaints', summary: 'Handling complaints that cover many domain names.', creator: GIGALAW, source: GIGALAW_URL, topic: 'Procedure' },
  { id: '9CSA886aVvU', title: 'Privacy services and the GDPR', summary: 'How privacy services and redacted WHOIS data affect complaints.', creator: GIGALAW, source: GIGALAW_URL, topic: 'Procedure' },
  { id: 'xJsBAU5YUS0', title: 'Where to file a UDRP complaint', summary: 'Comparing the approved dispute resolution providers.', creator: GIGALAW, source: GIGALAW_URL, topic: 'Procedure' },
  { id: 'R6kOB7tZAzE', title: 'What is the URS?', summary: 'The Uniform Rapid Suspension system and when it beats the UDRP.', creator: GIGALAW, source: GIGALAW_URL, topic: 'Basics' },
  { id: '9sV7_NlZ9pQ', title: 'ccTLD dispute policies', summary: 'How country-code domains handle disputes differently.', creator: GIGALAW, source: GIGALAW_URL, topic: 'Basics' },
  { id: 'cns0q-NjVo4', title: 'Domain name disputes: a top 10 list', summary: 'Ten things every party should know before a case.', creator: GIGALAW, source: GIGALAW_URL, topic: 'Basics' },
  { id: 'lsJt81ryzrA', title: 'WIPO-ICA UDRP review webinar', summary: 'WIPO and the Internet Commerce Association discuss proposed UDRP improvements after 25 years.', creator: 'Internet Commerce Association', source: 'https://www.youtube.com/@ICAdomains', topic: 'Policy & reform' },
];
