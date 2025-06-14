export interface JobOffer {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  type: "CDI" | "CDD" | "Freelance" | "Stage" | "Temps partiel"
  experience: string
  salary: {
    min: number
    max: number
    currency: string
    period: "mois" | "année"
  }
  department: string
  postedDate: string
  deadline: string
  status: "active" | "closed" | "draft"
  description: string
  responsibilities: string[]
  requirements: string[]
  skills: {
    required: string[]
    preferred: string[]
  }
  benefits: string[]
  workMode: "Présentiel" | "Télétravail" | "Hybride"
  languages: string[]
  education: string
  applicationsCount: number
  viewsCount: number
  tags: string[]
}

export const jobOffers: JobOffer[] = [
  {
    id: "1",
    title: "Développeur Full Stack Senior",
    company: "TechCorp Tunisia",
    location: "Tunis, Tunisie",
    type: "CDI",
    experience: "3-5 ans",
    salary: {
      min: 2500,
      max: 4000,
      currency: "TND",
      period: "mois",
    },
    department: "Technologie",
    postedDate: "2024-01-15",
    deadline: "2024-02-15",
    status: "active",
    description:
      "Nous recherchons un développeur Full Stack Senior passionné pour rejoindre notre équipe dynamique. Vous travaillerez sur des projets innovants utilisant les dernières technologies web et contribuerez à l'architecture de nos applications.",
    responsibilities: [
      "Développer et maintenir des applications web full-stack",
      "Collaborer avec l'équipe de design pour implémenter les interfaces utilisateur",
      "Optimiser les performances des applications",
      "Participer aux revues de code et mentorer les développeurs junior",
      "Contribuer à l'architecture technique et aux décisions technologiques",
    ],
    requirements: [
      "Minimum 3 ans d'expérience en développement web",
      "Maîtrise de JavaScript/TypeScript",
      "Expérience avec React et Node.js",
      "Connaissance des bases de données SQL et NoSQL",
      "Expérience avec Git et les méthodologies Agile",
    ],
    skills: {
      required: ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "Git"],
      preferred: ["Docker", "AWS", "MongoDB", "GraphQL", "Jest"],
    },
    benefits: [
      "Assurance maladie complète",
      "Formation continue et certifications",
      "Télétravail flexible",
      "Prime de performance",
      "Congés payés étendus",
    ],
    workMode: "Hybride",
    languages: ["Arabe", "Français", "Anglais"],
    education: "Master en Informatique ou équivalent",
    applicationsCount: 45,
    viewsCount: 234,
    tags: ["Développement", "Full Stack", "Senior", "Tech"],
  },
  {
    id: "2",
    title: "Designer UX/UI",
    company: "Creative Studio Carthage",
    location: "Sfax, Tunisie",
    type: "CDI",
    experience: "2-4 ans",
    salary: {
      min: 1800,
      max: 2800,
      currency: "TND",
      period: "mois",
    },
    department: "Design",
    postedDate: "2024-01-12",
    deadline: "2024-02-10",
    status: "active",
    description:
      "Rejoignez notre studio créatif en tant que Designer UX/UI. Vous concevrez des expériences utilisateur exceptionnelles pour nos clients dans divers secteurs, de la fintech aux e-commerce.",
    responsibilities: [
      "Concevoir des interfaces utilisateur intuitives et esthétiques",
      "Réaliser des recherches utilisateur et des tests d'utilisabilité",
      "Créer des wireframes, prototypes et maquettes",
      "Collaborer étroitement avec les développeurs",
      "Maintenir et faire évoluer le design system",
    ],
    requirements: [
      "2+ ans d'expérience en design UX/UI",
      "Portfolio démontrant des projets web et mobile",
      "Maîtrise de Figma et Adobe Creative Suite",
      "Connaissance des principes de design centré utilisateur",
      "Capacité à travailler en équipe multidisciplinaire",
    ],
    skills: {
      required: ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
      preferred: ["After Effects", "Principle", "InVision", "Zeplin", "HTML/CSS"],
    },
    benefits: [
      "Environnement créatif stimulant",
      "Matériel de design haut de gamme",
      "Formations aux nouvelles tendances design",
      "Horaires flexibles",
      "Projets variés et innovants",
    ],
    workMode: "Présentiel",
    languages: ["Arabe", "Français", "Anglais"],
    education: "Licence en Design ou domaine connexe",
    applicationsCount: 28,
    viewsCount: 156,
    tags: ["Design", "UX", "UI", "Créatif"],
  },
  {
    id: "3",
    title: "Data Scientist",
    company: "AI Solutions MENA",
    location: "Tunis, Tunisie",
    type: "CDI",
    experience: "3-6 ans",
    salary: {
      min: 3000,
      max: 5000,
      currency: "TND",
      period: "mois",
    },
    department: "Data & IA",
    postedDate: "2024-01-10",
    deadline: "2024-02-08",
    status: "active",
    description:
      "Nous recherchons un Data Scientist expérimenté pour développer des solutions d'intelligence artificielle innovantes. Vous travaillerez sur des projets de machine learning et d'analyse de données à grande échelle.",
    responsibilities: [
      "Développer des modèles de machine learning et deep learning",
      "Analyser de grandes quantités de données complexes",
      "Créer des pipelines de données automatisés",
      "Présenter les résultats aux parties prenantes",
      "Collaborer avec les équipes produit et engineering",
    ],
    requirements: [
      "Master/PhD en Data Science, Statistiques ou domaine connexe",
      "3+ ans d'expérience en machine learning",
      "Maîtrise de Python et ses librairies (pandas, scikit-learn, TensorFlow)",
      "Expérience avec SQL et bases de données",
      "Connaissance des méthodes statistiques avancées",
    ],
    skills: {
      required: ["Python", "Machine Learning", "TensorFlow", "SQL", "Statistics"],
      preferred: ["PyTorch", "Spark", "Docker", "AWS", "Tableau"],
    },
    benefits: [
      "Projets de recherche appliquée",
      "Conférences et formations internationales",
      "Équipement haute performance",
      "Stock options",
      "Environnement multiculturel",
    ],
    workMode: "Hybride",
    languages: ["Arabe", "Français", "Anglais"],
    education: "Master/PhD en Data Science ou équivalent",
    applicationsCount: 32,
    viewsCount: 189,
    tags: ["Data Science", "IA", "Machine Learning", "Python"],
  },
  {
    id: "4",
    title: "Chef de Projet Digital",
    company: "Digital Transformation Co.",
    location: "Sousse, Tunisie",
    type: "CDI",
    experience: "4-7 ans",
    salary: {
      min: 2800,
      max: 4200,
      currency: "TND",
      period: "mois",
    },
    department: "Management",
    postedDate: "2024-01-08",
    deadline: "2024-02-05",
    status: "active",
    description:
      "Dirigez la transformation digitale de nos clients en tant que Chef de Projet Digital. Vous piloterez des projets complexes de digitalisation et coordonnerez des équipes multidisciplinaires.",
    responsibilities: [
      "Piloter des projets de transformation digitale end-to-end",
      "Coordonner les équipes techniques et métier",
      "Gérer les budgets et les délais des projets",
      "Assurer la communication avec les clients",
      "Identifier et mitiger les risques projet",
    ],
    requirements: [
      "4+ ans d'expérience en gestion de projet digital",
      "Certification PMP ou équivalent appréciée",
      "Maîtrise des méthodologies Agile/Scrum",
      "Excellentes compétences en communication",
      "Expérience dans le conseil ou la transformation digitale",
    ],
    skills: {
      required: ["Gestion de projet", "Agile", "Scrum", "Leadership", "Communication"],
      preferred: ["JIRA", "Confluence", "MS Project", "Lean", "Change Management"],
    },
    benefits: [
      "Projets variés et stimulants",
      "Formation en management",
      "Voiture de fonction",
      "Bonus sur objectifs",
      "Évolution de carrière rapide",
    ],
    workMode: "Hybride",
    languages: ["Arabe", "Français", "Anglais"],
    education: "Master en Management ou Ingénierie",
    applicationsCount: 19,
    viewsCount: 98,
    tags: ["Management", "Digital", "Projet", "Leadership"],
  },
  {
    id: "5",
    title: "Développeur Mobile React Native",
    company: "MobileFirst Tunisia",
    location: "Tunis, Tunisie",
    type: "CDI",
    experience: "2-4 ans",
    salary: {
      min: 2200,
      max: 3500,
      currency: "TND",
      period: "mois",
    },
    department: "Technologie",
    postedDate: "2024-01-14",
    deadline: "2024-02-12",
    status: "active",
    description:
      "Développez des applications mobiles innovantes avec React Native. Rejoignez une équipe passionnée qui crée des solutions mobiles pour des clients internationaux.",
    responsibilities: [
      "Développer des applications mobiles cross-platform avec React Native",
      "Intégrer des APIs REST et GraphQL",
      "Optimiser les performances des applications",
      "Publier sur App Store et Google Play",
      "Maintenir et déboguer les applications existantes",
    ],
    requirements: [
      "2+ ans d'expérience en développement mobile",
      "Maîtrise de React Native et JavaScript",
      "Connaissance d'iOS et Android",
      "Expérience avec Redux ou Context API",
      "Familiarité avec les outils de build et déploiement",
    ],
    skills: {
      required: ["React Native", "JavaScript", "iOS", "Android", "Redux"],
      preferred: ["TypeScript", "Firebase", "GraphQL", "Jest", "Detox"],
    },
    benefits: [
      "Projets mobiles innovants",
      "Derniers devices pour tests",
      "Formation continue",
      "Télétravail partiel",
      "Prime de performance",
    ],
    workMode: "Hybride",
    languages: ["Arabe", "Français", "Anglais"],
    education: "Licence en Informatique ou équivalent",
    applicationsCount: 38,
    viewsCount: 167,
    tags: ["Mobile", "React Native", "Cross-platform", "Apps"],
  },
  {
    id: "6",
    title: "Ingénieur DevOps",
    company: "CloudOps Tunisia",
    location: "Tunis, Tunisie",
    type: "CDI",
    experience: "3-5 ans",
    salary: {
      min: 2800,
      max: 4500,
      currency: "TND",
      period: "mois",
    },
    department: "Infrastructure",
    postedDate: "2024-01-11",
    deadline: "2024-02-09",
    status: "active",
    description:
      "Automatisez et optimisez nos infrastructures cloud en tant qu'Ingénieur DevOps. Vous travaillerez sur des architectures modernes et des pipelines CI/CD avancés.",
    responsibilities: [
      "Concevoir et maintenir l'infrastructure cloud (AWS/Azure)",
      "Automatiser les déploiements avec CI/CD",
      "Monitorer et optimiser les performances",
      "Gérer la sécurité et la conformité",
      "Former les équipes aux bonnes pratiques DevOps",
    ],
    requirements: [
      "3+ ans d'expérience en DevOps/Infrastructure",
      "Maîtrise de Docker et Kubernetes",
      "Expérience avec AWS ou Azure",
      "Connaissance des outils CI/CD (Jenkins, GitLab CI)",
      "Scripting en Bash/Python",
    ],
    skills: {
      required: ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform"],
      preferred: ["Ansible", "Prometheus", "Grafana", "ELK Stack", "Helm"],
    },
    benefits: [
      "Technologies de pointe",
      "Certifications cloud payées",
      "Conférences techniques",
      "Équipe internationale",
      "Projets open source",
    ],
    workMode: "Télétravail",
    languages: ["Arabe", "Français", "Anglais"],
    education: "Ingénieur en Informatique ou équivalent",
    applicationsCount: 25,
    viewsCount: 134,
    tags: ["DevOps", "Cloud", "Infrastructure", "Automation"],
  },
  {
    id: "7",
    title: "Analyste Cybersécurité",
    company: "SecureNet MENA",
    location: "Tunis, Tunisie",
    type: "CDI",
    experience: "2-5 ans",
    salary: {
      min: 2500,
      max: 4000,
      currency: "TND",
      period: "mois",
    },
    department: "Sécurité",
    postedDate: "2024-01-09",
    deadline: "2024-02-07",
    status: "active",
    description:
      "Protégez nos systèmes et ceux de nos clients contre les cybermenaces. Rejoignez notre équipe de cybersécurité pour analyser, détecter et répondre aux incidents de sécurité.",
    responsibilities: [
      "Analyser les incidents de sécurité et les menaces",
      "Surveiller les systèmes avec des outils SIEM",
      "Effectuer des tests de pénétration",
      "Développer des politiques de sécurité",
      "Former les utilisateurs à la sécurité informatique",
    ],
    requirements: [
      "2+ ans d'expérience en cybersécurité",
      "Connaissance des frameworks de sécurité (ISO 27001, NIST)",
      "Maîtrise des outils SIEM et de monitoring",
      "Expérience en tests de pénétration",
      "Certifications sécurité appréciées (CISSP, CEH)",
    ],
    skills: {
      required: ["SIEM", "Penetration Testing", "ISO 27001", "Network Security", "Incident Response"],
      preferred: ["Splunk", "Wireshark", "Metasploit", "Nessus", "Python"],
    },
    benefits: [
      "Certifications sécurité payées",
      "Projets de sécurité critiques",
      "Formation continue",
      "Équipement spécialisé",
      "Prime de confidentialité",
    ],
    workMode: "Présentiel",
    languages: ["Arabe", "Français", "Anglais"],
    education: "Master en Sécurité Informatique ou équivalent",
    applicationsCount: 15,
    viewsCount: 89,
    tags: ["Cybersécurité", "SIEM", "Sécurité", "Analyse"],
  },
  {
    id: "8",
    title: "Product Manager",
    company: "InnovateTech Tunis",
    location: "Tunis, Tunisie",
    type: "CDI",
    experience: "4-6 ans",
    salary: {
      min: 3200,
      max: 5000,
      currency: "TND",
      period: "mois",
    },
    department: "Produit",
    postedDate: "2024-01-13",
    deadline: "2024-02-11",
    status: "active",
    description:
      "Dirigez la stratégie produit de nos solutions SaaS innovantes. Vous définirez la vision produit et coordonnerez les équipes pour livrer des fonctionnalités qui ravissent nos utilisateurs.",
    responsibilities: [
      "Définir la stratégie et roadmap produit",
      "Analyser les besoins utilisateurs et le marché",
      "Coordonner les équipes développement et design",
      "Gérer le backlog produit et prioriser les fonctionnalités",
      "Mesurer et analyser les métriques produit",
    ],
    requirements: [
      "4+ ans d'expérience en product management",
      "Expérience avec des produits SaaS/B2B",
      "Maîtrise des méthodologies Agile",
      "Compétences analytiques et data-driven",
      "Excellente communication et leadership",
    ],
    skills: {
      required: ["Product Management", "Agile", "Analytics", "User Research", "Roadmapping"],
      preferred: ["Mixpanel", "Amplitude", "Figma", "JIRA", "SQL"],
    },
    benefits: [
      "Impact direct sur le produit",
      "Stock options",
      "Formation en product management",
      "Conférences produit",
      "Équipe produit senior",
    ],
    workMode: "Hybride",
    languages: ["Arabe", "Français", "Anglais"],
    education: "Master en Business, Ingénierie ou équivalent",
    applicationsCount: 22,
    viewsCount: 112,
    tags: ["Product", "Management", "SaaS", "Strategy"],
  },
]

export const getJobOfferById = (id: string): JobOffer | undefined => {
  return jobOffers.find((job) => job.id === id)
}

export const getJobOffersByCompany = (company: string): JobOffer[] => {
  return jobOffers.filter((job) => job.company === company)
}

export const getJobOffersByDepartment = (department: string): JobOffer[] => {
  return jobOffers.filter((job) => job.department === department)
}

export const getActiveJobOffers = (): JobOffer[] => {
  return jobOffers.filter((job) => job.status === "active")
}
