import JobCard from './JobCard'

function JobList() {
  const jobs = [
    {
      id: 1,
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      type: 'Full Time',
      candidates: 32,
      interviews: 12,
      status: 'Active',
      created: 'Aug 24, 2026',
      skills: ['Python', 'FastAPI', 'PostgreSQL'],
    },
    {
      id: 2,
      title: 'Frontend Developer',
      department: 'Engineering',
      type: 'Full Time',
      candidates: 24,
      interviews: 9,
      status: 'Active',
      created: 'Aug 21, 2026',
      skills: ['React', 'JavaScript', 'Tailwind'],
    },
    {
      id: 3,
      title: 'Data Scientist',
      department: 'Data & AI',
      type: 'Full Time',
      candidates: 18,
      interviews: 7,
      status: 'Active',
      created: 'Aug 18, 2026',
      skills: ['Python', 'ML', 'SQL'],
    },
    {
      id: 4,
      title: 'Software Engineer Intern',
      department: 'Engineering',
      type: 'Internship',
      candidates: 41,
      interviews: 15,
      status: 'Closed',
      created: 'Aug 05, 2026',
      skills: ['Java', 'DSA', 'OOP'],
    },
  ]

  return (
    <div className="space-y-3">

      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
        />
      ))}

    </div>
  )
}

export default JobList