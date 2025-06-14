import { type NextRequest, NextResponse } from "next/server"

// Mock Rasa chatbot implementation with enhanced analytics
class MockRasaChatbot {
  private conversations: Map<string, any> = new Map()
  private analytics: Map<string, any> = new Map()

  async sendMessage(sessionId: string, message: string) {
    // Get or create conversation state
    let conversation = this.conversations.get(sessionId) || {
      step: "greeting",
      cvText: "",
      jobText: "",
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      scores: {},
      startTime: Date.now(),
      messageCount: 0,
      sentiment: [],
      topics: [],
    }

    conversation.messageCount++

    // Analyze message sentiment and topics
    const messageAnalysis = this.analyzeMessage(message)
    conversation.sentiment.push(messageAnalysis.sentiment)
    conversation.topics.push(...messageAnalysis.topics)

    let response = ""
    let quickReplies: string[] = []
    const visualizations: any[] = []

    switch (conversation.step) {
      case "greeting":
        if (message.toLowerCase().includes("bonjour") || message.toLowerCase().includes("commencer")) {
          response =
            "🤖 Bonjour ! Je suis **ATS Assistant**, votre conseiller IA spécialisé en recrutement.\n\n✨ Je vais analyser votre profil en 3 étapes :\n• 📄 Analyse de votre CV\n• 🎯 Matching avec l'offre d'emploi\n• 💬 Questions personnalisées\n\nCommençons cette aventure ensemble !"
          conversation.step = "waiting_start"
          quickReplies = ["🚀 Commencer l'évaluation", "ℹ️ En savoir plus", "🎯 Voir un exemple"]

          visualizations.push({
            type: "progress",
            data: { current: 0, total: 3, steps: ["CV", "Matching", "Entretien"] },
          })
        } else {
          response =
            "👋 Salut ! Je suis votre assistant IA pour l'évaluation de candidature. Dites **'Bonjour'** pour commencer !"
        }
        break

      case "waiting_start":
        if (message.toLowerCase().includes("commencer")) {
          response =
            "📄 **Étape 1/3 : Analyse de votre CV**\n\nVeuillez coller le texte complet de votre CV ci-dessous.\n\n💡 *Astuce : Plus votre CV est détaillé, plus l'analyse sera précise !*"
          conversation.step = "collecting_cv"

          visualizations.push({
            type: "step_indicator",
            data: { current: 1, total: 3, title: "Analyse CV" },
          })
        } else if (message.toLowerCase().includes("exemple")) {
          response =
            "📋 **Exemple d'évaluation :**\n\n1. **Analyse CV** : Extraction des compétences, expérience\n2. **Matching** : Compatibilité avec l'offre (score sur 100)\n3. **Entretien** : Questions personnalisées selon votre profil\n\nRésultat : Score global + recommandations personnalisées"
          quickReplies = ["🚀 Commencer maintenant", "❓ Autres questions"]
        } else {
          response =
            "🤖 Je suis un assistant IA qui évalue la compatibilité entre votre profil et une offre d'emploi.\n\n**Mes capacités :**\n• 🔍 Analyse sémantique de CV\n• 🎯 Matching intelligent\n• 💬 Questions adaptatives\n• 📊 Rapports détaillés"
          quickReplies = ["🚀 Parfait, commençons !", "🔍 Comment ça marche ?"]
        }
        break

      case "collecting_cv":
        if (message.length > 100) {
          conversation.cvText = message
          const cvAnalysis = this.analyzeCVText(message)

          response = `✅ **CV analysé avec succès !**\n\n📊 **Aperçu de votre profil :**\n• 🎯 **Compétences détectées :** ${cvAnalysis.skills.length}\n• 💼 **Années d'expérience :** ${cvAnalysis.experience}\n• 🎓 **Niveau :** ${cvAnalysis.level}\n\n📋 **Étape 2/3 : Offre d'emploi**\nMaintenant, collez la description du poste qui vous intéresse :`
          conversation.step = "collecting_job"
          conversation.cvAnalysis = cvAnalysis

          visualizations.push({
            type: "cv_analysis",
            data: cvAnalysis,
          })

          visualizations.push({
            type: "step_indicator",
            data: { current: 2, total: 3, title: "Analyse Offre" },
          })
        } else {
          response =
            "📝 Votre CV semble un peu court pour une analyse complète.\n\n💡 **Conseils :**\n• Incluez vos expériences professionnelles\n• Listez vos compétences techniques\n• Mentionnez votre formation\n• Ajoutez vos projets significatifs"
          quickReplies = ["📄 Réessayer", "💡 Voir un exemple de CV"]
        }
        break

      case "collecting_job":
        if (message.length > 100) {
          conversation.jobText = message
          const jobAnalysis = this.analyzeJobText(message)
          const matchingResults = this.performMatching(conversation.cvAnalysis, jobAnalysis)

          response = `🎯 **Analyse de compatibilité terminée !**\n\n📊 **Score de matching : ${matchingResults.overallScore}/100**\n\n${this.getScoreEmoji(matchingResults.overallScore)} ${this.getScoreDescription(matchingResults.overallScore)}\n\n💬 **Étape 3/3 : Entretien personnalisé**\nJe vais maintenant vous poser quelques questions adaptées à votre profil pour compléter l'évaluation.`

          conversation.jobAnalysis = jobAnalysis
          conversation.matchingResults = matchingResults
          conversation.questions = this.generatePersonalizedQuestions(
            conversation.cvAnalysis,
            jobAnalysis,
            matchingResults,
          )
          conversation.step = "interview"
          conversation.currentQuestionIndex = 0

          visualizations.push({
            type: "matching_results",
            data: matchingResults,
          })

          if (conversation.questions.length > 0) {
            response += `\n\n**Question 1/${conversation.questions.length}:**\n${conversation.questions[0].question}`

            visualizations.push({
              type: "interview_progress",
              data: { current: 1, total: conversation.questions.length },
            })
          }
        } else {
          response =
            "📋 La description du poste semble incomplète.\n\n💡 **Incluez :**\n• Les missions principales\n• Les compétences requises\n• Le niveau d'expérience\n• Les technologies utilisées"
          quickReplies = ["🔄 Réessayer", "📋 Voir un exemple d'offre"]
        }
        break

      case "interview":
        const currentQuestion = conversation.questions[conversation.currentQuestionIndex]
        const answerAnalysis = this.analyzeAnswer(message, currentQuestion)

        conversation.answers.push({
          question: currentQuestion,
          answer: message,
          analysis: answerAnalysis,
        })

        conversation.currentQuestionIndex++

        if (conversation.currentQuestionIndex < conversation.questions.length) {
          const nextQuestion = conversation.questions[conversation.currentQuestionIndex]
          response = `✅ **Réponse enregistrée !**\n\n📊 Score de cette réponse : ${answerAnalysis.score}/10\n\n**Question ${conversation.currentQuestionIndex + 1}/${conversation.questions.length}:**\n${nextQuestion.question}`

          visualizations.push({
            type: "answer_feedback",
            data: answerAnalysis,
          })

          visualizations.push({
            type: "interview_progress",
            data: { current: conversation.currentQuestionIndex + 1, total: conversation.questions.length },
          })
        } else {
          const finalResults = this.calculateFinalResults(conversation)
          conversation.finalResults = finalResults
          response = this.generateFinalReport(finalResults)
          conversation.step = "completed"

          visualizations.push({
            type: "final_results",
            data: finalResults,
          })

          quickReplies = ["🔄 Nouvelle évaluation", "📊 Voir détails", "📧 Envoyer rapport"]
        }
        break

      case "completed":
        if (message.toLowerCase().includes("nouvelle") || message.toLowerCase().includes("recommencer")) {
          conversation = {
            step: "greeting",
            cvText: "",
            jobText: "",
            questions: [],
            currentQuestionIndex: 0,
            answers: [],
            scores: {},
            startTime: Date.now(),
            messageCount: 0,
            sentiment: [],
            topics: [],
          }
          response =
            "🔄 **Nouvelle évaluation initiée !**\n\nCommençons une nouvelle analyse. Veuillez coller votre CV :"
          conversation.step = "collecting_cv"
        } else if (message.toLowerCase().includes("détails")) {
          response = this.generateDetailedReport(conversation.finalResults)
          visualizations.push({
            type: "detailed_analysis",
            data: conversation.finalResults,
          })
        } else {
          response =
            "✅ **Évaluation terminée !**\n\nVous pouvez :\n• Commencer une nouvelle évaluation\n• Consulter les détails de votre score\n• Recevoir le rapport par email"
          quickReplies = ["🔄 Nouvelle évaluation", "📊 Voir détails", "📧 Envoyer rapport"]
        }
        break

      default:
        response = "🤔 Je ne comprends pas. Pouvez-vous reformuler ou utiliser les suggestions ?"
        quickReplies = ["🏠 Recommencer", "❓ Aide"]
    }

    // Update analytics
    this.updateAnalytics(sessionId, conversation, messageAnalysis)

    // Save conversation state
    this.conversations.set(sessionId, conversation)

    return {
      response,
      quickReplies,
      step: conversation.step,
      visualizations,
      analytics: this.getSessionAnalytics(sessionId),
      typing: true,
    }
  }

