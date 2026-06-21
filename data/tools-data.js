// DevOps tools directory
const TOOLS_DIRECTORY = [
  { name: "Docker", icon: "🐳", desc: "Industry-standard containerization platform for packaging applications with their dependencies.", features: ["Lightweight containers", "Image layering & caching", "Docker Compose for multi-container apps", "Cross-platform"], docs: "https://docs.docker.com" },
  { name: "Kubernetes", icon: "☸️", desc: "Container orchestration platform for automating deployment, scaling, and management.", features: ["Auto-scaling & self-healing", "Service discovery", "Rolling updates", "Declarative config"], docs: "https://kubernetes.io/docs" },
  { name: "Jenkins", icon: "⚙️", desc: "Open-source automation server for building CI/CD pipelines with thousands of plugins.", features: ["Pipeline as code", "Massive plugin ecosystem", "Distributed builds", "Self-hosted"], docs: "https://www.jenkins.io/doc" },
  { name: "Terraform", icon: "🏗️", desc: "Infrastructure as Code tool to provision and manage cloud resources declaratively.", features: ["Multi-cloud support", "State management", "Plan before apply", "Module reuse"], docs: "https://developer.hashicorp.com/terraform" },
  { name: "Ansible", icon: "🔧", desc: "Agentless automation tool for configuration management and application deployment.", features: ["Agentless (SSH-based)", "YAML playbooks", "Idempotent execution", "Large module library"], docs: "https://docs.ansible.com" },
  { name: "Prometheus", icon: "🔥", desc: "Open-source monitoring system with a powerful time-series database and alerting.", features: ["Pull-based metrics", "PromQL query language", "Service discovery", "Alertmanager integration"], docs: "https://prometheus.io/docs" },
  { name: "Grafana", icon: "📊", desc: "Visualization and dashboarding tool, commonly paired with Prometheus and other data sources.", features: ["Rich dashboards", "Multi-datasource support", "Alerting", "Plugin ecosystem"], docs: "https://grafana.com/docs" },
  { name: "Helm", icon: "⛵", desc: "The package manager for Kubernetes — bundles manifests into reusable, versioned charts.", features: ["Templated manifests", "Release management", "Rollback support", "Public chart repos"], docs: "https://helm.sh/docs" },
  { name: "ArgoCD", icon: "🔄", desc: "Declarative GitOps continuous delivery tool for Kubernetes.", features: ["Git as source of truth", "Auto-sync", "Visual app topology", "Multi-cluster support"], docs: "https://argo-cd.readthedocs.io" },
  { name: "SonarQube", icon: "🔍", desc: "Static code analysis platform for detecting bugs, vulnerabilities, and code smells.", features: ["Multi-language support", "Quality gates", "CI/CD integration", "Security hotspot detection"], docs: "https://docs.sonarsource.com" },
  { name: "Nginx", icon: "🌐", desc: "High-performance web server, reverse proxy, and load balancer.", features: ["Reverse proxy", "Load balancing", "SSL termination", "Caching"], docs: "https://nginx.org/en/docs" },
  { name: "AWS", icon: "☁️", desc: "Amazon's comprehensive cloud computing platform with 200+ services.", features: ["EC2, S3, Lambda", "Global infrastructure", "IAM security", "Pay-as-you-go"], docs: "https://docs.aws.amazon.com" },
  { name: "Azure", icon: "🔷", desc: "Microsoft's cloud platform, strong in enterprise and hybrid-cloud scenarios.", features: ["Azure DevOps", "Active Directory integration", "Hybrid cloud", "App Services"], docs: "https://learn.microsoft.com/azure" },
  { name: "GCP", icon: "🌈", desc: "Google Cloud Platform — known for Kubernetes (GKE), BigQuery, and data/AI tooling.", features: ["GKE (managed K8s)", "BigQuery analytics", "Global network", "Vertex AI"], docs: "https://cloud.google.com/docs" },
];

