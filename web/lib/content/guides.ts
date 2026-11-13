/**
 * Original long-form guides. Citations refer to the ICANN Uniform Domain Name
 * Dispute Resolution Policy ("Policy") and the Rules for UDRP ("Rules").
 */

export interface Guide {
  slug: string;
  title: string;
  description: string;
  audience: 'Respondents' | 'Complainants' | 'Everyone' | 'Brand owners' | 'Domain investors';
  updated: string;
  body: string;
  faqs?: Array<{ q: string; a: string }>;
  related: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'how-to-respond-to-a-udrp-complaint',
    title: 'How to respond to a UDRP complaint',
    description:
      'A step-by-step plan for domain owners who have been served with a UDRP complaint: the deadline, what to argue, what evidence to gather and what to avoid.',
    audience: 'Respondents',
    updated: '2026-11-13',
    related: ['udrp-timeline-and-deadlines', 'rights-or-legitimate-interests', 'evidence-checklist', 'after-the-decision'],
    body: `
If you have received a notice from WIPO, Forum, CAC or another provider saying a complaint has been filed against your domain name, the clock is already running. Under paragraph 5(a) of the Rules you have **20 days from the date the proceeding commenced** to file a response. Paragraph 5(b) lets you ask for four more calendar days, and providers grant that first request automatically. If you file nothing, the panel decides on the complaint alone, and most undefended complaints succeed.

## Step 1: confirm the deadline and freeze the domain's history

Find the commencement date in the provider's notification email and add 20 days. Our [deadline calculator](/tools/deadline-calculator) does this for you. Then preserve evidence before anything changes: screenshot the current website, save Wayback Machine captures of how the domain was used over time, export your registrar's purchase receipt and keep any emails with the complainant. The registrar has already locked the domain, so you cannot transfer it while the case runs.

## Step 2: read the complaint as a checklist

The complainant has to prove all three elements of Policy paragraph 4(a):

1. The domain is identical or confusingly similar to a trademark in which the complainant has rights.
2. You have no rights or legitimate interests in the domain.
3. The domain was registered **and** is being used in bad faith.

You only need to defeat one of them. Mark every factual claim in the complaint as true, false or unknown. Most responses that win attack the second or third element with dated evidence, not argument.

## Step 3: build your strongest element

**Rights or legitimate interests.** Policy paragraph 4(c) gives three examples: use of the domain, or demonstrable preparations to use it, for a genuine business before you heard of the dispute; being commonly known by the name; or legitimate non-commercial or fair use. Business records, invoices, product pages and dated development work matter more than statements of intent. See the [legitimate interests guide](/guides/rights-or-legitimate-interests).

**No bad faith.** Bad faith needs both registration and use. If you registered the domain before the complainant's trademark existed, registration generally cannot have targeted it. A dictionary word, a common acronym or a surname registered for its own meaning is also hard to attack. See [bad faith under the UDRP](/guides/bad-faith-under-the-udrp).

## Step 4: write the response

Follow the provider's response form; WIPO and Forum both publish model responses for parties without a lawyer. Keep it factual and organised by element. Attach exhibits, number them, and refer to each exhibit where you rely on it. Avoid insults and speculation about the complainant's motives unless you can prove them. If you believe the complaint was filed in bad faith, for example the complainant knew your registration predated its mark, ask the panel for a finding of [reverse domain name hijacking](/procedures/rdnh-defense) under Rules paragraph 15(e).

## Step 5: decide on panel size

A single panelist decides most cases. You can elect a three-member panel in your response; if the complainant chose a single panelist, you then pay half of the three-member fee. Three-member panels are common in high-value or legally novel disputes.

## Step 6: consider settlement in parallel

Many cases end with a negotiated transfer or a payment. The provider can suspend the proceeding to give the parties time to settle. Settlement is a business decision: weigh the value of the domain against the cost of defending it and the risk of losing.

## What not to do

- Do not change the website to add content that copies the complainant after receiving the complaint; panels read that as bad faith.
- Do not offer to sell the domain to the complainant for a large sum inside the response.
- Do not miss the deadline. A late response may be ignored.
- Do not assume silence is safe. Default cases are decided on the complainant's evidence alone.

If you want a second opinion on your facts, request a [free case review](/get-help?situation=respondent).
`,
    faqs: [
      { q: 'How long do I have to respond to a UDRP complaint?', a: 'Twenty days from the date the proceeding commenced (Rules paragraph 5(a)). You can request four additional calendar days, which providers grant automatically on a first request.' },
      { q: 'Do I need a lawyer to respond?', a: 'No. The Rules only refer to "any representative authorized to act" for a party, so representation is optional, and providers publish model forms for parties filing themselves. A lawyer is worth considering when the domain is valuable or the facts are complicated.' },
      { q: 'What happens if I do not respond?', a: 'The panel decides on the complaint and its evidence alone. Most undefended complaints result in a transfer.' },
    ],
  },
  {
    slug: 'how-to-file-a-udrp-complaint',
    title: 'How to file a UDRP complaint',
    description:
      'What trademark owners need before filing a UDRP complaint, how to choose a provider, what it costs, and how to avoid a reverse domain name hijacking finding.',
    audience: 'Complainants',
    updated: '2026-11-13',
    related: ['choosing-a-dispute-provider', 'confusing-similarity-first-element', 'evidence-checklist', 'udrp-vs-urs-vs-court'],
    body: `
The UDRP is a fast, document-only procedure for recovering domain names registered in bad faith. It is cheaper than litigation, but it is not a negotiation tool and it does not award damages. Before filing, make sure you can prove all three elements of Policy paragraph 4(a).

## 1. Check that you have standing

You need rights in a trademark or service mark. A national or regional registration is the clearest proof. Unregistered (common-law) rights can qualify, but you must show the name acquired distinctiveness through use: sales figures, advertising, media coverage and customer recognition. A company name alone is not enough.

## 2. Check the timeline

Compare the domain's creation date (use our [domain lookup](/tools/domain-lookup)) with the date your rights began. If the domain was registered before your mark existed, a bad-faith registration claim is usually impossible, and filing anyway risks a finding of reverse domain name hijacking.

## 3. Collect evidence of bad faith

Policy paragraph 4(b) lists four examples: buying the domain mainly to sell it to you or a competitor for more than its costs; registering it to block you, as part of a pattern; registering it to disrupt a competitor; and using it to attract users for commercial gain by creating confusion with your mark. Screenshots of pay-per-click links naming your brand, phishing pages, fake shops, emails offering the domain for sale and evidence of the registrant's other infringing domains are typical exhibits. See the [evidence checklist](/guides/evidence-checklist).

## 4. Choose a provider and a panel size

Any ICANN-approved provider can hear a gTLD case. Fees for one to five domains with a single panelist run from about EUR 800 (CAC) to US$1,330 (Forum, 1-2 domains) and US$1,500 (WIPO). Three-member panels cost more. Compare them in our [fee estimator](/tools/fee-estimator) and the [provider guide](/guides/choosing-a-dispute-provider).

## 5. Draft the complaint

Use the provider's model complaint. The Rules (paragraph 3) require the parties' details, the domain names, the registrar, the trademarks relied on, the grounds for each element, the remedy requested (transfer or cancellation) and a certification. Representation is optional: you may file yourself, and the Rules only ask for details of "any representative" you appoint.

## 6. After filing

The provider checks the complaint for formal compliance, the registrar confirms and locks the domain, and the proceeding commences. The respondent then has 20 days to respond. A panel is appointed and is asked to decide within 14 days. Typical WIPO cases end around two months after filing. If you win, the registrar implements the transfer after ten business days unless the respondent files a court action (Policy paragraph 4(k)).

## When the UDRP is the wrong tool

The UDRP does not cover trademark infringement on a website that does not target your mark through the domain itself, contract disputes between business partners, or claims for money. For those, see [UDRP vs URS vs court](/guides/udrp-vs-urs-vs-court).
`,
    faqs: [
      { q: 'How much does it cost to file a UDRP?', a: 'Provider fees for 1-5 domains with a single panelist are US$1,500 at WIPO, US$1,330 at Forum (1-2 domains) and EUR 800 at CAC, before any legal fees.' },
      { q: 'Can I get damages through the UDRP?', a: 'No. The only remedies are transfer or cancellation of the domain (Policy paragraph 4(i)).' },
    ],
  },
  {
    slug: 'udrp-timeline-and-deadlines',
    title: 'UDRP timeline and deadlines, day by day',
    description:
      'Every deadline in a UDRP proceeding, from filing to implementation, with the rule that sets it and what usually happens in practice.',
    audience: 'Everyone',
    updated: '2026-11-13',
    related: ['how-to-respond-to-a-udrp-complaint', 'after-the-decision', 'how-to-file-a-udrp-complaint'],
    body: `
UDRP proceedings follow fixed deadlines set by the Rules. Real cases drift by a few days around them, but the sequence is predictable. Use the [deadline calculator](/tools/deadline-calculator) to apply these to your dates.

| Stage | Deadline | Source |
| --- | --- | --- |
| Registrar confirms details and locks the domain | 2 business days after the provider's request | Rules 4(b) |
| Provider reviews the complaint | A few days; deficiencies can be corrected within 5 days | Rules 4(d) |
| Proceeding commences | Date the provider forwards the complaint | Rules 4(c) |
| Response due | 20 days after commencement | Rules 5(a) |
| Automatic extension | 4 extra calendar days on request | Rules 5(b) |
| Panel appointed | Usually within 5 calendar days after the response | Rules 6(b) |
| Decision sent to provider | 14 days after appointment | Rules 15(b) |
| Decision sent to the parties | 3 business days after receipt | Rules 16(a) |
| Transfer implemented | After 10 business days unless a court action is filed | Policy 4(k) |

## In practice

Most WIPO cases conclude in about two months from filing. Cases with no response move faster. Settlement discussions can suspend the proceeding. WIPO now also offers an expedited track for up to five domains that targets a decision within one month of commencement, at a higher fee.

## Missing the response deadline

A late response may be disregarded. If you are close to the deadline, file what you have and ask for the automatic four-day extension before the original deadline passes.

## After the decision

If the complainant wins, the losing respondent has ten business days to show the registrar that it has started a lawsuit in a court of mutual jurisdiction. Otherwise the registrar transfers or cancels the domain. See [after the decision](/guides/after-the-decision).
`,
    faqs: [
      { q: 'How long does a UDRP take?', a: 'Typically about two months from filing to decision at WIPO, plus ten business days before the registrar implements a transfer.' },
    ],
  },
  {
    slug: 'bad-faith-under-the-udrp',
    title: 'Bad faith under the UDRP: what panels look for',
    description:
      'The four bad-faith circumstances in Policy paragraph 4(b), the evidence panels accept, and the facts that usually defeat a bad-faith claim.',
    audience: 'Everyone',
    updated: '2026-11-13',
    related: ['rights-or-legitimate-interests', 'confusing-similarity-first-element', 'evidence-checklist'],
    body: `
The third UDRP element requires that the domain was **registered and is being used** in bad faith. Both halves matter. Policy paragraph 4(b) lists four non-exhaustive examples.

## The four listed circumstances

1. **Selling to the mark owner.** The domain was acquired primarily to sell, rent or transfer it to the complainant or a competitor for more than the documented out-of-pocket costs.
2. **Blocking, as a pattern.** The domain was registered to prevent the mark owner from reflecting its mark in a domain, and the registrant has engaged in a pattern of such conduct.
3. **Disrupting a competitor.** The domain was registered primarily to disrupt the business of a competitor.
4. **Confusion for commercial gain.** The domain is used intentionally to attract internet users for commercial gain by creating a likelihood of confusion with the complainant's mark.

## Evidence panels accept

- Pay-per-click pages whose links relate to the complainant's goods or competitors.
- Phishing pages, fake log-ins, or email (MX) records used to impersonate the complainant.
- Offers to sell the domain to the complainant, especially unsolicited ones.
- A portfolio of other domains copying well-known marks.
- Use of the complainant's logo, product photos or trade dress.

## Passive holding

A domain that is simply parked with no content can still be found in bad faith when the mark is distinctive and well known, the registrant hides its identity, provides no evidence of good-faith use, and no plausible legitimate use can be imagined. Panels apply this doctrine cautiously.

## Facts that usually defeat bad faith

- Registration predates the complainant's trademark rights.
- The domain is a common word, phrase or short acronym used for its ordinary meaning.
- The registrant had no plausible reason to know of a small or local mark.
- A genuine business has used the domain openly for years.

A complaint that ignores these facts can lead to a finding of [reverse domain name hijacking](/procedures/rdnh-defense).
`,
  },
  {
    slug: 'rights-or-legitimate-interests',
    title: 'Rights or legitimate interests: the second element',
    description:
      'How respondents show rights or legitimate interests under Policy paragraph 4(c), how the burden of proof shifts, and the evidence that works.',
    audience: 'Respondents',
    updated: '2026-11-13',
    related: ['how-to-respond-to-a-udrp-complaint', 'bad-faith-under-the-udrp', 'buying-a-domain-without-a-dispute'],
    body: `
The complainant must show that the respondent lacks rights or legitimate interests in the domain. Because that is a negative, panels accept a *prima facie* case from the complainant and then shift the burden of production to the respondent to show something concrete.

## The three examples in Policy paragraph 4(c)

1. **Bona fide use before notice.** Before any notice of the dispute, the respondent used the domain, or made demonstrable preparations to use it, in connection with a genuine offering of goods or services.
2. **Commonly known by the name.** The respondent, as an individual, business or organisation, has been commonly known by the domain name, even without trademark rights.
3. **Legitimate non-commercial or fair use.** Use without intent for commercial gain to misleadingly divert consumers or tarnish the mark, such as a genuine criticism or fan site.

## What counts as evidence

- Invoices, orders, tax filings or bank records tied to the business on the domain.
- Dated design files, development contracts or launch plans from before the dispute.
- Company registration documents, press coverage or long-standing social accounts using the name.
- For criticism sites: content that is genuinely critical, non-commercial and does not impersonate.

## Domain investing

Buying and selling domain names is a legitimate business. Panels generally accept it as a legitimate interest when the domain is a dictionary word, common phrase or acronym held for its inherent value, not for its association with one trademark owner. It does not protect domains that copy a distinctive mark.

## Resellers and distributors

A reseller using a manufacturer's mark in its domain can have a legitimate interest if it actually sells the genuine goods, uses the site only for those goods, clearly discloses its relationship with the mark owner and does not corner the market in domains reflecting the mark.
`,
  },
  {
    slug: 'confusing-similarity-first-element',
    title: 'Identical or confusingly similar: the first element',
    description:
      'How panels compare a domain name with a trademark, why the TLD is ignored, and how typos, added words and hyphens are treated.',
    audience: 'Everyone',
    updated: '2026-11-13',
    related: ['bad-faith-under-the-udrp', 'protecting-your-brand-from-cybersquatting', 'how-to-file-a-udrp-complaint'],
    body: `
The first element is a standing test. Panels make a side-by-side comparison between the trademark and the domain name to see whether the mark is recognisable within it. It is usually the easiest element to satisfy.

## Common rules of thumb

- **The TLD is disregarded.** ".com" or ".shop" is a technical requirement and generally ignored in the comparison, though panels may take it into account where it forms part of the mark.
- **Added words do not help.** A domain that contains the whole mark plus a descriptive, geographic or pejorative term, such as "brand-support" or "brandoutlet", is normally confusingly similar.
- **Typos count.** Misspellings, swapped or doubled letters, and look-alike characters are classic typosquatting and usually satisfy the test.
- **Hyphens and spaces are ignored.** Punctuation differences rarely matter.
- **Design elements are ignored.** Only the textual part of a figurative mark is compared.

## When the first element fails

The test fails where the complainant has no trademark rights at all, or the mark is not recognisable in the domain. Rights acquired after the domain was registered still satisfy this element, but they become a serious problem for the bad-faith element.

Our case pages run the same comparison automatically for every decision, showing whether each disputed domain is an exact match, the mark plus extra words, or a one-character variant.
`,
  },
  {
    slug: 'udrp-vs-urs-vs-court',
    title: 'UDRP vs URS vs court: choosing the right route',
    description:
      'A practical comparison of the UDRP, the Uniform Rapid Suspension system and court action under the ACPA, by cost, speed, remedy and burden of proof.',
    audience: 'Everyone',
    updated: '2026-11-13',
    related: ['how-to-file-a-udrp-complaint', 'choosing-a-dispute-provider', 'after-the-decision'],
    body: `
Trademark owners have three main routes against a cybersquatter. They differ in cost, speed, what you can win and how much you must prove.

| | UDRP | URS | Court (US ACPA) |
| --- | --- | --- | --- |
| Domains covered | All gTLDs and many ccTLDs | New gTLDs and several legacy ones such as .org, .info and .biz (not .com or .net) | Any domain within the court's reach |
| Remedy | Transfer or cancellation | Suspension for the rest of the registration | Transfer, damages, injunction |
| Burden of proof | Balance of probabilities | Clear and convincing evidence | Civil standard |
| Typical provider fee | US$1,330 - 1,500 for a single panelist | Around US$375 at Forum | Court fees plus legal costs |
| Typical duration | About 2 months | A few weeks | Many months |
| Appeal | Court action within 10 business days | Appeal within the URS | Normal appeals |

## When to use the URS

Use the URS for open-and-shut cases where you only need the domain switched off, such as a phishing site on a new gTLD. The domain is suspended, not transferred, and can be registered again when it expires.

## When to go to court

The US Anticybersquatting Consumer Protection Act (15 U.S.C. 1125(d)) allows statutory damages of up to US$100,000 per domain and in rem actions against the domain itself where the registrant cannot be found. Court is expensive and slow, so it is usually reserved for serious, repeated or high-value abuse, or for a respondent challenging a UDRP decision.

## Country-code domains

Many ccTLDs run their own policies, such as Nominet's DRS for .uk or CIRA's CDRP for .ca. See the [ccTLD guide](/procedures/cctld).
`,
  },
  {
    slug: 'choosing-a-dispute-provider',
    title: 'Choosing a dispute provider: WIPO, Forum, CAC and others',
    description:
      'How the ICANN-approved UDRP providers compare on fees, languages and practice, and how to pick one.',
    audience: 'Complainants',
    updated: '2026-11-13',
    related: ['how-to-file-a-udrp-complaint', 'udrp-vs-urs-vs-court'],
    body: `
The complainant chooses the provider. All approved providers apply the same Policy and Rules, but they add their own supplemental rules, fees and panelist lists.

| Provider | Base fee, single panelist | Notes |
| --- | --- | --- |
| WIPO (Geneva) | US$1,500 for 1-5 domains | The largest caseload; about 6,280 cases in 2025; publishes the WIPO Overview of panel views; expedited track available |
| Forum (Minneapolis) | US$1,330 for 1-2 domains, US$1,480 for 3-5 | Large US caseload; also a URS provider |
| CAC (Prague) | EUR 800 for 1-5 domains | Lowest base fee; online filing platform |
| ADNDRC | Varies by office | Offices in Asia; Chinese-language proceedings |
| CIIDRC (Vancouver) | Published on its site | Canadian provider, also handles .ca |
| MFSD (Milan) | Published on its site | Also a URS provider |

## How to choose

- **Language.** Proceedings normally run in the language of the registration agreement. A provider with panelists fluent in that language helps.
- **Cost.** Fees matter most for multi-domain cases.
- **Precedent.** WIPO publishes the largest body of decisions and the WIPO Overview, which many panelists at every provider follow.
- **Speed.** Most providers move at similar speed; WIPO's expedited option is the exception.

Always confirm fees on the provider's own website on the day you file. Our [fee estimator](/tools/fee-estimator) shows the current schedules side by side.
`,
  },
  {
    slug: 'evidence-checklist',
    title: 'UDRP evidence checklist',
    description:
      'The exhibits complainants and respondents should collect before filing or answering a domain name dispute.',
    audience: 'Everyone',
    updated: '2026-11-13',
    related: ['how-to-respond-to-a-udrp-complaint', 'how-to-file-a-udrp-complaint', 'bad-faith-under-the-udrp'],
    body: `
UDRP panels decide on documents only: there is usually no hearing. The party with better-organised, dated evidence tends to win. Number every exhibit and refer to it in your argument.

## For complainants

- Trademark registration certificates, with dates and classes.
- Evidence of reputation: sales, advertising spend, press, awards, social following.
- WHOIS or RDAP record of the domain, showing its creation date.
- Screenshots of the domain's website, dated, including pay-per-click links.
- Wayback Machine captures showing past use.
- Any emails or listings offering the domain for sale.
- Evidence of phishing or fraud: fake log-in pages, emails sent from the domain, MX records.
- Other domains held by the respondent that copy third-party marks.

## For respondents

- Registrar receipt showing when and how you acquired the domain.
- Proof of business use: invoices, orders, product pages, analytics, tax records.
- Dated preparations: design files, development contracts, launch plans.
- Evidence you are commonly known by the name.
- Proof the term is generic or descriptive: dictionary entries, third-party uses.
- Any communication with the complainant, especially if it approached you first.
- Evidence that your registration predates the complainant's mark.

## Formatting tips

- Keep the narrative short and put detail in exhibits.
- Translate any document not in the language of the proceeding.
- Highlight the key line on long documents.
- Never alter screenshots; panels notice.
`,
  },
  {
    slug: 'after-the-decision',
    title: 'After the decision: implementation, settlement and appeals',
    description:
      'What happens after a UDRP decision: the ten-business-day window, how transfers are implemented, and how to challenge a decision in court.',
    audience: 'Everyone',
    updated: '2026-11-13',
    related: ['udrp-timeline-and-deadlines', 'udrp-vs-urs-vs-court'],
    body: `
The panel sends its decision to the provider, which forwards it to the parties, the registrar and ICANN within three business days (Rules paragraph 16(a)). Decisions are published on the provider's website.

## If the complainant wins

Under Policy paragraph 4(k), the registrar waits **ten business days** before transferring or cancelling the domain. During that window the respondent can stop implementation by giving the registrar official documentation that it has started a lawsuit against the complainant in a court of mutual jurisdiction. Otherwise the transfer goes ahead and the complainant receives instructions from the registrar.

## If the complainant loses

The respondent keeps the domain and the registrar removes the lock. The complainant may still sue in court; the UDRP does not prevent litigation. A complainant can refile a UDRP only in limited circumstances, such as relevant new evidence that was not reasonably available before.

## Reverse domain name hijacking

If the panel declared the complaint was brought in bad faith, the finding is published with the decision. It carries no monetary penalty under the UDRP.

## Terminated cases

When the parties settle or the complaint is withdrawn, the provider terminates the case and usually publishes no decision. In our case library these appear as "Terminated".
`,
  },
  {
    slug: 'protecting-your-brand-from-cybersquatting',
    title: 'Protecting your brand from cybersquatting',
    description:
      'A practical brand-protection routine: register defensively, monitor new registrations and filings, and act quickly against abusive domains.',
    audience: 'Brand owners',
    updated: '2026-11-13',
    related: ['confusing-similarity-first-element', 'how-to-file-a-udrp-complaint', 'udrp-vs-urs-vs-court'],
    body: `
Thousands of UDRP complaints are filed every year, most of them by brand owners chasing typo domains, phishing sites and fake shops. A simple routine cuts both risk and cost.

## 1. Register your trademark

The UDRP protects trademarks, not company names. A registered mark makes the first element straightforward and strengthens bad-faith arguments.

## 2. Register the domains that matter

Register your main mark in .com and in your key country codes, plus the most obvious typos of short marks. You cannot register everything; prioritise what customers are likely to type.

## 3. Monitor

- Run your mark through our [typo-variant scanner](/tools/typo-scanner) to see which look-alike domains are already registered.
- Watch the [live docket](/live) for filings involving your industry or competitors.
- Subscribe to the daily brief for new decisions and filings.

## 4. Triage what you find

Not every similar domain is worth a complaint. Prioritise active abuse (phishing, fake shops, email impersonation), then pay-per-click pages trading on your mark, then passive registrations. Check the registration date against your mark's history before acting.

## 5. Choose the right remedy

For clear abuse on a new gTLD, the URS is cheap and fast. For transfers, use the UDRP. For large-scale or repeated abuse with identifiable defendants, consider court. See [UDRP vs URS vs court](/guides/udrp-vs-urs-vs-court).

If you want help working through a list of infringing domains, ask for a [free case review](/get-help?situation=brand).
`,
  },
  {
    slug: 'buying-a-domain-without-a-dispute',
    title: 'Buying a domain without inviting a dispute',
    description:
      'Due diligence for domain investors and businesses buying an existing domain name: trademark checks, history checks and safe ways to use it.',
    audience: 'Domain investors',
    updated: '2026-11-13',
    related: ['rights-or-legitimate-interests', 'bad-faith-under-the-udrp', 'protecting-your-brand-from-cybersquatting'],
    body: `
A domain acquired today is judged by your intentions today, even if the domain itself is decades old. Panels generally treat a transfer to a new owner as a new registration for the bad-faith analysis.

## Before you buy

- **Search trademarks** for the exact term in your main markets (USPTO, EUIPO, WIPO Global Brand Database, CIPO). A famous, distinctive mark is a red flag.
- **Check the history** with the Wayback Machine. A domain previously used by a trademark owner carries more risk.
- **Search our [case library](/cases)** for the domain and its brand to see whether it has been disputed before.
- **Prefer meaning.** Dictionary words, common phrases, geographic terms and generic acronyms are far safer than invented words.

## After you buy

- Use the domain for its ordinary meaning, or park it with ads that relate to that meaning, not to a trademark owner's products.
- Keep records of why you bought it and what you planned.
- Do not approach trademark owners with offers to sell.
- Respond to every complaint on time.

## Escrow and transfers

Use a reputable escrow service for private purchases, and update the registrant details after the transfer so you can receive dispute notices.
`,
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
