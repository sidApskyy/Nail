const { query } = require('../config/db');

const getStaffSales = async () => {
  const result = await query(`
    SELECT 
      u.id as staff_id,
      COALESCE(sp.name, u.name) as staff_name,
      COUNT(cw.id) as total_sales,
      COALESCE(SUM(cw.total), 0) as total_amount,
      COALESCE(AVG(cw.total), 0) as average_amount,
      MIN(cw.total) as min_amount,
      MAX(cw.total) as max_amount,
      COUNT(DISTINCT cw.customer_name) as unique_customers,
      sp.id as staff_profile_id
    FROM users u
    LEFT JOIN completed_works cw ON u.id = cw.uploaded_by
    LEFT JOIN staff_profiles sp ON u.current_staff_id = sp.id AND sp.is_active = TRUE
    WHERE u.role = 'staff' AND u.is_active = TRUE
    GROUP BY u.id, u.name, sp.name, sp.id
    ORDER BY total_amount DESC
  `);
  
  // Add daily breakdown separately to avoid JSON aggregation issues
  const staffSalesData = result.rows;
  
  for (let i = 0; i < staffSalesData.length; i++) {
    const staffId = staffSalesData[i].staff_id;
    const dailyResult = await query(`
      SELECT 
        DATE(cw.created_at) as date,
        COUNT(*) as sales,
        COALESCE(SUM(cw.total), 0) as revenue,
        COUNT(DISTINCT cw.customer_name) as customers
      FROM completed_works cw
      WHERE cw.uploaded_by = $1
      GROUP BY DATE(cw.created_at)
      ORDER BY DATE(cw.created_at)
    `, [staffId]);
    
    staffSalesData[i].daily_breakdown = dailyResult.rows;
  }
  
  return staffSalesData;
};

const getStaffDetailedSales = async (staffId) => {
  const result = await query(`
    SELECT 
      cw.id,
      cw.customer_name,
      cw.customer_phone,
      cw.name as service_name,
      cw.number as service_number,
      cw.amount,
      cw.discount,
      cw.total,
      cw.description,
      cw.image_url,
      cw.created_at,
      COALESCE(sp.name, u.name) as staff_name
    FROM completed_works cw
    JOIN users u ON cw.uploaded_by = u.id
    LEFT JOIN staff_profiles sp ON u.current_staff_id = sp.id AND sp.is_active = TRUE
    WHERE cw.uploaded_by = $1
    ORDER BY cw.created_at DESC
  `, [staffId]);
  
  return result.rows;
};

const getDailySales = async () => {
  const result = await query(`
    SELECT 
      DATE(cw.created_at) as date,
      COUNT(cw.id) as total_sales,
      COALESCE(SUM(cw.total), 0) as total_amount
    FROM completed_works cw
    WHERE cw.created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(cw.created_at)
    ORDER BY date DESC
    LIMIT 30
  `);
  
  return result.rows;
};

const getWeeklySales = async () => {
  const result = await query(`
    SELECT 
      EXTRACT(WEEK FROM cw.created_at) as week_number,
      EXTRACT(YEAR FROM cw.created_at) as year,
      DATE_TRUNC('week', cw.created_at)::date as week_start,
      (DATE_TRUNC('week', cw.created_at)::date + INTERVAL '6 days')::date as week_end,
      COUNT(cw.id) as total_sales,
      COALESCE(SUM(cw.total), 0) as total_amount
    FROM completed_works cw
    WHERE cw.created_at >= CURRENT_DATE - INTERVAL '12 weeks'
    GROUP BY week_number, year, week_start, week_end
    ORDER BY year DESC, week_number DESC
    LIMIT 12
  `);
  
  return result.rows;
};

const getMonthlySales = async () => {
  const result = await query(`
    SELECT 
      DATE_TRUNC('month', cw.created_at)::date as month,
      COUNT(cw.id) as total_sales,
      COALESCE(SUM(cw.total), 0) as total_amount
    FROM completed_works cw
    WHERE cw.created_at >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', cw.created_at)
    ORDER BY month DESC
    LIMIT 12
  `);
  
  return result.rows;
};

module.exports = {
  getStaffSales,
  getStaffDetailedSales,
  getDailySales,
  getWeeklySales,
  getMonthlySales
};
