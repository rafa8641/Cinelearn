export const quizConfig = [
  {
    id: "theme",
    question: "Qual tema pedagógico principal?",
    options: [
      { id: "science", label: "Ciências", keywords: ["science","biology","physics","chemistry","experiment","ecosystem"] },
      { id: "history", label: "História", keywords: ["history","ancient history","medieval","world war","historical figure"] },
      { id: "literacy", label: "Língua/Leitura", keywords: ["literacy","reading","language","poetry","storytelling"] }
    ]
  },
  {
    id: "socioemotional",
    question: "Qual competência socioemocional você quer trabalhar?",
    options: [
      { id: "teamwork", label: "Trabalho em equipe", keywords: ["teamwork","cooperation","collaboration","leadership"] },
      { id: "empathy", label: "Empatia & Amizade", keywords: ["empathy","friendship","kindness","bullying","inclusion"] },
      { id: "conflict", label: "Resolução de conflitos", keywords: ["conflict resolution","problem solving","negotiation"] }
    ]
  },
  {
    id: "setting",
    question: "Qual ambientação você prefere?",
    options: [
      { id: "school_family", label: "Escola/Família", keywords: ["school","classroom","teacher","family","parent child relationship"] },
      { id: "nature", label: "Natureza/Meio ambiente", keywords: ["nature","environment","animals","conservation","forest"] },
      { id: "city_tech", label: "Cidade/Tecnologia", keywords: ["city","technology","computers","robotics","coding"] }
    ]
  },
  {
    id: "hook",
    question: "Que tipo de história chama mais atenção?",
    options: [
      { id: "sports", label: "Esportes/Jogos", keywords: ["sports","soccer","basketball","competition","team sport"] },
      { id: "mystery", label: "Mistério/Investigação", keywords: ["mystery","detective","investigation","puzzle"] },
      { id: "fantasy", label: "Fantasia/Magia", keywords: ["fantasy","magic","witch","fairy tale","imaginary friend"] }
    ]
  },
  {
    id: "narrative",
    question: "Qual tipo de narrativa você prefere?",
    options: [
      { id: "true_story", label: "Baseado em fatos", keywords: ["based on true story","biography","historical drama","documentary"] },
      { id: "contemporary", label: "Ficção contemporânea", keywords: ["coming of age","slice of life","school life","family drama"] },
      { id: "allegory", label: "Fábula/Alegoria", keywords: ["allegory","moral","parable","myth"] }
    ]
  },
  {
    id: "protagonist",
    question: "Qual dinâmica de protagonistas você quer?",
    options: [
      { id: "friends", label: "Grupo de amigos", keywords: ["friend group","peer group","classmates"] },
      { id: "mentor", label: "Aluno(a) e mentor/professor", keywords: ["mentor","teacher","apprentice","coach"] },
      { id: "family", label: "Família em destaque", keywords: ["siblings","parenting","grandparent","family bonds"] }
    ]
  },
  {
    id: "pedagogical_device",
    question: "Qual dispositivo pedagógico você quer que apareça?",
    options: [
      { id: "project", label: "Experimento/Projeto", keywords: ["project","experiment","science fair","maker"] },
      { id: "time_travel", label: "Viagem no tempo/entre lugares", keywords: ["time travel","historical setting","field trip","museum"] },
      { id: "challenge", label: "Desafio/Competição educativa", keywords: ["quiz","tournament","challenge","contest"] }
    ]
  },
  {
    id: "contentType",
    question: "Você deseja recomendações de:",
    options: [
      { id: "movie", label: "Filmes" },
      { id: "tv", label: "Séries" },
      { id: "both", label: "Ambos" },
    ],
  },
  {
    id: "ageRating",
    question: "Qual classificação indicativa deseja considerar (idade mínima)?",
    options: [
      { id: "0", label: "Livre para todos os públicos" },
      { id: "10", label: "A partir de 10 anos" },
      { id: "12", label: "A partir de 12 anos" },
      { id: "14", label: "A partir de 14 anos" },
      { id: "16", label: "A partir de 16 anos" },
      { id: "18", label: "A partir de 18 anos" },
    ],
    visibleFor: ["professor"],
  }
];