  private analyzeMessage(message: string) {
    // Simple sentiment analysis
    const positiveWords = ["bon", "bien", "excellent", "parfait", "super", "génial", "merci"]
    const negativeWords = ["mauvais", "difficile", "problème", "erreur", "non", "pas"]

    const words = message.toLowerCase().split(/\s+/)
    const positiveCount = words.filter((word) => positiveWords.includes(word)).length
    const negativeCount = words.filter((word) => negativeWords.includes(word)).length

    let sentiment = "neutral"
    if (positiveCount > negativeCount) sentiment = "positive"
    else if (negativeCount > positiveCount) sentiment = "negative"

    // Extract topics
    const techTopics = ["javascript", "python", "react", "node", "sql", "docker", "aws"]
    const topics = words.filter((word) => techTopics.includes(word))

    return { sentiment, topics, length: message.length }
  }

  private analyzeCVText(cvText: string) {
    const skills = this.extractSkills(cvText)
    const experience = this.extractExperience(cvText)
    const education = this.extractEducation(cvText)

    return {
      skills,
      experience,
      education,
      level: experience >= 5 ? "Senior" : experience >= 2 ? "Mid-level" : "Junior",
      completeness: Math.min(100, skills.length * 10 + experience * 5 + 20),
      categories: this.categorizeSkills(skills),
    }
  }

