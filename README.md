# Route2CareRx

Find free and low-cost healthcare clinics across the United States. Enter your ZIP code to discover federally funded community health centers (FQHCs), health center look-alikes, and other low-cost care options near you.

## Features

- **ZIP code search** — Find clinics within 10–100 miles of any US ZIP code
- **HRSA data** — Powered by the official [HRSA Health Center Service Delivery Sites](https://data.hrsa.gov/data/download) dataset (updated daily)
- **Services & details** — See services offered, sliding fee scale info, phone, website, and directions
- **Additional resources** — Links to NAFC free clinics, CDC cancer screening, SAMHSA treatment locators, and more

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy your Supabase credentials into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The root `.env` file is also read by import scripts.

### 3. Set up the database

Apply the Supabase migration (via Supabase dashboard SQL editor or MCP), then import data:

```bash
npm run import-zips
npm run import-data
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data accuracy notes

- **Services** are derived from verified HRSA fields: grant subprograms (homeless, migrant, public housing), site type, and location setting.
- **Hours** come from official HRSA data: total **operating hours per week**, **operating schedule** (e.g. Full-Time / Part-Time), and **operating calendar** (e.g. Year-Round / Seasonal). HRSA does **not** publish daily Mon–Sun open/close times — users are prompted to call the clinic for today's hours. For charitable clinics, [FreeClinics.com](https://www.freeclinics.com/) is linked as an external resource that sometimes lists daily hours.

## Data Sources

| Source | Coverage | Hours |
|--------|----------|-------|
| [HRSA Health Center Service Delivery Sites](https://data.hrsa.gov/data/download) | FQHCs and look-alikes (~18,000 sites) | Hours/week + schedule type |
| [HRSA ArcGIS Primary Health Care Facilities](https://gisportal.hrsa.gov/server/rest/services/HealthCareFacilities/PrimaryHealthCareFacilities_FS/MapServer/0/) | Same sites, machine-readable | `TOT_OPER_HR_PER_WEEK`, schedule & calendar |
| [FreeClinics.com](https://www.freeclinics.com/) | Free/income-based clinics | Sometimes daily hours (external link) |
| NAFC, CDC, SAMHSA | Specialized care locators | Search-only |

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** (PostgreSQL)
- **Tailwind CSS 4**

## Disclaimer

Route2CareRx is not affiliated with HRSA or any healthcare provider. Clinic data is provided for informational purposes. Always verify services, hours, and eligibility directly with the clinic. For medical emergencies, call 911.
