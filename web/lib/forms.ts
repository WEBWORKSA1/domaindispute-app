/**
 * Form registry shared by client forms and the /api/forms route.
 * Contains labels only - no addresses.
 */

export const FORM_TYPES = {
  contact: 'General inquiry',
  'case-review': 'Free case review',
  donation: 'Donation pledge',
  contest: 'Contest entry',
  careers: 'Talent pool application',
  advertise: 'Advertising inquiry',
  sponsorship: 'Sponsorship inquiry',
  partnership: 'Partnership inquiry',
  acquisition: 'Website / domain acquisition',
  correction: 'Data correction request',
  newsletter: 'Newsletter signup',
  tool: 'Tool follow-up request',
} as const;

export type FormType = keyof typeof FORM_TYPES;

export function isFormType(v: unknown): v is FormType {
  return typeof v === 'string' && v in FORM_TYPES;
}
