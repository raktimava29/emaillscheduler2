"use strict";
exports.__esModule = true;
exports.supabase = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
exports.supabase = supabase_js_1.createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
