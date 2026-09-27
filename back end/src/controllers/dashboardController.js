import { obterDashboard } from "../services/dashboardService.js";

// Dashboard
export async function dashboard(request, reply) {
  return await obterDashboard();
}