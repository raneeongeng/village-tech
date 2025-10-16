import { apiClient, ApiResponse } from '@/lib/api/client'
import type { HouseholdMember } from '@/types/household'

export interface CreateHouseholdMemberRequest {
  email: string
  password: string
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  phone?: string
  tenantId: string
  householdId: string
  relationshipId: string
  createdBy: string
}

export interface CreateHouseholdMemberResponse {
  success: boolean
  data: HouseholdMember
}

export interface UpdateHouseholdMemberRequest {
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  relationshipId?: string
  phone?: string
  email?: string
}

export class HouseholdMembersService {
  /**
   * Create a new household member
   */
  static async createMember(memberData: CreateHouseholdMemberRequest): Promise<ApiResponse<HouseholdMember>> {
    return apiClient.post<CreateHouseholdMemberResponse>('/household-members', memberData)
      .then(response => {
        if (response.success && response.data?.success) {
          return {
            success: true,
            data: response.data.data
          }
        }
        return {
          success: false,
          error: response.error || { message: 'Failed to create household member' }
        }
      })
  }

  /**
   * Update an existing household member
   */
  static async updateMember(memberId: string, memberData: UpdateHouseholdMemberRequest): Promise<ApiResponse<HouseholdMember>> {
    return apiClient.patch<HouseholdMember>(`/household-members/${memberId}`, memberData)
  }

  /**
   * Delete a household member
   */
  static async deleteMember(memberId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/household-members/${memberId}`)
  }

  /**
   * Get household members for a specific household
   */
  static async getHouseholdMembers(householdId: string): Promise<ApiResponse<HouseholdMember[]>> {
    return apiClient.get<HouseholdMember[]>(`/household-members?householdId=${householdId}`)
  }

  /**
   * Get a specific household member by ID
   */
  static async getMember(memberId: string): Promise<ApiResponse<HouseholdMember>> {
    return apiClient.get<HouseholdMember>(`/household-members/${memberId}`)
  }
}

export default HouseholdMembersService