  private analyzeJobText(jobText: string) {
    const requiredSkills = this.extractSkills(jobText)
    const requiredExperience = this.extractExperience(jobText)

    return {
      requiredSkills,
      requiredExperience,
      jobLevel: requiredExperience >= 5 ? "Senior" : requiredExperience >= 2 ? "Mid-level" : "Junior",
      categories: this.categorizeSkills(requiredSkills),
    }
  }

  private performMatching(cvAnalysis: any, jobAnalysis: any) {
    const skillsMatch = this.calculateSkillsMatch(cvAnalysis.skills, jobAnalysis.requiredSkills)
    const experienceMatch = this.calculateExperienceMatch(cvAnalysis.experience, jobAnalysis.requiredExperience)
    const levelMatch = cvAnalysis.level === jobAnalysis.jobLevel ? 100 : 70

    const overallScore = Math.round(skillsMatch * 0.5 + experienceMatch * 0.3 + levelMatch * 0.2)

    return {
      overallScore,
      skillsMatch,
      experienceMatch,
      levelMatch,
      matchingSkills: cvAnalysis.skills.filter((skill: string) =>
        jobAnalysis.requiredSkills.some((req: string) => req.toLowerCase().includes(skill.toLowerCase())),
      ),
      missingSkills: jobAnalysis.requiredSkills.filter(
        (skill: string) => !cvAnalysis.skills.some((cv: string) => cv.toLowerCase().includes(skill.toLowerCase())),
      ),
    }
  }

  private generatePersonalizedQuestions(cvAnalysis: any, jobAnalysis: any, matchingResults: any) {
    const questions = []

    // Question based on missing skills
    if (matchingResults.missingSkills.length > 0) {
      questions.push({
        question: `L'offre d'emploi mentionne ${matchingResults.missingSkills[0]}. Avez-vous de l'expérience avec cette technologie ou êtes-vous prêt(e) à l'apprendre ?`,
        type: "technical_gap",
        weight: 3,
      })
    }

    // Experience-based question
    if (cvAnalysis.experience < jobAnalysis.requiredExperience) {
      questions.push({
        question:
          "Ce poste demande plus d'expérience que ce que montre votre CV. Comment comptez-vous compenser cette différence ?",
        type: "experience_gap",
        weight: 3,
      })
    }

    // Standard questions
    questions.push(
      {
        question: "Qu'est-ce qui vous motive le plus dans ce type de poste ?",
        type: "motivation",
        weight: 2,
      },
      {
        question: "Décrivez un projet dont vous êtes particulièrement fier et votre rôle dans sa réussite.",
        type: "achievement",
        weight: 3,
      },
    )

    return questions.slice(0, 4)
  }

  private calculateFinalResults(conversation: any) {
    const matchingScore = conversation.matchingResults.overallScore
    const interviewScore =
      conversation.answers.length > 0
        ? (conversation.answers.reduce((sum: number, answer: any) => sum + answer.analysis.score, 0) /
            conversation.answers.length) *
          10
        : 0

    const finalScore = Math.round(matchingScore * 0.6 + interviewScore * 0.4)
    const duration = Math.round((Date.now() - conversation.startTime) / 1000 / 60)

    return {
      finalScore,
      matchingScore,
      interviewScore,
      duration,
      messageCount: conversation.messageCount,
      recommendation: this.getRecommendation(finalScore),
      strengths: this.identifyStrengths(conversation),
      improvements: this.identifyImprovements(conversation),
      sentiment: this.calculateOverallSentiment(conversation.sentiment),
    }
  }

