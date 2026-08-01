import {
  BookOpen,
  BriefcaseMedical,
  Building2,
  CreditCard,
  GraduationCap,
  HeartHandshake,
  Hospital,
  Languages,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

import type { Audience, UserRole } from '@/lib/supabase/userProfile'

export type DashboardIconName =
  | 'BookOpen'
  | 'BriefcaseMedical'
  | 'Building2'
  | 'CreditCard'
  | 'GraduationCap'
  | 'HeartHandshake'
  | 'Hospital'
  | 'Languages'
  | 'MapPin'
  | 'ShieldCheck'
  | 'Stethoscope'
  | 'UserRound'
  | 'UsersRound'

export type DashboardLink = {
  detail?: string
  href: string
  icon?: LucideIcon
  iconName?: DashboardIconName
  label: string
}
export type DashboardProfile = {
  eventTitle: string
  intro: string
  journey: DashboardLink[]
  label: string
  learning: DashboardLink & { progress: number }
  quickActions: DashboardLink[]
  recommendations: DashboardLink[]
  savedResources: DashboardLink[]
  searchPlaceholder: string
  services: DashboardLink[]
}

type ProfileSeed = {
  actions: Array<[string, LucideIcon, string?]>
  intro: string
  journey: string[]
  label: string
  learning: [string, number]
  recommendations: string[]
  saved: string[]
  services: Array<[string, LucideIcon]>
}

const dashboardIcons: Record<DashboardIconName, LucideIcon> = {
  BookOpen,
  BriefcaseMedical,
  Building2,
  CreditCard,
  GraduationCap,
  HeartHandshake,
  Hospital,
  Languages,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
}

export const getDashboardIcon = (name?: DashboardIconName) =>
  name ? dashboardIcons[name] : undefined

const resource = (label: string): DashboardLink => ({ label, href: '/resources' })
const makeProfile = (seed: ProfileSeed): DashboardProfile => ({
  eventTitle: `${seed.recommendations[0]} workshop`,
  label: seed.label,
  intro: seed.intro,
  searchPlaceholder: `Search ${seed.label.replace(' dashboard', '')} topics, resources, or services…`,
  quickActions: seed.actions.map(([label, icon, href]) => ({
    label,
    icon,
    href: href || '/resources',
  })),
  journey: seed.journey.map((label, index) => ({
    label,
    detail: index === 0 ? 'completed' : 'next',
    href: index === 0 ? '/topic/healthcare-system' : '/resources',
  })),
  learning: {
    label: seed.learning[0],
    progress: seed.learning[1],
    href: '/topic',
  },
  recommendations: seed.recommendations.map(resource),
  services: seed.services.map(([label, icon]) => ({
    label,
    icon,
    detail: 'Find options near you',
    href: '/resources',
  })),
  savedResources: seed.saved.map((label) => ({ ...resource(label), detail: 'Resource' })),
})

const profiles: Record<Audience, DashboardProfile> = {
  'new-immigrant': makeProfile({
    label: 'New immigrant dashboard',
    intro: 'Continue your journey to better health and confidently navigate care in Canada.',
    actions: [
      ['Find a Family Doctor', UserRound, '/family-doctor-registration'],
      ['Mental Support', HeartHandshake, '/manitoba-mental-support'],
      ['Walk-in Clinics', Hospital, '/walk-in-clinic'],
      ['Lab Results', Stethoscope, '/common-lab-test'],
    ],
    journey: [
      'Apply for a Provincial Health Card',
      'Learn how the healthcare system works',
      'Register with a Family Doctor',
      'Find a Walk-in Clinic',
    ],
    learning: ['Understanding Canadian Healthcare', 75],
    recommendations: [
      'Health Insurance in Canada',
      'How to Register with a Family Doctor',
      'Walk-in Clinics: What to Know',
    ],
    services: [
      ['Walk-in Clinics', Hospital],
      ['Family Doctors', UserRound],
      ['Settlement Services', UsersRound],
    ],
    saved: ['Nutrition for New Immigrants', 'Mental Health Support in Canada'],
  }),
  'international-student': makeProfile({
    label: 'International student dashboard',
    intro: 'Find coverage, campus care, and wellbeing information while studying in Canada.',
    actions: [
      ['Student Insurance', ShieldCheck],
      ['Campus Clinic', Hospital],
      ['Mental Wellness', HeartHandshake],
      ['Study Health Guide', GraduationCap],
    ],
    journey: [
      'Review your student health insurance',
      'Locate your campus health clinic',
      'Save after-hours care options',
      'Explore counselling supports',
    ],
    learning: ['Using Student Health Coverage', 40],
    recommendations: [
      'What Your Student Plan Covers',
      'Finding Care Away From Campus',
      'Managing School-Year Stress',
    ],
    services: [
      ['Campus Health Centres', GraduationCap],
      ['Counselling Services', HeartHandshake],
      ['Walk-in Clinics', Hospital],
    ],
    saved: ['International Student Health Checklist', 'Campus Mental Health Supports'],
  }),
  parent: makeProfile({
    label: 'Parent and family dashboard',
    intro:
      'Keep reliable information for your family’s health, development, and preventive care close at hand.',
    actions: [
      ['Find a Pediatrician', UserRound],
      ['Vaccination Guide', ShieldCheck],
      ['Family Nutrition', HeartHandshake],
      ['Urgent Care', Hospital],
    ],
    journey: [
      'Review your child’s vaccination schedule',
      'Choose a family healthcare provider',
      'Learn when to seek urgent care',
      'Explore family mental health supports',
    ],
    learning: ['Preventive Care for Children', 55],
    recommendations: [
      'Childhood Vaccination Schedule',
      'Healthy Eating for Families',
      'Supporting Your Child’s Mental Health',
    ],
    services: [
      ['Family Doctors', UserRound],
      ['Pediatric Services', Stethoscope],
      ['Parent Support Programs', UsersRound],
    ],
    saved: ['Family Health Checklist', 'Child Development Milestones'],
  }),
  youth: makeProfile({
    label: 'Youth dashboard',
    intro:
      'Explore private, practical information that helps you take charge of your health and wellbeing.',
    actions: [
      ['Mental Health Help', HeartHandshake],
      ['Talk to a Nurse', Stethoscope],
      ['Healthy Relationships', UsersRound],
      ['Private Care', ShieldCheck],
    ],
    journey: [
      'Learn about confidential healthcare',
      'Create a personal wellbeing plan',
      'Save crisis support contacts',
      'Understand healthy relationships',
    ],
    learning: ['Taking Charge of Your Health', 30],
    recommendations: [
      'How Confidential Care Works',
      'Coping With Stress and Anxiety',
      'Healthy Relationships and Consent',
    ],
    services: [
      ['Youth Clinics', Hospital],
      ['Crisis Support', HeartHandshake],
      ['Peer Programs', UsersRound],
    ],
    saved: ['Youth Mental Health Toolkit', 'Your Healthcare Privacy Rights'],
  }),
  refugee: makeProfile({
    label: 'Refugee support dashboard',
    intro:
      'Access clear, trauma-informed health information and services for your settlement journey.',
    actions: [
      ['Interim Health Coverage', CreditCard],
      ['Interpreter Services', Languages],
      ['Trauma Support', HeartHandshake],
      ['Settlement Help', UsersRound],
    ],
    journey: [
      'Understand Interim Federal Health coverage',
      'Find a newcomer clinic',
      'Request language interpretation',
      'Connect with trauma-informed support',
    ],
    learning: ['Your Healthcare Rights in Canada', 45],
    recommendations: [
      'Interim Federal Health Program',
      'Using an Interpreter During Care',
      'Trauma-Informed Mental Health Support',
    ],
    services: [
      ['Newcomer Clinics', Hospital],
      ['Interpretation Services', Languages],
      ['Settlement Organizations', UsersRound],
    ],
    saved: ['Healthcare Coverage for Refugees', 'Finding Trauma-Informed Care'],
  }),
  'healthcare-provider': makeProfile({
    label: 'Healthcare provider dashboard',
    intro:
      'Find culturally responsive clinical resources and tools for diverse patients and communities.',
    actions: [
      ['Patient Handouts', BookOpen],
      ['Interpreter Access', Languages],
      ['Referral Directory', MapPin],
      ['Clinical Updates', BriefcaseMedical],
    ],
    journey: [
      'Complete cultural safety learning',
      'Review interpreter best practices',
      'Save community referral pathways',
      'Explore trauma-informed care tools',
    ],
    learning: ['Culturally Safe and Responsive Care', 65],
    recommendations: [
      'Working Effectively With Interpreters',
      'Newcomer Health Assessment Guide',
      'Trauma-Informed Clinical Practice',
    ],
    services: [
      ['Interpreter Services', Languages],
      ['Community Referrals', UsersRound],
      ['Specialist Directory', Stethoscope],
    ],
    saved: ['Newcomer Clinical Assessment Tool', 'Multilingual Patient Education'],
  }),
  'settlement-worker': makeProfile({
    label: 'Settlement worker dashboard',
    intro:
      'Use practical referral tools and plain-language resources to help newcomers navigate healthcare.',
    actions: [
      ['Client Referrals', MapPin],
      ['Health System Guide', BookOpen],
      ['Interpretation', Languages],
      ['Community Programs', Building2],
    ],
    journey: [
      'Review the healthcare navigation toolkit',
      'Update your referral directory',
      'Save multilingual client handouts',
      'Explore crisis referral pathways',
    ],
    learning: ['Guiding Clients Through Healthcare', 60],
    recommendations: [
      'Healthcare Navigation Toolkit',
      'Multilingual Client Handouts',
      'Community Health Referral Map',
    ],
    services: [
      ['Settlement Agencies', Building2],
      ['Newcomer Clinics', Hospital],
      ['Language Services', Languages],
    ],
    saved: ['Client Healthcare Checklist', 'Winnipeg Health Referral Directory'],
  }),
  other: makeProfile({
    label: 'Personal health dashboard',
    intro:
      'Discover reliable health information, nearby services, and resources chosen around your interests.',
    actions: [
      ['Browse Health Topics', BookOpen],
      ['Find Services', MapPin],
      ['Community Support', UsersRound],
      ['Get Help', HeartHandshake],
    ],
    journey: [
      'Choose your health interests',
      'Explore a recommended topic',
      'Save a useful resource',
      'Find health services near you',
    ],
    learning: ['Getting Started With HealthBridge', 20],
    recommendations: [
      'Understanding the Healthcare System',
      'Finding Reliable Health Information',
      'Preventive Care Basics',
    ],
    services: [
      ['Health Services', Hospital],
      ['Community Supports', UsersRound],
      ['Help and Support', HeartHandshake],
    ],
    saved: ['Guide to Canadian Healthcare', 'Preventive Health Checklist'],
  }),
}

export const getDashboardProfile = (audiences: Audience[]) => profiles[audiences[0] ?? 'other']
export const getRoleLabel = (role: UserRole) =>
  role === 'admin' ? 'Administrator' : role === 'editor' ? 'Content editor' : 'Member'
