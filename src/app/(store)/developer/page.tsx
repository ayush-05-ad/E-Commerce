export default function DeveloperPage() {
  const skills = [
    {
      icon: <i className="fa-solid fa-code text-lg text-neutral-800 dark:text-neutral-200"></i>,
      title: "Frontend Engineering",
      description: "React, Next.js (App Router), Tailwind CSS, Framer Motion, Zustand state management.",
    },
    {
      icon: <i className="fa-solid fa-server text-lg text-neutral-800 dark:text-neutral-200"></i>,
      title: "Backend Architecture",
      description: "Node.js, Next.js Server Actions, REST APIs, Clerk authentication integrations.",
    },
    {
      icon: <i className="fa-solid fa-database text-lg text-neutral-800 dark:text-neutral-200"></i>,
      title: "Databases & ORMs",
      description: "PostgreSQL, Prisma ORM, atomic transactions, schema design, and seeding cycles.",
    },
    {
      icon: <i className="fa-solid fa-layer-group text-lg text-neutral-800 dark:text-neutral-200"></i>,
      title: "Integrations & APIs",
      description: "Stripe checkout APIs, Razorpay transaction payloads, validation schemas via Zod.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 py-16 px-4">
      <div className="max-w-4xl mx-auto mt-8 space-y-12">
        
        {/* Profile Card Section */}
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

          {/* Profile Image with subtle glow ring */}
          <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-tr from-neutral-600 to-neutral-400 dark:from-neutral-700 dark:to-neutral-500 shadow-xl flex-shrink-0 z-10">
            <div className="w-full h-full rounded-full overflow-hidden bg-neutral-950">
              <img 
                src="/images/developer.jpg" 
                alt="Ayush Deep" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = "https://ui-avatars.com/api/?name=Ayush+Deep&background=random";
                }}
              />
            </div>
          </div>

          {/* Bio info */}
          <div className="space-y-4 text-center md:text-left z-10">
            <div>
              <span className="inline-block px-2.5 py-1 rounded-full text-[9px] font-bold bg-white/5 border border-white/10 text-neutral-400 uppercase tracking-widest">
                Lead Architect
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2">
                Ayush Deep
              </h1>
              <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
                Full Stack Developer
              </p>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-lg font-medium">
              Architecting scalable, design-centric digital commerce solutions. Focused on clean database schemas, secure checkout pipelines, and intuitive layouts that perform.
            </p>

            {/* Social handles */}
            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-neutral-350 hover:text-white transition-all"
              >
                <i className="fa-brands fa-github text-sm"></i>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-neutral-350 hover:text-white transition-all"
              >
                <i className="fa-brands fa-linkedin-in text-sm"></i>
              </a>
              <a 
                href="mailto:ayush@example.com"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-neutral-350 hover:text-white transition-all"
              >
                <i className="fa-solid fa-envelope text-sm"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Technical stack list */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white uppercase tracking-wider text-center md:text-left">
            Core Expertise & Role
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((skill, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 shadow-sm space-y-3 hover:scale-[1.01] transition-transform"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 rounded-xl w-fit">
                  {skill.icon}
                </div>
                <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                  {skill.title}
                </h4>
                <p className="text-xxs text-neutral-500 dark:text-neutral-450 leading-relaxed font-medium">
                  {skill.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Project contribution highlights */}
        <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 text-center space-y-4 shadow-sm">
          <h3 className="font-black text-lg text-neutral-900 dark:text-white uppercase tracking-wider">
            NXTSTORE Platform contribution
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Designed the full-stack database schema configuration, multi-vendor order routing pipelines, Clerk profile synchronization checkpoints, custom-image variant creators, and search-indexer validations.
          </p>
        </div>

      </div>
    </div>
  );
}