  private generateFinalReport(results: any) {
    const emoji = this.getScoreEmoji(results.finalScore)
    const level = this.getScoreLevel(results.finalScore)

    return `🎉 **ÉVALUATION TERMINÉE !**\n\n${emoji} **Score Final : ${results.finalScore}/100**\n📊 **Niveau : ${level}**\n\n**📈 Détail des scores :**\n• 🎯 Matching CV/Offre : ${results.matchingScore}/100\n• 💬 Performance entretien : ${results.interviewScore.toFixed(1)}/100\n\n**⏱️ Statistiques :**\n• Durée : ${results.duration} minutes\n• Messages échangés : ${results.messageCount}\n\n**🎯 Recommandation :**\n${results.recommendation}`
  }

  private generateDetailedReport(results: any) {
    return `📊 **RAPPORT DÉTAILLÉ**\n\n**💪 Points forts :**\n${results.strengths.map((s: string) => `• ${s}`).join("\n")}\n\n**🎯 Axes d'amélioration :**\n${results.improvements.map((i: string) => `• ${i}`).join("\n")}\n\n**📈 Analyse comportementale :**\n• Sentiment général : ${results.sentiment}\n• Engagement : ${results.messageCount > 10 ? "Élevé" : "Modéré"}\n• Temps de réflexion : ${results.duration > 10 ? "Approfondi" : "Rapide"}`
  }

