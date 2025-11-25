# Advanced Analytics Setup Guide

## Overview

This guide will help you set up the advanced analytics feature for your Hovallo property platform. The analytics system provides landlords with insights into property views, inquiry conversion rates, price comparisons, listing timing analysis, and geographic demand.

## Prerequisites

- Supabase account with an active project
- Access to your Supabase SQL Editor
- Node.js and npm installed

## Step 1: Install Dependencies

The analytics feature requires two npm packages:

```bash
npm install recharts date-fns
```

**Note**: If you encounter PowerShell execution policy errors on Windows, run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then retry the npm install command.

## Step 2: Database Migration

1. Open your Supabase dashboard at https://app.supabase.com
2. Navigate to your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `analytics_schema.sql` from your project root
6. Paste it into the SQL Editor
7. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

The migration will create:
- `property_views` table for tracking property views
- `property_analytics_daily` materialized view for optimized queries
- Indexes for efficient querying
- Row Level Security (RLS) policies for data access control

### Verify the Migration

1. Go to **Table Editor** in the left sidebar
2. You should see a new table: `property_views`
3. Click on the table to verify its structure

## Step 3: Test the Analytics

### Test View Tracking

1. Start your development server: `npm run dev`
2. Open your browser and navigate to any property detail page
3. In Supabase, go to **Table Editor** → `property_views`
4. You should see a new row with the property ID and timestamp
5. Refresh the property page a few times and verify multiple views are tracked

### Test Analytics Dashboard

1. Log in as a landlord user
2. Navigate to your Dashboard
3. Click the **Portfolio Analytics** button
4. You should see:
   - Total properties count
   - Total views across all properties
   - Total inquiries
   - Average conversion rate

### Test Property Analytics

1. From the Dashboard, click the analytics icon (bar chart) next to any property
2. You should see:
   - Total views for that property
   - Total inquiries
   - Conversion rate
   - Views over time chart
   - Price comparison with similar properties

## Step 4: Optional - Set Up Periodic Refresh

The `property_analytics_daily` materialized view should be refreshed periodically for optimal performance. You can set up a cron job in Supabase:

1. In Supabase, go to **Database** → **Extensions**
2. Enable the `pg_cron` extension
3. Go to **SQL Editor** and run:

```sql
-- Refresh analytics daily at 2 AM UTC
SELECT cron.schedule(
  'refresh-property-analytics',
  '0 2 * * *',
  $$SELECT refresh_property_analytics()$$
);
```

## Features Overview

### Property View Tracking
- Automatically tracks when users view property detail pages
- Excludes views from property owners
- Stores viewer location (city, state) for geographic analysis

### Conversion Metrics
- Calculates inquiry-to-view conversion rate
- Compares your properties against platform average
- Identifies high-performing and underperforming listings

### Price Comparison
- Compares your property price with similar properties
- Filters by property type, city, and bedrooms
- Shows average, min, and max prices in the market

### Listing Timing Analysis
- Shows which months have historically higher inquiry rates
- Helps landlords choose the best time to list properties
- Based on historical platform data

### Geographic Demand Heatmap
- Displays demand scores by city
- Combines views and inquiries to calculate demand
- Helps identify high-demand markets

## Troubleshooting

### No Analytics Data Showing

**Problem**: Analytics pages show "No data yet"

**Solutions**:
1. Verify the database migration ran successfully
2. Check that `property_views` table exists in Supabase
3. Visit a few property pages to generate view data
4. Check browser console for any JavaScript errors

### Charts Not Displaying

**Problem**: Charts show as blank or missing

**Solutions**:
1. Verify `recharts` and `date-fns` are installed: `npm list recharts date-fns`
2. Check browser console for module import errors
3. Clear your browser cache and reload
4. Restart the development server

### Permission Errors

**Problem**: "Permission denied" or "RLS policy violation" errors

**Solutions**:
1. Verify you're logged in as a landlord/agent/admin user
2. Check that RLS policies were created correctly in the migration
3. Ensure the property belongs to the logged-in user

### Missing Dependencies Error

**Problem**: "Cannot find module 'recharts'" error

**Solution**:
```bash
# Install dependencies manually
npm install recharts date-fns

# If that fails, try:
npm install --legacy-peer-deps recharts date-fns
```

## Next Steps

- Create test properties and generate sample data
- Share the analytics dashboard with landlords for feedback
- Monitor database performance as data grows
- Consider adding more advanced analytics features (see FUTURE_FEATURES.md)

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Supabase connection in `.env` file
3. Review the implementation plan in `implementation_plan.md`
