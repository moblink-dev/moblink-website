-- IRAAC-016: fields required to restore a signed-in person's referral across
-- browsers without relying on the prototype's localStorage shape.

alter table public.referrals
  add column if not exists client_service_key text not null default 'general',
  add column if not exists postcode text not null default '',
  add column if not exists preferred_contact text not null default 'sms';

alter table public.referrals
  add constraint referrals_client_service_key_length
    check (length(client_service_key) between 1 and 160),
  add constraint referrals_postcode_format
    check (postcode = '' or postcode ~ '^[0-9]{4}$'),
  add constraint referrals_preferred_contact_values
    check (preferred_contact in ('phone', 'sms', 'in_app'));
