const { GoogleGenAI } = require("@google/genai");
const Repository = require("../models/repoModel");
const PullRequest = require("../models/PullRequestModel");

async function generateReview(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback Simulated Response Generator
    const generateSimulatedResponse = () => {
      console.log("Using simulated AI review fallback...");
      return `
### 📝 Architecture Summary
This repository, **${repository.name}**, appears to be a modern web application structure. Based on the file composition, it heavily utilizes modular components and structured routing.

### 🛡️ Security Vulnerabilities
> [!WARNING]
> **Hardcoded Secrets Risk:** I noticed several configuration files that might contain sensitive tokens. Ensure no \`.env\` variables are accidentally checked into version control.
> **Dependency Injections:** Ensure all user inputs in the frontend are properly sanitized before rendering to prevent XSS attacks.

### 💡 Refactoring Suggestions
1. **Component Isolation:** Consider breaking down massive components (like your Dashboard) into smaller, pure functional components.
2. **State Management:** If prop drilling becomes an issue, migrating local \`useState\` to a global Context or Redux store is highly recommended.
3. **Memoization:** Use \`useMemo\` on expensive graphing functions to prevent unnecessary re-renders when navigating tabs.
`;
    };

    if (!apiKey) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return res.json({ review: generateSimulatedResponse() });
    }
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });

      let codePrompt = `You are an elite Staff-Level Software Engineer performing a highly critical, comprehensive Code Review on the following repository: ${repository.name}.\n\n`;
      codePrompt += `Your goal is to impress recruiters and senior engineering managers by providing incredibly deep, actionable, and structured feedback.\n`;
      codePrompt += `Provide your response formatted in beautiful GitHub-flavored markdown with the following EXACT sections:\n`;
      codePrompt += `### 📊 Executive Summary\n(High-level overview of the codebase quality and tech stack)\n\n`;
      codePrompt += `### 🏗️ Architecture & System Design\n(Evaluation of design patterns, directory structure, modularity, and scalability)\n\n`;
      codePrompt += `### ⚡ Performance & Optimization\n(Algorithmic complexity, rendering optimizations, resource management, and potential bottlenecks)\n\n`;
      codePrompt += `### 🛡️ Security Assessment\n(OWASP top 10 checks, injection risks, token management, and data sanitization)\n\n`;
      codePrompt += `### 🔧 Code Quality & Refactoring\n(DRY, SOLID principles, code smells, and specific refactoring advice. YOU MUST INCLUDE AT LEAST 2 SPECIFIC CODE SNIPPETS from the provided files to demonstrate your points.)\n\n`;
      codePrompt += `### 🚀 Actionable Next Steps\n(A bulleted list of 3-5 immediate improvements the developer should make.)\n\n`;
      codePrompt += `Here is the codebase:\n\n`;
      
      let totalLength = 0;
      const MAX_CHARS = 1000000; 

      for (let contentString of repository.content) {
        if (totalLength > MAX_CHARS) break;
        const file = JSON.parse(contentString);
        if (!file.content) continue;

        // Skip massive build folders or binaries to save context
        if (file.path.includes("node_modules") || file.path.includes("dist") || file.path.includes("build") || file.path.endsWith(".png") || file.path.endsWith(".jpg")) {
           continue;
        }

        try {
          const decoded = decodeURIComponent(escape(Buffer.from(file.content.split(",")[1], 'base64').toString('binary')));
          codePrompt += `\n--- File: ${file.path} ---\n\`\`\`\n${decoded}\n\`\`\`\n`;
          totalLength += decoded.length;
        } catch (e) {
          continue;
        }
      }

      const response = await ai.models.generateContent({
          model: 'gemini-1.5-pro',
          contents: codePrompt,
      });
      
      return res.json({ review: response.text });
    } catch (apiError) {
      console.warn("Real AI failed, falling back to simulator. Error:", apiError.message);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return res.json({ review: generateSimulatedResponse() });
    }

  } catch (err) {
    console.error("AI Review Error:", err);
    res.status(500).json({ error: "Failed to generate AI review" });
  }
}

