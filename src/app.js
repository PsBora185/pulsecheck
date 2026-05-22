const toolCards = [
  {
    name: 'Git',
    category: 'Version Control',
    summary: 'Track changes, branch safely, and collaborate using pull requests.',
    practice: 'Create a feature branch and merge it after review.'
  },
  {
    name: 'Docker',
    category: 'Containerization',
    summary: 'Package your app with dependencies into predictable containers.',
    practice: 'Build image with docker build and run it locally.'
  },
  {
    name: 'Docker Compose',
    category: 'Local Orchestration',
    summary: 'Run multi-service setups with one command and simple YAML.',
    practice: 'Use compose to start and stop your app stack quickly.'
  },
  {
    name: 'Jenkins',
    category: 'Automation Server',
    summary: 'Automate build, test, and container image creation in pipelines.',
    practice: 'Trigger pipeline on push and inspect each stage output.'
  },
  {
    name: 'Kubernetes',
    category: 'Orchestration',
    summary: 'Deploy and scale containers using declarative manifests.',
    practice: 'Write a simple Deployment and Service YAML.'
  },
  {
    name: 'Terraform',
    category: 'Infrastructure as Code',
    summary: 'Provision cloud infrastructure from readable config files.',
    practice: 'Create a basic provider and one resource block.'
  },
  {
    name: 'Ansible',
    category: 'Configuration Management',
    summary: 'Automate server setup and tasks using playbooks.',
    practice: 'Run one playbook against a local test host.'
  },
  {
    name: 'Prometheus + Grafana',
    category: 'Monitoring',
    summary: 'Collect metrics and build dashboards for reliability insights.',
    practice: 'Add one app metric and graph it on a dashboard.'
  }
]

const ciCdSteps = [
  'Commit code to Git repository',
  'CI pipeline runs install, build, and tests',
  'Docker image is built from validated code',
  'Image is tagged and pushed to registry',
  'CD deploys image to target environment',
  'Monitoring validates system health after deploy'
]

function renderToolCards() {
  return toolCards
    .map(
      (tool) => `
      <article class="card tool-card">
        <p class="label">${tool.category}</p>
        <h3>${tool.name}</h3>
        <p>${tool.summary}</p>
        <p class="practice"><strong>Practice:</strong> ${tool.practice}</p>
      </article>
    `
    )
    .join('')
}

function renderFlowSteps() {
  return ciCdSteps
    .map(
      (step, index) => `
      <li>
        <span class="step-number">${index + 1}</span>
        <span>${step}</span>
      </li>
    `
    )
    .join('')
}

export function renderApp(container) {
  container.innerHTML = `
    <div class="background-glow" aria-hidden="true"></div>
    <header class="hero card">
      <p class="eyebrow">DevOps Practice Playground</p>
      <h1>Learn DevOps with a small app that is easy to build, run, and ship.</h1>
      <p>
        This frontend is intentionally lightweight so you can focus on CI/CD, Docker,
        and Jenkins workflows without dealing with a heavy project.
      </p>
    </header>

    <main>
      <section class="card intro">
        <h2>What Is DevOps?</h2>
        <p>
          DevOps is a collaboration culture and set of practices that connects development and
          operations. The goal is faster delivery, better reliability, and safer releases through
          automation and feedback loops.
        </p>
      </section>

      <section class="card flow">
        <h2>CI/CD Lifecycle</h2>
        <ol class="flow-list">
          ${renderFlowSteps()}
        </ol>
      </section>

      <section class="tools-section">
        <h2>Core DevOps Tools</h2>
        <div class="tools-grid">
          ${renderToolCards()}
        </div>
      </section>

      <section class="card checklist">
        <h2>Practice Checklist For You</h2>
        <ul>
          <li>Run <code>npm run build</code> and inspect the <code>dist</code> output.</li>
          <li>Build your container image from the Dockerfile.</li>
          <li>Use Docker Compose to run the app locally.</li>
          <li>Trigger Jenkins pipeline and read logs stage by stage.</li>
          <li>Edit content and repeat to build CI/CD confidence.</li>
        </ul>
      </section>
    </main>
  `
}