// Interview questions
const INTERVIEW_QUESTIONS = {
  docker: {
    beginner: [
      { q: "What is Docker and how is it different from a virtual machine?", a: "Docker is a containerization platform that packages applications with their dependencies into lightweight, portable containers. Unlike VMs, containers share the host OS kernel instead of virtualizing entire hardware, making them faster to start and far more resource-efficient." },
      { q: "What is the difference between an image and a container?", a: "An image is a read-only template/blueprint containing the application code, runtime, libraries, and dependencies. A container is a running instance of that image — you can run multiple containers from the same image." },
      { q: "What is a Dockerfile?", a: "A Dockerfile is a text file containing a sequence of instructions (FROM, RUN, COPY, CMD, etc.) used to build a Docker image automatically." },
    ],
    intermediate: [
      { q: "Explain Docker layer caching and why it matters for build speed.", a: "Each instruction in a Dockerfile creates a layer. Docker caches unchanged layers, so reordering instructions (e.g. copying package.json and installing deps before copying the rest of the code) avoids re-running expensive steps on every build." },
      { q: "What's the difference between CMD and ENTRYPOINT?", a: "CMD provides default arguments that can be overridden at runtime. ENTRYPOINT defines the fixed executable that always runs. They're often combined: ENTRYPOINT sets the binary, CMD supplies default args." },
      { q: "How do you reduce Docker image size?", a: "Use slim/alpine base images, multi-stage builds to discard build tools from the final image, combine RUN commands to reduce layers, and add a .dockerignore file." },
    ],
    advanced: [
      { q: "Explain multi-stage builds and a real use case.", a: "Multi-stage builds use multiple FROM statements in one Dockerfile — one stage compiles/builds the app (with all build tools), and a final stage copies only the compiled artifact into a minimal runtime image, drastically reducing final image size." },
      { q: "How does Docker networking work (bridge vs host vs overlay)?", a: "Bridge (default) creates an isolated network on the host with NAT. Host mode shares the host's network namespace directly (no isolation, max performance). Overlay networks span multiple Docker hosts, used in Swarm/Kubernetes for cross-node container communication." },
    ]
  },
  kubernetes: {
    beginner: [
      { q: "What is a Pod in Kubernetes?", a: "The smallest deployable unit in Kubernetes — a Pod wraps one or more tightly-coupled containers that share networking and storage." },
      { q: "What is the difference between a Deployment and a Pod?", a: "A Pod is a single instance of your app. A Deployment manages a set of identical Pods, handling replication, rolling updates, and self-healing if Pods crash." },
      { q: "What is a Service in Kubernetes?", a: "A Service provides a stable network endpoint (IP/DNS name) to access a dynamic set of Pods, since individual Pod IPs change as they're recreated." },
    ],
    intermediate: [
      { q: "Explain the difference between ClusterIP, NodePort, and LoadBalancer services.", a: "ClusterIP (default) exposes the service only inside the cluster. NodePort exposes it on a static port on every node's IP. LoadBalancer provisions an external cloud load balancer pointing to the service — typically used in production cloud environments." },
      { q: "What is a ConfigMap vs a Secret?", a: "Both store configuration data outside container images. ConfigMaps hold non-sensitive key-value data (like config files). Secrets store sensitive data (passwords, tokens) and are base64-encoded, with tighter access controls." },
      { q: "What does a readiness probe do, vs a liveness probe?", a: "A liveness probe checks if a container is still running correctly — if it fails, Kubernetes restarts the container. A readiness probe checks if the container is ready to accept traffic — if it fails, the Pod is removed from Service load balancing without being restarted." },
    ],
    advanced: [
      { q: "Explain how the Kubernetes scheduler decides where to place a Pod.", a: "The scheduler filters nodes that meet resource requests, node selectors, taints/tolerations, and affinity rules, then scores remaining candidates (e.g. by resource balance) and binds the Pod to the highest-scoring node." },
      { q: "What is a StatefulSet and when would you use one over a Deployment?", a: "StatefulSets provide stable, unique network identities and persistent storage per Pod, with ordered deployment/scaling. Use them for stateful apps like databases (e.g. PostgreSQL, Kafka) where Pod identity and storage must persist across restarts." },
    ]
  },
  linux: {
    beginner: [
      { q: "What is the difference between a hard link and a symbolic link?", a: "A hard link is another directory entry pointing to the same inode/data on disk — it survives even if the original file is deleted. A symbolic link is a separate file containing a path reference, and breaks if the target is removed." },
      { q: "What does chmod 755 mean?", a: "It sets permissions as: owner = read/write/execute (7), group = read/execute (5), others = read/execute (5)." },
    ],
    intermediate: [
      { q: "How would you find which process is using the most memory?", a: "Use `ps aux --sort=-%mem | head` or run `top`/`htop` and sort by memory usage (Shift+M in top)." },
      { q: "What's the difference between a process and a thread?", a: "A process has its own isolated memory space and resources. Threads exist within a process and share its memory space, making them lighter-weight but requiring careful synchronization." },
    ],
    advanced: [
      { q: "Explain what happens during the Linux boot process.", a: "BIOS/UEFI POST → bootloader (GRUB) loads the kernel → kernel initializes hardware and mounts root filesystem → init system (systemd) starts as PID 1 → systemd brings up targets/services in dependency order → login prompt." },
    ]
  },
  aws: {
    beginner: [
      { q: "What is the difference between EC2 and Lambda?", a: "EC2 provides persistent virtual servers you manage and pay for continuously. Lambda is serverless — code runs on-demand in response to events, and you only pay for actual execution time." },
      { q: "What is an S3 bucket?", a: "S3 is AWS's object storage service. A bucket is a container for storing objects (files) with virtually unlimited scalability, accessible via API, CLI, or console." },
    ],
    intermediate: [
      { q: "What is an IAM role vs an IAM user?", a: "An IAM user represents a person or application with long-term credentials. An IAM role is an identity with temporary permissions that can be assumed by users, services, or applications — best practice over long-lived access keys." },
      { q: "Explain the difference between a Security Group and a NACL.", a: "Security Groups are stateful, instance-level firewalls (return traffic automatically allowed). NACLs are stateless, subnet-level firewalls where you must explicitly allow both inbound and outbound rules." },
    ],
    advanced: [
      { q: "How would you design a highly available 3-tier architecture on AWS?", a: "Spread EC2/ECS instances across multiple Availability Zones behind an Application Load Balancer, use Auto Scaling Groups, a Multi-AZ RDS database for the data tier, and CloudFront + S3 for static assets — all within a VPC with public/private subnets." },
    ]
  },
  cicd: {
    beginner: [
      { q: "What is CI/CD?", a: "Continuous Integration automatically builds and tests code on every commit. Continuous Delivery/Deployment automatically packages and ships that code to staging or production environments." },
    ],
    intermediate: [
      { q: "What's the difference between Continuous Delivery and Continuous Deployment?", a: "Continuous Delivery means every change is automatically prepared for a release but requires manual approval to deploy to production. Continuous Deployment goes further — every passing change is deployed to production automatically with no manual gate." },
    ],
    advanced: [
      { q: "How would you implement a blue-green deployment in a CI/CD pipeline?", a: "Maintain two identical production environments (blue = live, green = idle). Deploy the new version to green, run smoke tests, then switch the load balancer/router to point to green. Keep blue as instant rollback if issues appear." },
    ]
  }
};

