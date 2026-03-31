import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding TheDoctors.Ai database...')

  // ── Plans ──
  const freePlan = await prisma.plan.upsert({
    where: { id: 'plan-free' },
    update: {},
    create: {
      id: 'plan-free', name: 'Free', price: 0,
      maxDoctors: 1, aiMinutes: 50,
      features: ['opd', 'pharmacy', 'patients']
    }
  })

  const starterPlan = await prisma.plan.upsert({
    where: { id: 'plan-starter' },
    update: {},
    create: {
      id: 'plan-starter', name: 'Starter', price: 1999,
      maxDoctors: 2, aiMinutes: 500,
      features: ['opd', 'pharmacy', 'patients', 'whatsapp', 'booking']
    }
  })

  const proPlan = await prisma.plan.upsert({
    where: { id: 'plan-pro' },
    update: {},
    create: {
      id: 'plan-pro', name: 'Pro', price: 4999,
      maxDoctors: 6, aiMinutes: 800,
      features: ['opd', 'ipd', 'pharmacy', 'patients', 'whatsapp', 'booking', 'insurance', 'calendar']
    }
  })

  const enterprisePlan = await prisma.plan.upsert({
    where: { id: 'plan-enterprise' },
    update: {},
    create: {
      id: 'plan-enterprise', name: 'Enterprise', price: 0,
      maxDoctors: -1, aiMinutes: -1,
      features: ['all']
    }
  })

  // ── Demo Clinic ──
  const clinic = await prisma.clinic.upsert({
    where: { code: 'TDA-2045' },
    update: {},
    create: {
      code: 'TDA-2045',
      name: 'TheDoctors.Ai Cardiac Clinic',
      type: 'Multi-Specialty Hospital (OPD+IPD)',
      address: 'Bestech Business Tower, Parkview Residence Colony',
      city: 'Mohali', state: 'Punjab', pinCode: '160066',
      phone: '+91 98765 43210',
      email: 'hello@thedoctors.ai',
      website: 'https://thedoctors.ai',
      gstin: '03AABCC1234D1Z5',
      regNumber: 'MCI-2045678',
      planId: enterprisePlan.id,
      status: 'active'
    }
  })

  console.log('✅ Clinic created:', clinic.code)

  // ── Admin User ──
  const adminPassword = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { id: 'user-admin' },
    update: {},
    create: {
      id: 'user-admin',
      clinicId: clinic.id,
      email: 'dr.james@thedoctors.ai',
      password: adminPassword,
      name: 'Dr. James Martin',
      role: 'admin',
      designation: 'Cardiac Surgeon',
      qualification: 'MBBS, MS',
      specialisation: 'Cardiology',
      phone: '98 7654 3210',
      permissions: {}
    }
  })

  const doctor2 = await prisma.user.upsert({
    where: { id: 'user-doctor2' },
    update: {},
    create: {
      id: 'user-doctor2',
      clinicId: clinic.id,
      email: 'dr.anil@thedoctors.ai',
      password: adminPassword,
      name: 'Dr. Anil Kumar',
      role: 'doctor',
      designation: 'General Physician',
      qualification: 'MBBS, MD',
      specialisation: 'Internal Medicine',
      phone: '98 7654 3211',
      permissions: {}
    }
  })

  const receptionist = await prisma.user.upsert({
    where: { id: 'user-reception' },
    update: {},
    create: {
      id: 'user-reception',
      clinicId: clinic.id,
      email: 'rekha@thedoctors.ai',
      password: adminPassword,
      name: 'Rekha S',
      role: 'receptionist',
      designation: 'Front Desk',
      phone: '98 7654 3212',
      permissions: {}
    }
  })

  console.log('✅ Users created')

  // ── Super Admin ──
  const superAdminPassword = await bcrypt.hash('superadmin123', 10)
  await prisma.superAdmin.upsert({
    where: { email: 'admin@thedoctors.ai' },
    update: {},
    create: {
      email: 'admin@thedoctors.ai',
      password: superAdminPassword,
      name: 'Platform Admin'
    }
  })

  console.log('✅ Super Admin created')

  // ── Demo Patients ──
  const patients = [
    {
      id: 'patient-1', patientCode: 'TDA-0001',
      name: 'Vibha Ak', phone: '78 4985 7655',
      gender: 'Female', age: 34, bloodGroup: 'O+',
      conditions: ['Hypertension', 'Diabetes'],
      drugAllergies: ['Penicillin'],
      insuranceProvider: 'Star Health Insurance',
      insurancePolicyNo: 'SH-2023-884721'
    },
    {
      id: 'patient-2', patientCode: 'TDA-0002',
      name: 'Nithya Kumar', phone: '87 4563 5422',
      gender: 'Female', age: 22, bloodGroup: 'A+',
      conditions: [], drugAllergies: []
    },
    {
      id: 'patient-3', patientCode: 'TDA-0003',
      name: 'Varun P', phone: '94 8372 1045',
      gender: 'Male', age: 42, bloodGroup: 'B+',
      conditions: ['Cardiac'], drugAllergies: [],
      insuranceProvider: 'HDFC Ergo',
      insurancePolicyNo: 'HE-2024-112233'
    },
    {
      id: 'patient-4', patientCode: 'TDA-0004',
      name: 'Karthik S', phone: '91 2345 6789',
      gender: 'Male', age: 55, bloodGroup: 'AB+',
      conditions: ['Heart Failure', 'Hypertension'],
      drugAllergies: []
    }
  ]

  for (const p of patients) {
    await prisma.patient.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, clinicId: clinic.id }
    })
  }

  console.log('✅ Patients created')

  // ── Services ──
  const services = [
    { id: 'svc-1', name: 'General Consultation', price: 400, duration: 30 },
    { id: 'svc-2', name: 'Cardiac Consultation', price: 800, duration: 45 },
    { id: 'svc-3', name: 'Follow-up Consultation', price: 200, duration: 15 },
    { id: 'svc-4', name: 'Video Consultation', price: 350, duration: 20 },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, clinicId: clinic.id }
    })
  }

  console.log('✅ Services created')

  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   Database seeded successfully!            ║
  ╠═══════════════════════════════════════════╣
  ║   Demo Login:                              ║
  ║   Clinic Code : TDA-2045                   ║
  ║   Email       : dr.james@thedoctors.ai     ║
  ║   Password    : password123                ║
  ║                                            ║
  ║   Super Admin:                             ║
  ║   Email       : admin@thedoctors.ai        ║
  ║   Password    : superadmin123              ║
  ╚═══════════════════════════════════════════╝
  `)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
