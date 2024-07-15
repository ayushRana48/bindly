const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lxnzgnvhkrgxpfsokwos.supabase.co';
const supabaseKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4bnpnbnZoa3JneHBmc29rd29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTAzODAxNzcsImV4cCI6MjAyNTk1NjE3N30.VyiRu-AaWtKdQmezcb_2Kxfsl8alQ5zc-S-gnjqAJPc"
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports= { supabase };