  // Helper methods
  private extractSkills(text: string): string[] {
    const skillsPattern =
      /\b(?:Python|Java|JavaScript|React|Angular|Vue|Node\.js|Django|Flask|SQL|MongoDB|PostgreSQL|MySQL|Docker|Kubernetes|AWS|Azure|GCP|Git|Linux|TypeScript|PHP|C\+\+|C#|Ruby|Swift|Kotlin|Flutter|React Native|TensorFlow|PyTorch|Scikit-learn|Pandas|NumPy|Matplotlib|Figma|Adobe|Photoshop|Illustrator|Sketch|InVision|Zeplin|Jira|Confluence|Slack|Trello|Agile|Scrum|Kanban)\b/gi
    const matches = text.match(skillsPattern) || []
    return [...new Set(matches.map((skill) => skill.toLowerCase()))]
  }

  private extractExperience(text: string): number {
    const expPattern = /(\d+)\s*(?:ans?|années?|year|experience)/gi
    const matches = text.match(expPattern)
    if (matches) {
      const years = matches.map((match) => Number.parseInt(match.match(/\d+/)?.[0] || "0"))
      return Math.max(...years)
    }
    return 0
  }

  private extractEducation(text: string): string[] {
    const eduPattern = /\b(?:Master|Licence|Bac|Doctorat|PhD|Ingénieur|DUT|BTS|MBA)\b/gi
    const matches = text.match(eduPattern) || []
    return [...new Set(matches)]
  }

  private categorizeSkills(skills: string[]) {
    const categories = {
      programming: ["python", "java", "javascript", "typescript", "php", "c++", "c#", "ruby", "swift", "kotlin"],
      frameworks: ["react", "angular", "vue", "node.js", "django", "flask", "flutter", "react native"],
      databases: ["sql", "mongodb", "postgresql", "mysql"],
      cloud: ["aws", "azure", "gcp", "docker", "kubernetes"],
      design: ["figma", "adobe", "photoshop", "illustrator", "sketch"],
      management: ["jira", "confluence", "agile", "scrum", "kanban"],
    }

    const result: any = {}
    Object.entries(categories).forEach(([category, categorySkills]) => {
      result[category] = skills.filter((skill) =>
        categorySkills.some((catSkill) => skill.toLowerCase().includes(catSkill)),
      )
    })

    return result
  }

  private calculateSkillsMatch(cvSkills: string[], jobSkills: string[]): number {
    if (jobSkills.length === 0) return 100
    const matchingSkills = cvSkills.filter((skill) =>
      jobSkills.some((jobSkill) => jobSkill.toLowerCase().includes(skill.toLowerCase())),
    )
    return Math.round((matchingSkills.length / jobSkills.length) * 100)
  }

  private calculateExperienceMatch(cvExp: number, jobExp: number): number {
    if (jobExp === 0) return 100
    if (cvExp >= jobExp) return 100
    return Math.round((cvExp / jobExp) * 100)
  }

  private analyzeAnswer(answer: string, question: any) {
    let score = 5.0

    // Length bonus
    if (answer.length > 50) score += 1.0
    if (answer.length > 100) score += 1.0

    // Content analysis
    const positiveKeywords = [
      "expérience",
      "projet",
      "équipe",
      "réussi",
      "appris",
      "développé",
      "créé",
      "géré",
      "optimisé",
    ]
    const keywordCount = positiveKeywords.filter((keyword) => answer.toLowerCase().includes(keyword)).length
    score += keywordCount * 0.5

    // Question-specific scoring
    if (question.type === "technical_gap") {
      if (/\b(oui|expérience|projet|utilisé|maîtrise|formation)\b/i.test(answer)) {
        score += 2.0
      }
    }

    return {
      score: Math.min(score, 10.0),
      keywords: keywordCount,
      length: answer.length,
      sentiment: answer.length > 30 ? "positive" : "neutral",
    }
  }

  private getScoreEmoji(score: number): string {
    if (score >= 90) return "🌟"
    if (score >= 80) return "🎯"
    if (score >= 70) return "👍"
    if (score >= 60) return "⚡"
    return "💪"
  }

  private getScoreLevel(score: number): string {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Très bon"
    if (score >= 70) return "Bon"
    if (score >= 60) return "Satisfaisant"
    return "À améliorer"
  }

  private getScoreDescription(score: number): string {
    if (score >= 80) return "**Excellent profil !** Vous êtes un candidat très prometteur pour ce poste."
    if (score >= 60) return "**Bon profil** avec quelques points à améliorer."
    return "**Profil à développer** - Plusieurs axes d'amélioration identifiés."
  }

  private getRecommendation(score: number): string {
    if (score >= 80) return "Candidature fortement recommandée. Votre profil correspond parfaitement aux exigences."
    if (score >= 60) return "Candidature recommandée avec quelques formations complémentaires."
    return "Candidature possible après développement des compétences manquantes."
  }

  private identifyStrengths(conversation: any): string[] {
    const strengths = []

    if (conversation.matchingResults.skillsMatch > 70) {
      strengths.push("Excellente correspondance technique")
    }

    if (conversation.cvAnalysis.experience >= 3) {
      strengths.push("Expérience professionnelle solide")
    }

    if (conversation.answers.some((a: any) => a.analysis.score > 8)) {
      strengths.push("Excellentes réponses aux questions")
    }

    return strengths.length > 0 ? strengths : ["Motivation et engagement"]
  }

  private identifyImprovements(conversation: any): string[] {
    const improvements = []

    if (conversation.matchingResults.missingSkills.length > 0) {
      improvements.push(`Développer les compétences en ${conversation.matchingResults.missingSkills[0]}`)
    }

    if (conversation.matchingResults.experienceMatch < 80) {
      improvements.push("Acquérir plus d'expérience dans le domaine")
    }

    if (conversation.answers.some((a: any) => a.analysis.score < 6)) {
      improvements.push("Préparer des exemples concrets pour les entretiens")
    }

    return improvements.length > 0 ? improvements : ["Continuer à développer vos compétences"]
  }

  private calculateOverallSentiment(sentiments: string[]): string {
    if (sentiments.length === 0) return "neutral"

    const positiveCount = sentiments.filter((s) => s === "positive").length
    const negativeCount = sentiments.filter((s) => s === "negative").length

    if (positiveCount > negativeCount) return "positive"
    if (negativeCount > positiveCount) return "negative"
    return "neutral"
  }

  private updateAnalytics(sessionId: string, conversation: any, messageAnalysis: any) {
    const analytics = this.analytics.get(sessionId) || {
      totalMessages: 0,
      avgResponseTime: 0,
      sentimentHistory: [],
      topicsDiscussed: [],
      sessionDuration: 0,
    }

    analytics.totalMessages++
    analytics.sentimentHistory.push(messageAnalysis.sentiment)
    analytics.topicsDiscussed.push(...messageAnalysis.topics)
    analytics.sessionDuration = Date.now() - conversation.startTime

    this.analytics.set(sessionId, analytics)
  }

  private getSessionAnalytics(sessionId: string) {
    return this.analytics.get(sessionId) || {}
  }
}

const chatbot = new MockRasaChatbot()

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()

    if (!message || !sessionId) {
      return NextResponse.json({ error: "Message and sessionId are required" }, { status: 400 })
    }

    const result = await chatbot.sendMessage(sessionId, message)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