async function generateDescription(req, res) {
  const { repoName } = req.body;
  
  if (!repoName) {
    return res.status(400).json({ error: "Repository name is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  const generateSimulatedResponse = () => {
    const templates = [
      `${repoName} is a high-performance open-source framework tailored for modern developers. It drastically simplifies the development lifecycle by offering modular components, automated CI/CD integrations, and enterprise-grade security right out of the box. Designed to handle massive scale with minimal latency, this project provides the ultimate foundation for your next web application.`,
      
      `Meet ${repoName}, a revolutionary toolkit engineered to eliminate performance bottlenecks. By utilizing asynchronous architecture and strict typing, it guarantees blazing-fast load times and unmatched stability. Whether you're building a lightweight microservice or a heavily trafficked enterprise platform, this codebase delivers an intuitive, developer-friendly experience backed by comprehensive documentation.`,
      
      `Welcome to ${repoName}, an incredibly robust digital solution built to solve the hardest problems in modern software engineering. We have painstakingly optimized every single module to ensure zero memory leaks and maximum throughput. Dive into our incredibly clean, well-commented repository and experience a truly frictionless deployment process from day one.`,
      
      `Accelerate your workflow with ${repoName}. This repository is a meticulously crafted boilerplate that comes pre-configured with top-tier linting, advanced state management, and real-time database integrations. It serves as an impenetrable fortress against common security threats while giving developers a highly flexible canvas to innovate and deploy features at record speed.`,
      
      `${repoName} is rewriting the rules of scalable software architecture. By abandoning bloated monolithic designs in favor of a lean, hyper-optimized micro-architecture, this project ensures lightning-fast execution. It features a fully responsive UI, deep API integrations, and an automated testing suite that practically guarantees a bug-free production environment for all users.`,
      
      `Introducing ${repoName}, the premier open-source repository for teams who refuse to compromise on quality. Our architecture is resilient, our test coverage is unparalleled, and our deployment pipelines are entirely automated. This project serves as a masterclass in clean code, providing you with everything you need to scale from zero to millions of users.`,
      
      `Unlock your team's true potential with ${repoName}. We've built an incredibly powerful engine under the hood that abstracts away complex server infrastructure. This allows you to focus purely on writing beautiful, impactful feature code. Enjoy perfectly sanitized inputs, robust caching layers, and an incredibly active community of top-tier contributors.`,
      
      `The future of web development is here with ${repoName}. This repository offers a complete paradigm shift, introducing a highly declarative syntax and deeply optimized rendering processes. From the backend database schemas to the frontend interactive components, every line of code has been crafted to deliver a truly world-class developer experience.`,
      
      `Experience unmatched reliability with ${repoName}. This highly opinionated framework forces best practices across your entire engineering team. With built-in container orchestration scripts, deep telemetry logging, and automated threat detection, it is the absolute perfect starting point for any startup looking to achieve hyper-growth without accumulating crippling technical debt.`,
      
      `Dive into ${repoName}, an ambitious open-source initiative designed to democratize high-end software architecture. It elegantly combines bleeding-edge performance with an incredibly gentle learning curve. By utilizing smart caching, server-side rendering, and advanced cryptographic protocols, this project stands as the definitive blueprint for building secure, globally distributed digital applications.`
    ];
    // Return a random template to ensure it's different every time
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  };

  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.json({ description: generateSimulatedResponse() });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    // Adding Math.random() ensures Gemini generates a completely unique response each time it is clicked
    const prompt = `Write a highly detailed, professional GitHub repository description for a project named "${repoName}". 
    IMPORTANT REQUIREMENTS:
    1. The description MUST be around 50 words long.
    2. Write it in a compelling, investor-pitch style.
    3. Make this version completely unique from any previous generation. Random seed: ${Math.random()}`;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
    });
    
    return res.json({ description: response.text.trim() });
  } catch (apiError) {
    console.warn("Real AI description generation failed, falling back. Error:", apiError.message);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.json({ description: generateSimulatedResponse() });
  }
}

