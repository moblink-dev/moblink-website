# IRAAC Supabase Database

## Setup

```bash
# Install Supabase CLI
# brew install supabase/tap/supabase

# Link to the existing production project
supabase link --project-ref xfrhwibtmpjnasbcxdlw

# Apply migrations
supabase db push

# Seed the service directory
# Run this in the Supabase SQL editor:
#   select public.seed_services();
```

## Migrations

| File | Purpose |
|------|---------|
| `20260808000000_enable_postgis.sql` | Enable PostGIS and pg_trgm extensions |
| `20260808000001_services_table.sql` | Service directory table with spatial index |
| `20260808000002_referrals_table.sql` | Referrals table for help requests |
| `20260808000003_staff_profiles.sql` | Staff profiles for admin access control |
| `20260808000004_search_functions.sql` | PostGIS search functions + seed data |
| `20260913155455_support_conversations.sql` | Authenticated customer/staff support inbox |
| `20260921174704_cloud_access_hardening.sql` | Owned referrals, explicit RLS and function hardening |
| `20260924132825_combine_select_policies.sql` | Equivalent single-pass read policies for services and referrals |
| `20260924133101_profile_image_storage.sql` | Private owner-scoped profile image bucket and policies |
| `20260924133148_referral_client_fields.sql` | Cross-device referral service, postcode and contact fields |

## Key Functions

- `nearby_services(lat, lng, radius_m, filter_cat, search_q)` — Find services within a radius
- `search_services_by_location(location_q, filter_cat)` — Search by suburb/postcode
- `service_categories_with_counts()` — Get category counts
- `get_service_detail(service_id)` — Full service details
- `seed_services()` — One-time seed of 20 Illawarra services

## RLS

- **Public**: Read published services only
- **Authenticated users**: Read published services
- **Authenticated community users**: Create and read only their own referrals
- **Staff**: Manage services and referrals when an active profile exists
- **Staff profiles**: Direct users can read only their own profile; provisioning
  and role changes remain server-side
