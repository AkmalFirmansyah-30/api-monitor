import api from "@/services/api"
import type { MonitoringRule, MonitoringRulesState, CheckResult } from "@/types/api"

export interface MonitoringRulesService {
  getRules(apiId: number): Promise<MonitoringRule | null>
  updateRules(apiId: number, rules: Partial<MonitoringRule>): Promise<MonitoringRule>
  resetRules(apiId: number): Promise<MonitoringRule>
}

export class MonitoringRulesServiceImpl implements MonitoringRulesService {
  async getRules(apiId: number): Promise<MonitoringRule | null> {
    try {
      const response = await api.get(`/apis/${apiId}/monitoring-rules`)
      return response.data.data ?? null
    } catch (error) {
      console.error("Failed to fetch monitoring rules:", error)
      return null
    }
  }

  async updateRules(apiId: number, rules: Partial<MonitoringRule>): Promise<MonitoringRule> {
    try {
      const response = await api.put(`/apis/${apiId}/monitoring-rules`, rules)
      return response.data.data
    } catch (error) {
      console.error("Failed to update monitoring rules:", error)
      throw error
    }
  }

  async resetRules(apiId: number): Promise<MonitoringRule> {
    try {
      const response = await api.put(`/apis/${apiId}/monitoring-rules`, {
        expected_status_codes: [],
        body_keyword: null,
        json_path: null,
        json_expected_value: null,
        warning_response_time_ms: null,
        failure_response_time_ms: null,
      })
      return response.data.data
    } catch (error) {
      console.error("Failed to reset monitoring rules:", error)
      throw error
    }
  }
}

export const monitoringRulesService: MonitoringRulesService = new MonitoringRulesServiceImpl()