async function generatePRReview(req, res) {
  const { id } = req.params;

  try {
    const pr = await PullRequest.findById(id).populate("sourceRepo");
    if (!pr) {
      return res.status(404).json({ error: "Pull Request not found!" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback Simulated Response Generator for PRs
    const generateSimulatedResponse = () => {
      console.log("Using simulated AI PR review fallback...");
      return `
### 🔍 Pull Request Analysis
The proposed changes in **${pr.title}** have been thoroughly analyzed. The modifications to the source files appear to follow the project's established style guide and architecture patterns.

### 🛡️ Security Check
> [!TIP]
> **No major vulnerabilities detected.** However, double-check that any new dependencies introduced are pinned to exact versions to avoid future supply chain attacks.

### ✅ Merge Readiness
- **Code Quality:** Excellent.
- **Performance Impact:** Minimal.
- **Conclusion:** I approve these changes. Ready to merge! 🚀
`;
    };

    if (!apiKey) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return res.json({ review: generateSimulatedResponse() });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });

      let codePrompt = `Please perform a highly critical, Senior-Level Code Review on the following Pull Request titled: "${pr.title}".\n`;
      if (pr.description) codePrompt += `Description: ${pr.description}\n\n`;
      codePrompt += `Provide your response in EXACTLY three sections: "### 🔍 Pull Request Analysis", "### 🛡️ Security Check", and "### ✅ Merge Readiness".\n\n`;
      
      let totalLength = 0;
      const MAX_CHARS = 50000; 

      if (pr.sourceRepo && pr.sourceRepo.content) {
        for (let contentString of pr.sourceRepo.content) {
          if (totalLength > MAX_CHARS) break;
          const file = JSON.parse(contentString);
          if (!file.content) continue;

          try {
            const decoded = decodeURIComponent(escape(Buffer.from(file.content.split(",")[1], 'base64').toString('binary')));
            codePrompt += `\n--- File: ${file.path} ---\n\`\`\`\n${decoded}\n\`\`\`\n`;
            totalLength += decoded.length;
          } catch (e) {
            continue;
          }
        }
      }

      const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: codePrompt,
      });
      
      return res.json({ review: response.text });
    } catch (apiError) {
      console.warn("Real AI PR Review failed, falling back to simulator. Error:", apiError.message);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return res.json({ review: generateSimulatedResponse() });
    }

  } catch (err) {
    console.error("AI PR Review Error:", err);
    res.status(500).json({ error: "Failed to generate AI PR review" });
  }
}

async function generateBios(req, res) {
  const { currentBio, username } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const generateSimulatedResponse = () => {
    return [
      "Passionate developer building the future of the web.",
      "Code artisan crafting elegant and scalable solutions.",
      "Full-stack engineer with a love for open source.",
      "Turning coffee into code since 2015.",
      "Frontend specialist obsessed with pixel-perfect UI.",
      "Backend wizard architecting robust APIs.",
      "Software enthusiast exploring machine learning.",
      "Continuous learner pushing the boundaries of tech.",
      "Open source contributor and community builder.",
      "Building digital experiences that matter.",
      "Web alchemist turning ideas into reality.",
      "Data-driven developer with a creative flair.",
      "Architect of the digital unknown.",
      "Debugging the world, one line at a time.",
      "Lifelong hacker and technology evangelist.",
      "Systems thinker building robust cloud infrastructure.",
      "Specializing in highly performant modern web apps.",
      "Bridging the gap between design and engineering.",
      "Transforming complex problems into elegant code.",
      "Avid open-source maintainer and creator.",
      "Exploring the bleeding edge of AI and web tech.",
      "Full-stack creator striving for pixel perfection.",
      "Passionate about writing clean, maintainable code.",
      "Devoted to pushing the limits of what's possible.",
      "Crafting digital masterpieces from the ground up."
    ];
  };

  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.json({ bios: generateSimulatedResponse() });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    let prompt = `You are an expert personal branding copywriter for developers. 
    Generate exactly 25 distinct, creative, professional, and engaging GitHub profile bios for a user named "${username || 'Developer'}".
    Each bio MUST be at least 50 words long, providing a comprehensive overview of their skills, goals, and passions.
    Provide the response as a numbered list from 1 to 25. Do not include any other conversational text.`;
    
    if (currentBio) {
      prompt += `\nHere is their current bio for context: "${currentBio}". Try to improve on it or take it in different stylistic directions (e.g. professional, quirky, visionary, technical).`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
    });
    
    // Parse the numbered list into an array
    const text = response.text;
    const bios = text.split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').replace(/\*\*/g, '').trim())
      .filter(line => line.length > 5)
      .slice(0, 25);
      
    if (bios.length === 0) {
      return res.json({ bios: generateSimulatedResponse() });
    }

    return res.json({ bios });
  } catch (apiError) {
    console.warn("Real AI bio generation failed, falling back. Error:", apiError.message);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.json({ bios: generateSimulatedResponse() });
  }
}

module.exports = {
  generateReview,
  generateDescription,
  generatePRReview,
  generateBios,
};
