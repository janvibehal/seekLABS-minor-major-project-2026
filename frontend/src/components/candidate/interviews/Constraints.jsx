function Constraints({ constraints = [] }) {
  return (
    <section>

      <h2 className="text-sm font-bold text-[#17324f]">
        Constraints
      </h2>

      <ul className="mt-4 space-y-2">

        {constraints.map((constraint, index) => (
          <li
            key={index}
            className="flex gap-3 text-xs leading-6 text-slate-500"
          >

            <span className="mt-2 h-1 w-1 shrink-0 bg-[#6fa9dc]" />

            <span>
              {constraint}
            </span>

          </li>
        ))}

      </ul>

    </section>
  )
}

export default Constraints