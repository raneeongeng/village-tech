import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      firstName,
      middleName,
      lastName,
      suffix,
      phone,
      tenantId,
      householdId,
      relationshipId,
      createdBy
    } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !tenantId || !householdId || !relationshipId || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createServerClient()

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix,
        phone,
        role: 'household_member',
        tenant_id: tenantId
      },
      email_confirm: true
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: `Failed to create user account: ${authError.message}` },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 400 }
      )
    }

    // Build full name
    const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(' ')

    // Create household_members record
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from('household_members')
      .insert({
        tenant_id: tenantId,
        household_id: householdId,
        user_id: authData.user.id,
        name: fullName,
        relationship_id: relationshipId,
        contact_info: {
          phone: phone || '',
          email
        },
        is_primary: false,
        created_by: createdBy,
        updated_by: createdBy
      })
      .select(`
        id,
        household_id,
        user_id,
        name,
        contact_info,
        photo_url,
        is_primary,
        created_at,
        relationship_id,
        relationship:lookup_values!household_members_relationship_fkey (
          id,
          code,
          name,
          sort_order
        )
      `)
      .single()

    if (memberError) {
      console.error('Error creating household member:', memberError)

      // Rollback: Delete the auth user if member record creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        { error: memberError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: memberData
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}