// DevOps roadmap nodes
const ROADMAP_NODES = [
  { id: "linux", title: "Linux", icon: "🐧", desc: "Master the command line, file permissions, process management, and shell scripting — the foundation of all DevOps work.", resources: ["Linux Journey (linuxjourney.com)", "The Linux Command Line (book)", "OverTheWire Bandit (hands-on wargame)"], projects: ["Write a bash backup script", "Set up a personal Linux server", "Automate log rotation"] },
  { id: "git", title: "Git", icon: "📦", desc: "Version control fundamentals: branching, merging, rebasing, and resolving conflicts.", resources: ["Pro Git book (free online)", "Learn Git Branching (interactive)", "Atlassian Git tutorials"], projects: ["Contribute to an open-source repo", "Practice resolving merge conflicts", "Set up Git hooks"] },
  { id: "github", title: "GitHub", icon: "🐙", desc: "Collaboration workflows, pull requests, Actions for CI/CD, and Issues/Projects for tracking work.", resources: ["GitHub Skills (skills.github.com)", "GitHub Actions documentation"], projects: ["Build a GitHub Actions CI pipeline", "Set up branch protection rules"] },
  { id: "docker", title: "Docker", icon: "🐳", desc: "Containerize applications, write efficient Dockerfiles, and orchestrate multi-container apps with Compose.", resources: ["Docker official docs", "Docker Curriculum (free)", "Play with Docker (browser sandbox)"], projects: ["Containerize a full-stack app", "Write a multi-stage Dockerfile", "Set up Docker Compose for a 3-tier app"] },
  { id: "kubernetes", title: "Kubernetes", icon: "☸️", desc: "Deploy, scale, and manage containerized applications in production-grade clusters.", resources: ["Kubernetes.io official docs", "Kubernetes the Hard Way (Kelsey Hightower)", "KillerCoda interactive labs"], projects: ["Deploy an app with Deployment + Service + Ingress", "Set up Horizontal Pod Autoscaling", "Build a Helm chart"] },
  { id: "jenkins", title: "Jenkins", icon: "⚙️", desc: "Build CI/CD pipelines as code, integrate testing, and automate deployments.", resources: ["Jenkins official documentation", "Jenkins Pipeline syntax reference"], projects: ["Build a Jenkinsfile pipeline", "Set up a multi-branch pipeline"] },
  { id: "terraform", title: "Terraform", icon: "🏗️", desc: "Infrastructure as Code — provision and version cloud resources declaratively.", resources: ["Terraform official tutorials (HashiCorp Learn)", "Terraform Up & Running (book)"], projects: ["Provision an EC2 instance + VPC with Terraform", "Build reusable Terraform modules"] },
  { id: "ansible", title: "Ansible", icon: "🔧", desc: "Agentless configuration management and application deployment automation.", resources: ["Ansible official docs", "Ansible for DevOps (book)"], projects: ["Write a playbook to configure a web server", "Automate user/SSH key provisioning"] },
  { id: "aws", title: "AWS", icon: "☁️", desc: "Cloud fundamentals: compute, storage, networking, and IAM security on the world's largest cloud platform.", resources: ["AWS Free Tier + AWS Skill Builder", "AWS Certified Solutions Architect guide"], projects: ["Deploy a 3-tier app on AWS", "Set up an Auto Scaling Group + ALB"] },
  { id: "monitoring", title: "Monitoring", icon: "📊", desc: "Observability with Prometheus, Grafana, and alerting to keep production systems healthy.", resources: ["Prometheus official docs", "Grafana dashboards library"], projects: ["Set up Prometheus + Grafana for a K8s cluster", "Create alerting rules for CPU/memory spikes"] },
  { id: "devsecops", title: "DevSecOps", icon: "🔐", desc: "Shift security left — integrate scanning, secrets management, and compliance into the pipeline.", resources: ["OWASP DevSecOps guideline", "SonarQube + Trivy documentation"], projects: ["Add SAST scanning to a CI pipeline", "Scan Docker images for vulnerabilities with Trivy"] },
];
