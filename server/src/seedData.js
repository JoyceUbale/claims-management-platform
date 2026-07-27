export const seedClaims = [
  {
    name: 'Sarah Johnson',
    email: 'patient@example.com',
    claimAmount: 1250.0,
    description:
      'Emergency room visit for acute abdominal pain. Includes CT scan, blood work, and overnight observation.',
    documentUrl: 'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'Pending',
  },
  {
    name: 'Sarah Johnson',
    email: 'patient@example.com',
    claimAmount: 480.75,
    description:
      'Prescription medication for chronic migraine management — 3 month supply of prescribed prophylactic treatment.',
    documentUrl: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'Approved',
    approvedAmount: 480.75,
    insurerComments: 'Approved in full. Documentation complete and within coverage limits.',
  },
  {
    name: 'Sarah Johnson',
    email: 'patient@example.com',
    claimAmount: 3200.0,
    description:
      'Physical therapy sessions (12 sessions) following knee arthroscopy surgery. Includes post-op rehabilitation plan.',
    documentUrl: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'Pending',
  },
  {
    name: 'Sarah Johnson',
    email: 'patient@example.com',
    claimAmount: 175.5,
    description: 'Annual wellness exam and routine blood panel screening.',
    documentUrl: null,
    status: 'Approved',
    approvedAmount: 175.5,
    insurerComments: 'Preventive care — fully covered under plan. No patient responsibility.',
  },
  {
    name: 'Sarah Johnson',
    email: 'patient@example.com',
    claimAmount: 890.0,
    description: 'Dental procedure — root canal treatment and crown fitting.',
    documentUrl: 'https://images.pexels.com/photos/3779705/pexels-photo-3779705.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'Rejected',
    insurerComments:
      'Dental procedures are not covered under the current medical-only plan. Please review plan benefits.',
  },
  {
    name: 'Sarah Johnson',
    email: 'patient@example.com',
    claimAmount: 2150.0,
    description:
      'MRI scan of lower spine to investigate chronic back pain. Referred by primary care physician.',
    documentUrl: 'https://images.pexels.com/photos/4226921/pexels-photo-4226921.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'Pending',
  },
];
